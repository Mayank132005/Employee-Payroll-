import { Play, Lock, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const Payroll = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: salaries = [], isLoading } = useQuery({
    queryKey: ["salaries-with-employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salary")
        .select("*, employees(employee_id, name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const runPayrollMutation = useMutation({
    mutationFn: async () => {
      // Get all active employees
      const { data: employees, error: empErr } = await supabase.from("employees").select("*").eq("employment_status", "active");
      if (empErr) throw empErr;

      // Get payroll settings
      const { data: settings, error: setErr } = await supabase.from("payroll_settings").select("*").limit(1).single();
      if (setErr) throw setErr;

      const currentMonth = new Date().toLocaleString("default", { month: "long" });
      const currentYear = new Date().getFullYear();

      // Get attendance for current month
      const { data: attendance, error: attErr } = await supabase
        .from("attendance")
        .select("*")
        .eq("month", currentMonth)
        .eq("year", currentYear);
      if (attErr) throw attErr;

      const attMap = new Map(attendance?.map((a) => [a.employee_id, a]) || []);

      for (const emp of employees || []) {
        const att = attMap.get(emp.id);
        const basic = Number(emp.basic_salary);
        const hra = basic * (Number(settings.hra_percentage) / 100);
        const overtimeHours = att ? Number(att.overtime_hours) : 0;
        const overtimePay = overtimeHours * Number(settings.overtime_rate);
        const gross = basic + hra + overtimePay;
        const tax = gross * (Number(settings.tax_rate) / 100);
        const pf = basic * (Number(settings.pf_percentage) / 100);
        const insurance = Number(settings.insurance_amount);
        const netSalary = gross - tax - pf - insurance;

        // Upsert salary record
        const { error } = await supabase.from("salary").upsert(
          {
            employee_id: emp.id,
            month: currentMonth,
            year: currentYear,
            basic,
            hra,
            bonus: 0,
            overtime_pay: overtimePay,
            tax,
            provident_fund: pf,
            insurance,
            loan_deduction: 0,
            net_salary: netSalary,
            status: "processed",
          },
          { onConflict: "employee_id,month,year" }
        );
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaries-with-employees"] });
      queryClient.invalidateQueries({ queryKey: ["salaries"] });
      toast({ title: "Payroll Processed", description: "Salaries calculated for all active employees." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const totalGross = salaries.reduce((s, r) => s + Number(r.basic) + Number(r.hra) + Number(r.bonus) + Number(r.overtime_pay), 0);
  const totalDeductions = salaries.reduce((s, r) => s + Number(r.tax) + Number(r.provident_fund) + Number(r.insurance) + Number(r.loan_deduction), 0);
  const totalNet = salaries.reduce((s, r) => s + Number(r.net_salary), 0);

  return (
    <div>
      <PageHeader title="Payroll Processing" description="Calculate and process monthly salaries">
        <Button variant="outline" className="gap-2" onClick={() => runPayrollMutation.mutate()} disabled={runPayrollMutation.isPending}>
          <Play className="w-4 h-4" /> {runPayrollMutation.isPending ? "Processing..." : "Run Payroll"}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Gross", value: fmt(totalGross) },
          { label: "Total Deductions", value: fmt(totalDeductions) },
          { label: "Net Payroll", value: fmt(totalNet) },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card rounded-xl p-4">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-xl font-semibold text-foreground mt-1 font-mono">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-xl overflow-x-auto">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : salaries.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No payroll records. Click "Run Payroll" to calculate salaries.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["ID", "Name", "Basic", "HRA", "OT Pay", "Tax", "PF", "Insurance", "Net Salary", "Status"].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {salaries.map((p) => {
                const emp = p.employees as any;
                return (
                  <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{emp?.employee_id || "—"}</td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{emp?.name || "—"}</td>
                    <td className="px-4 py-3 text-sm font-mono text-foreground">{fmt(Number(p.basic))}</td>
                    <td className="px-4 py-3 text-sm font-mono text-foreground">{fmt(Number(p.hra))}</td>
                    <td className="px-4 py-3 text-sm font-mono text-foreground">{fmt(Number(p.overtime_pay))}</td>
                    <td className="px-4 py-3 text-sm font-mono text-destructive">-{fmt(Number(p.tax))}</td>
                    <td className="px-4 py-3 text-sm font-mono text-destructive">-{fmt(Number(p.provident_fund))}</td>
                    <td className="px-4 py-3 text-sm font-mono text-destructive">-{fmt(Number(p.insurance))}</td>
                    <td className="px-4 py-3 text-sm font-mono font-semibold text-foreground">{fmt(Number(p.net_salary))}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        p.status === "finalized" ? "bg-success/10 text-success" :
                        p.status === "processed" ? "bg-accent/10 text-accent" :
                        "bg-warning/10 text-warning"
                      }`}>{p.status.charAt(0).toUpperCase() + p.status.slice(1)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
};

export default Payroll;
