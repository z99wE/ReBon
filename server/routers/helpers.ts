import { ARCHETYPES, ONBOARDING_QUESTIONS } from "../../shared/carbonData";

/** Strip markdown code fences and extract JSON from AI responses */
export function parseAIJson<T>(content: string, fallback: T): T {
  try { return JSON.parse(content); } catch { /* try stripping markdown */ }
  const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) { try { return JSON.parse(match[1].trim()); } catch { /* fall through */ } }
  // Try to find first [ or { and parse from there
  const arrStart = content.indexOf('[');
  const objStart = content.indexOf('{');
  const start = arrStart !== -1 && (objStart === -1 || arrStart < objStart) ? arrStart : objStart;
  if (start !== -1) { try { return JSON.parse(content.slice(start)); } catch { /* fall through */ } }
  return fallback;
}

export function getWeekNumber(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
}

export function computeArchetype(answers: Record<string, unknown>): { id: string; label: string } {
  const scores: Record<string, number> = { urban_commuter: 0, conscious_consumer: 0, energy_heavy: 0, eco_pioneer: 0, suburban_family: 0, digital_nomad: 0 };
  ONBOARDING_QUESTIONS.forEach(q => {
    const answer = answers[q.id] as string; if (!answer) return;
    const option = q.options.find(o => o.value === answer); if (!option) return;
    Object.entries(option.score).forEach(([arch, pts]) => { scores[arch] = (scores[arch] ?? 0) + pts; });
  });
  const topArchetype = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];
  const id = topArchetype[0] as keyof typeof ARCHETYPES;
  return { id, label: ARCHETYPES[id]?.label ?? id };
}
