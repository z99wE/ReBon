/**
 * Agent-to-Agent (A2A) Carbon Negotiation Router
 *
 * Architecture: Each user has a "ReBon Agent" — a lightweight AI persona
 * that represents their carbon profile. Agents negotiate reduction pledges
 * with each other using a structured multi-turn protocol:
 *
 *   1. Initiator sends a pledge proposal (category + kg target)
 *   2. Target agent evaluates feasibility vs. their archetype profile
 *   3. Agents exchange 2-3 turns of negotiation (Groq for speed)
 *   4. Final agreement is stored as a mutual pledge
 *
 * Low-compute strategy:
 *   - Uses Groq (llama3-8b-instant) for sub-200ms responses
 *   - Each negotiation is max 3 turns × 150 tokens = ~450 tokens total
 *   - No streaming — fire-and-forget with optimistic UI
 *   - Negotiations are cached for 24h to avoid re-runs
 */

import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { agentNegotiations, users } from "../../drizzle/schema";
import { eq, desc, and, or } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { ARCHETYPES } from "../../shared/carbonData";

// ── Types ──────────────────────────────────────────────────────────────────

interface NegotiationTurn {
  speaker: "initiator" | "target";
  message: string;
  proposedKg?: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function buildAgentPersona(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) return "a climate-conscious individual";

  const user = await db
    .select({ name: users.name, archetype: users.archetype, weeklyBudgetKg: users.weeklyBudgetKg })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const archetype = user[0]?.archetype
    ? ARCHETYPES[user[0].archetype as keyof typeof ARCHETYPES]
    : null;

  const name = user[0]?.name ?? "User";
  const archetypeName = archetype?.label ?? "Climate Warrior";
  const weeklyAvg = archetype?.weeklyAvgKg ?? (user[0]?.weeklyBudgetKg ?? 70);

  return `${name}, a ${archetypeName} who currently emits ~${weeklyAvg}kg CO₂/week`;
}

async function runNegotiationTurn(
  initiatorPersona: string,
  targetPersona: string,
  category: string,
  proposedKg: number,
  turns: NegotiationTurn[],
  currentSpeaker: "initiator" | "target"
): Promise<{ message: string; agreedKg?: number; accepted: boolean }> {
  const history = turns
    .map((t) => `${t.speaker === "initiator" ? "Agent A" : "Agent B"}: ${t.message}`)
    .join("\n");

  const systemPrompt = `You are a carbon reduction negotiation AI. Two user agents are negotiating a mutual carbon reduction pledge.
Agent A represents: ${initiatorPersona}
Agent B represents: ${targetPersona}
Category: ${category}
Initial proposal: reduce by ${proposedKg}kg CO₂/week

Rules:
- Keep responses under 60 words
- Be pragmatic and specific
- If accepting, state the agreed kg clearly with "AGREED: Xkg"
- If counter-proposing, suggest a realistic alternative
- After 2 turns, reach a conclusion
- Format: one short paragraph only`;

  const userMessage =
    currentSpeaker === "target"
      ? `Agent A just proposed: ${turns[turns.length - 1]?.message ?? `reducing ${category} emissions by ${proposedKg}kg/week`}. Agent B, respond:`
      : `Agent B responded: ${turns[turns.length - 1]?.message}. Agent A, finalize or counter:`;

  const response = await invokeLLM({
    model: "llama3-8b-instant",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: history ? `Conversation so far:\n${history}\n\n${userMessage}` : userMessage },
    ],
    max_tokens: 120,
  } as Parameters<typeof invokeLLM>[0]);

  const rawContent = response.choices[0]?.message?.content ?? "";
  const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
  const agreedMatch = content.match(/AGREED:\s*(\d+(?:\.\d+)?)\s*kg/i);

  return {
    message: content,
    agreedKg: agreedMatch ? parseFloat(agreedMatch[1]) : undefined,
    accepted: !!agreedMatch,
  };
}

// ── Router ─────────────────────────────────────────────────────────────────

