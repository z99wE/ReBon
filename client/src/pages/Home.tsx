import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { IconLeaf, IconSwords, IconEye, IconTarget, IconGlobe, IconShare, IconPulse, IconLayers, IconArrowForward, IconBarChart, IconPeople, IconChatbubble } from "@/components/Icons";

const FEATURES = [
  {
    tag: "VOICE + AI",
    icon: <IconPulse className="w-6 h-6 text-white/50" />,
    title: "Log in seconds, not minutes",
    body: "Say \"I drove to work and had a burger\" — ReBon understands context, calculates emissions, and logs everything instantly. No forms. No friction. Just your voice.",
  },
  {
    tag: "AGENT-TO-AGENT",
    icon: <IconSwords className="w-6 h-6 text-white/50" />,
    title: "Your AI negotiates for you",
    body: "ReBon deploys a personal AI agent that challenges peers to binding carbon reduction commitments. Two agents debate, counter-propose, and reach an agreement — while you watch.",
  },
  {
    tag: "SOCIAL INTELLIGENCE",
    icon: <IconEye className="w-6 h-6 text-white/50" />,
    title: "See yourself through your peers' eyes",
    body: "CarbonMirror benchmarks your footprint against anonymized peers with the same lifestyle archetype. Understand exactly where you stand — and what it takes to move up.",
  },
  {
    tag: "COLLECTIVE ACTION",
    icon: <IconGlobe className="w-6 h-6 text-white/50" />,
    title: "Small groups, massive impact",
    body: "Form a tribe, pool your reductions, and model collective scenarios in real time. \"If our 12-person group goes plant-based for a month, we offset 2.4 tonnes of CO₂.\"",
  },
  {
    tag: "PERSONALIZED COACHING",
    icon: <IconTarget className="w-6 h-6 text-white/50" />,
    title: "Challenges that actually fit your life",
    body: "Every week, ReBon generates 3 challenges tuned to your lifestyle archetype and trending climate topics — not generic advice, but actions you can realistically take.",
  },
  {
    tag: "IMPACT STORYTELLING",
    icon: <IconShare className="w-6 h-6 text-white/50" />,
    title: "Turn numbers into narratives",
    body: "\"You saved 87kg CO₂ this month — equivalent to not driving from Mumbai to Pune 4 times.\" ReBon turns your data into emotionally resonant stories worth sharing.",
  },
];

