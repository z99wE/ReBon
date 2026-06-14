import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

const FEATURES = [
  {
    tag: "VOICE + AI",
    title: "Log in seconds, not minutes",
    desc: "Say \"I drove to work and had a burger\" — ReBon's voice intelligence understands context, calculates emissions, and logs everything instantly. No forms. No friction.",
    color: "#6366f1",
    icon: "🎙",
  },
  {
    tag: "AGENT-TO-AGENT",
    title: "Your AI negotiates for you",
    desc: "ReBon deploys a personal AI agent that challenges peers to binding carbon reduction commitments. Two agents debate, counter-propose, and reach an agreement — while you watch.",
    color: "#10b981",
    icon: "⚔",
  },
  {
    tag: "SOCIAL INTELLIGENCE",
    title: "See yourself through your peers' eyes",
    desc: "CarbonMirror benchmarks your footprint against anonymized peers with the same lifestyle archetype. Understand exactly where you stand — and what it takes to move up.",
    color: "#f59e0b",
    icon: "🪞",
  },
  {
    tag: "COLLECTIVE ACTION",
    title: "Small groups, massive impact",
    desc: "Form a tribe, pool your reductions, and model collective scenarios in real time. \"If our 12-person group goes plant-based for a month, we offset 2.4 tonnes of CO₂.\"",
    color: "#ec4899",
    icon: "🌍",
  },
  {
    tag: "PERSONALIZED COACHING",
    title: "Challenges that actually fit your life",
    desc: "Every week, ReBon's AI generates 3 challenges tuned to your lifestyle archetype and trending climate topics — not generic advice, but actions you can realistically take.",
    color: "#8b5cf6",
    icon: "🎯",
  },
  {
    tag: "IMPACT STORYTELLING",
    title: "Turn numbers into narratives",
    desc: "\"You saved 87kg CO₂ this month — equivalent to not driving from Mumbai to Pune 4 times.\" ReBon turns your data into emotionally resonant stories worth sharing.",
    color: "#06b6d4",
    icon: "✨",
  },
];

const ARCHETYPES = [
  { id: "urban_commuter", label: "Urban Commuter", color: "#6366f1", desc: "City-dweller optimizing daily transit" },
  { id: "conscious_consumer", label: "Conscious Consumer", color: "#10b981", desc: "Mindful about purchases and waste" },
  { id: "home_chef", label: "Home Chef", color: "#f59e0b", desc: "Cooking-focused with dietary impact" },
  { id: "remote_worker", label: "Remote Worker", color: "#ec4899", desc: "WFH lifestyle, energy-conscious" },
  { id: "frequent_flyer", label: "Frequent Flyer", color: "#8b5cf6", desc: "High travel, high reduction potential" },
  { id: "eco_explorer", label: "Eco Explorer", color: "#06b6d4", desc: "Outdoor enthusiast, nature-first" },
];

