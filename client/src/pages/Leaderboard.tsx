import React from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { IconTrophy, IconMedal, IconZap, IconPulse, IconStar } from "@/components/Icons";
import { cn } from "@/lib/utils";

export default function Leaderboard() {
  const { user } = useAuth();
  const lbQuery = trpc.leaderboard.current.useQuery();
  const { season, entries } = lbQuery.data ?? { season: null, entries: [] };

  const getName = (entry: (typeof entries)[number]) => (entry as any).user?.name ?? "Anonymous";
  const getArchetype = (entry: (typeof entries)[number]) => (entry as any).user?.archetypeLabel ?? "Explorer";
  const getStreak = (entry: (typeof entries)[number]) => (entry as any).streakDays ?? 0;
  const getLogs = (entry: (typeof entries)[number]) => (entry as any).activitiesLogged ?? 0;

  const rankBars = ["w-full", "w-4/5", "w-3/5"];
  const rankHeights = ["h-28", "h-36", "h-20"];
  const rankLabels = ["1ST", "2ND", "3RD"];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <IconTrophy className="w-6 h-6 text-white/60" />
            <h1 className="text-2xl font-black text-white tracking-tight">Leaderboard</h1>
          </div>
          <p className="text-white/40 text-sm max-w-lg">
            Every kilogram counts. Every rank matters. The top 1% of climate actors don't wait for governments — they compete, they commit, and they win.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
          <div className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
          <span className="text-xs font-medium text-white/60 tracking-widest uppercase">Live</span>
        </div>
      </div>

      {/* Season Banner */}
      {season && (
        <div className="glass-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconStar className="w-4 h-4 text-white/40" />
            <span className="text-sm font-semibold text-white">
              {(season as any).name ?? `Season ${(season as any).seasonNumber}`}
            </span>
          </div>
          <span className="text-xs text-white/40 tracking-widest uppercase">
            Ends {new Date((season as any).endDate ?? (season as any).endsAt).toLocaleDateString()}
          </span>
        </div>
      )}

      {/* Podium — Top 3 */}
      {entries.length >= 3 && (
        <div className="glass-card p-6">
          <p className="text-xs text-white/30 tracking-widest uppercase mb-6">Top Performers</p>
          <div className="flex items-end justify-center gap-4">
            {[entries[1], entries[0], entries[2]].map((entry, podiumIdx) => {
              const rank = podiumIdx === 1 ? 1 : podiumIdx === 0 ? 2 : 3;
              const isFirst = rank === 1;
              return (
                <div key={(entry as any).userId ?? podiumIdx} className="flex flex-col items-center gap-2 flex-1">
                  <div className="text-center mb-1">
                    <div className={cn("font-black text-white text-sm", isFirst ? "text-base" : "")}>
                      {getName(entry)}
                    </div>
                    <div className="text-xs text-white/40">{getArchetype(entry)}</div>
                    <div className="text-xs font-bold text-white/60 mt-1">{(entry as any).eloScore} pts</div>
                  </div>
                  {/* Bar */}
                  <div className={cn(
                    "w-full rounded-t-lg border border-white/10 flex items-end justify-center pb-3",
                    rankHeights[rank - 1],
                    isFirst ? "bg-white/15" : "bg-white/5"
                  )}>
                    <span className="text-xs font-black text-white/50 tracking-widest">{rankLabels[rank - 1]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Rankings */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <p className="text-xs text-white/30 tracking-widest uppercase">Full Rankings</p>
        </div>
        {lbQuery.isLoading ? (
          <div className="p-8 text-center text-white/30 text-sm">Loading rankings...</div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center">
            <IconTrophy className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm font-medium">No rankings yet</p>
            <p className="text-white/20 text-xs mt-1">Log your first activity to claim your spot</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {entries.map((entry, i) => {
              const isMe = user && (entry as any).userId === (user as any).id;
              const streak = getStreak(entry);
              const logs = getLogs(entry);
              return (
                <div
                  key={(entry as any).userId ?? i}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 transition-colors",
                    isMe ? "bg-white/8" : "hover:bg-white/3"
                  )}
                >
                  {/* Rank */}
                  <div className={cn(
                    "w-8 text-center font-black text-sm",
                    i === 0 ? "text-white" : i === 1 ? "text-white/70" : i === 2 ? "text-white/50" : "text-white/30"
                  )}>
                    {i < 3 ? <IconMedal className="w-4 h-4 mx-auto" /> : `#${i + 1}`}
                  </div>
                  {/* Name + archetype */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("font-semibold text-sm truncate", isMe ? "text-white" : "text-white/80")}>
                        {getName(entry)}{isMe ? " (you)" : ""}
                      </span>
                    </div>
                    <div className="text-xs text-white/30 mt-0.5">{getArchetype(entry)}</div>
                  </div>
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-right">
                    <div className="hidden sm:block">
                      <div className="text-xs text-white/20 uppercase tracking-widest">Streak</div>
                      <div className="text-sm font-bold text-white/60">{streak}d</div>
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-xs text-white/20 uppercase tracking-widest">Logs</div>
                      <div className="text-sm font-bold text-white/60">{logs}</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/20 uppercase tracking-widest">Score</div>
                      <div className="text-sm font-black text-white">{(entry as any).eloScore}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="glass-card p-6 text-center border border-white/10">
        <IconZap className="w-8 h-8 text-white/30 mx-auto mb-3" />
        <p className="text-white font-bold text-lg mb-1">Your rank is waiting.</p>
        <p className="text-white/40 text-sm">Log an activity today and climb the board. Every action moves the needle.</p>
      </div>
    </div>
  );
}
