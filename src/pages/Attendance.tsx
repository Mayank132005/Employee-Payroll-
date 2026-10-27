import { useState } from "react";
import { Upload, CalendarDays, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MarkAttendanceDialog from "@/components/MarkAttendanceDialog";

const Attendance = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: attendanceData = [], isLoading } = useQuery({
    queryKey: ["attendance-with-employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("*, employees(employee_id, name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const currentYear = new Date().getFullYear();

  return (
    <div>
      <PageHeader title="Attendance" description="Track employee attendance and overtime">
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Mark Attendance
        </Button>
      </PageHeader>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold text-foreground">{currentMonth} {currentYear}</h2>
          <p className="text-sm text-muted-foreground">{attendanceData.length} records</p>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : attendanceData.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No attendance records yet. Mark attendance to get started.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Employee ID", "Name", "Month", "Days Present", "Leaves", "Overtime (hrs)", "Attendance %"].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((a) => {
                const workingDays = 22;
                const pct = Math.round((a.days_present / workingDays) * 100);
                const emp = a.employees as any;
                return (
                  <tr key={a.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-mono text-muted-foreground">{emp?.employee_id || "—"}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-foreground">{emp?.name || "—"}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{a.month} {a.year}</td>
                    <td className="px-5 py-3.5 text-sm text-foreground">{a.days_present}</td>
                    <td className="px-5 py-3.5 text-sm text-foreground">{a.leaves}</td>
                    <td className="px-5 py-3.5 text-sm font-mono text-foreground">{a.overtime_hours}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${pct >= 90 ? "bg-success" : pct >= 70 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </motion.div>

      <MarkAttendanceDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default Attendance;
