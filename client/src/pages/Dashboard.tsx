import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { ARCHETYPES } from "@shared/carbonData";

const QUICK_ACTIONS = [
  { href: "/log",        label: "Log Activity",   tag: "INPUT",   desc: "Voice or tap to log" },
  { href: "/assistant",  label: "Ask ReBon AI",   tag: "AI",      desc: "Get coaching now" },
  { href: "/leaderboard",label: "Leaderboard",    tag: "COMPETE", desc: "See your rank" },
  { href: "/agents",     label: "Agent Arena",    tag: "A2A NEW", desc: "AI-to-AI negotiation" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { data: profile } = trpc.user.profile.useQuery();
  const { data: activities } = trpc.activities.list.useQuery({ limit: 5 });
  const { data: challenges } = trpc.challenges.list.useQuery();

  const archetype = profile?.archetype ? ARCHETYPES[profile.archetype as keyof typeof ARCHETYPES] : null;
  const totalKg = activities?.reduce((s, a) => s + Number(a.carbonKg), 0) ?? 0;
  const weeklyBudget = archetype?.weeklyAvgKg ?? 70;
  const budgetUsed = Math.min((totalKg / weeklyBudget) * 100, 100);
  const budgetColor = budgetUsed > 80 ? '#f87171' : budgetUsed > 50 ? '#fbbf24' : '#4ade80';

  const STATS = [
    { label: "Elo Score",        value: profile?.eloScore ?? 1000,          unit: "pts",  accent: "stat-accent-violet", color: "#a78bfa" },
    { label: "Weekly CO₂",       value: totalKg.toFixed(1),                  unit: "kg",   accent: "stat-accent-green",  color: "#4ade80" },
    { label: "Active Challenges", value: challenges?.filter(c => !c.completedAt).length ?? 0, unit: "",  accent: "stat-accent-cyan",   color: "#67e8f9" },
    { label: "Influence Score",   value: profile?.influenceScore?.toFixed(0) ?? "0", unit: "pts", accent: "stat-accent-amber", color: "#fbbf24" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] p-6 md:p-8">
      {/* ── Header ── */}
      <div className="border-b border-white/8 pb-6 mb-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="label-tech mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block mr-2 animate-pulse-dot" />
              Dashboard — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] ?? 'Warrior'}.
            </h1>
            {archetype && (
              <p className="text-white/40 text-sm mt-1">
                Archetype: <span className="text-white/70 font-600">{archetype.label}</span>
                {" "}— {archetype.description}
              </p>
            )}
          </div>
          <Link href="/log">
            <button className="btn-primary hidden md:flex">Log Activity →</button>
          </Link>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border-l border-t border-white/8 mb-8">
        {STATS.map((s, i) => (
          <div key={i} className={`glass-card border-r border-b border-white/8 p-6 ${s.accent}`}>
            <p className="label-tech mb-3">{s.label}</p>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-black" style={{color: s.color}}>{s.value}</span>
              {s.unit && <span className="text-white/40 text-sm mb-1">{s.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* ── Weekly Budget Bar ── */}
      <div className="glass-card border border-white/8 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="label-tech mb-1">Weekly Carbon Budget</p>
            <p className="text-white/40 text-xs">Based on your {archetype?.label ?? 'lifestyle'} archetype target</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black" style={{color: budgetColor}}>{budgetUsed.toFixed(0)}%</span>
            <p className="text-white/30 text-xs">{totalKg.toFixed(1)} / {weeklyBudget} kg CO₂</p>
          </div>
        </div>
        <div className="h-2 bg-white/8 rounded-full overflow-hidden" role="progressbar" aria-valuenow={budgetUsed} aria-valuemin={0} aria-valuemax={100} aria-label="Weekly carbon budget used">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${budgetUsed}%`, background: budgetColor, boxShadow: `0 0 12px ${budgetColor}40` }}
          />
        </div>
        {budgetUsed > 80 && (
          <p className="text-rose-400/80 text-xs mt-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse-dot" />
            High emissions week — ask ReBon AI for quick wins
          </p>
        )}
      </div>

      {/* ── Quick Actions + Recent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Quick Actions */}
        <div className="glass-card border border-white/8">
          <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
            <p className="label-tech-bright">Quick Actions</p>
            <span className="text-[9px] text-white/20 font-black tracking-widest">SYS-Q1</span>
          </div>
          <div className="divide-y divide-white/8">
            {QUICK_ACTIONS.map((a) => (
              <Link key={a.href} href={a.href} className="flex items-center justify-between px-6 py-4 hover:bg-white/4 transition-colors no-underline group">
                <div className="flex items-center gap-4">
                  <span className="label-tech text-white/20 group-hover:text-white/40 transition-colors">{a.tag}</span>
                  <div>
                    <p className="text-sm font-700 text-white/80 group-hover:text-white transition-colors">{a.label}</p>
                    <p className="text-xs text-white/30">{a.desc}</p>
                  </div>
                </div>
                <span className="text-white/20 group-hover:text-white/60 transition-colors text-lg">→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card border border-white/8">
          <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
            <p className="label-tech-bright">Recent Activity</p>
            <Link href="/log" className="text-[9px] font-black tracking-widest text-white/30 hover:text-white/60 transition-colors no-underline uppercase">View All →</Link>
          </div>
          {!activities || activities.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-white/20 text-sm mb-4">No activities logged yet.</p>
              <Link href="/log">
                <button className="btn-ghost text-xs py-2 px-4">Log your first activity →</button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/8">
              {activities.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm text-white/70 font-500">{a.label || a.subcategory}</p>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest">{a.category} · {new Date(a.loggedAt).toLocaleDateString()}</p>
                  </div>
                  <span className="text-sm font-black" style={{color: Number(a.carbonKg) > 5 ? '#f87171' : '#4ade80'}}>
                    {Number(a.carbonKg).toFixed(1)} kg
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Active Challenges ── */}
      {challenges && challenges.filter(c => !c.completedAt).length > 0 && (
        <div className="glass-card border border-white/8">
          <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
            <p className="label-tech-bright">Active Challenges</p>
            <Link href="/assistant" className="text-[9px] font-black tracking-widest text-white/30 hover:text-white/60 transition-colors no-underline uppercase">Get New →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/8">
            {challenges.filter(c => !c.completedAt).slice(0, 3).map((c) => (
              <div key={c.id} className="p-6">
                <p className="label-tech mb-2">{c.category}</p>
                <p className="text-sm font-700 text-white/80 mb-2">{c.title}</p>
                <p className="text-xs text-white/40 mb-3">{c.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-cyan-400/70 bg-cyan-400/10 px-2 py-0.5 uppercase tracking-widest">{c.difficulty}</span>
                  <span className="text-[10px] text-white/30">{c.carbonSavingKg} kg CO₂ saved</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
