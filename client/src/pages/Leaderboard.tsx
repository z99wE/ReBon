import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Trophy, Crown, Zap, Flame, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

const rankColors = ["text-yellow-400", "text-slate-300", "text-amber-600"];
const rankIcons = [Crown, Medal, Medal];

export default function Leaderboard() {
  const { user } = useAuth();
  const lbQuery = trpc.leaderboard.current.useQuery();
  const { season, entries } = lbQuery.data ?? { season: null, entries: [] };

  const getName = (entry: (typeof entries)[number]) => (entry as any).user?.name ?? "Anonymous";
  const getArchetype = (entry: (typeof entries)[number]) => (entry as any).user?.archetypeLabel ?? "Explorer";
  const getStreak = (entry: (typeof entries)[number]) => (entry as any).streakDays ?? 0;
  const getLogs = (entry: (typeof entries)[number]) => (entry as any).activitiesLogged ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2"><Trophy className="w-6 h-6 text-yellow-400" /> Leaderboard</h1>
          <p className="text-muted-foreground text-sm mt-1">{season ? `Season ${(season as any).name ?? (season as any).seasonNumber} · ${new Date((season as any).endDate ?? (season as any).endsAt).toLocaleDateString()}` : "Live rankings"}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-400/10 border border-green-400/20">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-medium text-green-400">Live</span>
        </div>
      </div>

      {/* Top 3 Podium */}
      {entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-2">
          {[entries[1], entries[0], entries[2]].map((entry, podiumIdx) => {
            const rank = podiumIdx === 1 ? 1 : podiumIdx === 0 ? 2 : 3;
            const heights = ["h-24", "h-32", "h-20"];
            const RankIcon = rankIcons[rank - 1] ?? Medal;
            const name = getName(entry);
            return (
              <div key={entry.id} className={cn("flex flex-col items-center justify-end", heights[podiumIdx])}>
                <div className="text-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-muted border-2 border-border flex items-center justify-center mx-auto mb-1 text-sm font-bold">
                    {name[0].toUpperCase()}
                  </div>
                  <div className="text-xs font-medium truncate max-w-[80px]">{name}</div>
                  <div className="text-xs text-muted-foreground">{entry.eloScore} pts</div>
                </div>
                <div className={cn("w-full rounded-t-lg flex items-center justify-center py-2", rank === 1 ? "bg-yellow-400/20 border border-yellow-400/30" : rank === 2 ? "bg-slate-400/20 border border-slate-400/30" : "bg-amber-700/20 border border-amber-700/30")}>
                  <RankIcon className={cn("w-5 h-5", rankColors[rank - 1])} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full List */}
      <div className="card-glass rounded-xl border border-border overflow-hidden">
        {lbQuery.isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading rankings...</div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center">
            <Trophy className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No rankings yet. Be the first to log activities!</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {entries.map((entry, idx) => {
              const isCurrentUser = entry.userId === (user as any)?.id;
              const rank = idx + 1;
              const name = getName(entry);
              const streak = getStreak(entry);
              return (
                <div key={entry.id} className={cn("flex items-center gap-4 px-5 py-4 transition-colors", isCurrentUser ? "bg-primary/5 border-l-2 border-primary" : "hover:bg-muted/30")}>
                  <div className={cn("w-8 text-center font-black text-sm flex-shrink-0", rank <= 3 ? rankColors[rank - 1] : "text-muted-foreground")}>
                    {rank <= 3 ? (() => { const I = rankIcons[rank - 1] ?? Medal; return <I className="w-4 h-4 mx-auto" />; })() : `#${rank}`}
                  </div>
                  <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    {name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate flex items-center gap-2">
                      {name}
                      {isCurrentUser && <span className="text-xs text-primary font-normal">(you)</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">{getArchetype(entry)}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-sm flex items-center gap-1 justify-end">
                      <Zap className="w-3 h-3 text-yellow-400" />
                      {entry.eloScore}
                    </div>
                    <div className="text-xs text-muted-foreground">{getLogs(entry)} logs</div>
                  </div>
                  {streak > 0 && (
                    <div className="flex items-center gap-1 text-xs text-orange-400 flex-shrink-0">
                      <Flame className="w-3 h-3" /> {streak}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
