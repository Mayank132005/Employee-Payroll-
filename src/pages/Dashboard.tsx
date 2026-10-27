import { Users, IndianRupee, CalendarCheck, TrendingUp } from "lucide-react";
import StatCard from "@/components/StatCard";
import PageHeader from "@/components/PageHeader";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employees").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: salaries = [] } = useQuery({
    queryKey: ["salaries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("salary").select("*, employees(name, department)");
      if (error) throw error;
      return data;
    },
  });

  const { data: attendanceRecords = [] } = useQuery({
    queryKey: ["attendance"],
    queryFn: async () => {
      const { data, error } = await supabase.from("attendance").select("*");
      if (error) throw error;
      return data;
    },
  });

  const totalEmployees = employees.length;
  const totalPayroll = salaries.reduce((sum, s) => sum + Number(s.net_salary), 0);
  const pendingCount = salaries.filter((s) => s.status === "pending").length;

  // Department summary from real data
  const deptCounts: Record<string, number> = {};
  employees.forEach((e) => {
    deptCounts[e.department] = (deptCounts[e.department] || 0) + 1;
  });
  const deptSummary = Object.entries(deptCounts).map(([dept, count]) => ({
    dept,
    count,
    percentage: totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0,
  }));

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your payroll operations" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} title="Total Employees" value={String(totalEmployees)} change="from database" changeType="neutral" delay={0} />
        <StatCard icon={IndianRupee} title="Monthly Payroll" value={fmt(totalPayroll)} change={`${salaries.length} records`} changeType="neutral" delay={0.05} />
        <StatCard icon={CalendarCheck} title="Attendance Records" value={String(attendanceRecords.length)} change="this period" changeType="neutral" delay={0.1} />
        <StatCard icon={TrendingUp} title="Pending Payroll" value={String(pendingCount)} change={pendingCount > 0 ? "needs processing" : "all clear"} changeType={pendingCount > 0 ? "negative" : "positive"} delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 glass-card rounded-xl">
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold text-foreground">Recent Payroll Activity</h2>
          </div>
          <div className="p-0">
            {salaries.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No payroll records yet. Run payroll from the Payroll page.</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Employee</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Amount</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {salaries.slice(0, 5).map((s) => (
                    <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-foreground">{(s.employees as any)?.name || "—"}</td>
                      <td className="px-5 py-3.5 text-sm font-mono font-medium text-foreground">{fmt(Number(s.net_salary))}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          s.status === "finalized" ? "bg-success/10 text-success" :
                          s.status === "processed" ? "bg-accent/10 text-accent" :
                          "bg-warning/10 text-warning"
                        }`}>
                          {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-4">Department Summary</h2>
          {deptSummary.length === 0 ? (
            <p className="text-sm text-muted-foreground">No employees added yet.</p>
          ) : (
            <div className="space-y-4">
              {deptSummary.map((d) => (
                <div key={d.dept}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-foreground font-medium">{d.dept}</span>
                    <span className="text-muted-foreground">{d.count} employees</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${d.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
