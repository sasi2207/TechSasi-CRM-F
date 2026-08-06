import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Users, GraduationCap, Briefcase, TrendingUp, CircleDollarSign, Calendar, BookOpen, Sparkles,
  ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend, Line, LineChart,
} from "recharts";
import { motion } from "framer-motion";

const KPI_DEFS = [
  { key: "students", label: "Students", icon: GraduationCap, tone: "primary" },
  { key: "staff", label: "Staff", icon: Users, tone: "success" },
  { key: "revenue", label: "Revenue", icon: CircleDollarSign, tone: "primary", currency: true },
  { key: "pending_fees", label: "Pending Fees", icon: TrendingUp, tone: "danger", currency: true },
  { key: "courses", label: "Active Courses", icon: BookOpen, tone: "muted" },
  { key: "projects", label: "Projects", icon: Briefcase, tone: "muted" },
  { key: "open_leads", label: "Open Leads", icon: TrendingUp, tone: "primary" },
  { key: "present_today", label: "Present Today", icon: Calendar, tone: "success" },
];

const CHART_COLORS = ["#FF6B00", "#16A34A", "#3B82F6", "#8B5CF6", "#EC4899"];

function formatCurrency(n) {
  if (n == null) return "-";
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

function KPI({ def, value, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      data-testid={`kpi-${def.key}`}
      className="kpi-card"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{def.label}</div>
          <div className="mt-2 font-outfit text-2xl font-semibold">
            {def.currency ? formatCurrency(value) : (value ?? 0).toLocaleString("en-IN")}
          </div>
        </div>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
          def.tone === "primary" ? "bg-accent text-primary"
          : def.tone === "success" ? "bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))]"
          : def.tone === "danger" ? "bg-destructive/10 text-destructive"
          : "bg-muted text-muted-foreground"
        }`}>
          <def.icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3 text-[11px] text-muted-foreground flex items-center gap-1">
        <ArrowUpRight className="w-3 h-3 text-[hsl(var(--success))]" /> vs last month
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [charts, setCharts] = useState(null);
  const [activity, setActivity] = useState([]);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    // Only fetch dashboard data once user is authenticated and user object is ready
    if (!user || user === false) return;

    Promise.all([
      api.get("/dashboard/stats"),
      api.get("/dashboard/charts"),
      api.get("/dashboard/recent-activity"),
      api.get("/ai/insights"),
    ]).then(([s, c, a, ins]) => {
      setStats(s.data.kpis || {});
      setCharts(c.data);
      setActivity(a.data.activities || []);
      setInsights(ins.data);
    }).catch((err) => {
      console.error("Failed to load dashboard data:", err);
    });
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Welcome back</div>
          <h1 className="font-outfit text-3xl sm:text-4xl font-semibold tracking-tight mt-1">
            Hi {user?.name?.split(" ")[0] || "there"}, here's what's happening.
          </h1>
        </div>
        <div className="text-sm text-muted-foreground">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {KPI_DEFS.map((d, i) => <KPI key={d.key} def={d} value={stats[d.key]} index={i} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-outfit font-semibold">Revenue vs Expense</h3>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={charts?.revenue || []}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF6B00" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#FF6B00" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16A34A" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#16A34A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#FF6B00" strokeWidth={2.5} fill="url(#rev)" />
                <Area type="monotone" dataKey="expense" stroke="#16A34A" strokeWidth={2.5} fill="url(#exp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="font-outfit font-semibold">AI Insights</h3>
          </div>
          <div className="space-y-3">
            <div className="rounded-xl bg-accent p-3">
              <div className="text-[11px] uppercase tracking-widest text-accent-foreground">Lead Conversion</div>
              <div className="font-outfit text-2xl font-semibold">{insights?.conversion_rate ?? 0}%</div>
            </div>
            <div className="rounded-xl bg-muted p-3">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Fee Collection</div>
              <div className="font-outfit text-2xl font-semibold">{insights?.fee_collection_rate ?? 0}%</div>
            </div>
            <div className="pt-2 space-y-2">
              {(insights?.tips || []).map((t, i) => (
                <div key={i} className="text-xs text-muted-foreground flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" /> {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-card border border-border p-6">
          <h3 className="font-outfit font-semibold mb-4">Attendance (7 days)</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={charts?.attendance_7d || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Bar dataKey="present" fill="#16A34A" radius={[6, 6, 0, 0]} />
                <Bar dataKey="absent" fill="#EF4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-6">
          <h3 className="font-outfit font-semibold mb-4">Sales Pipeline</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={charts?.pipeline || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="stage" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Line type="monotone" dataKey="count" stroke="#FF6B00" strokeWidth={3} dot={{ r: 5, fill: "#FF6B00" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-6">
          <h3 className="font-outfit font-semibold mb-4">Course Enrollment</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={charts?.course_distribution || []}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={72}
                  paddingAngle={4}
                >
                  {(charts?.course_distribution || []).map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border p-6">
        <h3 className="font-outfit font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3" data-testid="recent-activity-list">
          {activity.length === 0 && <div className="text-sm text-muted-foreground">No activity yet.</div>}
          {activity.map((a, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                a.type === "student" ? "bg-accent text-primary"
                : a.type === "lead" ? "bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))]"
                : "bg-muted text-muted-foreground"
              }`}>{a.type ? a.type[0].toUpperCase() : "A"}</div>
              <div className="min-w-0">
                <div className="text-sm">{a.message}</div>
                <div className="text-[11px] text-muted-foreground">{a.time?.slice(0, 10)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}