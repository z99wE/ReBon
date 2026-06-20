/**
 * @fileoverview Shared server-side utility functions used across routers.
 *
 * Functions here are intentionally free of HTTP/TRPC context so they can be
 * unit-tested in isolation.
 */

import { ARCHETYPES, ONBOARDING_QUESTIONS } from "../../shared/carbonData";

/**
 * Parses a JSON value from raw AI response text.
 *
 * AI models sometimes wrap JSON in markdown code fences (e.g. ```json … ```).
 * This helper tries multiple strategies in order:
 *  1. Direct JSON.parse on the full response.
 *  2. Strip a single markdown code fence and parse its inner text.
 *  3. Find the first `[` or `{` character and parse from there.
 *
 * @template T - Expected shape of the parsed value.
 * @param content  - Raw string content from the AI response.
 * @param fallback - Value returned when every parse attempt fails.
 * @returns Parsed value of type T, or `fallback` on failure.
 */
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

/**
 * Returns the ISO week number (1–53) for a given date.
 *
 * Uses the simple ISO-8601-like algorithm where week 1 starts on
 * the first day of the year.
 *
 * @param date - The date to compute the week number for.
 * @returns Integer week number in the range 1–53.
 */
export function getWeekNumber(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
}

/**
 * Computes the user's carbon archetype from onboarding survey answers.
 *
 * Each answer contributes weighted scores to several archetype buckets
 * (defined in `ONBOARDING_QUESTIONS`). The archetype with the highest
 * cumulative score wins.
 *
 * @param answers - Map of question `id` → selected option `value`.
 * @returns Object with `id` (archetype key) and `label` (display name).
 *
 * @example
 * const { id, label } = computeArchetype({ q1: "bus", q2: "vegan" });
 * // id: "eco_pioneer", label: "Eco Pioneer"
 */
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
