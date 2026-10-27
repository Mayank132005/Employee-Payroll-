import PageHeader from "@/components/PageHeader";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ["hsl(174,60%,40%)", "hsl(220,60%,20%)", "hsl(38,92%,50%)", "hsl(152,60%,40%)", "hsl(0,72%,51%)", "hsl(215,20%,65%)"];

const Reports = () => {
  const { data: salaries = [] } = useQuery({
    queryKey: ["salaries-reports"],
    queryFn: async () => {
      const { data, error } = await supabase.from("salary").select("*, employees(name, department)");
      if (error) throw error;
      return data;
    },
  });

  // Aggregate by department
  const deptTotals: Record<string, number> = {};
  salaries.forEach((s) => {
    const dept = (s.employees as any)?.department || "Other";
    deptTotals[dept] = (deptTotals[dept] || 0) + Number(s.net_salary);
  });
  const deptData = Object.entries(deptTotals).map(([name, value]) => ({ name, value }));

  // Aggregate by month
  const monthTotals: Record<string, number> = {};
  salaries.forEach((s) => {
    const key = `${s.month} ${s.year}`;
    monthTotals[key] = (monthTotals[key] || 0) + Number(s.net_salary);
  });
  const monthlyData = Object.entries(monthTotals).map(([month, amount]) => ({ month, amount }));

  return (
    <div>
      <PageHeader title="Reports" description="Payroll analytics and department summaries" />

      {salaries.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
          No data to display. Run payroll first to see reports.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
            <h2 className="font-semibold text-foreground mb-4">Monthly Payroll Expense</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215,20%,90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(215,15%,50%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(215,15%,50%)" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                <Bar dataKey="amount" fill="hsl(174,60%,40%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-xl p-5">
            <h2 className="font-semibold text-foreground mb-4">Department-wise Salary Distribution</h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={deptData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                  {deptData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {deptData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {d.name}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Reports;
