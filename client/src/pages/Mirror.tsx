import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { IconGitCompare, IconPeople, IconPulse, IconTrendingDown, IconTrendingUp } from "@/components/Icons";
import { toast } from "sonner";
import { ARCHETYPES } from "../../../shared/carbonData";

export default function Mirror() {
  const { isAuthenticated } = useAuth();
  const latestQuery = trpc.mirror.latest.useQuery(undefined, { enabled: isAuthenticated });
  const compareMutation = trpc.mirror.compare.useMutation({ onSuccess: () => latestQuery.refetch(), onError: e => toast.error(e.message) });

  const data = latestQuery.data;
  const arch = data?.archetype ? ARCHETYPES[data.archetype as keyof typeof ARCHETYPES] : null;
  const diff = data ? data.userCarbonKg - data.peerAvgKg : 0;
  const better = diff < 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2"><IconGitCompare className="w-6 h-6 text-white/70" /> CarbonMirror</h1>
        <p className="text-white/50 text-sm mt-1">You can't improve what you don't understand. Benchmark against peers who live exactly like you.</p>
      </div>

      {!isAuthenticated ? (
        <div className="card-glass rounded-xl border border-white/10 p-8 text-center">
          <IconGitCompare className="w-10 h-10 text-white/50 mx-auto mb-3" />
          <p className="text-white/50">Sign in to compare with peers</p>
        </div>
      ) : (
        <>
          <button onClick={() => compareMutation.mutate()} disabled={compareMutation.isPending} className="btn-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2 w-full justify-center">
            {compareMutation.isPending ? <><IconPulse className="w-4 h-4 animate-spin" /> Analyzing peers...</> : <><IconGitCompare className="w-4 h-4" /> Run Peer Comparison</>}
          </button>

          {data && (
            <div className="space-y-4">
              {/* Archetype Badge */}
              {arch && (
                <div className="card-glass rounded-xl border border-blue-400/20 p-4 flex items-center gap-4">
                  <div className="text-4xl">{arch.icon}</div>
                  <div>
                    <div className="text-xs font-bold tracking-widest text-white/70 uppercase mb-1">Your Archetype</div>
                    <div className="font-bold text-white">{arch.label}</div>
                    <div className="text-xs text-white/50">{arch.description}</div>
                  </div>
                </div>
              )}

              {/* Comparison Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="card-glass rounded-xl border border-white/10 p-5 text-center">
                  <div className="text-xs text-white/50 mb-2">Your Weekly Carbon</div>
                  <div className="text-3xl font-black text-white">{data.userCarbonKg.toFixed(1)}</div>
                  <div className="text-xs text-white/50">kg CO₂</div>
                </div>
                <div className="card-glass rounded-xl border border-white/10 p-5 text-center">
                  <div className="text-xs text-white/50 mb-2 flex items-center justify-center gap-1"><IconPeople className="w-3 h-3" /> Peer Average</div>
                  <div className="text-3xl font-black text-white">{data.peerAvgKg.toFixed(1)}</div>
                  <div className="text-xs text-white/50">kg CO₂ ({(data as any).peerCount ?? 0} peers)</div>
                </div>
              </div>

              {/* Percentile Ring */}
              <div className="card-glass rounded-xl border border-white/10 p-6 flex flex-col items-center gap-4">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="oklch(0.22 0.012 240)" strokeWidth="10" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke={better ? "oklch(0.55 0.18 145)" : "oklch(0.65 0.20 30)"} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(data.percentileRank / 100) * 314} 314`} className="transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-2xl font-black text-white">{data.percentileRank}th</div>
                    <div className="text-xs text-white/50">percentile</div>
                  </div>
                </div>
                <div className={`flex items-center gap-2 text-sm font-semibold ${better ? "text-white/70" : "text-white/70"}`}>
                  {better ? <IconTrendingDown className="w-4 h-4" /> : <IconTrendingUp className="w-4 h-4" />}
                  {better ? `${Math.abs(diff).toFixed(1)} kg below peer average` : `${diff.toFixed(1)} kg above peer average`}
                </div>
              </div>

              {/* AI Insights */}
              {(data as any).insights && (
                <div className="card-glass rounded-xl border border-primary/20 p-5 space-y-3">
                  <div className="text-sm font-bold text-white">ReBon Insights</div>
                  {((data as any).insights as string[]).map((insight, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-white/50">
                      <span className="text-primary mt-0.5 flex-shrink-0">→</span>
                      {insight}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
