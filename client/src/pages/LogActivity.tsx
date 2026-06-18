import React from "react";
import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ACTIVITY_PRESETS } from "../../../shared/carbonData";
import { toast } from "sonner";


/** Typed preset shape — mirrors the objects in shared/carbonData.ts ACTIVITY_PRESETS */
interface ActivityPreset {
  id: string;
  label: string;
  subcategory: string;
  category: string;
  carbonKg: number;
  quantity: number;
  unit: string;
  icon: string;
}

export default function LogActivity() {
  const { isAuthenticated } = useAuth();
  const [recording, setRecording] = useState(false);
  const [voiceResult, setVoiceResult] = useState<{ transcript: string; activities: any[] } | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<ActivityPreset | null>(null);
  const [quantity, setQuantity] = useState(1);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const logMutation = trpc.activities.log.useMutation({ onSuccess: () => { toast.success("Activity logged!"); setSelectedPreset(null); setVoiceResult(null); }, onError: e => toast.error(e.message) });
  const voiceMutation = trpc.activities.logVoice.useMutation({ onSuccess: (d) => { setVoiceResult(d); setRecording(false); }, onError: e => { toast.error(e.message); setRecording(false); } });
  const challengesQuery = trpc.challenges.list.useQuery(undefined, { enabled: isAuthenticated });
  const completeMutation = trpc.challenges.complete.useMutation({ onSuccess: () => toast.success("Challenge completed!"), onError: e => toast.error(e.message) });



  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(",")[1];
          voiceMutation.mutate({ audioBase64: base64, mimeType: "audio/webm" });
        };
        reader.readAsDataURL(blob);
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch { toast.error("Microphone access denied"); }
  };

  const stopRecording = () => { mediaRef.current?.stop(); };

  const categories = Object.keys(ACTIVITY_PRESETS) as Array<keyof typeof ACTIVITY_PRESETS>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Log Activity</h1>
        <p className="text-white/50 text-sm mt-1">Track your carbon footprint via quick-tap presets or voice</p>
      </div>

      {/* Voice Input */}
      <section aria-label="Voice Input" className="glass-card border border-white/[0.07] p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="label-tech-bright">Speak to Log</h2>
          <span className="text-[9px] font-black tracking-widest text-bottle">VOICE</span>
        </div>
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={recording ? stopRecording : startRecording}
            disabled={voiceMutation.isPending}
            aria-label={recording ? "Stop recording" : "Start voice recording"}
            aria-pressed={recording}
            className={`w-20 h-20 border flex items-center justify-center transition-all duration-200 text-[10px] font-black tracking-widest ${recording ? "border-[oklch(0.82_0.21_142)] text-fluoro bg-[oklch(0.82_0.21_142_/_0.08)] animate-ring-pulse" : "border-white/[0.08] text-bottle hover:border-[oklch(0.82_0.21_142_/_0.4)] hover:text-fluoro"}`}
          >
            {voiceMutation.isPending ? "···" : recording ? "STOP" : "REC"}
          </button>
          <p className="text-sm text-white/50 text-center" aria-live="polite">
            {recording ? "Recording… tap to stop" : voiceMutation.isPending ? "Processing your voice…" : 'Say something like "I drove 10 miles to work"'}
          </p>
        </div>
        {voiceResult && (
          <div className="mt-4 space-y-3" aria-live="polite">
            <div className="p-3 rounded-lg bg-white/5 text-sm text-white/50 italic">"{voiceResult.transcript}"</div>
            {voiceResult.activities.length > 0 ? (
              <div className="space-y-2">
                {voiceResult.activities.map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-white/[0.06] bg-white/[0.02]">
                    <div>
                      <div className="text-sm font-bold text-white/80">{a.label}</div>
                      <div className="text-[10px] font-mono text-bottle tabular-nums">{a.carbonKg?.toFixed(2)} kg CO₂</div>
                    </div>
                    <button onClick={() => logMutation.mutate({ category: a.category, subcategory: a.subcategory, label: a.label, carbonKg: a.carbonKg, quantity: a.quantity, unit: a.unit, inputMethod: "voice", voiceTranscript: voiceResult.transcript })} disabled={logMutation.isPending} className="btn-primary px-3 py-1.5 text-[9px] font-black tracking-widest" aria-label={`Log ${a.label}`}>
                      Log →
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-white/50 text-center py-2">No activities detected. Try being more specific.</div>
            )}
          </div>
        )}
      </section>

      {/* Quick-Tap Presets */}
      <section aria-label="Quick-Tap Presets" className="space-y-0 mt-8 divide-y divide-white/[0.05]">
      {categories.map(cat => (
        <div key={cat} className="py-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="label-tech-bright capitalize">{cat}</h3>
            <span className="text-[9px] font-black tracking-widest text-white/15">PRESET</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-white/[0.05]" role="group" aria-label={`${cat} presets`}>
             {ACTIVITY_PRESETS[cat].map((preset) => (
              <button
                key={preset.id}
                onClick={() => setSelectedPreset({ ...preset, category: cat })}
                aria-pressed={selectedPreset?.id === preset.id}
                aria-label={`${preset.label}, ${preset.carbonKg} kg CO₂`}
                className={`bg-[#050505] p-4 text-left transition-all group hover:bg-white/[0.02] ${
                  selectedPreset?.id === preset.id
                    ? "outline outline-1 outline-[oklch(0.82_0.21_142_/_0.5)] z-10 relative bg-[oklch(0.82_0.21_142_/_0.04)]"
                    : ""
                }`}
              >
                <div className={`text-xs font-bold leading-tight mb-1 transition-colors ${
                  selectedPreset?.id === preset.id ? "text-fluoro" : "text-white/70 group-hover:text-white"
                }`}>{preset.label}</div>
                <div className={`text-[10px] font-mono tabular-nums transition-colors ${
                  selectedPreset?.id === preset.id ? "text-fluoro/70" : "text-bottle group-hover:text-fluoro/60"
                }`}>{preset.carbonKg} kg CO₂</div>
              </button>
            ))}
          </div>
        </div>
      ))}
      </section>

      {/* Log Selected Preset — bottom sheet */}
      {selectedPreset && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Log ${selectedPreset.label}`}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-premium border border-[oklch(0.82_0.21_142_/_0.25)] p-5 shadow-2xl w-[calc(100%-2rem)] max-w-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="label-tech mb-1">{selectedPreset.category}</div>
              <div className="font-black text-white text-base">{selectedPreset.label}</div>
              <div className="text-[11px] font-mono text-fluoro tabular-nums">{(selectedPreset.carbonKg * quantity).toFixed(2)} kg CO₂</div>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <label htmlFor="preset-qty" className="text-xs text-white/50">Qty:</label>
            <input
              id="preset-qty"
              type="number"
              min={0.1}
              step={0.1}
              value={quantity}
              onChange={e => setQuantity(parseFloat(e.target.value) || 1)}
              className="w-20 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-sm text-white"
            />
            <span className="text-xs text-white/50">{selectedPreset.unit}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSelectedPreset(null)} className="flex-1 py-2.5 border border-white/[0.08] text-[10px] font-black tracking-widest uppercase text-bottle hover:text-white transition-colors">Cancel</button>
            <button
              onClick={() => logMutation.mutate({
                category: selectedPreset.category as "transport" | "meals" | "energy" | "shopping" | "other",
                subcategory: selectedPreset.subcategory,
                label: selectedPreset.label,
                carbonKg: selectedPreset.carbonKg * quantity,
                quantity,
                unit: selectedPreset.unit,
                inputMethod: "tap",
              })}
              disabled={logMutation.isPending}
              className="flex-1 btn-primary py-2.5 text-[10px] font-black tracking-widest justify-center"
            >
              {logMutation.isPending ? "···" : "Log →"}
            </button>
          </div>
        </div>
      )}

      {/* Active Challenges */}
      {challengesQuery.isLoading && (
        <section aria-label="Active Challenges Loading" className="glass-card border border-white/[0.06] p-5 mt-8 animate-pulse">
          <div className="h-4 w-40 shimmer mb-4" />
          <div className="space-y-2">
            <div className="h-14 shimmer" />
            <div className="h-14 shimmer" />
          </div>
        </section>
      )}
      
      {challengesQuery.data && challengesQuery.data.filter((c: any) => !c.completedAt).length > 0 && (
        <section aria-label="Active Challenges" className="glass-card border border-white/[0.06] mt-8">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="label-tech-bright">Active Challenges</h2>
          </div>
          <div className="divide-y divide-white/[0.05]">
            {challengesQuery.data.filter((c: any) => !c.completedAt).map((c: any) => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1">
                  <div className="text-sm font-bold text-white/80 mb-0.5">{c.title}</div>
                  <div className="text-[10px] text-bottle">{c.description}</div>
                </div>
                <button
                  onClick={() => completeMutation.mutate({ challengeId: c.id })}
                  disabled={completeMutation.isPending}
                  aria-label={`Complete challenge: ${c.title}`}
                  className="btn-ghost text-[9px] py-1.5 px-3"
                >
                  Done →
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
