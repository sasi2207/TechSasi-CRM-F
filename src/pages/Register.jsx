import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, formatApiErrorDetail } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Building2 } from "lucide-react";
import { toast } from "sonner";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created!");
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
        <Link to="/" className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#FF8C33] flex items-center justify-center shadow-lg shadow-primary/20">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-outfit font-semibold text-lg leading-tight">Join TechSasi</div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Learn · Build · Grow</div>
          </div>
        </Link>

        <div className="rounded-2xl bg-card border border-border shadow-xl p-8">
          <h1 className="font-outfit text-2xl font-semibold tracking-tight">Create your account</h1>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" data-testid="reg-name-input" value={form.name} required minLength={2} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" data-testid="reg-email-input" type="email" value={form.email} required onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password">Password (min 6)</Label>
              <Input id="password" data-testid="reg-password-input" type="password" value={form.password} required minLength={6} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger data-testid="reg-role-select" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && <div data-testid="reg-error" className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</div>}

            <Button type="submit" data-testid="reg-submit-btn" disabled={loading} className="w-full h-11 rounded-full btn-gradient text-white font-medium">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create account"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
