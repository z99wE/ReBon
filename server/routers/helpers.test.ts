/**
 * @fileoverview Unit tests for server/routers/helpers.ts
 *
 * These tests are intentionally fast and have zero external dependencies —
 * no database, no HTTP, no AI calls — so they can run in CI with no extra
 * setup beyond a standard `pnpm test` invocation.
 */

import { describe, expect, it } from "vitest";
import { computeArchetype, getWeekNumber, parseAIJson } from "./helpers";

// ─── parseAIJson ─────────────────────────────────────────────────────────────

describe("parseAIJson", () => {
  it("parses plain JSON array", () => {
    const result = parseAIJson<number[]>("[1, 2, 3]", []);
    expect(result).toEqual([1, 2, 3]);
  });

  it("parses plain JSON object", () => {
    const result = parseAIJson<{ a: number }>('{"a": 42}', { a: 0 });
    expect(result).toEqual({ a: 42 });
  });

  it("strips markdown json fence and parses", () => {
    const content = "```json\n{\"headline\": \"Test\", \"narrative\": \"Content\"}\n```";
    const result = parseAIJson<{ headline: string; narrative: string }>(content, {
      headline: "",
      narrative: "",
    });
    expect(result).toEqual({ headline: "Test", narrative: "Content" });
  });

  it("strips plain markdown fence (no language tag)", () => {
    const content = "```\n[1, 2, 3]\n```";
    const result = parseAIJson<number[]>(content, []);
    expect(result).toEqual([1, 2, 3]);
  });

  it("finds JSON starting with [ embedded in surrounding text", () => {
    const content = "Here is the output:\n[{\"category\": \"transport\", \"carbonKg\": 2.5}]";
    const result = parseAIJson<any[]>(content, []);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ category: "transport", carbonKg: 2.5 });
  });

  it("finds JSON starting with { embedded in surrounding text", () => {
    const content = "Sure! {\"key\": \"value\"}";
    const result = parseAIJson<{ key: string }>(content, { key: "" });
    expect(result).toEqual({ key: "value" });
  });

  it("returns fallback for completely invalid content", () => {
    const fallback = { headline: "fallback", narrative: "n/a" };
    const result = parseAIJson(
      "I cannot parse this as JSON at all.",
      fallback
    );
    expect(result).toBe(fallback);
  });

  it("returns fallback for empty string", () => {
    const result = parseAIJson("", [99]);
    expect(result).toEqual([99]);
  });

  it("returns fallback for fenced but invalid JSON", () => {
    const content = "```json\nNOT_JSON\n```";
    const result = parseAIJson<string>(content, "default");
    expect(result).toBe("default");
  });
});

// ─── getWeekNumber ────────────────────────────────────────────────────────────

describe("getWeekNumber", () => {
  it("returns 1 for January 1st", () => {
    expect(getWeekNumber(new Date(2024, 0, 1))).toBe(1);
  });

  it("returns a later week number for mid-year dates", () => {
    // July 1st of any year should be after week 25
    const week = getWeekNumber(new Date(2024, 6, 1));
    expect(week).toBeGreaterThan(25);
  });

  it("returns a higher week number later in the year", () => {
    const week1 = getWeekNumber(new Date(2024, 0, 15));
    const week2 = getWeekNumber(new Date(2024, 5, 15));
    expect(week2).toBeGreaterThan(week1);
  });

  it("returns consistent results for the same date", () => {
    const date = new Date(2024, 3, 15);
    expect(getWeekNumber(date)).toBe(getWeekNumber(date));
  });
});

// ─── computeArchetype ────────────────────────────────────────────────────────

describe("computeArchetype", () => {
  it("returns a valid archetype id and label for empty answers", () => {
    // With no answers all scores are 0; should still return one archetype
    const result = computeArchetype({});
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("label");
    expect(typeof result.id).toBe("string");
    expect(typeof result.label).toBe("string");
  });

  it("returns an id that is a known archetype key", () => {
    const knownKeys = [
      "urban_commuter",
      "conscious_consumer",
      "energy_heavy",
      "eco_pioneer",
      "suburban_family",
      "digital_nomad",
    ];
    const result = computeArchetype({});
    expect(knownKeys).toContain(result.id);
  });

  it("handles unknown answer values gracefully without throwing", () => {
    expect(() =>
      computeArchetype({ q_nonexistent: "unknown_option" })
    ).not.toThrow();
  });

  it("produces a non-empty label", () => {
    const result = computeArchetype({});
    expect(result.label.length).toBeGreaterThan(0);
  });
});
