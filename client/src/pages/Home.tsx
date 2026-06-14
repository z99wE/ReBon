import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Leaf, Zap, Users, BarChart2, Bot, ArrowRight, Globe, Shield, Mic } from "lucide-react";

const FEATURES = [
  { icon: Mic,      color: "text-violet-400", bg: "gradient-violet", title: "Voice Logging",       desc: "Say 'I drove 15km to work' — Deepgram transcribes, AI extracts carbon data instantly." },
  { icon: Bot,      color: "text-indigo-400", bg: "gradient-violet", title: "ReBon AI Assistant",  desc: "Multi-model AI routing across Groq, NVIDIA NIM, and Sarvam AI for multilingual coaching." },
  { icon: Trophy,   color: "text-amber-400",  bg: "gradient-amber",  title: "Elo Leaderboard",     desc: "Real-time Elo-rated competition with weekly seasons and rival matchups." },
  { icon: Users,    color: "text-cyan-400",   bg: "gradient-cyan",   title: "CarbonCollective",    desc: "Form tribes, pool your reductions, and model collective what-if scenarios." },
  { icon: BarChart2,color: "text-rose-400",   bg: "gradient-rose",   title: "CarbonMirror",        desc: "Anonymised peer comparison with differential privacy. See where you rank." },
  { icon: Globe,    color: "text-emerald-400",bg: "gradient-green",  title: "CarbonStory NLG",     desc: "AI generates emotionally compelling shareable narratives about your impact." },
];

import { Trophy } from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen mesh-bg text-white overflow-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60 backdrop-blur-sm sticky top-0 z-20 bg-zinc-950/60" aria-label="Site navigation">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center glow-violet">
            <Leaf className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <span className="font-black text-lg tracking-tight">ReBon</span>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link href="/dashboard" className="btn-primary px-4 py-2 rounded-xl text-sm flex items-center gap-2">
              Open App <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-2">Sign in</Link>
              <Link href="/login" className="btn-primary px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                Get started <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 pt-24 pb-20 text-center max-w-4xl mx-auto" aria-labelledby="hero-heading">
        {/* Abstract blobs */}
        <div className="absolute top-10 left-1/4 w-72 h-72 blob bg-violet-600/10 blur-2xl pointer-events-none" aria-hidden="true" />
        <div className="absolute top-20 right-1/4 w-56 h-56 blob bg-emerald-500/10 blur-2xl pointer-events-none" style={{ animationDelay: "3s" }} aria-hidden="true" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 badge-violet px-3 py-1.5 rounded-full text-xs font-semibold mb-6">
            <Zap className="w-3.5 h-3.5" aria-hidden="true" /> Powered by Groq · NVIDIA NIM · Deepgram · Sarvam AI
          </div>

          <h1 id="hero-heading" className="text-5xl sm:text-6xl font-black leading-tight mb-6">
            Track your carbon.<br />
            <span className="text-gradient">Beat your rivals.</span>
          </h1>

          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            ReBon is an AI-powered carbon intelligence platform that turns climate action into a social movement.
            Log activities by voice, compete on live leaderboards, and let AI coach you to net-zero.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={isAuthenticated ? "/dashboard" : "/login"}
              className="btn-primary px-6 py-3 rounded-xl text-base flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Start tracking free <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/leaderboard"
              className="px-6 py-3 rounded-xl text-base border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              View leaderboard <Trophy className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="px-6 pb-16" aria-label="Platform statistics">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4">
          {[
            { value: "4 AI Models", label: "Multi-model routing" },
            { value: "9 Features",  label: "Fully integrated" },
            { value: "Real-time",   label: "Live leaderboards" },
          ].map(({ value, label }) => (
            <div key={label} className="card-glass rounded-2xl p-5 text-center hover-lift">
              <div className="text-2xl font-black text-gradient mb-1">{value}</div>
              <div className="text-xs text-zinc-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-20" aria-labelledby="features-heading">
        <div className="max-w-4xl mx-auto">
          <h2 id="features-heading" className="text-3xl font-black text-center mb-3">Everything you need to go net-zero</h2>
          <p className="text-zinc-500 text-center mb-12 text-sm">Six AI-powered features working together</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
              <article key={title} className={`card-glass ${bg} rounded-2xl p-5 hover-lift`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${bg}`}>
                  <Icon className={`w-4.5 h-4.5 ${color}`} aria-hidden="true" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1.5">{title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24" aria-labelledby="cta-heading">
        <div className="max-w-2xl mx-auto text-center card-glass rounded-3xl p-10 relative overflow-hidden">
          <div className="absolute inset-0 gradient-violet opacity-50" aria-hidden="true" />
          <div className="relative z-10">
            <Shield className="w-8 h-8 text-violet-400 mx-auto mb-4" aria-hidden="true" />
            <h2 id="cta-heading" className="text-2xl font-black mb-3">Sign in with email or phone</h2>
            <p className="text-zinc-400 text-sm mb-6">No password required. Get a 6-digit code and you're in. Works for any hackathon judge.</p>
            <Link href="/login" className="btn-primary px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2">
              Sign in now <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 px-6 py-6 text-center text-xs text-zinc-600">
        <p>ReBon — Built for Hack2Kill PromptWars · Google · 2026</p>
      </footer>
    </div>
  );
}
