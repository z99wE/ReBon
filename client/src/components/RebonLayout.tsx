import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { cn } from "@/lib/utils";
import {
  BarChart2, Mic, Bot, Trophy, Zap, GitCompare, Users, BookOpen,
  LogOut, LogIn, Menu, X
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const ASCII_TREE = `    *
   /|\\
  / | \\
 /  |  \\
    |
   /_\\`;

const navItems = [
  { href: "/dashboard",  icon: BarChart2,  label: "Dashboard" },
  { href: "/log",        icon: Mic,        label: "Log Activity" },
  { href: "/assistant",  icon: Bot,        label: "ReBon AI" },
  { href: "/leaderboard",icon: Trophy,     label: "Leaderboard" },
  { href: "/community",  icon: Zap,        label: "Influencers" },
  { href: "/mirror",     icon: GitCompare, label: "CarbonMirror" },
  { href: "/collective", icon: Users,      label: "Collective" },
  { href: "/stories",    icon: BookOpen,   label: "My Stories" },
];

function SidebarContent({ onNav }: { onNav?: () => void }) {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 pt-5 pb-4 border-b border-border">
        <Link href="/" onClick={onNav}>
          <a className="flex items-center gap-2.5 group outline-none focus-visible:ring-2 focus-visible:ring-primary rounded" aria-label="ReBon home">
            <div className="w-8 h-8 rounded border border-primary/40 bg-primary/10 flex items-center justify-center font-mono font-bold text-xs text-primary group-hover:bg-primary/20 transition-colors" aria-hidden="true">
              Re
            </div>
            <div>
              <div className="text-sm font-bold font-mono text-foreground tracking-tight">ReBon</div>
              <div className="text-[9px] font-mono text-muted-foreground tracking-[0.12em] uppercase">Carbon Intelligence</div>
            </div>
          </a>
        </Link>
      </div>

      {/* ASCII art */}
      <div className="px-4 py-2.5 border-b border-border/40" aria-hidden="true">
        <pre className="ascii-art text-[0.48rem] leading-[1.3]">{`  🌿 track · reduce · compete
  ─────────────────────────
  powered by groq + nvidia nim`}</pre>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto" aria-label="Main navigation">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = location === href || (href !== "/" && location.startsWith(href));
          return (
            <Link key={href} href={href} onClick={onNav}>
              <a
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded text-xs font-mono transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-primary border",
                  active
                    ? "bg-primary/10 text-primary border-primary/25 font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent border-transparent"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                <span>{label}</span>
                {active && <span className="ml-auto live-dot" aria-hidden="true" />}
              </a>
            </Link>
          );
        })}
      </nav>

      {/* ASCII tree */}
      <div className="px-5 py-2" aria-hidden="true">
        <pre className="ascii-art-dim text-[0.42rem] leading-[1.2]">{ASCII_TREE}</pre>
      </div>

      {/* User / Auth */}
      <div className="px-2 pb-4 pt-2 border-t border-border">
        {isAuthenticated && user ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2 px-3 py-2 rounded bg-accent/60">
              <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-mono font-bold text-primary flex-shrink-0" aria-hidden="true">
                {(user.name ?? "U")[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-mono text-foreground truncate">{user.name ?? "User"}</div>
                <div className="text-[9px] font-mono text-muted-foreground">{user.role}</div>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-accent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Sign out"
            >
              <LogOut className="w-3 h-3" aria-hidden="true" />
              sign out
            </button>
          </div>
        ) : (
          <a
            href={getLoginUrl()}
            className="flex items-center gap-2 px-3 py-2 rounded text-xs font-mono text-primary border border-primary/30 bg-primary/5 hover:bg-primary/15 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Sign in to ReBon"
          >
            <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
            sign in
          </a>
        )}
      </div>
    </div>
  );
}

export default function RebonLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-52 flex-shrink-0 border-r border-border bg-[oklch(0.08_0.005_240)] fixed top-0 left-0 h-full z-40">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 border-b border-border bg-[oklch(0.08_0.005_240)]">
        <Link href="/">
          <a className="flex items-center gap-2 font-mono text-sm font-bold text-primary" aria-label="ReBon home">
            <span className="w-6 h-6 rounded border border-primary/40 bg-primary/10 flex items-center justify-center text-[10px]">Re</span>
            ReBon
          </a>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded hover:bg-accent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </header>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          onClick={() => setMobileOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          id="mobile-nav"
        >
          <div className="absolute inset-0 bg-black/70" aria-hidden="true" />
          <aside
            className="absolute left-0 top-0 h-full w-52 border-r border-border bg-[oklch(0.08_0.005_240)] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <SidebarContent onNav={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-52 min-w-0 overflow-auto" id="main-content" tabIndex={-1}>
        <div className="lg:hidden h-14" aria-hidden="true" />
        {children}
      </main>
    </div>
  );
}
