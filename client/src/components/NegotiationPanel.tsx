import React from "react";
import { IconSwords } from "@/components/Icons";

type NegotiationTurn = { speaker: string; message: string; proposedKg?: number | null };

type NegotiationResult = {
  id: number;
  status: string;
  agreedKg: number | null;
  turns: NegotiationTurn[];
  initiatorPersona: string;
  targetPersona: string;
};

interface NegotiationPanelProps {
  isPending: boolean;
  activeNeg: NegotiationResult | null;
}

/**
 * NegotiationPanel — live transcript for an agent-to-agent negotiation.
 * Extracted from AgentArena for single-responsibility and testability.
 */
export function NegotiationPanel({ isPending, activeNeg }: NegotiationPanelProps) {
  if (!activeNeg && !isPending) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 min-h-48 text-center">
        <IconSwords className="w-10 h-10 text-white/[0.07] mb-4" />
        <p className="text-white/25 text-sm">No active negotiation.</p>
        <p className="text-white/15 text-xs mt-2">Select a peer and deploy your agent to begin.</p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div
        className="flex flex-col items-center justify-center flex-1 min-h-48 text-center"
        aria-busy="true"
        aria-label="Agents are negotiating"
      >
        <div className="w-8 h-8 border-2 border-white/10 border-t-white/60 rounded-full animate-spin mb-4" />
        <p className="text-white/40 text-sm">Agents are negotiating...</p>
        <p className="text-white/20 text-xs mt-2">Analysing profiles · Generating proposals · Reaching consensus</p>
      </div>
    );
  }

  if (!activeNeg) return null;

  return (
    <div
      className="space-y-3 max-h-80 overflow-y-auto pr-1 flex-1"
      aria-label="Negotiation transcript"
      role="log"
      aria-live="polite"
    >
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
        <div
          className="p-5 rounded-lg border border-white/20 bg-white/[0.04] text-center mt-4"
          role="status"
          aria-label={`Agreement reached: ${activeNeg.agreedKg} kg weekly reduction`}
        >
          <div className="label-tech text-white/30 text-[9px] tracking-widest mb-3">AGREEMENT REACHED</div>
          <div className="text-4xl font-black text-white mb-1 tabular-nums">{activeNeg.agreedKg} kg</div>
          <div className="text-white/30 text-xs">weekly CO₂ reduction · both parties bound</div>
        </div>
      )}

      {activeNeg.status === "rejected" && (
        <div
          className="p-4 rounded-lg border border-white/10 bg-white/[0.02] text-center mt-4"
          role="status"
          aria-label="No agreement reached"
        >
          <div className="label-tech text-white/20 text-[9px] tracking-widest mb-2">NO AGREEMENT</div>
          <p className="text-white/30 text-xs">Agents could not reach consensus. Try a different proposal or peer.</p>
        </div>
      )}
    </div>
  );
}
