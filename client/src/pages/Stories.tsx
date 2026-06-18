import React from "react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { IconBookOpen, IconCar, IconPulse, IconShare, IconStar, IconTree, IconZap, IconLeaf } from "@/components/Icons";
import { toast } from "sonner";

const LOADING_STEPS = [
  {
    title: "Gathering emissions metrics...",
    tip: "Every saved kilometer avoids 0.2 kg of CO₂ from entering our atmosphere.",
    fact: "ReBon Carbon Intelligence acts as your personal greenhouse gas tracker."
  },
  {
    title: "Benchmarking against target limits...",
    tip: "Your Eco Pioneer archetype target helps you stay within safe planetary boundaries.",
    fact: "Small actions multiply. Reducing household energy by 10% saves up to 500 kg of CO₂ annually."
  },
  {
    title: "Evaluating completed challenges...",
    tip: "Completed challenges directly reduce your carbon balance and build long-term green habits.",
    fact: "Trees are nature's carbon capture machines, absorbing about 22 kg of CO₂ per year."
  },
  {
    title: "Synthesizing custom impact equivalents...",
    tip: "Translating kilograms of CO₂ into trees and travel equivalents makes your progress tangible.",
    fact: "ReBon translates raw stats into human-centric narrative chapters."
  },
  {
    title: "Running AI narrative engine...",
    tip: "NVIDIA NIM is writing a personalized, shareable story that highlights your milestones.",
    fact: "Net Zero is a collective journey. Sharing your story inspires others to start theirs."
  }
];

