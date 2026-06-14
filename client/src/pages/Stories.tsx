import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { BookOpen, Loader2, Share2, Sparkles, TreePine, Car, Zap } from "lucide-react";
import { toast } from "sonner";

export default function Stories() {
  const { isAuthenticated } = useAuth();
  const [period, setPeriod] = useState<"week" | "month" | "alltime">("week");
  const storiesQuery = trpc.stories.list.useQuery(undefined, { enabled: isAuthenticated });
  const generateMutation = trpc.stories.generate.useMutation({ onSuccess: () => storiesQuery.refetch(), onError: e => toast.error(e.message) });
  const shareMutation = trpc.stories.share.useMutation({ onSuccess: () => toast.success("Story shared!") });

  const handleShare = (story: any) => {
    if (navigator.share) {
      navigator.share({ title: story.headline, text: story.narrative, url: window.location.origin });
    } else {
      navigator.clipboard.writeText(`${story.headline}\n\n${story.narrative}\n\n— ReBon Carbon Intelligence`);
      toast.success("Story copied to clipboard!");
    }
    shareMutation.mutate({ storyId: story.id });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2"><BookOpen className="w-6 h-6 text-pink-400" /> CarbonStory</h1>
        <p className="text-muted-foreground text-sm mt-1">AI-generated narratives about your climate impact</p>
      </div>

      {!isAuthenticated ? (
        <div className="card-glass rounded-xl border border-border p-8 text-center">
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Sign in to generate your impact story</p>
        </div>
      ) : (
        <>
          {/* Generate */}
          <div className="card-glass rounded-xl border border-pink-400/20 p-5 space-y-4">
            <h3 className="font-bold text-foreground flex items-center gap-2"><Sparkles className="w-4 h-4 text-pink-400" /> Generate New Story</h3>
            <div className="flex gap-2">
              {(["week", "month", "alltime"] as const).map(p => (
                <button key={p} onClick={() => setPeriod(p)} className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all capitalize ${period === p ? "border-pink-400/50 bg-pink-400/10 text-pink-400" : "border-border text-muted-foreground hover:bg-muted"}`}>
                  {p === "alltime" ? "All Time" : p}
                </button>
              ))}
            </div>
            <button onClick={() => generateMutation.mutate({ period })} disabled={generateMutation.isPending} className="w-full btn-primary py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
              {generateMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Crafting your story...</> : <><Sparkles className="w-4 h-4" /> Generate Story</>}
            </button>
          </div>

          {/* Latest Generated */}
          {generateMutation.data && (
            <div className="card-glass rounded-2xl border border-pink-400/30 p-6 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-400/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="text-xs font-bold tracking-widest text-pink-400 uppercase mb-2">Your Impact Story</div>
                <h2 className="text-xl font-black text-foreground mb-3">{generateMutation.data.headline}</h2>
                <p className="text-muted-foreground leading-relaxed">{generateMutation.data.narrative}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { icon: TreePine, label: "Trees equiv.", value: generateMutation.data.equivalents?.trees ?? 0, color: "text-green-400" },
                  { icon: Car, label: "km not driven", value: generateMutation.data.equivalents?.km_not_driven ?? 0, color: "text-blue-400" },
                  { icon: Zap, label: "kg CO₂", value: generateMutation.data.carbonSavedKg?.toFixed(1) ?? 0, color: "text-yellow-400" },
                ].map(stat => (
                  <div key={stat.label} className="text-center p-3 rounded-xl bg-muted/50 border border-border">
                    <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                    <div className="text-lg font-black text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground text-right">Powered by {generateMutation.data.equivalents ? "ReBon AI" : "ReBon AI"}</div>
            </div>
          )}

          {/* Story History */}
          {storiesQuery.data && storiesQuery.data.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-foreground">Story Archive</h3>
              {storiesQuery.data.map(story => (
                <div key={story.id} className="card-glass rounded-xl border border-border p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground mb-1 capitalize">{story.period} · {new Date(story.generatedAt).toLocaleDateString()}</div>
                      <h4 className="font-bold text-foreground">{story.headline}</h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{story.narrative}</p>
                    </div>
                    <button onClick={() => handleShare(story)} className="p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0">
                      <Share2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="text-green-400 font-medium">{story.carbonSavedKg?.toFixed(1)} kg CO₂</span>
                    <span>{story.shareCount ?? 0} shares</span>
                    <span className="ml-auto">via {story.aiProvider}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
