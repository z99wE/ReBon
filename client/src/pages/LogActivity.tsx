import React from "react";
import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ACTIVITY_PRESETS } from "../../../shared/carbonData";
import { IconAdd, IconCar, IconCart, IconCheckmark, IconFlash, IconMic, IconMicOff, IconPulse, IconRestaurant } from "@/components/Icons";
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

  const iconTone = "text-zinc-400";
  const iconToneSoft = "text-zinc-500";

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
      <section aria-label="Voice Input" className="card-glass rounded-xl border border-white/10 p-6">
        <h2 className="font-bold text-white mb-4 flex items-center gap-2"><IconMic className={`w-4 h-4 ${iconTone}`} aria-hidden="true" /> Speak to Log</h2>
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={recording ? stopRecording : startRecording}
            disabled={voiceMutation.isPending}
            aria-label={recording ? "Stop recording" : "Start voice recording"}
            aria-pressed={recording}
            className={`w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${recording ? "bg-primary/12 border-primary/60 animate-pulse hover:bg-primary/16" : "bg-white/5 border-white/10 hover:bg-primary/10 hover:border-primary/40"}`}
          >
            {voiceMutation.isPending ? <IconPulse className={`w-8 h-8 animate-spin ${iconTone}`} /> : recording ? <IconMicOff className={`w-8 h-8 ${iconTone}`} /> : <IconMic className={`w-8 h-8 ${iconTone}`} />}
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
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-green-400/20 bg-green-400/5">
                    <div>
                      <div className="text-sm font-medium text-white">{a.label}</div>
                      <div className="text-xs text-white/50">{a.carbonKg?.toFixed(2)} kg CO₂</div>
                    </div>
                    <button onClick={() => logMutation.mutate({ category: a.category, subcategory: a.subcategory, label: a.label, carbonKg: a.carbonKg, quantity: a.quantity, unit: a.unit, inputMethod: "voice", voiceTranscript: voiceResult.transcript })} disabled={logMutation.isPending} className="btn-primary px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1" aria-label={`Log ${a.label}`}>
                      <IconAdd className={`w-3 h-3 ${iconToneSoft}`} /> Log
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
      <section aria-label="Quick-Tap Presets" className="space-y-4 mt-8">
      {categories.map(cat => (
        <div key={cat} className="card-glass rounded-xl border border-white/10 p-5">
          <h3 className="font-bold text-white mb-3 capitalize flex items-center gap-2">
            {cat === "transport" && <IconCar className={`w-4 h-4 ${iconTone}`} aria-hidden="true" />}
            {cat === "meals" && <IconRestaurant className={`w-4 h-4 ${iconTone}`} aria-hidden="true" />}
            {cat === "energy" && <IconFlash className={`w-4 h-4 ${iconTone}`} aria-hidden="true" />}
            {cat === "shopping" && <IconCart className={`w-4 h-4 ${iconTone}`} aria-hidden="true" />}
            {!["transport","meals","energy","shopping"].includes(cat) && <IconAdd className={`w-4 h-4 ${iconTone}`} aria-hidden="true" />}
            {cat}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="group" aria-label={`${cat} presets`}>
            {ACTIVITY_PRESETS[cat].map((preset) => (
              <button
                key={preset.id}
                onClick={() => setSelectedPreset({ ...preset, category: cat })}
                aria-pressed={selectedPreset?.id === preset.id}
                aria-label={`${preset.label}, ${preset.carbonKg} kg CO₂`}
                className={`p-3 rounded-lg border text-left transition-all flex items-start gap-2 ${selectedPreset?.id === preset.id ? "border-primary bg-primary/10" : "border-white/10 hover:border-primary/40 hover:bg-primary/5"}`}
              >
                <div className="text-lg mb-1" aria-hidden="true">{preset.icon}</div>
                <div>
                  <div className="text-xs font-medium text-white leading-tight">{preset.label}</div>
                  <div className="text-xs text-white/50">{preset.carbonKg} kg CO₂</div>
                </div>
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
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 card-glass border border-primary/30 rounded-2xl p-4 shadow-2xl w-[calc(100%-2rem)] max-w-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl" aria-hidden="true">{selectedPreset.icon}</span>
            <div className="flex-1">
              <div className="font-bold text-white">{selectedPreset.label}</div>
              <div className="text-xs text-white/50">{(selectedPreset.carbonKg * quantity).toFixed(2)} kg CO₂</div>
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
            <button onClick={() => setSelectedPreset(null)} className="flex-1 py-2 rounded-lg border border-white/10 text-sm text-white/50 hover:bg-primary/5 transition-colors">Cancel</button>
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
              className="flex-1 btn-primary py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1"
            >
              {logMutation.isPending ? <IconPulse className={`w-4 h-4 animate-spin ${iconTone}`} /> : <><IconCheckmark className={`w-4 h-4 ${iconToneSoft}`} /> Log</>}
            </button>
          </div>
        </div>
      )}

      {/* Active Challenges */}
      {challengesQuery.isLoading && (
        <section aria-label="Active Challenges Loading" className="card-glass rounded-xl border border-orange-400/20 p-5 mt-8 animate-pulse">
          <div className="h-6 w-40 bg-white/10 rounded mb-4" />
          <div className="space-y-2">
            <div className="h-16 bg-white/5 rounded" />
            <div className="h-16 bg-white/5 rounded" />
          </div>
        </section>
      )}
      
      {challengesQuery.data && challengesQuery.data.filter(c => !c.completedAt).length > 0 && (
        <section aria-label="Active Challenges" className="card-glass rounded-xl border border-orange-400/20 p-5 mt-8">
          <h2 className="font-bold text-white mb-3">Active Challenges</h2>
          <div className="space-y-2">
            {challengesQuery.data.filter(c => !c.completedAt).map(c => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{c.title}</div>
                  <div className="text-xs text-white/50">{c.description}</div>
                </div>
                <button
                  onClick={() => completeMutation.mutate({ challengeId: c.id })}
                  disabled={completeMutation.isPending}
                  aria-label={`Complete challenge: ${c.title}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 border border-primary/30 text-white/70 hover:bg-primary/15 hover:border-primary/50 transition-colors"
                >
                  Done
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
