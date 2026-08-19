import { NavLink, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, UserCog, BookOpen, CalendarCheck, CreditCard,
  Sparkles, Briefcase, ScrollText, Settings, TrendingUp, Award, UserPlus
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
    if (item.section) return true;
    if (!item.roles || item.roles.includes("*")) return true;
    return item.roles.includes(userRole);
  });

  return (
    <aside
      data-testid="app-sidebar"
      className="w-64 shrink-0 border-r border-border/60 bg-card/60 backdrop-blur-xl h-screen sticky top-0 flex flex-col"
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-border/60">
        <Link to="/" className="block">
          <motion.div whileHover={{ scale: 1.02 }} className="cursor-pointer">
            <div className="leading-none">
              <h1 className="text-xl font-black tracking-tight">
                <span className="text-foreground">TECH</span>
                <span className="text-orange-500">SASI</span>
              </h1> 

              <div className="flex items-center gap-1 mt-1 text-[9px] font-bold uppercase text-muted-foreground">
                <div className="w-3 h-[1.5px] bg-orange-500"></div>
                <span>Learn</span>
                <span className="text-orange-500">•</span>
                <span>Build</span>
                <span className="text-orange-500">•</span>
                <span>Grow</span>
                <div className="w-3 h-[1.5px] bg-orange-500"></div>
              </div>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Navigation Links */}
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
              className={({ isActive }) => cn("nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50", isActive && "active bg-primary/10 text-primary hover:bg-primary/15")}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          )
        )}
      </nav>

      {/* User Profile Footer */}
      <div className="px-4 py-3 border-t border-border/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/80 to-orange-400 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
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