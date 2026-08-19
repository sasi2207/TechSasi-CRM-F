import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, GraduationCap, TrendingUp, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: GraduationCap, title: "Institute + LMS", desc: "Students, courses, batches, attendance, certificates and fees — all synced in real time." },
  { icon: TrendingUp, title: "CRM & Sales Pipeline", desc: "Track leads from Website to Won with quotations, invoicing and revenue analytics." },
  { icon: Sparkles, title: "AI Assistant Built-in", desc: "Ask Claude Sonnet 5 about revenue, attendance or lead funnel — powered by Emergent." },
  { icon: ShieldCheck, title: "RBAC & Audit-ready", desc: "15 roles with fine-grained permissions, JWT auth and login lockout out of the box." },
];

const bullets = [
  "Multi-role dashboards (Admin, Trainer, Student, Client)",
  "Live analytics, revenue & attendance charts",
  "Student & staff CRUD, fees collection tracking",
  "Projects, Invoices, Quotations for the Agency arm",
];

export default function Landing() {
  return (
    <div className="min-h-screen auth-bg relative overflow-hidden">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-5">
   <div className="flex items-center">
              <Link to="/">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div className="leading-none">
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                      <span className="text-gray-900">TECH</span>
                      <span className="text-orange-500">SASI</span>
                    </h1> 

                    <div className="flex items-center justify-center gap-1 mt-1 text-[9px] md:text-[10px] font-bold uppercase text-gray-400">
                      <div className="w-3 md:w-4 h-[1.5px] bg-orange-500"></div>
                      <span>Learn</span>
                      <span className="text-orange-500">•</span>
                      <span>Build</span>
                      <span className="text-orange-500">•</span>
                      <span>Grow</span>
                      <div className="w-3 md:w-4 h-[1.5px] bg-orange-500"></div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </div>
        <div className="flex items-center gap-2">
          <Link to="/login" data-testid="landing-login">
            <Button variant="ghost" className="rounded-full">Log in</Button>
          </Link>
          <Link to="/register" data-testid="landing-register">
            <Button className="rounded-full btn-gradient">Get started <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </Link>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 pt-12 pb-24 grid lg:grid-cols-[1.15fr_1fr] gap-12 items-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Enterprise ERP + CRM · v1.0
          </div>
          <h1 className="font-outfit font-semibold tracking-tight text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
            The operating system for your <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF6B00] to-[#FF8C33]">training institute</span> &amp; agency.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl">
            TechSasi ERP + CRM unifies Students, Staff, Attendance, Fees, CRM, Projects and Invoicing into one premium dashboard — with an AI assistant that actually understands your data.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login" data-testid="hero-cta-login">
              <Button className="rounded-full btn-gradient h-11 px-6">Open the Dashboard <ArrowRight className="w-4 h-4 ml-1" /></Button>
            </Link>
            <a href="#features">
              <Button variant="outline" className="rounded-full h-11 px-6">See what's inside</Button>
            </a>
          </div>
          <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-[hsl(var(--success))] mt-0.5 shrink-0" /> {b}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -inset-8 bg-gradient-to-br from-primary/25 to-orange-300/10 blur-3xl -z-10" />
          <div className="rounded-3xl overflow-hidden border border-border/60 shadow-2xl bg-card">
            <img
              alt="Dashboard preview"
              src="https://images.unsplash.com/photo-1556761175-4b46a572b786?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODh8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb3Jwb3JhdGUlMjB0ZWNoJTIwb2ZmaWNlJTIwc3BhY2V8ZW58MHx8fHwxNzg1ODQ5NDYzfDA&ixlib=rb-4.1.0&q=85"
              className="w-full h-64 object-cover"
            />
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { l: "Students", v: "1,240" },
                  { l: "Revenue", v: "₹4.6M" },
                  { l: "Attendance", v: "94%" },
                ].map((k) => (
                  <div key={k.l} className="rounded-xl bg-muted/50 p-3">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k.l}</div>
                    <div className="font-outfit text-xl font-semibold">{k.v}</div>
                  </div>
                ))}
              </div>
              <div className="h-24 rounded-xl bg-gradient-to-br from-primary/15 to-orange-200/10 border border-primary/20 flex items-center justify-center text-xs text-muted-foreground">
                Live Revenue Trend
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-6 pb-24">
        <h2 className="font-outfit text-3xl sm:text-4xl font-semibold tracking-tight">Everything you need. Nothing you don't.</h2>
        <p className="mt-2 text-muted-foreground max-w-2xl">Built to scale from a single trainer to enterprise operations. One login, one source of truth.</p>
        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="rounded-2xl bg-card border border-border p-5 hover:shadow-lg transition-shadow"
            >
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-primary mb-4">
                <f.icon className="w-5 h-5" />
              </div>
              <div className="font-outfit font-semibold mb-1">{f.title}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} TechSasi Training Institute · Learn · Build · Grow
      </footer>
    </div>
  );
}
