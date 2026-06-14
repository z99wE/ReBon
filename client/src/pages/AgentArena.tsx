import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

const CATEGORY_COLORS: Record<string, string> = {
  transport: "#6366f1",
  meals: "#10b981",
  energy: "#f59e0b",
  shopping: "#ec4899",
  lifestyle: "#8b5cf6",
};

const CATEGORY_ICONS: Record<string, string> = {
  transport: "🚗",
  meals: "🥗",
  energy: "⚡",
  shopping: "🛍️",
  lifestyle: "🌿",
};

interface NegotiationTurn {
  agent: "initiator" | "target";
  message: string;
  proposedKg?: number;
  timestamp: string;
}

export default function AgentArena() {
  const { user, isAuthenticated } = useAuth();
  const [selectedPeer, setSelectedPeer] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("transport");
  const [proposedKg, setProposedKg] = useState("5");
  const [activeNegotiation, setActiveNegotiation] = useState<{
    id: number;
    turns: NegotiationTurn[];
    status: string;
    agreedKg?: string;
  } | null>(null);
  const [isNegotiating, setIsNegotiating] = useState(false);

  const { data: peers } = trpc.agents.getPeers.useQuery(undefined, { enabled: isAuthenticated });
  const { data: history, refetch: refetchHistory } = trpc.agents.list.useQuery(undefined, { enabled: isAuthenticated });

  const startNegotiation = trpc.agents.initiate.useMutation({
    onSuccess: (data: { id: number; status: string; agreedKg: number | null; turns: unknown[] }) => {
      const turns = (data.turns as Array<{ speaker: string; message: string; proposedKg?: number }>).map(t => ({
        agent: t.speaker as "initiator" | "target",
        message: t.message,
        proposedKg: t.proposedKg,
        timestamp: new Date().toISOString(),
      }));
      setActiveNegotiation({
        id: data.id,
        turns,
        status: data.status,
        agreedKg: data.agreedKg != null ? String(data.agreedKg) : undefined,
      });
      setIsNegotiating(false);
      refetchHistory();
    },
    onError: () => setIsNegotiating(false),
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="glass-card p-10 text-center max-w-md">
          <div className="text-5xl mb-4">🤖</div>
          <h2 className="text-2xl font-black text-white mb-3">Agent Arena</h2>
          <p className="text-white/50 mb-6">Sign in to challenge peers to AI-powered carbon reduction negotiations.</p>
          <a href={getLoginUrl()} className="btn-primary inline-block">Sign In</a>
        </div>
      </div>
    );
  }

  const handleStart = () => {
    if (!selectedPeer) return;
    setIsNegotiating(true);
    startNegotiation.mutate({
      targetUserId: selectedPeer,
      category: selectedCategory,
      proposedKg: parseFloat(proposedKg) || 5,
    });
  };

  const handleAdvance = () => {
    // Negotiation completes in a single initiate call — no advance needed
    // Reset to allow a new negotiation
    setActiveNegotiation(null);
    setSelectedPeer(null);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
            style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-8 blur-3xl"
            style={{ background: "radial-gradient(circle, #10b981, transparent)" }} />
        </div>
        <div className="max-w-6xl mx-auto px-6 py-12 relative">
          <div className="flex items-center gap-3 mb-4">
            <span className="label-tech text-indigo-400">EXPERIMENTAL</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="label-tech">AGENT-TO-AGENT PROTOCOL</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Agent Arena
            <span className="block text-2xl md:text-3xl font-light text-white/40 mt-1">
              AI agents negotiate carbon reduction on your behalf
            </span>
          </h1>
          <p className="text-white/50 max-w-2xl text-lg">
            Your personal ReBon AI agent challenges a peer's agent to a structured negotiation.
            Two AI personas debate, propose, and agree on a shared carbon reduction commitment —
            turning social accountability into a game.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Setup */}
        <div className="lg:col-span-1 space-y-6">
          {/* How it works */}
          <div className="glass-card p-6 border border-white/8">
            <h3 className="text-white font-black mb-4 flex items-center gap-2">
              <span className="text-indigo-400">⚙</span> How It Works
            </h3>
            <ol className="space-y-3">
              {[
                { step: "01", text: "Select a peer from the community" },
                { step: "02", text: "Choose a carbon category to negotiate" },
                { step: "03", text: "Your AI agent proposes a reduction target" },
                { step: "04", text: "Their AI agent responds with a counter-proposal" },
                { step: "05", text: "Agents reach a binding agreement in 3 turns" },
              ].map((item) => (
                <li key={item.step} className="flex items-start gap-3">
                  <span className="label-tech text-indigo-400 shrink-0 mt-0.5">{item.step}</span>
                  <span className="text-white/60 text-sm">{item.text}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Configure negotiation */}
          <div className="glass-card p-6 border border-white/8">
            <h3 className="text-white font-black mb-5">Configure Negotiation</h3>

            {/* Peer selection */}
            <div className="mb-5">
              <label className="label-tech text-white/50 block mb-2">Select Peer</label>
              {peers && peers.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {peers.map((peer) => (
                    <button
                      key={peer.id}
                      onClick={() => setSelectedPeer(peer.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedPeer === peer.id
                          ? "border-indigo-500/60 bg-indigo-500/10"
                          : "border-white/8 bg-white/3 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black">
                          {(peer.name ?? "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-600">{peer.name ?? "Anonymous"}</p>
                          <p className="text-white/30 text-xs label-tech">{peer.archetype ?? "EXPLORER"}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-white/30 text-sm italic">No peers available yet. Invite friends to join ReBon!</p>
              )}
            </div>

            {/* Category */}
            <div className="mb-5">
              <label className="label-tech text-white/50 block mb-2">Carbon Category</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(CATEGORY_ICONS).map(([cat, icon]) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      selectedCategory === cat
                        ? "border-indigo-500/60 bg-indigo-500/10"
                        : "border-white/8 bg-white/3 hover:bg-white/5"
                    }`}
                  >
                    <div className="text-lg">{icon}</div>
                    <div className="text-[10px] text-white/50 capitalize mt-0.5">{cat}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Proposed kg */}
            <div className="mb-6">
              <label className="label-tech text-white/50 block mb-2">
                Proposed Reduction (kg CO₂/week)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={proposedKg}
                  onChange={(e) => setProposedKg(e.target.value)}
                  className="flex-1 accent-indigo-500"
                  aria-label="Proposed CO2 reduction in kg per week"
                />
                <span className="text-white font-black text-lg w-16 text-right">{proposedKg} kg</span>
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={!selectedPeer || isNegotiating}
              className="w-full btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              aria-busy={isNegotiating}
            >
              {isNegotiating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Agents Negotiating...
                </span>
              ) : (
                "⚔ Start Negotiation"
              )}
            </button>
          </div>
        </div>

        {/* Right: Active negotiation + history */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active negotiation */}
          {activeNegotiation ? (
            <div className="glass-card border border-white/8 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
                <div>
                  <h3 className="text-white font-black">Live Negotiation</h3>
                  <p className="text-white/30 text-xs label-tech mt-0.5">
                    {selectedCategory.toUpperCase()} · {proposedKg} KG TARGET
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black label-tech ${
                  activeNegotiation.status === "agreed"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : activeNegotiation.status === "rejected"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                }`}>
                  {activeNegotiation.status.toUpperCase()}
                </span>
              </div>

              {/* Agreed banner */}
              {activeNegotiation.status === "agreed" && activeNegotiation.agreedKg && (
                <div className="mx-6 mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                  <span className="text-2xl">🤝</span>
                  <div>
                    <p className="text-emerald-400 font-black">Agreement Reached!</p>
                    <p className="text-white/60 text-sm">
                      Both agents committed to reducing <strong className="text-white">{activeNegotiation.agreedKg} kg CO₂/week</strong> in {selectedCategory}
                    </p>
                  </div>
                </div>
              )}

              {/* Turns */}
              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                {activeNegotiation.turns.map((turn, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${turn.agent === "initiator" ? "" : "flex-row-reverse"}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                      turn.agent === "initiator"
                        ? "bg-indigo-500/20 border border-indigo-500/30"
                        : "bg-purple-500/20 border border-purple-500/30"
                    }`}>
                      🤖
                    </div>
                    <div className={`max-w-[75%] ${turn.agent === "initiator" ? "" : "text-right"}`}>
                      <p className={`label-tech text-xs mb-1 ${
                        turn.agent === "initiator" ? "text-indigo-400" : "text-purple-400"
                      }`}>
                        {turn.agent === "initiator" ? `${user?.name ?? "Your"} Agent` : "Peer Agent"}
                      </p>
                      <div className={`p-3 rounded-xl text-sm text-white/80 ${
                        turn.agent === "initiator"
                          ? "bg-indigo-500/10 border border-indigo-500/20"
                          : "bg-purple-500/10 border border-purple-500/20"
                      }`}>
                        {turn.message}
                        {turn.proposedKg && (
                          <span className="block mt-1 text-xs font-black" style={{ color: CATEGORY_COLORS[selectedCategory] }}>
                            → Proposes: {turn.proposedKg} kg/week
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* New negotiation button */}
              <div className="px-6 pb-6">
                <button
                  onClick={handleAdvance}
                  className="w-full btn-secondary"
                >
                  ↩ Start Another Negotiation
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card border border-white/8 p-12 text-center">
              <div className="text-5xl mb-4">⚔️</div>
              <h3 className="text-white font-black text-xl mb-2">No Active Negotiation</h3>
              <p className="text-white/40 text-sm">
                Select a peer and configure a negotiation to watch your AI agents debate carbon reduction strategies.
              </p>
            </div>
          )}

          {/* History */}
          {history && history.length > 0 && (
            <div className="glass-card border border-white/8 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/8">
                <h3 className="text-white font-black">Negotiation History</h3>
                <p className="text-white/30 text-xs label-tech mt-0.5">{history.length} PAST NEGOTIATIONS</p>
              </div>
              <div className="divide-y divide-white/5">
                {history.slice(0, 5).map((neg) => (
                  <div key={neg.id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{CATEGORY_ICONS[neg.category] ?? "🌿"}</span>
                      <div>
                        <p className="text-white text-sm font-600 capitalize">{neg.category} Negotiation</p>
                        <p className="text-white/30 text-xs label-tech">
                          {new Date(neg.createdAt).toLocaleDateString()} · PROPOSED {neg.proposedKg} KG
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-xs font-black label-tech ${
                        neg.status === "agreed"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : neg.status === "rejected"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-indigo-500/20 text-indigo-400"
                      }`}>
                        {neg.status.toUpperCase()}
                      </span>
                      {neg.agreedKg && (
                        <p className="text-white/40 text-xs mt-0.5">{neg.agreedKg} kg agreed</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
