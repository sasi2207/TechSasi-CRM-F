import { Sun, Moon, Bell, Search, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  return (
    <header
      data-testid="app-topbar"
      className="h-16 border-b border-border/60 bg-background/70 backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between px-4 md:px-6"
    >
      <div className="flex items-center gap-3">
        <Button
          data-testid="topbar-menu-btn"
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/70 text-sm text-muted-foreground min-w-[260px]">
          <Search className="w-4 h-4" />
          <input
            data-testid="topbar-search"
            className="bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground w-full"
            placeholder="Search students, courses, invoices…"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          data-testid="theme-toggle"
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
        <Button variant="ghost" size="icon" data-testid="notifications-btn" aria-label="Notifications">
          <Bell className="w-4 h-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              data-testid="profile-menu-trigger"
              className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-muted transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white text-xs font-semibold">
                {(user?.name || "?").slice(0, 1).toUpperCase()}
              </div>
              <span className="hidden sm:inline text-sm font-medium">{user?.name}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="font-medium">{user?.name}</div>
              <div className="text-xs text-muted-foreground">{user?.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem data-testid="menu-settings" onClick={() => navigate("/app/settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              data-testid="menu-logout"
              className="text-destructive focus:text-destructive"
              onClick={async () => { await logout(); navigate("/login"); }}
            >
              <LogOut className="w-4 h-4 mr-2" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
