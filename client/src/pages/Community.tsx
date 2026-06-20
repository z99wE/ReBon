import React from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { IconHeart, IconPulse, IconStar, IconTrendingUp, IconZap } from "@/components/Icons";
import { toast } from "sonner";
import type { FeedItemRow } from "@shared/viewModels";

export default function Community() {
  const { isAuthenticated } = useAuth();
  const feedQuery = trpc.influencer.feed.useQuery({ limit: 30 });
  const influencersQuery = trpc.influencer.topInfluencers.useQuery();
  const likeMutation = trpc.influencer.like.useMutation({
    onSuccess: () => feedQuery.refetch(),
    onError: (e) => toast.error(e.message),
  });

  const typeColors: Record<string, string> = {
    activity: "text-white/70",
    challenge_complete: "text-white/70",
    collective_join: "text-white/70",
    story: "text-white/70",
    milestone: "text-white/70",
  };

  const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    activity: IconZap,
    challenge_complete: IconStar,
    collective_join: IconHeart,
    story: IconTrendingUp,
    milestone: IconPulse,
  };

  const feedItems = (feedQuery.data ?? []) as FeedItemRow[];
  const topInfluencers = influencersQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <IconZap className="w-6 h-6 text-white/70" /> CarbonInfluencers
        </h1>
        <p className="text-white/50 text-sm mt-1">
          Influence is earned, not assigned. The people below are driving real change — and their habits are contagious.
        </p>
      </div>

      {topInfluencers.length > 0 && (
        <div className="card-glass rounded-xl border border-white/10 p-5">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2" id="top-influencers-heading">
            <IconStar className="w-4 h-4 text-white/70" /> Top Influencers
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2" role="list" aria-labelledby="top-influencers-heading">
            {topInfluencers.map((inf, idx) => (
              <div key={inf.id} className="flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl border border-white/10 bg-white/5/30 min-w-[90px]" role="listitem">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-indigo-600/10 border-2 border-primary/30 flex items-center justify-center text-lg font-bold">
                    {(inf.name ?? "?")[0].toUpperCase()}
                  </div>
                  {idx === 0 && <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white/50 flex items-center justify-center text-[10px]" />}
                </div>
                <div className="text-xs font-medium text-center truncate w-full">{inf.name ?? "Anonymous"}</div>
                <div className="text-xs text-primary font-bold">{inf.influenceScore ?? 0} pts</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3" role="list" aria-labelledby="live-feed-heading">
        <h3 className="font-bold text-white" id="live-feed-heading">Live Community Feed</h3>
        {feedQuery.isLoading ? (
          <div className="text-center py-8 text-white/50">Loading feed...</div>
        ) : feedItems.length === 0 ? (
          <div className="card-glass rounded-xl border border-white/10 p-8 text-center">
            <IconZap className="w-10 h-10 text-white/50 mx-auto mb-3" />
            <p className="text-white/50">No activity yet. Start logging to appear here!</p>
          </div>
        ) : (
          feedItems.map((item) => {
            const Icon = typeIcons[item.type] ?? IconZap;
            const color = typeColors[item.type] ?? "text-primary";

            return (
              <div
                key={item.id}
                className={`card-glass rounded-xl border p-4 transition-all ${item.isInfluencer ? "border-white/20 bg-white/5" : "border-white/10"}`}
                role="listitem"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    {(item.user?.name ?? "Anonymous")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm">{item.user?.name ?? "Anonymous"}</span>
                      {item.isInfluencer && <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white/70">Influencer</span>}
                      <span className="text-xs text-white/50 ml-auto">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className={`w-3.5 h-3.5 ${color}`} />
                      <span className="text-sm font-medium text-white">{item.title}</span>
                    </div>
                    {item.body && <p className="text-xs text-white/50">{item.body}</p>}
                    {typeof item.carbonKg === "number" && <div className="text-xs text-white/70 mt-1">{item.carbonKg.toFixed(2)} kg CO₂</div>}
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10">
                  <button
                    onClick={() => (isAuthenticated ? likeMutation.mutate({ feedItemId: item.id }) : toast.error("Sign in to like"))}
                    className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/70 transition-colors"
                  >
                    <IconHeart className="w-3.5 h-3.5" /> {item.likeCount}
                  </button>
                  {item.user?.influenceScore ? (
                    <div className="flex items-center gap-1 text-xs text-white/50">
                      <IconTrendingUp className="w-3 h-3" /> {item.user.influenceScore} influence
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
