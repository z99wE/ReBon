import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { ArrowRight, Zap, Users, Trophy, GitCompare, Bot, Mic } from "lucide-react";

const ASCII_EARTH = `
    .--.
   /    \\
  | o  o |
  |  __  |
   \\    /
    '--'
`;

const ASCII_LEAF = `
  ╭─╮
 ╱   ╲
│ ●   │
 ╲   ╱
  ╰─╯
`;

const ASCII_BANNER = `
██████╗ ███████╗██████╗  ██████╗ ███╗   ██╗
██╔══██╗██╔════╝██╔══██╗██╔═══██╗████╗  ██║
██████╔╝█████╗  ██████╔╝██║   ██║██╔██╗ ██║
██╔══██╗██╔══╝  ██╔══██╗██║   ██║██║╚██╗██║
██║  ██║███████╗██████╔╝╚██████╔╝██║ ╚████║
╚═╝  ╚═╝╚══════╝╚═════╝  ╚═════╝ ╚═╝  ╚═══╝
`;

const features = [
  {
    icon: Mic,
    tag: "deepgram",
    title: "Voice Carbon Logging",
    desc: "Say \"I drove 20km and had steak for lunch\" — Deepgram transcribes, Groq parses it into CO₂ entries instantly.",
  },
  {
    icon: Bot,
    tag: "groq · nvidia nim · sarvam",
    title: "ReBon AI Assistant",
    desc: "Multi-model routing: Groq for speed, NVIDIA NIM for deep analysis, Sarvam AI for multilingual support.",
  },
  {
    icon: Trophy,
    tag: "elo rating",
    title: "Live Leaderboard",
    desc: "Chess-style Elo scoring. Beat peers with similar carbon baselines. Weekly seasons, rival matchups.",
  },
  {
    icon: Zap,
    tag: "graph algorithm",
    title: "CarbonInfluencer",
    desc: "Graph-based influence scoring amplifies top reducers. Cascading behaviour change through social proof.",
  },
  {
    icon: GitCompare,
    tag: "privacy-preserving",
    title: "CarbonMirror",
    desc: "Anonymised peer comparison within your lifestyle archetype. See category gaps without revealing identities.",
  },
  {
    icon: Users,
    tag: "collective impact",
    title: "CarbonCollective",
    desc: "Form tribes, pool reductions. What-if scenarios: \"If our group goes vegan, we save 2,340 kg this month.\"",
  },
];

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" aria-label="Loading">
        <div className="font-mono text-muted-foreground text-sm">
          <span className="text-primary">$</span> initialising rebon<span className="cursor-blink" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Skip to content */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded z-50 font-mono text-sm">
        Skip to main content
      </a>

      {/* Top bar */}
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded border border-primary/40 bg-primary/10 flex items-center justify-center font-mono font-bold text-xs text-primary" aria-hidden="true">Re</div>
          <span className="font-mono font-bold text-sm text-foreground">ReBon</span>
          <span className="rebon-tag rebon-tag-green ml-1">v1.0</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block font-mono text-xs text-muted-foreground">Hack2Kill · Google PromptWars</span>
          <a
            href={getLoginUrl()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-primary/40 bg-primary/10 text-primary font-mono text-xs hover:bg-primary/20 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Sign in to ReBon"
          >
            Sign in <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </a>
        </div>
      </header>

      <main id="main-content">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border" aria-labelledby="hero-heading">
          {/* ASCII background art */}
          <div className="absolute inset-0 flex items-center justify-end pr-8 pointer-events-none" aria-hidden="true">
            <pre className="ascii-art text-[0.7rem] leading-[1.3] opacity-60">{ASCII_BANNER}</pre>
          </div>

          <div className="relative max-w-4xl mx-auto px-6 py-20 lg:py-28">
            {/* Status */}
            <div className="flex items-center gap-2 mb-6">
              <span className="live-dot" aria-hidden="true" />
              <span className="font-mono text-xs text-primary">system online · carbon intelligence active</span>
            </div>

            <h1 id="hero-heading" className="text-4xl lg:text-6xl font-bold font-mono mb-4 leading-tight">
              <span className="text-gradient-green">Track.</span>{" "}
              <span className="text-gradient-amber">Compete.</span>{" "}
              <span className="text-foreground">Reduce.</span>
            </h1>

            <p className="text-muted-foreground text-lg max-w-xl mb-3 leading-relaxed">
              ReBon turns climate action into a living, competitive, community-driven movement.
              Log carbon with your voice. Battle peers on the leaderboard. Let AI coach your habits.
            </p>

            <div className="font-mono text-xs text-muted-foreground mb-8 space-y-1">
              <div><span className="text-primary">$</span> models: groq · nvidia-nim · deepgram · sarvam-ai</div>
              <div><span className="text-primary">$</span> features: voice-log · elo-ranking · ai-challenges · nlg-stories</div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={getLoginUrl()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-primary text-primary-foreground font-mono text-sm font-semibold hover:bg-primary/90 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="Get started with ReBon"
              >
                Get Started <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded border border-border text-muted-foreground font-mono text-sm hover:text-foreground hover:border-primary/40 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="View source code on GitHub"
              >
                View Source
              </a>
            </div>
          </div>
        </section>

        {/* ASCII art section divider */}
        <div className="border-b border-border px-6 py-4 flex items-center gap-4 bg-[oklch(0.08_0.005_240)]" aria-hidden="true">
          <pre className="ascii-art-bright text-[0.5rem] leading-tight">{`┌─────────────────────────────────────────────────────────────────────┐
│  CARBON INTELLIGENCE PLATFORM  ·  6 AI-POWERED FEATURES  ·  LIVE   │
└─────────────────────────────────────────────────────────────────────┘`}</pre>
        </div>

        {/* Features grid */}
        <section className="max-w-5xl mx-auto px-6 py-16" aria-labelledby="features-heading">
          <div className="mb-10">
            <div className="font-mono text-xs text-muted-foreground mb-2">
              <span className="text-primary">$</span> ls features/
            </div>
            <h2 id="features-heading" className="text-2xl font-bold font-mono text-foreground">
              What ReBon does
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, tag, title, desc }) => (
              <article
                key={title}
                className="rebon-card p-5 hover-lift"
                aria-label={title}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded border border-primary/30 bg-primary/8 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="rebon-tag rebon-tag-muted mt-1">{tag}</span>
                </div>
                <h3 className="font-mono font-semibold text-sm text-foreground mb-2">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Architecture section */}
        <section className="border-t border-border bg-[oklch(0.08_0.005_240)]" aria-labelledby="arch-heading">
          <div className="max-w-5xl mx-auto px-6 py-12">
            <div className="font-mono text-xs text-muted-foreground mb-2">
              <span className="text-primary">$</span> cat architecture.md
            </div>
            <h2 id="arch-heading" className="text-xl font-bold font-mono text-foreground mb-6">How it works</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* ASCII architecture diagram */}
              <div>
                <pre className="ascii-art-bright text-[0.52rem] leading-[1.4] font-mono">{`┌──────────────────────────────────────┐
│         React 19 Frontend            │
│  Dashboard · Log · AI · Leaderboard  │
└──────────────────┬───────────────────┘
                   │ tRPC (type-safe)
┌──────────────────▼───────────────────┐
│         Express 4 Backend            │
│                                      │
│  ┌──────────┐  ┌──────────────────┐  │
│  │ AI Router│  │  Carbon Engine   │  │
│  │ Groq     │  │  EMISSION_FACTORS│  │
│  │ NIM      │  │  Elo Calculator  │  │
│  │ Deepgram │  │  Archetype Model │  │
│  │ Sarvam   │  └──────────────────┘  │
│  └──────────┘                        │
└──────────────────┬───────────────────┘
                   │ Drizzle ORM
┌──────────────────▼───────────────────┐
│         MySQL / TiDB Database        │
│  users · activities · challenges     │
│  stories · leaderboard · collectives │
└──────────────────────────────────────┘`}</pre>
              </div>

              {/* AI routing table */}
              <div className="space-y-3">
                <div className="font-mono text-xs text-muted-foreground mb-3">AI model routing:</div>
                {[
                  { provider: "Groq", model: "llama-3.3-70b", use: "Fast inference, challenges, parsing", tag: "fast" },
                  { provider: "NVIDIA NIM", model: "llama-3.3-70b", use: "Deep analysis, stories, what-if", tag: "deep" },
                  { provider: "Deepgram", model: "nova-2", use: "Voice transcription", tag: "voice" },
                  { provider: "Sarvam AI", model: "saaras:v2", use: "Multilingual support", tag: "i18n" },
                ].map(({ provider, model, use, tag }) => (
                  <div key={provider} className="flex items-start gap-3 p-3 rounded border border-border bg-card">
                    <span className="rebon-tag rebon-tag-green w-14 justify-center flex-shrink-0">{tag}</span>
                    <div className="min-w-0">
                      <div className="font-mono text-xs text-foreground font-medium">{provider}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{model} · {use}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border px-6 py-12 text-center" aria-labelledby="cta-heading">
          <div className="max-w-lg mx-auto">
            <pre className="ascii-art-bright text-[0.5rem] leading-tight mb-6 mx-auto w-fit" aria-hidden="true">{`  🌱  every kg CO₂ counts  🌱`}</pre>
            <h2 id="cta-heading" className="font-mono text-xl font-bold text-foreground mb-3">
              Ready to track your footprint?
            </h2>
            <p className="text-muted-foreground text-sm font-mono mb-6">
              Complete Carbon DNA onboarding in 2 minutes. Get your archetype, roadmap, and first AI challenge.
            </p>
            <a
              href={getLoginUrl()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded bg-primary text-primary-foreground font-mono text-sm font-semibold hover:bg-primary/90 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="Sign in and start tracking your carbon footprint"
            >
              Start now <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border px-6 py-4 flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[10px] text-muted-foreground">
            Built for Hack2Kill · Google PromptWars 2026
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            67 tests passing · TypeScript · tRPC · Drizzle ORM
          </span>
        </footer>
      </main>
    </div>
  );
}
