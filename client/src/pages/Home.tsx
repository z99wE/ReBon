import React, { useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

/* ─── Particle canvas (barely visible, like trae.ai) ─── */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let animId: number;
    let mouse = { x: w / 2, y: h / 2 };

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    const onMouse = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouse);

    /* particles */
    const N = 55;
    type P = { x: number; y: number; vx: number; vy: number; r: number; life: number; maxLife: number };
    const pts: P[] = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.2 + 0.4,
      life: Math.random() * 300,
      maxLife: 300 + Math.random() * 200,
    }));

    const tick = () => {
      ctx.clearRect(0, 0, w, h);

      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        /* wrap */
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        /* fade in / out */
        const t = p.life / p.maxLife;
        const alpha = t < 0.1
          ? t / 0.1
          : t > 0.85
            ? (1 - t) / 0.15
            : 1;

        if (p.life > p.maxLife) {
          p.life = 0;
          p.x = Math.random() * w;
          p.y = Math.random() * h;
          p.vx = (Math.random() - 0.5) * 0.18;
          p.vy = (Math.random() - 0.5) * 0.18;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(74,222,128,${alpha * 0.22})`;
        ctx.fill();
      }

      /* draw faint lines between close particles */
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            const alpha = (1 - d / 120) * 0.04;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(74,222,128,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.85 }}
      aria-hidden="true"
    />
  );
}

/* ─── Data ─── */
const FEATURES = [
  {
    num: "01",
    tag: "VOICE + LOGGING",
    title: "Log in seconds, not minutes",
    body: "Say \"I drove to work and had a burger\" — ReBon understands context, calculates emissions, and logs everything instantly. No forms. No friction.",
  },
  {
    num: "02",
    tag: "AGENT-TO-AGENT",
    title: "Your agent negotiates for you",
    body: "ReBon deploys a personal negotiation agent that challenges peers to binding carbon reduction commitments. Two agents debate, counter-propose, and reach an agreement.",
  },
  {
    num: "03",
    tag: "SOCIAL INTELLIGENCE",
    title: "See yourself through your peers' eyes",
    body: "CarbonMirror benchmarks your footprint against anonymized peers with the same lifestyle archetype. Understand exactly where you stand — and what it takes to move up.",
  },
  {
    num: "04",
    tag: "COLLECTIVE ACTION",
    title: "Small groups, massive impact",
    body: "Form a tribe, pool your reductions, and model collective scenarios in real time. \"If our 12-person group goes plant-based for a month, we offset 2.4 tonnes of CO₂.\"",
  },
  {
    num: "05",
    tag: "PERSONALIZED COACHING",
    title: "Challenges that actually fit your life",
    body: "Every week, ReBon generates 3 challenges tuned to your lifestyle archetype and trending climate topics — not generic advice, but actions you can realistically take.",
  },
  {
    num: "06",
    tag: "IMPACT STORYTELLING",
    title: "Turn numbers into narratives",
    body: "\"You saved 87kg CO₂ this month — equivalent to not driving from Mumbai to Pune 4 times.\" ReBon turns your data into emotionally resonant stories worth sharing.",
  },
];

const STATS = [
  { value: "18,000+", label: "CLIMATE WARRIORS" },
  { value: "2.4M kg", label: "CO₂ REDUCED" },
  { value: "94%",     label: "CHALLENGE COMPLETION" },
  { value: "4.8",     label: "AVG IMPACT SCORE" },
];

/* ─── Component ─── */
export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#050505] text-white relative">
      <ParticleField />

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-14 border-b border-white/[0.05] bg-[#050505]/85 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          {/* Wordmark only — no icon squatting */}
          <span className="font-black text-white tracking-[0.2em] text-[13px] uppercase">REBON</span>
        </div>

        <div className="hidden md:flex items-center gap-10">
          <a href="#features" className="text-[10px] font-bold tracking-[0.2em] text-white/30 hover:text-white/70 transition-colors uppercase">Features</a>
          <a href="#how-it-works" className="text-[10px] font-bold tracking-[0.2em] text-white/30 hover:text-white/70 transition-colors uppercase">How It Works</a>
          <a href="#mission" className="text-[10px] font-bold tracking-[0.2em] text-white/30 hover:text-white/70 transition-colors uppercase">Mission</a>
        </div>

        {isAuthenticated ? (
          <Link href="/dashboard">
            <button className="btn-primary text-[10px] py-2 px-5">Open App</button>
          </Link>
        ) : (
          <a href={getLoginUrl()}>
            <button className="btn-primary text-[10px] py-2 px-5">Get Started</button>
          </a>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 pt-36 pb-28 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Tiny status chip */}
          <div className="inline-flex items-center gap-2 mb-10">
            <span className="w-1 h-1 rounded-full bg-[oklch(0.82_0.21_142)] animate-pulse-dot" />
            <span className="text-[9px] font-bold tracking-[0.3em] text-bottle uppercase">
              Carbon Intelligence Platform
            </span>
          </div>

          {/* Hero heading — pure type, no decoration */}
          <h1 className="font-black leading-none tracking-tighter mb-8" style={{ fontSize: 'clamp(3.5rem, 10vw, 8rem)' }}>
            <span className="block text-white">YOUR CARBON</span>
            <span className="block" style={{ color: 'rgba(255,255,255,0.12)' }}>FOOTPRINT.</span>
            <span className="block gradient-text-green">REIMAGINED.</span>
          </h1>

          <p className="text-white/40 text-base md:text-lg max-w-xl mb-12 leading-relaxed font-light">
            The world's first{" "}
            <span className="text-white/70 font-medium">agent-to-agent carbon negotiation platform</span>.
            Track your impact, compete with peers, and let your agent fight for the planet on your behalf.
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-20">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <button className="btn-primary py-3 px-8 text-[11px]">
                  Open your Dashboard →
                </button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <button className="btn-primary py-3 px-8 text-[11px]">
                  Begin your carbon journey →
                </button>
              </a>
            )}
            <a
              href="#how-it-works"
              className="text-[10px] font-bold tracking-[0.15em] text-white/25 hover:text-white/50 uppercase transition-colors"
            >
              How it works
            </a>
          </div>

          {/* Stats — horizontal rule style, pure numbers */}
          <div className="border-t border-white/[0.05] pt-10 grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-2xl md:text-3xl font-black text-white tabular-nums mb-1">{s.value}</div>
                <div className="text-[9px] font-bold tracking-[0.2em] text-bottle uppercase">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative z-10 border-t border-white/[0.05] py-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16">
            <span className="text-[9px] font-bold tracking-[0.3em] text-bottle uppercase block mb-5">What ReBon does</span>
            <h2 className="font-black leading-none tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
              <span className="text-white">INTELLIGENCE MEETS</span>
              <br />
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>CLIMATE ACTION</span>
            </h2>
          </div>

          {/* Grid — no icons, just typography */}
          <div className="divide-y divide-white/[0.05]">
            {FEATURES.map((f) => (
              <div
                key={f.num}
                className="py-8 grid grid-cols-12 gap-6 group hover:bg-white/[0.01] transition-colors -mx-6 px-6"
              >
                <div className="col-span-1 pt-0.5">
                  <span className="text-[9px] font-black tracking-widest text-white/15 group-hover:text-bottle transition-colors">
                    {f.num}
                  </span>
                </div>
                <div className="col-span-4 md:col-span-3">
                  <span className="text-[9px] font-bold tracking-[0.2em] text-bottle uppercase">
                    {f.tag}
                  </span>
                </div>
                <div className="col-span-7 md:col-span-8">
                  <h3 className="text-base font-black text-white mb-2 leading-tight">
                    {f.title}
                  </h3>
                  <p className="text-white/35 text-sm leading-relaxed font-light">
                    {f.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="relative z-10 border-t border-white/[0.05] py-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16">
            <span className="text-[9px] font-bold tracking-[0.3em] text-bottle uppercase block mb-5">The process</span>
            <h2 className="font-black leading-none tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
              <span className="text-white">THREE STEPS TO</span>
              <br />
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>NET ZERO HABITS</span>
            </h2>
          </div>

          <div className="space-y-0 divide-y divide-white/[0.05]">
            {[
              {
                step: "01",
                title: "Build your Carbon DNA",
                body: "Answer 6 questions. ReBon segments you into a lifestyle archetype and generates a personalised 90-day reduction roadmap.",
              },
              {
                step: "02",
                title: "Log without thinking",
                body: "Speak, tap, or type. ReBon calculates your CO₂ impact instantly across transport, food, energy, and shopping.",
              },
              {
                step: "03",
                title: "Compete, compare, improve",
                body: "Climb the Elo leaderboard, challenge peers via Agent Arena, and watch your collective tribe offset tonnes of CO₂.",
              },
            ].map((s) => (
              <div key={s.step} className="py-10 flex gap-10 group">
                <span
                  className="text-[4rem] font-black leading-none shrink-0 select-none tabular-nums"
                  style={{ color: 'rgba(255,255,255,0.04)', lineHeight: 1 }}
                >
                  {s.step}
                </span>
                <div className="pt-2">
                  <h3 className="text-lg font-black text-white mb-2">{s.title}</h3>
                  <p className="text-white/35 text-sm leading-relaxed font-light max-w-lg">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section id="mission" className="relative z-10 border-t border-white/[0.05] py-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <span className="text-[9px] font-bold tracking-[0.3em] text-bottle uppercase block mb-8">Our Mission</span>

          <blockquote className="font-black leading-tight tracking-tight mb-12" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.8rem)' }}>
            <span className="text-white">"The climate crisis is a collective action problem. </span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>ReBon makes collective action feel like a game you can win."</span>
          </blockquote>

          <p className="text-white/35 text-sm leading-relaxed font-light max-w-2xl mb-16">
            We believe the fastest path to behaviour change is not guilt — it is competition, community, and personalised intelligence.
            ReBon turns abstract carbon numbers into concrete daily actions, social accountability, and measurable progress toward a liveable planet.
          </p>

          {/* 3 principles — text only, no icons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.05]">
            {[
              { label: "Community-first", body: "Behaviour change is 4× more likely when peers are involved. ReBon makes your network your accountability system." },
              { label: "Radically personal", body: "No two users get the same advice. Your archetype, habits, and history shape every recommendation ReBon makes." },
              { label: "Privacy by design", body: "CarbonMirror peer comparisons use differential privacy. Your data is yours — we only use it to help you improve." },
            ].map((p) => (
              <div key={p.label} className="bg-[#050505] p-8 group hover:bg-white/[0.015] transition-colors">
                <h4 className="font-black text-white text-sm mb-3 group-hover:text-fluoro transition-colors">{p.label}</h4>
                <p className="text-white/30 text-sm leading-relaxed font-light">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 border-t border-white/[0.05] py-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-black leading-none tracking-tighter mb-8" style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}>
            <span className="block text-white">THE PLANET</span>
            <span className="block" style={{ color: 'rgba(255,255,255,0.1)' }}>CAN'T WAIT.</span>
          </h2>
          <p className="text-white/30 mb-10 text-sm font-light">
            Join 18,000+ climate warriors already reducing their footprint with ReBon.
          </p>
          {isAuthenticated ? (
            <Link href="/dashboard">
              <button className="btn-primary py-3 px-10 text-[11px]">Go to your Dashboard →</button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <button className="btn-primary py-3 px-10 text-[11px]">Start for free →</button>
            </a>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.05] px-6 md:px-12 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <span className="font-black text-white/20 text-[11px] tracking-[0.25em] uppercase">REBON</span>
        <p className="text-white/15 text-[10px] tracking-wide">Climate Intelligence Platform · © 2026 ReBon. All rights reserved.</p>
      </footer>
    </div>
  );
}
