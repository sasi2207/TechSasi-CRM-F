import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-outfit text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your workspace and preferences.</p>
      </div>

      <div className="rounded-2xl bg-card border border-border p-6">
        <h3 className="font-outfit font-semibold mb-4">Profile</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><div className="text-muted-foreground text-xs uppercase tracking-widest">Name</div><div className="font-medium mt-1">{user?.name}</div></div>
          <div><div className="text-muted-foreground text-xs uppercase tracking-widest">Email</div><div className="font-medium mt-1">{user?.email}</div></div>
          <div><div className="text-muted-foreground text-xs uppercase tracking-widest">Role</div><div className="font-medium mt-1 capitalize">{(user?.role || "").replace("_", " ")}</div></div>
          <div><div className="text-muted-foreground text-xs uppercase tracking-widest">Permissions</div><div className="font-medium mt-1">{user?.permissions?.length ? user.permissions.join(", ") : "Role-based"}</div></div>
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border p-6">
        <h3 className="font-outfit font-semibold mb-4">Appearance</h3>
        <div className="flex gap-2">
          <Button data-testid="theme-light" variant={theme === "light" ? "default" : "outline"} className="rounded-full" onClick={() => setTheme("light")}><Sun className="w-4 h-4 mr-1" /> Light</Button>
          <Button data-testid="theme-dark" variant={theme === "dark" ? "default" : "outline"} className="rounded-full" onClick={() => setTheme("dark")}><Moon className="w-4 h-4 mr-1" /> Dark</Button>
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border p-6">
        <h3 className="font-outfit font-semibold mb-4">Advanced Auth (coming soon)</h3>
        <p className="text-sm text-muted-foreground">Face recognition login, OTP login, QR login and Google Sign-In will be enabled in the next iteration. Email + password with JWT is active today.</p>
      </div>
    </div>
  );
}
