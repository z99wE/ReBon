import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Leaf, Zap, Users, Star, ArrowRight, Mic, GitCompare, BookOpen } from "lucide-react";

function StarburstSVG({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i * 360) / 16;
        const rad = (angle * Math.PI) / 180;
        const x1 = 50 + 20 * Math.cos(rad); const y1 = 50 + 20 * Math.sin(rad);
        const x2 = 50 + 45 * Math.cos(rad); const y2 = 50 + 45 * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />;
      })}
      <circle cx="50" cy="50" r="12" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function OrbitRing({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="100" rx="90" ry="35" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
      <ellipse cx="100" cy="100" rx="90" ry="35" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" transform="rotate(60 100 100)" />
      <ellipse cx="100" cy="100" rx="90" ry="35" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" transform="rotate(120 100 100)" />
      <circle cx="100" cy="100" r="18" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

const features = [
  { icon: Mic, label: "Voice Logging", desc: "Say \"I drove 10 miles\" and Deepgram AI transcribes and calculates your carbon instantly.", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20" },
  { icon: GitCompare, label: "CarbonMirror", desc: "Anonymized peer benchmarking. See where you stand against people with the same lifestyle.", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  { icon: Zap, label: "CarbonInfluencer", desc: "Graph algorithms surface top reducers. Their actions cascade through the network.", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
  { icon: Users, label: "CarbonCollective", desc: "Form tribes. Pool reductions. Model collective impact with real-time what-if scenarios.", color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20" },
  { icon: Star, label: "AI Challenges", desc: "Groq + NVIDIA NIM generate personalized weekly challenges from your profile and climate trends.", color: "text-green-400", bg: "bg-green-400/10 border-green-400/20" },
  { icon: BookOpen, label: "CarbonStory", desc: "NLG crafts emotionally compelling narratives about your impact. Beautiful shareable cards.", color: "text-pink-400", bg: "bg-pink-400/10 border-pink-400/20" },
];

const archetypes = [
  { icon: "🌆", label: "Urban Commuter", desc: "Transit-first, apartment dweller" },
  { icon: "🌿", label: "Eco Pioneer", desc: "Vegan, cycling, renewable energy" },
  { icon: "⚡", label: "Energy Heavy", desc: "Large home, frequent flyer" },
  { icon: "🛒", label: "Conscious Consumer", desc: "Mindful shopping, plant-based" },
  { icon: "🏡", label: "Suburban Family", desc: "Car-dependent, medium house" },
  { icon: "✈️", label: "Digital Nomad", desc: "Remote work, frequent travel" },
];

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, loading, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-primary" />
          </div>
          <span className="font-black text-lg text-foreground">Re<span className="text-primary">Bon</span></span>
          <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase ml-1 hidden sm:block">Carbon Intelligence</span>
        </div>
        <a href={getLoginUrl()} className="btn-primary px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
          Get Started <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <StarburstSVG className="absolute top-20 right-16 w-24 h-24 text-primary/15" style={{ animation: "spin 30s linear infinite" }} />
          <StarburstSVG className="absolute bottom-32 left-12 w-16 h-16 text-orange-400/10" style={{ animation: "spin 25s linear infinite reverse" }} />
          <OrbitRing className="absolute top-1/2 right-8 w-64 h-64 text-primary/8 -translate-y-1/2" />
          <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-primary/3 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-orange-400/5 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(oklch(0.92 0.015 75) 1px, transparent 1px), linear-gradient(90deg, oklch(0.92 0.015 75) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>
        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            AI-Powered Carbon Intelligence
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tight">
              <span className="text-foreground">Your carbon</span><br />
              <span className="text-gradient-primary">footprint,</span><br />
              <span className="text-foreground">decoded.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              ReBon uses <strong className="text-foreground">Groq</strong>, <strong className="text-foreground">NVIDIA NIM</strong>, <strong className="text-foreground">Deepgram</strong>, and <strong className="text-foreground">Sarvam AI</strong> to help you understand, track, and reduce your carbon footprint — through competition, community, and radical transparency.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={getLoginUrl()} className="btn-primary px-8 py-4 rounded-xl font-bold text-base flex items-center gap-2 w-full sm:w-auto justify-center">
              <Leaf className="w-5 h-5" /> Discover Your Carbon DNA
            </a>
            <a href="#features" className="px-8 py-4 rounded-xl font-semibold text-base border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all w-full sm:w-auto text-center">
              See How It Works
            </a>
          </div>
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/50 max-w-lg mx-auto">
            {[{ value: "6", label: "Lifestyle Archetypes" }, { value: "4", label: "AI Models Routing" }, { value: "9", label: "Core Features" }].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-black text-primary">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 relative border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-bold tracking-widest text-primary uppercase mb-3">Features</div>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">Everything you need to act on climate</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Six deep-tech features powered by multi-model AI routing, graph algorithms, and behavioral science.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => (
              <div key={f.label} className={`card-glass rounded-2xl border p-6 space-y-3 hover:scale-[1.02] transition-transform ${f.bg}`}>
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${f.bg}`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <div className="font-bold text-foreground">{f.label}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Archetypes */}
      <section className="py-24 px-6 border-t border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <StarburstSVG className="absolute top-8 left-8 w-20 h-20 text-primary/10" />
          <OrbitRing className="absolute bottom-0 right-0 w-48 h-48 text-primary/8 translate-x-1/4 translate-y-1/4" />
        </div>
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="text-xs font-bold tracking-widest text-primary uppercase mb-3">Carbon DNA</div>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">Which archetype are you?</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">ReBon AI segments you into one of 6 lifestyle archetypes and builds a personalized 90-day reduction roadmap.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {archetypes.map(a => (
              <div key={a.label} className="card-glass rounded-2xl border border-border p-5 flex flex-col items-center text-center gap-3 hover:border-primary/40 transition-colors group">
                <div className="text-4xl group-hover:scale-110 transition-transform">{a.icon}</div>
                <div className="font-bold text-foreground text-sm">{a.label}</div>
                <div className="text-xs text-muted-foreground">{a.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Stack */}
      <section className="py-24 px-6 border-t border-border/50">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div>
            <div className="text-xs font-bold tracking-widest text-primary uppercase mb-3">AI Stack</div>
            <h2 className="text-3xl md:text-4xl font-black text-foreground">Multi-model intelligence routing</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">ReBon routes each task to the optimal AI model based on latency, depth, and language requirements.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Groq", role: "Fast Inference", desc: "Leaderboard, real-time chat", color: "text-orange-400", border: "border-orange-400/30", bg: "bg-orange-400/5" },
              { name: "NVIDIA NIM", role: "Deep Analysis", desc: "Impact modeling, challenges", color: "text-green-400", border: "border-green-400/30", bg: "bg-green-400/5" },
              { name: "Deepgram", role: "Voice AI", desc: "Speech transcription, NLP", color: "text-blue-400", border: "border-blue-400/30", bg: "bg-blue-400/5" },
              { name: "Sarvam AI", role: "Multilingual", desc: "Regional language support", color: "text-purple-400", border: "border-purple-400/30", bg: "bg-purple-400/5" },
            ].map(ai => (
              <div key={ai.name} className={`card-glass rounded-2xl border p-5 text-center space-y-2 ${ai.border} ${ai.bg}`}>
                <div className={`text-sm font-black ${ai.color}`}>{ai.name}</div>
                <div className="text-xs font-semibold text-foreground">{ai.role}</div>
                <div className="text-xs text-muted-foreground">{ai.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-primary/3" />
          <StarburstSVG className="absolute top-1/2 left-1/2 w-96 h-96 text-primary/5 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="max-w-2xl mx-auto text-center space-y-8 relative">
          <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto pulse-glow">
            <Leaf className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-foreground">Ready to reduce your footprint?</h2>
          <p className="text-muted-foreground text-lg">Join ReBon. Discover your Carbon DNA. Compete with peers. Build a movement.</p>
          <a href={getLoginUrl()} className="btn-primary px-10 py-4 rounded-xl font-bold text-lg inline-flex items-center gap-3">
            <Leaf className="w-5 h-5" /> Start Your Journey <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Leaf className="w-4 h-4 text-primary" />
          <span className="font-black text-foreground">Re<span className="text-primary">Bon</span></span>
          <span className="text-muted-foreground text-xs">Carbon Intelligence</span>
        </div>
        <p className="text-xs text-muted-foreground">Built for Hack2Kill · Google PromptWars · Powered by Groq, NVIDIA NIM, Deepgram & Sarvam AI</p>
      </footer>
    </div>
  );
}
