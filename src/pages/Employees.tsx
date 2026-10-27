import { useState } from "react";
import { Plus, Search, Filter, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/PageHeader";
import AddEmployeeDialog from "@/components/AddEmployeeDialog";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Employees = () => {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employees").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast({ title: "Employee deleted" });
    },
  });

  const filtered = employees.filter(
    (e) => e.name.toLowerCase().includes(search.toLowerCase()) || e.employee_id.toLowerCase().includes(search.toLowerCase())
  );

  const statusLabel = (s: string) => s === "active" ? "Active" : s === "on_leave" ? "On Leave" : "Inactive";
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <div>
      <PageHeader title="Employees" description="Manage your employee records">
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Employee
        </Button>
      </PageHeader>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading employees...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {employees.length === 0 ? "No employees yet. Add your first employee!" : "No matching employees found."}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["ID", "Name", "Department", "Designation", "Status", "Joined", "Basic Salary", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-muted-foreground px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr key={emp.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-mono text-muted-foreground">{emp.employee_id}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-foreground">{emp.name}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{emp.department}</td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{emp.designation}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      emp.employment_status === "active" ? "bg-success/10 text-success" :
                      emp.employment_status === "on_leave" ? "bg-warning/10 text-warning" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {statusLabel(emp.employment_status)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">{emp.joining_date}</td>
                  <td className="px-5 py-3.5 text-sm font-mono font-medium text-foreground">{fmt(Number(emp.basic_salary))}</td>
                  <td className="px-5 py-3.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2 text-destructive" onClick={() => deleteMutation.mutate(emp.id)}>
                          <Trash2 className="w-4 h-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      <AddEmployeeDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default Employees;
