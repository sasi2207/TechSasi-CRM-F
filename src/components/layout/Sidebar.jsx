import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Users, UserCog, BookOpen, CalendarCheck, CreditCard,
  Sparkles, Briefcase, ScrollText, Building2, Settings, TrendingUp, Award, UserPlus
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, testid: "nav-dashboard", end: true, roles: ["*"] },
  { section: "Institute" },
  { to: "/app/students", label: "Students", icon: Users, testid: "nav-students", roles: ["*"] },
  { to: "/app/courses", label: "Courses", icon: BookOpen, testid: "nav-courses", roles: ["*"] },
  { to: "/app/attendance", label: "Attendance", icon: CalendarCheck, testid: "nav-attendance", roles: ["*"] },
  { to: "/app/fees", label: "Fees", icon: CreditCard, testid: "nav-fees", roles: ["*"] },
  { to: "/app/certificates", label: "Certificates", icon: Award, testid: "nav-certificates", roles: ["*"] },
  { section: "HR & Agency" },
  { to: "/app/staff", label: "Staff / HRMS", icon: UserCog, testid: "nav-staff", roles: ["admin", "super_admin", "hr"] },
  { to: "/app/projects", label: "Projects", icon: Briefcase, testid: "nav-projects", roles: ["*"] },
  { section: "Sales & Finance" },
  { to: "/app/leads", label: "CRM Leads", icon: TrendingUp, testid: "nav-leads", roles: ["*"] },
  { to: "/app/invoices", label: "Invoices", icon: ScrollText, testid: "nav-invoices", roles: ["*"] },
  { section: "AI" },
  { to: "/app/ai", label: "AI Assistant", icon: Sparkles, testid: "nav-ai", roles: ["*"] },
  { section: "System" },
  { to: "/app/register", label: "Register User", icon: UserPlus, testid: "nav-register", roles: ["admin", "super_admin", "hr"] },
  { to: "/app/settings", label: "Settings", icon: Settings, testid: "nav-settings", roles: ["*"] },
];

export default function Sidebar({ onNavigate }) {
  const { user } = useAuth();
  const userRole = user?.role || "staff";

  // Filter navigation items based on user role
  const filteredNav = NAV.filter((item) => {
    if (item.section) return true; // Keep sections for now, can be cleaned if all items in section are hidden
    if (!item.roles || item.roles.includes("*")) return true;
    return item.roles.includes(userRole);
  });

  return (
    <aside
      data-testid="app-sidebar"
      className="w-64 shrink-0 border-r border-border/60 bg-card/60 backdrop-blur-xl h-screen sticky top-0 flex flex-col"
    >
      <div className="px-5 py-5 border-b border-border/60 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#FF8C33] flex items-center justify-center shadow-lg shadow-primary/20">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-outfit font-semibold text-base leading-tight">TechSasi</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Learn · Build · Grow</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {filteredNav.map((item, i) =>
          item.section ? (
            <div key={`s-${i}`} className="pt-4 pb-1 px-2 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              {item.section}
            </div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              data-testid={item.testid}
              onClick={onNavigate}
              className={({ isActive }) => cn("nav-item", isActive && "active")}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          )
        )}
      </nav>

      <div className="px-4 py-3 border-t border-border/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/80 to-orange-400 flex items-center justify-center text-white font-semibold text-sm">
            {(user?.name || "?").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate" data-testid="sidebar-user-name">{user?.name}</div>
            <div className="text-[11px] text-muted-foreground truncate capitalize">{(user?.role || "").replace("_", " ")}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}