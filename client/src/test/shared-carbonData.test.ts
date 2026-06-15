import { describe, expect, it } from "vitest";
import { ARCHETYPES, calculateEquivalents, calculateEloChange, calculateInfluenceScore } from "../../../shared/carbonData";

describe("shared carbon data", () => {
  it("calculates equivalents from carbon saved", () => {
    const equivalents = calculateEquivalents(42);

    expect(equivalents.trees).toBeGreaterThan(0);
    expect(equivalents.km_not_driven).toBeGreaterThan(0);
    expect(equivalents.phone_charges).toBeGreaterThan(0);
  });

  it("keeps the Elo system zero-sum", () => {
    const { winnerChange, loserChange } = calculateEloChange(1200, 1000);

    expect(winnerChange + loserChange).toBe(0);
  });

  it("scales influence score with activity and network size", () => {
    const base = calculateInfluenceScore({
      carbonSavedKg: 0,
      activitiesLogged: 0,
      challengesCompleted: 0,
      streakDays: 0,
      followersCount: 0,
    });
    const boosted = calculateInfluenceScore({
      carbonSavedKg: 100,
      activitiesLogged: 10,
      challengesCompleted: 2,
      streakDays: 7,
      followersCount: 20,
    });

    expect(boosted).toBeGreaterThan(base);
  });

  it("exports six archetypes", () => {
    expect(Object.keys(ARCHETYPES)).toHaveLength(6);
  });
});
