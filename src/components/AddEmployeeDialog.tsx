import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddEmployeeDialog = ({ open, onOpenChange }: AddEmployeeDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: "", email: "", department: "", designation: "", phone: "", joining_date: "", basic_salary: "", employment_status: "active",
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("employees").insert({
        employee_id: "", // trigger will auto-generate
        name: form.name,
        email: form.email || null,
        department: form.department,
        designation: form.designation,
        phone: form.phone || null,
        joining_date: form.joining_date,
        basic_salary: Number(form.basic_salary),
        employment_status: form.employment_status,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast({ title: "Employee Added", description: "New employee record has been created." });
      onOpenChange(false);
      setForm({ name: "", email: "", department: "", designation: "", phone: "", joining_date: "", basic_salary: "", employment_status: "active" });
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" required value={form.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@company.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={form.department} onValueChange={(v) => update("department", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {["Engineering", "Design", "Marketing", "Finance", "HR", "Operations"].map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Input id="designation" placeholder="Software Engineer" required value={form.designation} onChange={(e) => update("designation", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="+1 234 567 890" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="joinDate">Date of Joining</Label>
              <Input id="joinDate" type="date" required value={form.joining_date} onChange={(e) => update("joining_date", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basic">Basic Salary</Label>
              <Input id="basic" type="number" placeholder="5000" required value={form.basic_salary} onChange={(e) => update("basic_salary", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.employment_status} onValueChange={(v) => update("employment_status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Adding..." : "Add Employee"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeDialog;
