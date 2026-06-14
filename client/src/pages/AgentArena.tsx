import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  IconSwords, IconRobot, IconCar, IconFlash, IconRestaurant,
  IconCart, IconLeaf, IconPulse, IconShield, IconPeople, IconArrowForward
} from "@/components/Icons";
import type { JSX } from "react";

const CATEGORY_ICONS: Record<string, JSX.Element> = {
  transport: <IconCar className="w-4 h-4" />,
  energy: <IconFlash className="w-4 h-4" />,
  food: <IconRestaurant className="w-4 h-4" />,
  shopping: <IconCart className="w-4 h-4" />,
  lifestyle: <IconLeaf className="w-4 h-4" />,
};

const CATEGORY_LABELS: Record<string, string> = {
  transport: "Transport",
  energy: "Energy",
  food: "Food & Diet",
  shopping: "Shopping",
  lifestyle: "Lifestyle",
};

type NegotiationTurn = { speaker: string; message: string; proposedKg?: number | null };

type NegotiationResult = {
  id: number;
  status: string;
  agreedKg: number | null;
  turns: NegotiationTurn[];
  initiatorPersona: string;
  targetPersona: string;
};

export default function AgentArena() {
  const { isAuthenticated } = useAuth();
  const [category, setCategory] = useState("transport");
  const [proposedKg, setProposedKg] = useState(5);
  const [selectedPeer, setSelectedPeer] = useState<number | null>(null);
  const [activeNeg, setActiveNeg] = useState<NegotiationResult | null>(null);

  const historyQuery = trpc.agents.list.useQuery(undefined, { enabled: isAuthenticated });
  const peersQuery = trpc.agents.getPeers.useQuery(undefined, { enabled: isAuthenticated });

  const initiateMutation = trpc.agents.initiate.useMutation({
    onSuccess: (data) => {
      setActiveNeg(data as unknown as NegotiationResult);
      historyQuery.refetch();
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8">
        <div className="glass-card p-10 text-center max-w-md">
          <IconShield className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-3">Sign in to access Agent Arena</h2>
          <p className="text-white/50 mb-6 text-sm leading-relaxed">
            Deploy your personal AI agent to negotiate binding carbon reduction commitments with peers.
          </p>
          <a href={getLoginUrl()} className="btn-primary inline-block">Sign In</a>
        </div>
      </div>
    );
  }

  const peers = peersQuery.data ?? [];

  return (
    <div className="min-h-screen bg-[#050505] p-6 md:p-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <IconSwords className="w-5 h-5 text-white/30" />
          <span className="label-tech text-white/30 text-[10px] tracking-widest">AGENT-TO-AGENT PROTOCOL · WORLD FIRST</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white leading-none mb-3">
          AGENT<br />
          <span className="text-white/25">ARENA</span>
        </h1>
        <p className="text-white/40 max-w-lg text-sm leading-relaxed">
          Deploy your personal AI agent to negotiate binding carbon reduction commitments with peers.
          Two agents debate, counter-propose, and reach an agreement — while you watch in real time.
          No human intervention required.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Configure Panel */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <IconRobot className="w-5 h-5 text-white/50" />
            <div>
              <h2 className="text-base font-black text-white tracking-tight">DEPLOY YOUR AGENT</h2>
              <p className="text-white/30 text-xs mt-0.5">Configure your negotiation parameters</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Peer selector */}
            <div>
              <label className="label-tech text-white/30 text-[10px] tracking-widest block mb-3">
                SELECT PEER TO CHALLENGE
              </label>
              {peersQuery.isLoading ? (
                <div className="text-white/30 text-sm py-4 text-center">Loading peers...</div>
              ) : peers.length === 0 ? (
                <div className="glass-card p-4 text-center border-white/[0.04]">
                  <IconPeople className="w-6 h-6 text-white/20 mx-auto mb-2" />
                  <p className="text-white/30 text-xs">No peers available yet.</p>
                  <p className="text-white/20 text-xs mt-1">Invite others to join ReBon to unlock negotiations.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {peers.map((peer) => (
                    <button
                      key={peer.id}
                      onClick={() => setSelectedPeer(peer.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border text-sm transition-all ${
                        selectedPeer === peer.id
                          ? "border-white/30 bg-white/10 text-white"
                          : "border-white/[0.06] bg-white/[0.02] text-white/50 hover:border-white/15 hover:text-white/70"
                      }`}
                      aria-label={`Select ${peer.name ?? "Anonymous"} as negotiation peer`}
                      aria-pressed={selectedPeer === peer.id}
                    >
                      <span className="font-semibold">{peer.name ?? "Anonymous Warrior"}</span>
                      <span className="label-tech text-[9px] tracking-widest text-white/30">
                        {peer.archetype?.toUpperCase() ?? "UNKNOWN"} · ELO {peer.eloScore ?? 1000}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="label-tech text-white/30 text-[10px] tracking-widest block mb-3">CATEGORY</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setCategory(key)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs font-semibold transition-all ${
                      category === key
                        ? "border-white/30 bg-white/10 text-white"
                        : "border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/15 hover:text-white/60"
                    }`}
                    aria-pressed={category === key}
                  >
                    <span className="text-white/50">{CATEGORY_ICONS[key]}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reduction target */}
            <div>
              <label className="label-tech text-white/30 text-[10px] tracking-widest block mb-3">
                PROPOSED WEEKLY REDUCTION
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={proposedKg}
                  onChange={(e) => setProposedKg(Number(e.target.value))}
                  className="flex-1 accent-white"
                  aria-label="Proposed CO₂ reduction in kg per week"
                />
                <span className="text-2xl font-black text-white w-20 text-right tabular-nums">{proposedKg} kg</span>
              </div>
              <p className="text-white/20 text-xs mt-2">CO₂ reduction commitment per week</p>
            </div>

            <div className="p-4 rounded-lg border border-white/[0.06] bg-white/[0.02]">
              <p className="text-white/30 text-xs leading-relaxed">
                Your agent is briefed on your carbon profile, lifestyle archetype, and historical data.
                It will negotiate the most ambitious yet achievable commitment on your behalf.
              </p>
            </div>

            <button
              onClick={() => {
                if (!selectedPeer) return;
                initiateMutation.mutate({ targetUserId: selectedPeer, category, proposedKg });
              }}
              disabled={initiateMutation.isPending || !selectedPeer}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Start agent-to-agent negotiation"
            >
              <IconSwords className="w-4 h-4" />
              {initiateMutation.isPending
                ? "Agents negotiating..."
                : !selectedPeer
                ? "Select a peer first"
                : "Start Negotiation"}
            </button>
          </div>
        </div>

        {/* Live Transcript */}
        <div className="glass-card p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <IconPulse className="w-5 h-5 text-white/50" />
            <div>
              <h2 className="text-base font-black text-white tracking-tight">LIVE TRANSCRIPT</h2>
              <p className="text-white/30 text-xs mt-0.5">Watch your agents negotiate in real time</p>
            </div>
          </div>

          {!activeNeg && !initiateMutation.isPending && (
            <div className="flex flex-col items-center justify-center flex-1 min-h-48 text-center">
              <IconSwords className="w-10 h-10 text-white/[0.07] mb-4" />
              <p className="text-white/25 text-sm">No active negotiation.</p>
              <p className="text-white/15 text-xs mt-2">Select a peer and deploy your agent to begin.</p>
            </div>
          )}

          {initiateMutation.isPending && (
            <div className="flex flex-col items-center justify-center flex-1 min-h-48 text-center">
              <div className="w-8 h-8 border-2 border-white/10 border-t-white/60 rounded-full animate-spin mb-4" />
              <p className="text-white/40 text-sm">Agents are negotiating...</p>
              <p className="text-white/20 text-xs mt-2">Analysing profiles · Generating proposals · Reaching consensus</p>
            </div>
          )}

          {activeNeg && (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 flex-1">
              {activeNeg.turns.map((turn, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg text-sm ${
                    turn.speaker === "initiator"
                      ? "bg-white/[0.07] border border-white/10 ml-6"
                      : "bg-white/[0.02] border border-white/[0.05] mr-6"
                  }`}
                >
                  <div className="label-tech text-white/30 text-[9px] tracking-widest mb-1.5">
                    {turn.speaker === "initiator" ? "YOUR AGENT" : "PEER AGENT"}
                    {turn.proposedKg != null && (
                      <span className="ml-2 text-white/20">· {turn.proposedKg} kg proposed</span>
                    )}
                  </div>
                  <p className="text-white/70 leading-relaxed">{turn.message}</p>
                </div>
              ))}

              {activeNeg.agreedKg !== null && (
                <div className="p-5 rounded-lg border border-white/20 bg-white/[0.04] text-center mt-4">
                  <div className="label-tech text-white/30 text-[9px] tracking-widest mb-3">AGREEMENT REACHED</div>
                  <div className="text-4xl font-black text-white mb-1 tabular-nums">{activeNeg.agreedKg} kg</div>
                  <div className="text-white/30 text-xs">weekly CO₂ reduction · both parties bound</div>
                </div>
              )}

              {activeNeg.status === "rejected" && (
                <div className="p-4 rounded-lg border border-white/10 bg-white/[0.02] text-center mt-4">
                  <div className="label-tech text-white/20 text-[9px] tracking-widest mb-2">NO AGREEMENT</div>
                  <p className="text-white/30 text-xs">Agents could not reach consensus. Try a different proposal or peer.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* History */}
      {historyQuery.data && historyQuery.data.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span className="label-tech text-white/30 text-[10px] tracking-widest">NEGOTIATION HISTORY</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {historyQuery.data.map((neg) => (
              <div
                key={neg.id}
                className="glass-card p-5 hover:border-white/15 transition-all cursor-default"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-white/50">
                    {CATEGORY_ICONS[neg.category] ?? <IconLeaf className="w-4 h-4" />}
                    <span className="text-white/60 text-sm font-semibold">
                      {CATEGORY_LABELS[neg.category] ?? neg.category}
                    </span>
                  </div>
                  <span className={`label-tech text-[9px] tracking-widest px-2 py-0.5 rounded-full border ${
                    neg.status === "agreed"
                      ? "border-white/20 text-white/50 bg-white/[0.04]"
                      : "border-white/[0.06] text-white/20"
                  }`}>
                    {neg.status.toUpperCase()}
                  </span>
                </div>
                {neg.agreedKg !== null ? (
                  <div className="text-3xl font-black text-white tabular-nums">{neg.agreedKg} kg</div>
                ) : (
                  <div className="text-white/25 text-sm">No agreement</div>
                )}
                <div className="text-white/20 text-xs mt-2">
                  {new Date(neg.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Marketing callout */}
      <div className="mt-12 glass-card p-8 text-center">
        <IconArrowForward className="w-6 h-6 text-white/20 mx-auto mb-4" />
        <h3 className="text-2xl font-black text-white mb-3">The world's first A2A carbon negotiation protocol</h3>
        <p className="text-white/40 text-sm max-w-xl mx-auto leading-relaxed">
          Traditional carbon pledges are forgotten by Tuesday. ReBon's Agent Arena creates binding,
          AI-witnessed commitments between real people — turning climate action into a contract, not a suggestion.
        </p>
      </div>
    </div>
  );
}
