import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, CalendarCheck, Calculator, FileText, BarChart3, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Employees", path: "/employees" },
  { icon: CalendarCheck, label: "Attendance", path: "/attendance" },
  { icon: Calculator, label: "Payroll", path: "/payroll" },
  { icon: FileText, label: "Payslips", path: "/payslips" },
  { icon: BarChart3, label: "Reports", path: "/reports" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const AppSidebar = () => {
  const location = useLocation();
  const { session, signOut } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar flex flex-col z-50">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Calculator className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-sidebar-accent-foreground">PayrollPro</h1>
            <p className="text-xs text-sidebar-foreground/60">Management System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-muted flex items-center justify-center text-xs font-semibold text-sidebar-foreground">
            {session?.user?.email?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{session?.user?.email || "User"}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
