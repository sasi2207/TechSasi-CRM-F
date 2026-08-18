import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, formatApiErrorDetail } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "staff" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created successfully!");
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Administration</div>
        <h1 className="font-outfit text-3xl font-semibold tracking-tight mt-1 flex items-center gap-2">
          <UserPlus className="w-7 h-7 text-primary" />
          Register New User
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Create accounts for staff members, trainers, HR, or administrators.</p>
      </div>

      <div className="rounded-2xl bg-card border border-border shadow-sm p-6 sm:p-8">
        <form onSubmit={submit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                data-testid="reg-name-input" 
                placeholder="Enter full name"
                value={form.name} 
                required 
                minLength={2} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                className="mt-1.5" 
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                data-testid="reg-email-input" 
                type="email" 
                placeholder="user@techsasi.com"
                value={form.email} 
                required 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
                className="mt-1.5" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password">Password (min 6 chars)</Label>
              <Input 
                id="password" 
                data-testid="reg-password-input" 
                type="password" 
                placeholder="••••••••"
                value={form.password} 
                required 
                minLength={6} 
                onChange={(e) => setForm({ ...form, password: e.target.value })} 
                className="mt-1.5" 
              />
            </div>

            <div>
              <Label htmlFor="role">User Role</Label>
              <select 
                id="role"
                data-testid="reg-role-select"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5"
                value={form.role} 
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="staff">Staff</option>
                <option value="trainer">Trainer</option>
                <option value="hr">HR</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
                <option value="student">Student</option>
                <option value="client">Client</option>
              </select>
            </div>
          </div>

          {error && (
            <div data-testid="reg-error" className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              data-testid="reg-submit-btn" 
              disabled={loading} 
              className="btn-gradient px-6"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}