const STATS = [
  { value: "18,000+", label: "CLIMATE WARRIORS", sub: "active this month" },
  { value: "2.4M kg", label: "CO₂ REDUCED", sub: "and counting" },
  { value: "94%", label: "CHALLENGE COMPLETION", sub: "vs 23% industry avg" },
  { value: "4.8", label: "IMPACT SCORE", sub: "avg user rating" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: <IconLayers className="w-5 h-5 text-white/50" />,
    title: "Build your Carbon DNA",
    body: "Answer 6 questions. ReBon segments you into a lifestyle archetype and generates a personalised 90-day reduction roadmap.",
  },
  {
    step: "02",
    icon: <IconPulse className="w-5 h-5 text-white/50" />,
    title: "Log without thinking",
    body: "Speak, tap, or type. ReBon calculates your CO₂ impact instantly across transport, food, energy, and shopping.",
  },
  {
    step: "03",
    icon: <IconBarChart className="w-5 h-5 text-white/50" />,
    title: "Compete, compare, improve",
    body: "Climb the Elo leaderboard, challenge peers via Agent Arena, and watch your collective tribe offset tonnes of CO₂.",
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-white/10 border border-white/20 flex items-center justify-center">
            <IconLeaf className="w-4 h-4 text-white/80" />
          </div>
          <span className="font-black text-white tracking-tight text-lg">REBON</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-widest text-white/40">
          <a href="#features" className="hover:text-white/70 transition-colors">FEATURES</a>
          <a href="#how-it-works" className="hover:text-white/70 transition-colors">HOW IT WORKS</a>
          <a href="#mission" className="hover:text-white/70 transition-colors">MISSION</a>
        </div>
        {isAuthenticated ? (
          <Link href="/dashboard">
            <button className="btn-primary text-xs py-2 px-4">OPEN APP</button>
          </Link>
        ) : (
          <a href={getLoginUrl()}>
            <button className="btn-primary text-xs py-2 px-4">GET STARTED</button>
          </a>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 md:px-12 overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        {/* Glow orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.02] blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
            <span className="label-tech text-white/50 text-[10px] tracking-widest">HACK2KILL · GOOGLE PROMPTWARS 2026</span>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-[110px] font-black leading-none tracking-tighter mb-6">
            <span className="text-white">YOUR CARBON</span>
            <br />
            <span className="text-white/20">FOOTPRINT.</span>
            <br />
            <span className="text-gradient">REIMAGINED.</span>
          </h1>

          <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            ReBon is the world's first <strong className="text-white/80">agent-to-agent carbon negotiation platform</strong>.
            Track your impact, compete with peers, and let your AI fight for the planet on your behalf.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <button className="btn-primary flex items-center gap-2 text-sm py-3 px-8">
                  OPEN YOUR DASHBOARD <IconArrowForward className="w-4 h-4" />
                </button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <button className="btn-primary flex items-center gap-2 text-sm py-3 px-8">
                  BEGIN YOUR CARBON JOURNEY <IconArrowForward className="w-4 h-4" />
                </button>
              </a>
            )}
            <a href="#how-it-works" className="text-white/40 text-sm font-semibold hover:text-white/70 transition-colors tracking-wide">
              Watch Demo
            </a>
          </div>

          {/* Stats bar */}
          <div className="glass-card grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.06]">
            {STATS.map((s) => (
              <div key={s.label} className="p-5 text-center">
                <div className="text-2xl md:text-3xl font-black text-white mb-1">{s.value}</div>
                <div className="label-tech text-white/30 text-[9px] tracking-widest">{s.label}</div>
                <div className="text-white/20 text-[10px] mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="py-20 px-6 md:px-12 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <span className="label-tech text-white/30 text-xs tracking-widest block mb-4">WHAT REBON DOES</span>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-none">
              INTELLIGENCE MEETS<br />
              <span className="text-white/30">CLIMATE ACTION</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06]">
            {FEATURES.map((f) => (
              <div key={f.tag} className="bg-[#050505] p-8 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center justify-between mb-6">
                  {f.icon}
                  <span className="label-tech text-white/25 text-[9px] tracking-widest border border-white/10 px-2 py-1 rounded-full">
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mb-3 leading-tight">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6 md:px-12 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <span className="label-tech text-white/30 text-xs tracking-widest block mb-4">THE PROCESS</span>
            <h2 className="text-4xl md:text-5xl font-black text-white leading-none">
              THREE STEPS TO<br />
              <span className="text-white/30">NET ZERO HABITS</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="glass-card p-8">
                <div className="flex items-start justify-between mb-6">
                  <span className="text-5xl font-black text-white/[0.08] leading-none">{step.step}</span>
                  {step.icon}
                </div>
                <h3 className="text-xl font-black text-white mb-3">{step.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission statement */}
      <section id="mission" className="py-20 px-6 md:px-12 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto text-center">
          <span className="label-tech text-white/30 text-xs tracking-widest block mb-6">OUR MISSION</span>
          <blockquote className="text-3xl md:text-4xl font-black text-white leading-tight mb-8">
            "The climate crisis is a collective action problem. ReBon makes collective action{" "}
            <span className="text-white/30">feel like a game you can win.</span>"
          </blockquote>
          <p className="text-white/40 text-base leading-relaxed max-w-2xl mx-auto mb-12">
            We believe the fastest path to behaviour change is not guilt — it is competition, community, and 
            personalised intelligence. ReBon turns abstract carbon numbers into concrete daily actions, 
            social accountability, and measurable progress toward a liveable planet.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="glass-card p-6">
              <IconPeople className="w-5 h-5 text-white/30 mb-4" />
              <h4 className="font-black text-white mb-2">Community-first</h4>
              <p className="text-white/40 text-sm">Behaviour change is 4× more likely when peers are involved. ReBon makes your network your accountability system.</p>
            </div>
            <div className="glass-card p-6">
              <IconChatbubble className="w-5 h-5 text-white/30 mb-4" />
              <h4 className="font-black text-white mb-2">Radically personal</h4>
              <p className="text-white/40 text-sm">No two users get the same advice. Your archetype, habits, and history shape every recommendation ReBon makes.</p>
            </div>
            <div className="glass-card p-6">
              <IconShield className="w-5 h-5 text-white/30 mb-4" />
              <h4 className="font-black text-white mb-2">Privacy by design</h4>
              <p className="text-white/40 text-sm">CarbonMirror peer comparisons use differential privacy. Your data is yours — we only use it to help you improve.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 md:px-12 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black text-white leading-none mb-6">
            THE PLANET<br />
            <span className="text-white/20">CAN'T WAIT.</span>
          </h2>
          <p className="text-white/40 mb-10 text-lg">
            Join 18,000+ climate warriors already reducing their footprint with ReBon.
          </p>
          {isAuthenticated ? (
            <Link href="/dashboard">
              <button className="btn-primary flex items-center gap-2 mx-auto text-sm py-4 px-12">
                GO TO YOUR DASHBOARD <IconArrowForward className="w-4 h-4" />
              </button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <button className="btn-primary flex items-center gap-2 mx-auto text-sm py-4 px-12">
                START FOR FREE <IconArrowForward className="w-4 h-4" />
              </button>
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-white/10 border border-white/20 flex items-center justify-center">
            <IconLeaf className="w-3 h-3 text-white/60" />
          </div>
          <span className="font-black text-white/40 text-sm tracking-tight">REBON</span>
        </div>
        <p className="text-white/20 text-xs">Built for Hack2Kill · Google PromptWars 2026 · Climate Intelligence Platform</p>
        <p className="text-white/20 text-xs">© 2026 ReBon. All rights reserved.</p>
      </footer>
    </div>
  );
}

// Need to import IconShield used in mission section
import { IconShield } from "@/components/Icons";
