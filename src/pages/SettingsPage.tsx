import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

const SettingsPage = () => (
  <div>
    <PageHeader title="Settings" description="Configure payroll system settings" />
    <div className="max-w-2xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Salary Components</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>HRA Percentage</Label>
            <Input type="number" defaultValue="40" />
          </div>
          <div className="space-y-2">
            <Label>PF Percentage</Label>
            <Input type="number" defaultValue="12" />
          </div>
          <div className="space-y-2">
            <Label>Tax Rate (%)</Label>
            <Input type="number" defaultValue="10" />
          </div>
          <div className="space-y-2">
            <Label>Overtime Rate ($/hr)</Label>
            <Input type="number" defaultValue="50" />
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground">Company Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input defaultValue="Acme Corp" />
          </div>
          <div className="space-y-2">
            <Label>Payroll Cycle</Label>
            <Input defaultValue="Monthly" disabled />
          </div>
        </div>
      </motion.div>

      <Button>Save Settings</Button>
    </div>
  </div>
);

export default SettingsPage;
