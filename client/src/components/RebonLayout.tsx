import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { cn } from "@/lib/utils";
import {
  Activity, BarChart3, Bot, Leaf, LogOut, Menu, Sparkles,
  Trophy, Users, X, Zap, GitCompare, BookOpen
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const navItems = [
  { href: "/dashboard", icon: BarChart3, label: "Dashboard", color: "text-primary" },
  { href: "/log", icon: Activity, label: "Log Activity", color: "text-green-400" },
  { href: "/assistant", icon: Bot, label: "ReBon AI", color: "text-secondary" },
  { href: "/leaderboard", icon: Trophy, label: "Leaderboard", color: "text-yellow-400" },
  { href: "/community", icon: Zap, label: "Influencers", color: "text-orange-400" },
  { href: "/mirror", icon: GitCompare, label: "CarbonMirror", color: "text-blue-400" },
  { href: "/collective", icon: Users, label: "Collective", color: "text-purple-400" },
  { href: "/stories", icon: BookOpen, label: "My Stories", color: "text-pink-400" },
];

interface RebonLayoutProps {
  children: React.ReactNode;
}

export default function RebonLayout({ children }: RebonLayoutProps) {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar — Desktop */}
      <aside className="hidden lg:flex flex-col w-64 glass-strong border-r border-border fixed top-0 left-0 h-full z-40">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 rounded-full bg-primary/20 pulse-glow" />
              <div className="relative w-9 h-9 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-gradient-primary">ReBon</span>
              <div className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">Carbon Intelligence</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = location === item.href || location.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group",
                  active
                    ? "bg-primary/15 border border-primary/30 text-foreground glow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                )}>
                  <item.icon className={cn("w-4 h-4 flex-shrink-0 transition-colors", active ? item.color : "group-hover:" + item.color)} />
                  <span>{item.label}</span>
                  {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-border">
          {isAuthenticated && user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">{(user.name ?? "U")[0].toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{user.name ?? "Climate Hero"}</div>
                  <div className="text-xs text-muted-foreground truncate">{(user as any).archetypeLabel ?? "Onboarding..."}</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          ) : (
            <a href={getLoginUrl()} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors glow-sm">
              <Sparkles className="w-4 h-4" />
              Sign In
            </a>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-primary" />
          <span className="font-black text-gradient-primary">ReBon</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-muted transition-colors">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside className="absolute left-0 top-0 h-full w-72 glass-strong border-r border-border flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 pt-16 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-primary" />
                </div>
                <span className="text-lg font-black text-gradient-primary">ReBon</span>
              </div>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const active = location === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                    <div className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
                      active ? "bg-primary/15 border border-primary/30 text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                    )}>
                      <item.icon className={cn("w-4 h-4", active ? item.color : "")} />
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="lg:hidden h-14" />
        <div className="p-4 lg:p-6 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
