import React from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { IconTrophy, IconMedal, IconZap, IconStar } from "@/components/Icons";
import { cn } from "@/lib/utils";
import { SocialShare } from "@/components/SocialShare";
import type { LeaderboardRow } from "@shared/viewModels";

export default function Leaderboard() {
  const { user } = useAuth();
  const lbQuery = trpc.leaderboard.current.useQuery();
  const season = lbQuery.data?.season ?? null;
  const entries = lbQuery.data?.entries ?? [];

  const getName = (entry: LeaderboardRow) => entry.user?.name ?? "Anonymous";
  const getArchetype = (entry: LeaderboardRow) => entry.user?.archetypeLabel ?? "Explorer";
  const getStreak = (entry: LeaderboardRow) => entry.streakDays ?? 0;
  const getLogs = (entry: LeaderboardRow) => entry.activitiesLogged ?? 0;

  const rankHeights = ["h-28", "h-36", "h-20"];
  const rankLabels = ["1ST", "2ND", "3RD"];

  return (
    <div className="space-y-8">
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

      {season && (
        <div className="glass-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconStar className="w-4 h-4 text-white/40" />
            <span className="text-sm font-semibold text-white">
              {season.name ?? `Season ${season.seasonNumber}`}
            </span>
          </div>
          <span className="text-xs text-white/40 tracking-widest uppercase">
            Ends {new Date(season.endDate ?? season.endsAt ?? new Date()).toLocaleDateString()}
          </span>
        </div>
      )}

      {entries.length >= 3 && (
        <div className="glass-card p-6">
          <p className="text-xs text-white/30 tracking-widest uppercase mb-6" id="top-performers-heading">
            Top Performers
          </p>
          <div className="flex items-end justify-center gap-4" role="list" aria-labelledby="top-performers-heading">
            {[entries[1], entries[0], entries[2]].map((entry, podiumIdx) => {
              if (!entry) return null;
              const rank = podiumIdx === 1 ? 1 : podiumIdx === 0 ? 2 : 3;
              const isFirst = rank === 1;
              return (
                <div key={entry.userId ?? podiumIdx} className="flex flex-col items-center gap-2 flex-1" role="listitem">
                  <div className="text-center mb-1">
                    <div className={cn("font-black text-white text-sm", isFirst ? "text-base" : "")}>
                      {getName(entry)}
                    </div>
                    <div className="text-xs text-white/40">{getArchetype(entry)}</div>
                    <div className="text-xs font-bold text-white/60 mt-1">{entry.eloScore} pts</div>
                  </div>
                  <div
                    className={cn(
                      "w-full rounded-t-lg border border-white/10 flex items-end justify-center pb-3",
                      rankHeights[rank - 1],
                      isFirst ? "bg-white/15" : "bg-white/5"
                    )}
                  >
                    <span className="text-xs font-black text-white/50 tracking-widest">{rankLabels[rank - 1]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
          <div className="divide-y divide-white/5" role="list" aria-label="Leaderboard Rankings">
            {entries.map((entry, i) => {
              const isMe = user && entry.userId === user.id;
              const streak = getStreak(entry);
              const logs = getLogs(entry);

              return (
                <div
                  key={entry.userId ?? i}
                  role="listitem"
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 transition-colors",
                    isMe ? "bg-white/8" : "hover:bg-white/3"
                  )}
                >
                  <div className={cn(
                    "w-8 text-center font-black text-sm",
                    i === 0 ? "text-white" : i === 1 ? "text-white/70" : i === 2 ? "text-white/50" : "text-white/30"
                  )}>
                    {i < 3 ? <IconMedal className="w-4 h-4 mx-auto" /> : `#${i + 1}`}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("font-semibold text-sm truncate", isMe ? "text-white" : "text-white/80")}>
                        {getName(entry)}{isMe ? " (you)" : ""}
                      </span>
                    </div>
                    <div className="text-xs text-white/30 mt-0.5">{getArchetype(entry)}</div>
                  </div>

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
                      <div className="text-sm font-black text-white">{entry.eloScore}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="glass-card p-6 border border-white/10 space-y-4">
        <div className="text-center">
          <IconZap className="w-8 h-8 text-white/30 mx-auto mb-3" />
          <p className="text-white font-bold text-lg mb-1">Your rank is waiting.</p>
          <p className="text-white/40 text-sm">Log an activity today and climb the board. Every action moves the needle.</p>
        </div>

        {entries.length > 0 && (() => {
          const myEntry = entries.find((entry) => user && entry.userId === user.id);
          const myRank = myEntry ? entries.indexOf(myEntry) + 1 : null;
          const shareText = myRank
            ? `I'm ranked #${myRank} on the ReBon Climate Leaderboard with ${myEntry?.eloScore ?? 0} Elo points! Every kg of CO₂ saved counts 🌿 #ClimateAction #ReBon`
            : "I'm competing on the ReBon Climate Leaderboard! Join me in tracking and reducing carbon emissions 🌿 #ClimateAction #ReBon";

          return (
            <div className="pt-3 border-t border-white/8 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[10px] text-white/30 font-mono tracking-widest uppercase">Share your rank</span>
              <SocialShare
                text={shareText}
                title="My Climate Leaderboard Rank — ReBon"
                platforms={["x", "linkedin", "whatsapp", "copy"]}
                onShare={(p) => console.log("[ReBon] Leaderboard share →", p)}
              />
            </div>
          );
        })()}
      </div>
    </div>
  );
}