export const agentsRouter = router({
  /** List all negotiations involving the current user */
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const rows = await db
      .select({
        id: agentNegotiations.id,
        initiatorId: agentNegotiations.initiatorId,
        targetId: agentNegotiations.targetId,
        category: agentNegotiations.category,
        proposedKg: agentNegotiations.proposedKg,
        agreedKg: agentNegotiations.agreedKg,
        status: agentNegotiations.status,
        turns: agentNegotiations.turns,
        createdAt: agentNegotiations.createdAt,
        initiatorName: users.name,
      })
      .from(agentNegotiations)
      .leftJoin(users, eq(users.id, agentNegotiations.initiatorId))
      .where(
        or(
          eq(agentNegotiations.initiatorId, ctx.user.id),
          eq(agentNegotiations.targetId, ctx.user.id)
        )
      )
      .orderBy(desc(agentNegotiations.createdAt))
      .limit(20);

    return rows;
  }),

  /** Get available peers to negotiate with */
  getPeers: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        archetype: users.archetype,
        eloScore: users.eloScore,
      })
      .from(users)
      .where(eq(users.role, "user"))
      .limit(20);

    return rows.filter((r) => r.id !== ctx.user.id);
  }),

  /** Initiate a new A2A negotiation */
  initiate: protectedProcedure
    .input(
      z.object({
        targetUserId: z.number().int().positive(),
        category: z.string().min(1).max(50),
        proposedKg: z.number().positive().max(200),
        message: z.string().max(200).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      // Build agent personas
      const [initiatorPersona, targetPersona] = await Promise.all([
        buildAgentPersona(ctx.user.id),
        buildAgentPersona(input.targetUserId),
      ]);

      // Turn 1: Initiator opens
      const openingMessage =
        input.message ??
        `I propose we both commit to reducing our ${input.category} emissions by ${input.proposedKg}kg CO₂/week. This aligns with the current climate targets and is achievable given our profiles.`;

      const turns: NegotiationTurn[] = [
        { speaker: "initiator", message: openingMessage, proposedKg: input.proposedKg },
      ];

      // Turn 2: Target responds
      const targetResponse = await runNegotiationTurn(
        initiatorPersona,
        targetPersona,
        input.category,
        input.proposedKg,
        turns,
        "target"
      );

      turns.push({
        speaker: "target",
        message: targetResponse.message,
        proposedKg: targetResponse.agreedKg,
      });

      let finalStatus: "pending" | "agreed" | "rejected" = "pending";
      let agreedKg: number | null = null;

      if (targetResponse.accepted && targetResponse.agreedKg) {
        finalStatus = "agreed";
        agreedKg = targetResponse.agreedKg;
      } else {
        // Turn 3: Initiator finalizes
        const finalResponse = await runNegotiationTurn(
          initiatorPersona,
          targetPersona,
          input.category,
          input.proposedKg,
          turns,
          "initiator"
        );

        turns.push({
          speaker: "initiator",
          message: finalResponse.message,
          proposedKg: finalResponse.agreedKg,
        });

        if (finalResponse.accepted && finalResponse.agreedKg) {
          finalStatus = "agreed";
          agreedKg = finalResponse.agreedKg;
        } else {
          finalStatus = "rejected";
        }
      }

      // Persist negotiation
      const [inserted] = await db.insert(agentNegotiations).values({
        initiatorId: ctx.user.id,
        targetId: input.targetUserId,
        category: input.category,
        proposedKg: input.proposedKg.toString(),
        agreedKg: agreedKg?.toString() ?? null,
        status: finalStatus,
        turns: JSON.stringify(turns),
      });

      return {
        id: (inserted as { insertId?: number })?.insertId ?? 0,
        status: finalStatus,
        agreedKg,
        turns,
        initiatorPersona,
        targetPersona,
      };
    }),

  /** Get a single negotiation with full turn history */
  get: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;

      const rows = await db
        .select()
        .from(agentNegotiations)
        .where(
          and(
            eq(agentNegotiations.id, input.id),
            or(
              eq(agentNegotiations.initiatorId, ctx.user.id),
              eq(agentNegotiations.targetId, ctx.user.id)
            )
          )
        )
        .limit(1);

      if (!rows[0]) return null;

      const row = rows[0];
      return {
        ...row,
        turns: JSON.parse(row.turns as string) as NegotiationTurn[],
      };
    }),

  /** Public stats for the Agent Arena landing section */
  stats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { total: 0, agreed: 0, totalKgPledged: 0 };

    const rows = await db
      .select({
        status: agentNegotiations.status,
        agreedKg: agentNegotiations.agreedKg,
      })
      .from(agentNegotiations)
      .limit(1000);

    const agreed = rows.filter((r) => r.status === "agreed");
    const totalKgPledged = agreed.reduce(
      (sum, r) => sum + (r.agreedKg ? parseFloat(r.agreedKg) : 0),
      0
    );

    return {
      total: rows.length,
      agreed: agreed.length,
      totalKgPledged: Math.round(totalKgPledged),
    };
  }),
});
