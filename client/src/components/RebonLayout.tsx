import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  LayoutDashboard, Activity, Trophy, Users, GitBranch,
  BarChart2, BookOpen, Bot, LogOut, Menu, X, Leaf, ChevronRight
} from "lucide-react";

const NAV = [
  { href: "/dashboard",  label: "Dashboard",   icon: LayoutDashboard, color: "text-violet-400" },
  { href: "/log",        label: "Log Activity", icon: Activity,        color: "text-emerald-400" },
  { href: "/leaderboard",label: "Leaderboard",  icon: Trophy,          color: "text-amber-400"  },
  { href: "/community",  label: "Community",    icon: Users,           color: "text-cyan-400"   },
  { href: "/collective", label: "Collective",   icon: GitBranch,       color: "text-rose-400"   },
  { href: "/mirror",     label: "Mirror",       icon: BarChart2,       color: "text-indigo-400" },
  { href: "/stories",    label: "Stories",      icon: BookOpen,        color: "text-pink-400"   },
  { href: "/assistant",  label: "ReBon AI",     icon: Bot,             color: "text-violet-400", highlight: true },
];

export default function RebonLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { toast.success("Signed out"); window.location.href = "/"; },
  });

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <nav
      className={`flex flex-col h-full ${mobile ? "p-4" : "p-5"}`}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg glow-violet flex-shrink-0">
          <Leaf className="w-4.5 h-4.5 text-white" aria-hidden="true" />
        </div>
        <div>
          <span className="text-base font-black text-white tracking-tight">ReBon</span>
          <div className="text-[10px] text-zinc-500 font-mono leading-none mt-0.5">carbon intelligence</div>
        </div>
      </div>

      {/* Nav items */}
      <ul className="space-y-0.5 flex-1" role="list">
        {NAV.map(({ href, label, icon: Icon, color, highlight }) => {
          const active = location === href || location.startsWith(href + "/");
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative
                  ${active
                    ? "bg-violet-500/15 text-white"
                    : highlight
                    ? "text-zinc-300 hover:bg-violet-500/10 hover:text-white"
                    : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100"
                  }`}
                aria-current={active ? "page" : undefined}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-violet-500" aria-hidden="true" />
                )}
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-violet-400" : color}`} aria-hidden="true" />
                <span className="flex-1">{label}</span>
                {highlight && !active && (
                  <span className="text-[10px] badge-violet px-1.5 py-0.5 rounded-full font-semibold">AI</span>
                )}
                {active && <ChevronRight className="w-3 h-3 text-violet-400 opacity-60" aria-hidden="true" />}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* User + logout */}
      <div className="mt-4 pt-4 border-t border-zinc-800">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 text-white text-xs font-bold" aria-hidden="true">
              {(user.name ?? "?")[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-zinc-200 truncate">{user.name ?? "User"}</div>
              <div className="text-[10px] text-zinc-500 truncate">{user.email ?? user.loginMethod ?? "member"}</div>
            </div>
            <button
              onClick={() => logoutMutation.mutate()}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <Link href="/login" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-[oklch(0.07_0.012_265)]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-56 flex-shrink-0 fixed left-0 top-0 h-screen bg-zinc-950/90 backdrop-blur-xl border-r border-zinc-800/60 z-30">
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-zinc-950 border-r border-zinc-800 z-50 lg:hidden transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
        aria-label="Mobile navigation"
        aria-hidden={!open}
      >
        <div className="absolute top-4 right-4">
          <button onClick={() => setOpen(false)} className="p-2 rounded-lg text-zinc-400 hover:text-white" aria-label="Close menu">
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <Sidebar mobile />
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-20">
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Open navigation menu"
            aria-expanded={open}
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg gradient-primary flex items-center justify-center">
              <Leaf className="w-3 h-3 text-white" aria-hidden="true" />
            </div>
            <span className="font-bold text-white text-sm">ReBon</span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 max-w-5xl w-full mx-auto" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
