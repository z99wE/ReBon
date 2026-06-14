import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { GitCompare, Loader2, TrendingDown, TrendingUp, Users } from "lucide-react";
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
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2"><GitCompare className="w-6 h-6 text-blue-400" /> CarbonMirror</h1>
        <p className="text-muted-foreground text-sm mt-1">See how you compare to anonymous peers with the same lifestyle</p>
      </div>

      {!isAuthenticated ? (
        <div className="card-glass rounded-xl border border-border p-8 text-center">
          <GitCompare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Sign in to compare with peers</p>
        </div>
      ) : (
        <>
          <button onClick={() => compareMutation.mutate()} disabled={compareMutation.isPending} className="btn-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2 w-full justify-center">
            {compareMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing peers...</> : <><GitCompare className="w-4 h-4" /> Run Peer Comparison</>}
          </button>

          {data && (
            <div className="space-y-4">
              {/* Archetype Badge */}
              {arch && (
                <div className="card-glass rounded-xl border border-blue-400/20 p-4 flex items-center gap-4">
                  <div className="text-4xl">{arch.icon}</div>
                  <div>
                    <div className="text-xs font-bold tracking-widest text-blue-400 uppercase mb-1">Your Archetype</div>
                    <div className="font-bold text-foreground">{arch.label}</div>
                    <div className="text-xs text-muted-foreground">{arch.description}</div>
                  </div>
                </div>
              )}

              {/* Comparison Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="card-glass rounded-xl border border-border p-5 text-center">
                  <div className="text-xs text-muted-foreground mb-2">Your Weekly Carbon</div>
                  <div className="text-3xl font-black text-foreground">{data.userCarbonKg.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">kg CO₂</div>
                </div>
                <div className="card-glass rounded-xl border border-border p-5 text-center">
                  <div className="text-xs text-muted-foreground mb-2 flex items-center justify-center gap-1"><Users className="w-3 h-3" /> Peer Average</div>
                  <div className="text-3xl font-black text-foreground">{data.peerAvgKg.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">kg CO₂ ({(data as any).peerCount ?? 0} peers)</div>
                </div>
              </div>

              {/* Percentile Ring */}
              <div className="card-glass rounded-xl border border-border p-6 flex flex-col items-center gap-4">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="oklch(0.22 0.012 240)" strokeWidth="10" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke={better ? "oklch(0.55 0.18 145)" : "oklch(0.65 0.20 30)"} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(data.percentileRank / 100) * 314} 314`} className="transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-2xl font-black text-foreground">{data.percentileRank}th</div>
                    <div className="text-xs text-muted-foreground">percentile</div>
                  </div>
                </div>
                <div className={`flex items-center gap-2 text-sm font-semibold ${better ? "text-green-400" : "text-red-400"}`}>
                  {better ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                  {better ? `${Math.abs(diff).toFixed(1)} kg below peer average` : `${diff.toFixed(1)} kg above peer average`}
                </div>
              </div>

              {/* AI Insights */}
              {(data as any).insights && (
                <div className="card-glass rounded-xl border border-primary/20 p-5 space-y-3">
                  <div className="text-sm font-bold text-foreground">🤖 ReBon AI Insights</div>
                  {((data as any).insights as string[]).map((insight, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
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
