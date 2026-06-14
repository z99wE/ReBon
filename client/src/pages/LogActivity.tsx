import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ACTIVITY_PRESETS } from "../../../shared/carbonData";
import { Activity, Mic, MicOff, Loader2, CheckCircle, Plus } from "lucide-react";
import { toast } from "sonner";

export default function LogActivity() {
  const { isAuthenticated } = useAuth();
  const [recording, setRecording] = useState(false);
  const [voiceResult, setVoiceResult] = useState<{ transcript: string; activities: any[] } | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const logMutation = trpc.activities.log.useMutation({ onSuccess: () => { toast.success("Activity logged!"); setSelectedPreset(null); setVoiceResult(null); }, onError: e => toast.error(e.message) });
  const voiceMutation = trpc.activities.logVoice.useMutation({ onSuccess: (d) => { setVoiceResult(d); setRecording(false); }, onError: e => { toast.error(e.message); setRecording(false); } });
  const challengesQuery = trpc.challenges.list.useQuery(undefined, { enabled: isAuthenticated });
  const completeMutation = trpc.challenges.complete.useMutation({ onSuccess: () => toast.success("Challenge completed! 🎉"), onError: e => toast.error(e.message) });

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
        <h1 className="text-2xl font-black text-foreground">Log Activity</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your carbon footprint via quick-tap presets or voice</p>
      </div>

      {/* Voice Input */}
      <div className="card-glass rounded-xl border border-border p-6">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2"><Mic className="w-4 h-4 text-primary" /> Voice Logging (Deepgram AI)</h3>
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={recording ? stopRecording : startRecording}
            disabled={voiceMutation.isPending}
            className={`w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${recording ? "bg-red-500/20 border-red-500 animate-pulse" : "bg-primary/10 border-primary/40 hover:bg-primary/20"}`}
          >
            {voiceMutation.isPending ? <Loader2 className="w-8 h-8 animate-spin text-primary" /> : recording ? <MicOff className="w-8 h-8 text-red-400" /> : <Mic className="w-8 h-8 text-primary" />}
          </button>
          <p className="text-sm text-muted-foreground text-center">
            {recording ? "Recording... tap to stop" : voiceMutation.isPending ? "Transcribing with Deepgram..." : 'Say something like "I drove 10 miles to work"'}
          </p>
        </div>
        {voiceResult && (
          <div className="mt-4 space-y-3">
            <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground italic">"{voiceResult.transcript}"</div>
            {voiceResult.activities.length > 0 ? (
              <div className="space-y-2">
                {voiceResult.activities.map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-green-400/20 bg-green-400/5">
                    <div>
                      <div className="text-sm font-medium text-foreground">{a.label}</div>
                      <div className="text-xs text-muted-foreground">{a.carbonKg?.toFixed(2)} kg CO₂</div>
                    </div>
                    <button onClick={() => logMutation.mutate({ category: a.category, subcategory: a.subcategory, label: a.label, carbonKg: a.carbonKg, quantity: a.quantity, unit: a.unit, inputMethod: "voice", voiceTranscript: voiceResult.transcript })} disabled={logMutation.isPending} className="btn-primary px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Log
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-2">No activities detected. Try being more specific.</div>
            )}
          </div>
        )}
      </div>

      {/* Quick-Tap Presets */}
      {categories.map(cat => (
        <div key={cat} className="card-glass rounded-xl border border-border p-5">
          <h3 className="font-bold text-foreground mb-3 capitalize flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> {cat}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ACTIVITY_PRESETS[cat].map((preset: any) => (
              <button
                key={preset.id}
                onClick={() => setSelectedPreset({ ...preset, category: cat })}
                className={`p-3 rounded-lg border text-left transition-all ${selectedPreset?.id === preset.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/40 hover:bg-muted/50"}`}
              >
                <div className="text-lg mb-1">{preset.icon}</div>
                <div className="text-xs font-medium text-foreground leading-tight">{preset.label}</div>
                <div className="text-xs text-muted-foreground">{preset.defaultCarbonKg} kg CO₂</div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Log Selected Preset */}
      {selectedPreset && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 card-glass border border-primary/30 rounded-2xl p-4 shadow-2xl w-[calc(100%-2rem)] max-w-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{selectedPreset.icon}</span>
            <div className="flex-1">
              <div className="font-bold text-foreground">{selectedPreset.label}</div>
              <div className="text-xs text-muted-foreground">{(selectedPreset.defaultCarbonKg * quantity).toFixed(2)} kg CO₂</div>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <label className="text-xs text-muted-foreground">Qty:</label>
            <input type="number" min={0.1} step={0.1} value={quantity} onChange={e => setQuantity(parseFloat(e.target.value) || 1)} className="w-20 px-2 py-1 rounded-lg bg-muted border border-border text-sm text-foreground" />
            <span className="text-xs text-muted-foreground">{selectedPreset.unit}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSelectedPreset(null)} className="flex-1 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
            <button onClick={() => logMutation.mutate({ category: selectedPreset.category, subcategory: selectedPreset.subcategory, label: selectedPreset.label, carbonKg: selectedPreset.defaultCarbonKg * quantity, quantity, unit: selectedPreset.unit, inputMethod: "tap" })} disabled={logMutation.isPending} className="flex-1 btn-primary py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1">
              {logMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Log</>}
            </button>
          </div>
        </div>
      )}

      {/* Active Challenges */}
      {challengesQuery.data && challengesQuery.data.filter(c => !c.completedAt).length > 0 && (
        <div className="card-glass rounded-xl border border-orange-400/20 p-5">
          <h3 className="font-bold text-foreground mb-3">Active Challenges</h3>
          <div className="space-y-2">
            {challengesQuery.data.filter(c => !c.completedAt).map(c => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <div className="text-sm font-medium">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{c.description}</div>
                </div>
                <button onClick={() => completeMutation.mutate({ challengeId: c.id })} disabled={completeMutation.isPending} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-400/10 border border-green-400/30 text-green-400 hover:bg-green-400/20 transition-colors">Done</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
