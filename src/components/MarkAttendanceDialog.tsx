import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MarkAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const MarkAttendanceDialog = ({ open, onOpenChange }: MarkAttendanceDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const currentYear = new Date().getFullYear();

  const [form, setForm] = useState({
    employee_id: "",
    month: currentMonth,
    year: String(currentYear),
    days_present: "",
    leaves: "",
    overtime_hours: "",
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employees").select("id, employee_id, name").eq("employment_status", "active");
      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("attendance").insert({
        employee_id: form.employee_id,
        month: form.month,
        year: Number(form.year),
        days_present: Number(form.days_present) || 0,
        leaves: Number(form.leaves) || 0,
        overtime_hours: Number(form.overtime_hours) || 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-with-employees"] });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast({ title: "Attendance Marked", description: "Attendance record saved successfully." });
      onOpenChange(false);
      setForm({ employee_id: "", month: currentMonth, year: String(currentYear), days_present: "", leaves: "", overtime_hours: "" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark Attendance</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Employee</Label>
            <Select value={form.employee_id} onValueChange={(v) => update("employee_id", v)}>
              <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.employee_id} — {e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Month</Label>
              <Select value={form.month} onValueChange={(v) => update("month", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {months.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Input type="number" value={form.year} onChange={(e) => update("year", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Days Present</Label>
              <Input type="number" placeholder="22" value={form.days_present} onChange={(e) => update("days_present", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Leaves</Label>
              <Input type="number" placeholder="0" value={form.leaves} onChange={(e) => update("leaves", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>OT Hours</Label>
              <Input type="number" placeholder="0" value={form.overtime_hours} onChange={(e) => update("overtime_hours", e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending || !form.employee_id}>{mutation.isPending ? "Saving..." : "Save Attendance"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MarkAttendanceDialog;
