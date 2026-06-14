import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Activity, Award, Flame, Leaf, Sparkles, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { Link } from "wouter";
import { ARCHETYPES } from "../../../shared/carbonData";

const STAT_STYLES: Record<string, { wrap: string; iconWrap: string; iconColor: string }> = {
  primary:      { wrap: "border-violet-500/25 hover:border-violet-500/50",  iconWrap: "bg-violet-500/10 border-violet-500/20",  iconColor: "text-violet-400" },
  "green-400":  { wrap: "border-emerald-500/25 hover:border-emerald-500/50", iconWrap: "bg-emerald-500/10 border-emerald-500/20", iconColor: "text-emerald-400" },
  "orange-400": { wrap: "border-amber-500/25 hover:border-amber-500/50",    iconWrap: "bg-amber-500/10 border-amber-500/20",    iconColor: "text-amber-400" },
  "yellow-400": { wrap: "border-yellow-500/25 hover:border-yellow-500/50",  iconWrap: "bg-yellow-500/10 border-yellow-500/20",  iconColor: "text-yellow-400" },
};
function StatCard({ label, value, unit, icon: Icon, color, trend }: { label: string; value: string | number; unit?: string; icon: any; color: string; trend?: "up" | "down" | "neutral" }) {
  const s = STAT_STYLES[color] ?? STAT_STYLES.primary;
  return (
    <div className={`card-glass p-5 rounded-xl border ${s.wrap} transition-all hover-lift`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${s.iconWrap} border flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${s.iconColor}`} aria-hidden="true" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend === "down" ? "text-emerald-400" : trend === "up" ? "text-rose-400" : "text-zinc-500"}`} aria-label={trend === "down" ? "trending down" : "trending up"}>
            {trend === "down" ? <TrendingDown className="w-3 h-3" aria-hidden="true" /> : trend === "up" ? <TrendingUp className="w-3 h-3" aria-hidden="true" /> : null}
          </div>
        )}
      </div>
      <div className="text-2xl font-black text-white">{value}<span className="text-sm font-medium text-zinc-400 ml-1">{unit}</span></div>
      <div className="text-xs text-zinc-500 mt-1">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const summaryQuery = trpc.activities.summary.useQuery(undefined, { enabled: isAuthenticated });
  const challengesQuery = trpc.challenges.list.useQuery(undefined, { enabled: isAuthenticated });
  const profileQuery = trpc.user.profile.useQuery(undefined, { enabled: isAuthenticated });

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto pulse-glow">
          <Leaf className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-foreground mb-2">Sign in to view your dashboard</h2>
          <p className="text-muted-foreground">Track your carbon footprint and compete with peers</p>
        </div>
        <a href="/login" className="btn-primary px-8 py-3 rounded-xl font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4" aria-hidden="true" /> Get Started
        </a>
      </div>
    );
  }

  const summary = summaryQuery.data;
  const profile = profileQuery.data;
  const archetype = profile?.archetype ? ARCHETYPES[profile.archetype as keyof typeof ARCHETYPES] : null;
  const pendingChallenges = challengesQuery.data?.filter(c => !c.completedAt).length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">
            Welcome back, <span className="text-gradient">{user?.name?.split(" ")[0] ?? "Hero"}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {archetype ? `${archetype.icon} ${archetype.label}` : "Complete onboarding to get your Carbon DNA"}
          </p>
        </div>
        {!profile?.onboardingCompleted && (
          <Link href="/onboarding">
            <button className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Get Carbon DNA
            </button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="This Week" value={summary?.weeklyKg?.toFixed(1) ?? "0"} unit="kg CO₂" icon={Activity} color="primary" trend="down" />
        <StatCard label="This Month" value={summary?.monthlyKg?.toFixed(1) ?? "0"} unit="kg CO₂" icon={Leaf} color="green-400" />
        <StatCard label="Current Streak" value={profile?.currentStreak ?? 0} unit="days" icon={Flame} color="orange-400" trend="up" />
        <StatCard label="Elo Score" value={profile?.eloScore ?? 1000} icon={Award} color="yellow-400" />
      </div>

      {/* Carbon Meter */}
      <div className="card-glass rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Weekly Carbon Budget</h3>
          <span className="text-xs text-muted-foreground">Target: 70 kg/week</span>
        </div>
        <div className="relative h-4 bg-muted rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000"
            style={{
              width: `${Math.min(((summary?.weeklyKg ?? 0) / 70) * 100, 100)}%`,
              background: (summary?.weeklyKg ?? 0) > 70
                ? "linear-gradient(90deg, oklch(0.65 0.20 30), oklch(0.55 0.22 15))"
                : "linear-gradient(90deg, oklch(0.55 0.18 145), oklch(0.65 0.20 160))"
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{summary?.weeklyKg?.toFixed(1) ?? 0} kg used</span>
          <span>{Math.max(0, 70 - (summary?.weeklyKg ?? 0)).toFixed(1)} kg remaining</span>
        </div>
      </div>

      {/* Category Breakdown */}
      {summary?.weeklyByCategory && Object.keys(summary.weeklyByCategory).length > 0 && (
        <div className="card-glass rounded-xl border border-border p-6">
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> By Category</h3>
          <div className="space-y-3">
            {Object.entries(summary.weeklyByCategory as Record<string, number>).map(([cat, kg]) => {
              const total = Object.values(summary.weeklyByCategory as Record<string, number>).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? (kg / total) * 100 : 0;
              const colors: Record<string, string> = { transport: "oklch(0.65 0.20 30)", meals: "oklch(0.65 0.18 145)", energy: "oklch(0.70 0.18 60)", shopping: "oklch(0.65 0.18 280)", other: "oklch(0.60 0.10 240)" };
              return (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize text-foreground font-medium">{cat}</span>
                    <span className="text-muted-foreground">{kg.toFixed(1)} kg</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: colors[cat] ?? "oklch(0.60 0.15 240)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { href: "/log", icon: Activity, label: "Log Activity", color: "text-green-400", bg: "bg-green-400/10 border-green-400/20" },
          { href: "/assistant", icon: Sparkles, label: "Ask ReBon AI", color: "text-primary", bg: "bg-primary/10 border-primary/20" },
          { href: "/leaderboard", icon: Award, label: "Leaderboard", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
          { href: "/mirror", icon: Zap, label: "CarbonMirror", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
        ].map(item => (
          <Link key={item.href} href={item.href}>
            <div className={`card-glass rounded-xl border ${item.bg} p-4 flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transition-transform`}>
              <item.icon className={`w-6 h-6 ${item.color}`} />
              <span className="text-xs font-semibold text-center text-foreground">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Active Challenges */}
      {pendingChallenges > 0 && (
        <div className="card-glass rounded-xl border border-primary/20 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-foreground flex items-center gap-2"><Flame className="w-4 h-4 text-orange-400" /> Active Challenges</h3>
            <Link href="/log"><span className="text-xs text-primary hover:underline cursor-pointer">{pendingChallenges} pending →</span></Link>
          </div>
          <div className="space-y-2">
            {challengesQuery.data?.filter(c => !c.completedAt).slice(0, 2).map(c => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{c.carbonSavingKg} kg CO₂ · +{c.pointsReward} pts</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${c.difficulty === "easy" ? "text-green-400 border-green-400/30 bg-green-400/10" : c.difficulty === "hard" ? "text-red-400 border-red-400/30 bg-red-400/10" : "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"}`}>{c.difficulty}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