export default function Stories() {
  const { isAuthenticated } = useAuth();
  const [period, setPeriod] = useState<"week" | "month" | "alltime">("week");
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const storiesQuery = trpc.stories.list.useQuery(undefined, { enabled: isAuthenticated });
  const generateMutation = trpc.stories.generate.useMutation({ onSuccess: () => storiesQuery.refetch(), onError: e => toast.error(e.message) });
  const shareMutation = trpc.stories.share.useMutation({ onSuccess: () => toast.success("Story shared!") });

  React.useEffect(() => {
    if (!generateMutation.isPending) {
      setProgress(0);
      return;
    }
    
    setProgress(0);
    setStepIndex(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 98) return prev;
        const diff = Math.max(1, Math.floor((100 - prev) / 12));
        return Math.min(prev + diff, 98);
      });
    }, 150);

    const stepInterval = setInterval(() => {
      setStepIndex(prev => (prev + 1) % LOADING_STEPS.length);
    }, 2500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [generateMutation.isPending]);

  const activeStory = generateMutation.data?.period === period
    ? generateMutation.data
    : (storiesQuery.data?.find(s => s.period === period) || null);

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
        <h1 className="text-2xl font-black text-white flex items-center gap-2"><IconBookOpen className="w-6 h-6 text-white/70" /> CarbonStory</h1>
        <p className="text-white/50 text-sm mt-1">Numbers don't move people. Stories do. Turn your data into narratives worth sharing.</p>
      </div>

      {!isAuthenticated ? (
        <div className="card-glass rounded-xl border border-white/10 p-8 text-center">
          <IconBookOpen className="w-10 h-10 text-white/50 mx-auto mb-3" />
          <p className="text-white/50">Sign in to generate your impact story</p>
        </div>
      ) : (
        <>
          {/* Generate */}
          <div className="card-glass rounded-xl border border-pink-400/20 p-5 space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2"><IconStar className="w-4 h-4 text-white/70" /> Generate New Story</h3>
            <div className="flex gap-2">
              {(["week", "month", "alltime"] as const).map(p => (
                <button key={p} onClick={() => setPeriod(p)} className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all capitalize ${period === p ? "border-pink-400/50 bg-pink-400/10 text-white/70" : "border-white/10 text-white/50 hover:bg-white/5"}`}>
                  {p === "alltime" ? "All Time" : p}
                </button>
              ))}
            </div>
            <button onClick={() => generateMutation.mutate({ period })} disabled={generateMutation.isPending} className="w-full btn-primary py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
              {generateMutation.isPending ? <><IconPulse className="w-4 h-4 animate-spin" /> Crafting your story...</> : <><IconStar className="w-4 h-4" /> Generate Story</>}
            </button>
          </div>

          {/* Loading State */}
          {generateMutation.isPending && (
            <div className="card-glass rounded-2xl border border-pink-400/30 p-8 space-y-6 relative overflow-hidden text-center min-h-[300px] flex flex-col justify-center items-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[oklch(0.62_0.17_220)]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              
              {/* Spinning/pulsing animation */}
              <div className="relative flex items-center justify-center mb-6">
                {/* Outer pulsing ring */}
                <div className="absolute w-24 h-24 rounded-full border border-pink-400/20 animate-ping" />
                {/* Middle rotating ring with gradient border */}
                <div className="absolute w-20 h-20 rounded-full border-2 border-t-pink-500 border-r-transparent border-b-[oklch(0.62_0.17_220)] border-l-transparent animate-spin" style={{ animationDuration: '3s' }} />
                {/* Inner glass icon container */}
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-lg backdrop-blur-md">
                  <IconLeaf className="w-8 h-8 text-pink-400 animate-pulse" />
                </div>
              </div>

              <div className="space-y-3 max-w-sm">
                <div className="text-[10px] font-mono tracking-widest text-pink-400/80 uppercase font-semibold">AI Narrative Engine Active</div>
                <h3 className="text-base font-bold text-white tracking-tight transition-all duration-300 min-h-[24px]">
                  {LOADING_STEPS[stepIndex]?.title}
                </h3>
                <div className="text-xs text-white/60 bg-white/5 border border-white/5 rounded-xl p-3 leading-relaxed shadow-inner">
                  <span className="font-semibold text-pink-300">Eco-Tip: </span>
                  {LOADING_STEPS[stepIndex]?.tip}
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed italic">
                  {LOADING_STEPS[stepIndex]?.fact}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-xs bg-white/10 h-1.5 rounded-full overflow-hidden mt-2 relative">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-[oklch(0.62_0.17_220)] h-full rounded-full transition-all duration-150 ease-out" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <div className="text-[10px] text-white/30 font-mono">{progress}% Complete</div>
            </div>
          )}

          {/* Active Story */}
          {!generateMutation.isPending && activeStory ? (
            <div className="card-glass rounded-2xl border border-pink-400/30 p-6 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-400/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="flex justify-between items-start">
                  <div className="text-xs font-bold tracking-widest text-pink-400 uppercase mb-2">
                    {period === "week" ? "Weekly" : period === "month" ? "Monthly" : "All-Time"} Narrative
                  </div>
                  <button onClick={() => handleShare(activeStory)} className="p-2 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0 border border-white/10">
                    <IconShare className="w-4 h-4 text-white/70" />
                  </button>
                </div>
                <h2 className="text-xl font-black text-white mb-3">{activeStory.headline}</h2>
                <p className="text-white/70 leading-relaxed text-sm">{activeStory.narrative}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { icon: IconTree, label: "Trees equiv.", value: activeStory.equivalents?.trees ?? 0, color: "text-white/70" },
                  { icon: IconCar, label: "km not driven", value: activeStory.equivalents?.km_not_driven ?? 0, color: "text-white/70" },
                  { icon: IconZap, label: "kg CO₂", value: activeStory.carbonSavedKg?.toFixed(1) ?? activeStory.carbonSaved?.toFixed(1) ?? 0, color: "text-white/70" },
                ].map(stat => (
                  <div key={stat.label} className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                    <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                    <div className="text-lg font-black text-white">{stat.value}</div>
                    <div className="text-[10px] text-white/50">{stat.label}</div>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-white/40 text-right">Powered by ReBon · AI Generated</div>
            </div>
          ) : (
            !generateMutation.isPending && (
              <div className="card-glass rounded-2xl border border-white/10 p-8 text-center space-y-3">
                <IconLeaf className="w-10 h-10 text-white/20 mx-auto" />
                <h4 className="font-bold text-white text-sm capitalize">No {period === "alltime" ? "All-Time" : period} story crafted yet</h4>
                <p className="text-xs text-white/50 max-w-xs mx-auto">Click the "Generate Story" button to let ReBon AI narrate your carbon footprint and challenges for this period.</p>
              </div>
            )
          )}

          {/* Story History */}
          {storiesQuery.data && storiesQuery.data.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-white">Story Archive</h3>
              {storiesQuery.data.map(story => (
                <div key={story.id} className="card-glass rounded-xl border border-white/10 p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-xs text-white/50 mb-1 capitalize">{story.period} · {new Date(story.generatedAt).toLocaleDateString()}</div>
                      <h4 className="font-bold text-white">{story.headline}</h4>
                      <p className="text-sm text-white/50 mt-1 line-clamp-2">{story.narrative}</p>
                    </div>
                    <button onClick={() => handleShare(story)} className="p-2 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0">
                      <IconShare className="w-4 h-4 text-white/50" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-white/50">
                    <span className="text-white/70 font-medium">{story.carbonSavedKg?.toFixed(1)} kg CO₂</span>
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
