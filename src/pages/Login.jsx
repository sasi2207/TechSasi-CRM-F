import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, formatApiErrorDetail } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Building2 } from "lucide-react";
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
      // login handles authentication via AuthContext/API helper
      const res = await login(email, password);

      // Handle various common API response structures:
      // - Direct object: { access_token: "..." } or { token: "..." } or { accessToken: "..." }
      // - Axios wrapper: { data: { access_token: "..." } }
      const token =
        res?.access_token ||
        res?.accessToken ||
        res?.token ||
        res?.data?.access_token ||
        res?.data?.accessToken ||
        res?.data?.token;

      if (token) {
        localStorage.setItem("access_token", token);
      } else {
        console.warn("Login succeeded, but no token field was found in the response:", res);
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
    <div className="min-h-screen auth-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-3 mb-8" data-testid="login-brand-link">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#FF8C33] flex items-center justify-center shadow-lg shadow-primary/20">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-outfit font-semibold text-lg leading-tight">TechSasi ERP + CRM</div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Learn · Build · Grow</div>
          </div>
        </Link>

        <div className="rounded-2xl bg-card border border-border shadow-xl p-8">
          <h1 className="font-outfit text-2xl font-semibold tracking-tight">Sign in to your workspace</h1>
          <p className="text-sm text-muted-foreground mt-1">Use your work email and password.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                data-testid="login-email-input"
                type="email"
                value={email}
                autoComplete="email"
                required
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="#" className="text-xs text-primary hover:underline">Forgot?</Link>
              </div>
              <Input
                id="password"
                data-testid="login-password-input"
                type="password"
                value={password}
                autoComplete="current-password"
                required
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5"
              />
            </div>

            {error && (
              <div data-testid="login-error" className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <Button
              type="submit"
              data-testid="login-submit-btn"
              disabled={loading}
              className="w-full h-11 rounded-full btn-gradient text-white font-medium"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline" data-testid="login-goto-register">
              Create one
            </Link>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-dashed border-border/70 p-4 text-xs text-muted-foreground bg-muted/40">
          <div className="font-medium text-foreground mb-2">Demo credentials</div>
          <div>Admin — admin@techsasi.com / Admin@123</div>
          <div>Trainer — trainer@techsasi.com / Trainer@123</div>
          <div>Student — student@techsasi.com / Student@123</div>
        </div>
      </div>
    </div>
  );
}