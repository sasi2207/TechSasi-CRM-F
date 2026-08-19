import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth, formatApiErrorDetail } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@techsasi.com");
  const [password, setPassword] = useState("Admin@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(email, password);

      const token =
        res?.access_token ||
        res?.accessToken ||
        res?.token ||
        res?.data?.access_token ||
        res?.data?.accessToken ||
        res?.data?.token;

      if (token) {
        localStorage.setItem("access_token", token);
      }

      toast.success("Welcome back!");
      navigate("/app");
    } catch (err) {
      const msg = formatApiErrorDetail(err.response?.data?.detail) || err.message;
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 auth-bg">
      {/* Left Column - Branding & Highlights (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-card/80 via-card/40 to-background border-r border-border/50 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="z-10">
          <Link to="/" data-testid="login-brand-link">
            <motion.div whileHover={{ scale: 1.02 }} className="inline-block cursor-pointer">
              <div className="leading-none">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                  <span className="text-foreground">TECH</span>
                  <span className="text-orange-500">SASI</span>
                </h1> 

                <div className="flex items-center justify-center gap-1 mt-1 text-[9px] md:text-[10px] font-bold uppercase text-muted-foreground">
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

        <div className="my-auto max-w-lg z-10 space-y-6">
          <h2 className="font-outfit text-4xl font-bold tracking-tight leading-tight">
            Manage your entire enterprise workspace in one place.
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Streamline your operations, track customer relationships, and scale your organization seamlessly with our integrated ERP and CRM suite.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">Lightning Fast</div>
                <div className="text-xs text-muted-foreground">Optimized workflow</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">Secure Access</div>
                <div className="text-xs text-muted-foreground">Enterprise security</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground z-10">
          © {new Date().getFullYear()} TechSasi. All rights reserved.
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex items-center justify-center p-6 sm:p-12 w-full">
        <div className="w-full max-w-md space-y-6">
          
          {/* Mobile brand header */}
          <div className="lg:hidden mb-6">
            <Link to="/" data-testid="login-brand-link-mobile">
              <div className="leading-none">
                <h1 className="text-2xl font-black tracking-tight">
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
            </Link>
          </div>

          <div className="rounded-2xl bg-card border border-border/80 shadow-2xl p-8 backdrop-blur-sm">
            <div className="space-y-1">
              <h1 className="font-outfit text-2xl font-bold tracking-tight">Sign in to workspace</h1>
              <p className="text-sm text-muted-foreground">Enter your organizational credentials below.</p>
            </div>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  data-testid="login-email-input"
                  type="email"
                  value={email}
                  autoComplete="email"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-background/50 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="#" className="text-xs text-primary font-medium hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  data-testid="login-password-input"
                  type="password"
                  value={password}
                  autoComplete="current-password"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 bg-background/50 focus-visible:ring-primary"
                />
              </div>

              {error && (
                <div data-testid="login-error" className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5 animate-fadeIn">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                data-testid="login-submit-btn"
                disabled={loading}
                className="w-full h-11 rounded-xl btn-gradient text-white font-medium shadow-lg shadow-primary/20 hover:opacity-95 transition-opacity mt-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
              </Button>
            </form>
          </div>

          <div className="text-center lg:hidden text-xs text-muted-foreground">
            © {new Date().getFullYear()} TechSasi. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}