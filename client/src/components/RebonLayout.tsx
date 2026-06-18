import React from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { useState } from "react";

const NAV = [
  { href: "/dashboard",   label: "Dashboard",    id: "01", tag: "HOME" },
  { href: "/log",         label: "Log Activity", id: "02", tag: "INPUT" },
  { href: "/leaderboard", label: "Leaderboard",  id: "03", tag: "COMPETE" },
  { href: "/community",   label: "Community",    id: "04", tag: "FEED" },
  { href: "/collective",  label: "Collective",   id: "05", tag: "GROUPS" },
  { href: "/mirror",      label: "Carbon Mirror",id: "06", tag: "COMPARE" },
  { href: "/stories",     label: "Stories",      id: "07", tag: "SHARE" },
  { href: "/arena",       label: "Agent Arena",  id: "08", tag: "A2A" },
  { href: "/assistant",   label: "ReBon AI",     id: "09", tag: "CHAT" },
];

interface Props { children: React.ReactNode; }

export default function RebonLayout({ children }: Props) {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
        {/* Ambient orbs */}
        <div className="orb orb-green w-96 h-96 -top-24 -left-24 opacity-40" />
        <div className="orb orb-teal w-80 h-80 -bottom-16 -right-16 opacity-30" />

        <div className="glass-premium p-10 max-w-sm w-full mx-4 text-center animate-fade-up" style={{ borderRadius: 2 }}>
          {/* Logo */}
          <div className="w-12 h-12 flex items-center justify-center mx-auto mb-6 glass-rim-animated" style={{ borderRadius: 2 }}>
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
              <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9z" stroke="oklch(0.82 0.21 142)" strokeWidth="1.5"/>
              <path d="M12 7v5l3 3" stroke="oklch(0.82 0.21 142)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>

          <p className="label-tech mb-2">Access Required</p>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-3">
            Sign in to <span className="text-fluoro text-glow-green">ReBon</span>
          </h2>
          <p className="text-sm mb-8 text-bottle">
            Join 18,000+ climate warriors competing to reduce their carbon footprint.
          </p>

          <div className="progress-track mb-8">
            <div className="progress-fill" style={{ width: '100%' }} />
          </div>

          <Link href={getLoginUrl()}>
            <button className="btn-primary w-full justify-center glow-green-sm">
              Sign In / Register →
            </button>
          </Link>
          <Link href="/">
            <button className="btn-ghost w-full justify-center mt-3">
              Back to Home
            </button>
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
        glass-strong border-r border-white/[0.07]
        transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Subtle side rim glow */}
        <div className="absolute right-0 top-0 w-px h-full pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent, oklch(0.82 0.21 142 / 0.3) 30%, oklch(0.82 0.21 142 / 0.15) 70%, transparent)'
          }}
        />

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 h-16 px-5 border-b border-white/[0.07] hover:bg-white/[0.04] transition-colors no-underline flex-shrink-0 group glossy-top"
        >
          <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 glass-card transition-all duration-300 group-hover:glow-green-sm"
            style={{ borderRadius: 2 }}>
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
              <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9z"
                stroke="currentColor" strokeWidth="1.5"
                style={{ stroke: 'oklch(0.82 0.21 142)' }}
              />
              <path d="M12 7v5l3 3"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                style={{ stroke: 'oklch(0.82 0.21 142)' }}
              />
            </svg>
          </div>
          <span className="font-black text-[11px] tracking-[0.25em] uppercase text-white/90 group-hover:text-fluoro transition-colors duration-200">
            ReBon
          </span>
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
                  flex items-center justify-between px-5 py-3 transition-all duration-200 no-underline group relative overflow-hidden
                  ${active
                    ? 'bg-[oklch(0.82_0.21_142_/_0.08)] border-r-2 text-white'
                    : 'text-bottle hover:text-white hover:bg-white/[0.04] border-r-2 border-transparent'
                  }
                `}
                style={active ? { borderRightColor: 'oklch(0.82 0.21 142)' } : {}}
                aria-current={active ? "page" : undefined}
              >
                {/* Active item gloss */}
                {active && (
                  <div className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, oklch(0.82 0.21 142 / 0.05) 0%, transparent 100%)'
                    }}
                  />
                )}

                <div className="flex items-center gap-3 relative">
                  <span className={`text-[9px] font-black tracking-widest transition-colors ${active ? 'text-fluoro' : 'text-white/20 group-hover:text-bottle'}`}>
                    {item.id}
                  </span>
                  <span className={`text-[11px] font-bold tracking-wide transition-colors ${active ? 'text-white' : ''}`}>
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 relative">
                  {item.tag === "A2A" && (
                    <span className="text-[7px] font-black tracking-widest badge-fluoro">NEW</span>
                  )}
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot"
                      style={{ background: 'oklch(0.82 0.21 142)' }}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-white/[0.07] p-4 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 glass-card animate-float"
              style={{ borderRadius: 2, animationDuration: '5s' }}>
              <span className="text-[11px] font-black text-fluoro">
                {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-white truncate">{user?.name ?? "User"}</p>
              <p className="text-[9px] text-bottle uppercase tracking-widest">Climate Warrior</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="w-full text-[9px] font-black tracking-widest uppercase text-bottle hover:text-fluoro transition-colors text-left py-1"
          >
            Sign Out →
          </button>
        </div>
      </aside>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile header ── */}
      <div className="fixed top-0 left-0 right-0 h-14 glass-strong border-b border-white/[0.07] z-30 flex items-center justify-between px-4 lg:hidden glossy-top">
        <Link href="/" className="flex items-center gap-2 no-underline group">
          <div className="w-5 h-5 flex items-center justify-center glass-card" style={{ borderRadius: 2 }}>
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none">
              <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9z"
                style={{ stroke: 'oklch(0.82 0.21 142)' }} strokeWidth="2"/>
            </svg>
          </div>
          <span className="text-white font-black text-[10px] tracking-[0.3em] uppercase group-hover:text-fluoro transition-colors">
            ReBon
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-bottle hover:text-fluoro transition-colors p-2"
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
