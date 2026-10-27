import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const Payslips = () => {
  const { data: salaries = [], isLoading } = useQuery({
    queryKey: ["salaries-for-payslips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salary")
        .select("*, employees(employee_id, name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <PageHeader title="Payslips" description="View employee payslips" />

      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">Loading...</div>
      ) : salaries.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
          No payslips available. Run payroll first from the Payroll page.
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {salaries.map((s) => {
            const emp = s.employees as any;
            return (
              <div key={s.id} className="glass-card rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-foreground">{emp?.name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{emp?.employee_id || "—"} • {s.month} {s.year}</p>
                  </div>
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-2xl font-semibold font-mono text-foreground mb-1">{fmt(Number(s.net_salary))}</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Basic: {fmt(Number(s.basic))} | HRA: {fmt(Number(s.hra))}
                </p>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  s.status === "finalized" ? "bg-success/10 text-success" :
                  s.status === "processed" ? "bg-accent/10 text-accent" :
                  "bg-warning/10 text-warning"
                }`}>{s.status.charAt(0).toUpperCase() + s.status.slice(1)}</span>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default Payslips;