const STATS = [
  { value: "18,000+", label: "Climate Warriors", sub: "active this month" },
  { value: "2.4M kg", label: "CO₂ Reduced", sub: "and counting" },
  { value: "94%", label: "Challenge Completion", sub: "vs 23% industry avg" },
  { value: "4.8★", label: "Impact Score", sub: "avg user rating" },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 md:px-12 border-b border-white/6"
        style={{ background: "rgba(5,5,5,0.85)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-white rounded-sm flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
              <circle cx="12" cy="12" r="9" stroke="black" strokeWidth="1.5"/>
              <path d="M12 7v5l3 3" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-white font-black text-xs tracking-[0.3em] uppercase">ReBon</span>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <button className="btn-primary text-sm px-5 py-2">Open App →</button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <button className="btn-ghost text-sm px-4 py-2">Sign In</button>
              </Link>
              <Link href="/login">
                <button className="btn-primary text-sm px-5 py-2">Start Free →</button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] rounded-full opacity-12 blur-[120px]"
            style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-8 blur-[100px]"
            style={{ background: "radial-gradient(circle, #10b981, transparent 70%)" }} />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/4 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="label-tech text-white/50 text-[10px]">HACK2KILL · GOOGLE PROMPTWARS 2026</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tight mb-6 uppercase">
            Your carbon
            <span className="block" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)", color: "transparent" }}>
              footprint.
            </span>
            <span className="block" style={{ background: "linear-gradient(135deg, #6366f1, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Reimagined.
            </span>
          </h1>

          <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            ReBon is the world's first <strong className="text-white/80">agent-to-agent carbon negotiation platform</strong>.
            Track your impact, compete with peers, and let your AI fight for the planet on your behalf.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/login">
              <button className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto">
                Begin Your Carbon Journey →
              </button>
            </Link>
            <Link href="/login">
              <button className="btn-secondary text-base px-8 py-3.5 w-full sm:w-auto">
                Watch Demo
              </button>
            </Link>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/8 rounded-2xl overflow-hidden border border-white/8">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-[#050505] px-6 py-5 text-center">
                <p className="text-2xl md:text-3xl font-black text-white mb-0.5">{stat.value}</p>
                <p className="text-[10px] font-black tracking-widest text-white/40 uppercase">{stat.label}</p>
                <p className="text-[9px] text-white/20 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="label-tech text-white/30 mb-4">WHAT REBON DOES</p>
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
            Intelligence meets
            <span className="block" style={{ background: "linear-gradient(135deg, #6366f1, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              accountability
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/6 rounded-2xl overflow-hidden border border-white/8">
          {FEATURES.map((f) => (
            <div key={f.tag} className="bg-[#050505] p-8 group hover:bg-white/3 transition-colors">
              <div className="flex items-start justify-between mb-5">
                <span className="text-3xl">{f.icon}</span>
                <span className="label-tech text-[9px] px-2 py-0.5 rounded border"
                  style={{ color: f.color, borderColor: `${f.color}30`, background: `${f.color}10` }}>
                  {f.tag}
                </span>
              </div>
              <h3 className="text-white font-black text-lg mb-3 leading-tight">{f.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Archetypes ── */}
      <section className="py-24 px-6 border-t border-white/6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="label-tech text-white/30 mb-4">CARBON DNA</p>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
              Which archetype
              <span className="block text-white/30 font-light normal-case tracking-normal text-2xl mt-2">
                are you?
              </span>
            </h2>
            <p className="text-white/40 mt-4 max-w-lg mx-auto">
              ReBon segments you into one of 6 lifestyle archetypes based on a 6-question onboarding.
              Every insight, challenge, and peer comparison is calibrated to your profile.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {ARCHETYPES.map((a) => (
              <div key={a.id} className="glass-card p-5 border border-white/6 group hover:border-white/15 transition-all cursor-default">
                <div className="w-8 h-1 rounded-full mb-4 transition-all group-hover:w-12"
                  style={{ background: a.color }} />
                <p className="text-white font-black text-sm mb-1">{a.label}</p>
                <p className="text-white/30 text-xs">{a.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/login">
              <button className="btn-primary px-8 py-3">Discover Your Archetype →</button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Agent Arena CTA ── */}
      <section className="py-24 px-6 border-t border-white/6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-10 md:p-16 border border-white/8 relative overflow-hidden text-center">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 opacity-15 blur-3xl"
                style={{ background: "radial-gradient(ellipse, #6366f1, transparent)" }} />
            </div>
            <div className="relative">
              <span className="label-tech text-amber-400/70 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded mb-6 inline-block">
                ⚔ AGENT ARENA — WORLD FIRST
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
                Let your AI fight
                <span className="block" style={{ background: "linear-gradient(135deg, #6366f1, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  for the planet
                </span>
              </h2>
              <p className="text-white/50 text-lg max-w-xl mx-auto mb-8">
                Deploy your personal ReBon agent to challenge a peer's agent to a structured carbon reduction negotiation.
                Watch two AIs debate, counter-propose, and reach a binding commitment — in real time.
              </p>
              <Link href="/login">
                <button className="btn-primary text-base px-10 py-4">
                  Enter the Arena →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/6 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none">
                <circle cx="12" cy="12" r="9" stroke="black" strokeWidth="2"/>
              </svg>
            </div>
            <span className="text-white/40 text-xs font-black tracking-widest uppercase">ReBon</span>
          </div>
          <p className="text-white/20 text-xs text-center">
            Built for Google PromptWars Hack2Kill · Carbon Intelligence Platform · 2026
          </p>
          <div className="flex items-center gap-4">
            <span className="label-tech text-white/20 text-[9px]">Powered by</span>
            <span className="label-tech text-white/30 text-[9px]">GROQ</span>
            <span className="label-tech text-white/30 text-[9px]">NVIDIA NIM</span>
            <span className="label-tech text-white/30 text-[9px]">DEEPGRAM</span>
            <span className="label-tech text-white/30 text-[9px]">SARVAM AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
