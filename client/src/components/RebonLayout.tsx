import React from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { useState } from "react";

const NAV = [
  { href: "/dashboard",   label: "Dashboard",   id: "01", tag: "HOME" },
  { href: "/log",         label: "Log Activity",id: "02", tag: "INPUT" },
  { href: "/leaderboard", label: "Leaderboard", id: "03", tag: "COMPETE" },
  { href: "/community",   label: "Community",   id: "04", tag: "FEED" },
  { href: "/collective",  label: "Collective",  id: "05", tag: "GROUPS" },
  { href: "/mirror",      label: "Carbon Mirror",id:"06", tag: "COMPARE" },
  { href: "/stories",     label: "Stories",     id: "07", tag: "SHARE" },
  { href: "/arena",       label: "Agent Arena", id: "08", tag: "A2A" },
  { href: "/assistant",   label: "ReBon AI",    id: "09", tag: "CHAT" },
];

interface Props { children: React.ReactNode; }

export default function RebonLayout({ children }: Props) {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="glass-card p-10 max-w-sm w-full mx-4 text-center">
          <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center mx-auto mb-6">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
              <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9z" stroke="black" strokeWidth="1.5"/>
              <path d="M12 7v5l3 3" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="label-tech mb-2">Access Required</p>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Sign in to ReBon</h2>
          <p className="text-white/40 text-sm mb-8">Join 18,000+ climate warriors competing to reduce their carbon footprint.</p>
          <Link href={getLoginUrl()}>
            <button className="btn-primary w-full justify-center">Sign In / Register →</button>
          </Link>
          <Link href="/">
            <button className="btn-ghost w-full justify-center mt-3">Back to Home</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex">
      {/* ── Sidebar ── */}
      <aside className={`
        fixed top-0 left-0 h-full w-52 z-40 flex flex-col
        bg-[#050505]/95 backdrop-blur-xl border-r border-white/8
        transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 h-16 px-5 border-b border-white/8 hover:bg-white/4 transition-colors no-underline flex-shrink-0">
          <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
              <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9z" stroke="black" strokeWidth="1.5"/>
              <path d="M12 7v5l3 3" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-white font-black text-[11px] tracking-[0.25em] uppercase">ReBon</span>
        </Link>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2" aria-label="Main navigation">
          {NAV.map((item) => {
            const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center justify-between px-5 py-3 transition-all duration-200 no-underline group
                  ${active
                    ? 'bg-white/8 border-r-2 border-white text-white'
                    : 'text-white/40 hover:text-white hover:bg-white/4 border-r-2 border-transparent'
                  }
                `}
                aria-current={active ? "page" : undefined}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black tracking-widest text-white/20 group-hover:text-white/40 transition-colors">{item.id}</span>
                  <span className="text-[11px] font-700 tracking-wide">{item.label}</span>
                </div>
                {item.tag === "A2A" && (
                  <span className="text-[8px] font-black tracking-widest text-amber-400/70 bg-amber-400/10 px-1.5 py-0.5">NEW</span>
                )}
                {active && <span className="w-1 h-1 rounded-full bg-white" />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-white/8 p-4 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-7 h-7 rounded-sm bg-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-black text-white/70">
                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-700 text-white truncate">{user?.name ?? "User"}</p>
              <p className="text-[9px] text-white/30 uppercase tracking-widest">Climate Warrior</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="w-full text-[9px] font-black tracking-widest uppercase text-white/30 hover:text-white/60 transition-colors text-left py-1"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile header ── */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-[#050505]/95 backdrop-blur-xl border-b border-white/8 z-30 flex items-center justify-between px-4 lg:hidden">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none">
              <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9z" stroke="black" strokeWidth="2"/>
            </svg>
          </div>
          <span className="text-white font-black text-[10px] tracking-[0.3em] uppercase">ReBon</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white/60 hover:text-white transition-colors p-2"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
            {mobileOpen
              ? <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round"/>
              : <><path d="M4 6h16" strokeLinecap="round"/><path d="M4 12h16" strokeLinecap="round"/><path d="M4 18h16" strokeLinecap="round"/></>
            }
          </svg>
        </button>
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 lg:ml-52 min-h-screen pt-14 lg:pt-0" id="main-content">
        {children}
      </main>
    </div>
  );
}
