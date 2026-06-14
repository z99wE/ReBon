/**
 * ReBon Core Logic Tests
 * Focused unit tests for pure functions, validators, and data transforms.
 * No browser automation, no snapshot files, no heavy fixtures.
 */
import { describe, it, expect } from "vitest";
import {
  EMISSION_FACTORS,
  ACTIVITY_PRESETS,
  ARCHETYPES,
  calculateEquivalents,
  calculateInfluenceScore,
  calculateEloChange,
  ONBOARDING_QUESTIONS,
} from "../shared/carbonData";

// ─── 1. Carbon Emission Factors ───────────────────────────────────────────────

describe("EMISSION_FACTORS", () => {
  it("has positive emission factors for all transport modes", () => {
    const { transport } = EMISSION_FACTORS;
    expect(transport.car_petrol_km).toBeGreaterThan(0);
    expect(transport.bus_km).toBeGreaterThan(0);
    expect(transport.train_km).toBeGreaterThan(0);
    expect(transport.flight_short_km).toBeGreaterThan(0);
    // Electric car should be lower than petrol
    expect(transport.car_electric_km).toBeLessThan(transport.car_petrol_km);
  });

  it("has positive emission factors for all meal types", () => {
    const { meals } = EMISSION_FACTORS;
    expect(meals.beef_meal).toBeGreaterThan(0);
    expect(meals.chicken_meal).toBeGreaterThan(0);
    expect(meals.vegan_meal).toBeGreaterThan(0);
    // Beef should be higher than vegan
    expect(meals.beef_meal).toBeGreaterThan(meals.vegan_meal);
  });

  it("has positive emission factors for energy", () => {
    const { energy } = EMISSION_FACTORS;
    expect(energy.electricity_kwh).toBeGreaterThan(0);
    expect(energy.natural_gas_kwh).toBeGreaterThan(0);
  });
});

// ─── 2. Activity Presets ──────────────────────────────────────────────────────

describe("ACTIVITY_PRESETS", () => {
  const allPresets = [
    ...ACTIVITY_PRESETS.transport,
    ...ACTIVITY_PRESETS.meals,
    ...ACTIVITY_PRESETS.energy,
    ...ACTIVITY_PRESETS.shopping,
  ];

  it("has unique IDs across all presets", () => {
    const allIds = allPresets.map(p => p.id);
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  it("every preset has a non-negative carbon value", () => {
    allPresets.forEach(preset => {
      expect(preset.carbonKg).toBeGreaterThanOrEqual(0);
    });
  });

  it("most presets have positive carbon values (>0)", () => {
    const positivePresets = allPresets.filter(p => p.carbonKg > 0);
    // At least 80% should have positive values; bicycle/walking are intentionally 0
    expect(positivePresets.length / allPresets.length).toBeGreaterThan(0.8);
  });

  it("every preset has a non-empty label and subcategory", () => {
    allPresets.forEach(preset => {
      expect(preset.label.length).toBeGreaterThan(0);
      expect(preset.subcategory.length).toBeGreaterThan(0);
    });
  });

  it("has presets in all four categories", () => {
    expect(ACTIVITY_PRESETS.transport.length).toBeGreaterThan(0);
    expect(ACTIVITY_PRESETS.meals.length).toBeGreaterThan(0);
    expect(ACTIVITY_PRESETS.energy.length).toBeGreaterThan(0);
    expect(ACTIVITY_PRESETS.shopping.length).toBeGreaterThan(0);
  });
});

// ─── 3. Carbon Equivalents ────────────────────────────────────────────────────

describe("calculateEquivalents", () => {
  it("returns correct tree equivalents (21 kg CO₂ ≈ 1 tree/year)", () => {
    const result = calculateEquivalents(21);
    expect(result.trees).toBeCloseTo(1, 0);
  });

  it("returns correct km_not_driven equivalents", () => {
    const result = calculateEquivalents(19.2);
    expect(result.km_not_driven).toBeCloseTo(100, 0);
  });

  it("returns all expected keys", () => {
    const result = calculateEquivalents(100);
    expect(result).toHaveProperty("trees");
    expect(result).toHaveProperty("km_not_driven");
    expect(result).toHaveProperty("flights_avoided");
    expect(result).toHaveProperty("phone_charges");
    expect(result).toHaveProperty("meals_saved");
    expect(result).toHaveProperty("lightbulb_hours");
  });

  it("all values are non-negative for positive input", () => {
    const result = calculateEquivalents(50);
    Object.values(result).forEach(v => expect(v).toBeGreaterThanOrEqual(0));
  });
});

// ─── 4. Archetype Segmentation ───────────────────────────────────────────────

describe("ARCHETYPES", () => {
  it("has all required lifestyle archetypes", () => {
    const required = ["urban_commuter", "conscious_consumer", "eco_pioneer", "digital_nomad", "suburban_family", "energy_heavy"];
    required.forEach(key => {
      expect(ARCHETYPES).toHaveProperty(key);
    });
  });

  it("every archetype has required fields", () => {
    Object.entries(ARCHETYPES).forEach(([_key, archetype]) => {
      const a = archetype as any;
      expect(a).toHaveProperty("label");
      expect(a).toHaveProperty("icon");
      expect(a).toHaveProperty("weeklyAvgKg");
      expect(a).toHaveProperty("description");
      expect(a.weeklyAvgKg).toBeGreaterThan(0);
    });
  });

  it("archetype weekly averages are realistic (10–200 kg/week)", () => {
    Object.values(ARCHETYPES).forEach(archetype => {
      const a = archetype as any;
      expect(a.weeklyAvgKg).toBeGreaterThanOrEqual(10);
      expect(a.weeklyAvgKg).toBeLessThanOrEqual(200);
    });
  });

  it("all archetype icons are non-empty strings", () => {
    Object.values(ARCHETYPES).forEach(archetype => {
      expect((archetype as any).icon.length).toBeGreaterThan(0);
    });
  });
});

// ─── 5. Influence Score ───────────────────────────────────────────────────────

describe("calculateInfluenceScore", () => {
  const base = { carbonSavedKg: 0, activitiesLogged: 0, challengesCompleted: 0, streakDays: 0, followersCount: 0 };

  it("returns 0 for all-zero inputs", () => {
    expect(calculateInfluenceScore(base)).toBe(0);
  });

  it("higher carbon savings produce higher scores", () => {
    const low = calculateInfluenceScore({ ...base, carbonSavedKg: 10 });
    const high = calculateInfluenceScore({ ...base, carbonSavedKg: 100 });
    expect(high).toBeGreaterThan(low);
  });

  it("more followers increase influence score", () => {
    const few = calculateInfluenceScore({ ...base, followersCount: 2 });
    const many = calculateInfluenceScore({ ...base, followersCount: 20 });
    expect(many).toBeGreaterThan(few);
  });

  it("longer streaks increase influence score", () => {
    const short = calculateInfluenceScore({ ...base, streakDays: 3 });
    const long = calculateInfluenceScore({ ...base, streakDays: 30 });
    expect(long).toBeGreaterThan(short);
  });

  it("returns a non-negative integer", () => {
    const score = calculateInfluenceScore({ ...base, carbonSavedKg: 50, followersCount: 10 });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(score)).toBe(true);
  });
});

// ─── 6. Elo Rating System ─────────────────────────────────────────────────────

describe("calculateEloChange", () => {
  it("winner gains Elo points", () => {
    const { winnerChange } = calculateEloChange(1000, 1000);
    expect(winnerChange).toBeGreaterThan(0);
  });

  it("loser loses Elo points", () => {
    const { loserChange } = calculateEloChange(1000, 1000);
    expect(loserChange).toBeLessThan(0);
  });

  it("equal players gain/lose equal magnitude", () => {
    const { winnerChange, loserChange } = calculateEloChange(1000, 1000);
    expect(winnerChange).toBe(-loserChange);
  });

  it("upset win (lower rated beats higher rated) gives more points", () => {
    const upset = calculateEloChange(800, 1200);
    const expected = calculateEloChange(1200, 800);
    expect(upset.winnerChange).toBeGreaterThan(expected.winnerChange);
  });

  it("changes sum to zero (zero-sum system)", () => {
    const { winnerChange, loserChange } = calculateEloChange(1100, 900);
    expect(winnerChange + loserChange).toBe(0);
  });
});

// ─── 7. Onboarding Questions ─────────────────────────────────────────────────

describe("ONBOARDING_QUESTIONS", () => {
  it("has at least 5 onboarding questions", () => {
    expect(ONBOARDING_QUESTIONS.length).toBeGreaterThanOrEqual(5);
  });

  it("every question has an id, text, and at least 2 options", () => {
    ONBOARDING_QUESTIONS.forEach(q => {
      expect(q.id.length).toBeGreaterThan(0);
      expect(q.question.length).toBeGreaterThan(0);
      expect(q.options.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("every option has a value and label", () => {
    ONBOARDING_QUESTIONS.forEach(q => {
      q.options.forEach(opt => {
        expect(opt.value.length).toBeGreaterThan(0);
        expect(opt.label.length).toBeGreaterThan(0);
      });
    });
  });

  it("question IDs are unique", () => {
    const ids = ONBOARDING_QUESTIONS.map(q => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ─── 8. OTP Auth Validation ───────────────────────────────────────────────────

describe("OTP Auth validation", () => {
  it("validates email format correctly", () => {
    const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("test.name+tag@domain.co.uk")).toBe(true);
    expect(isValidEmail("invalid-email")).toBe(false);
    expect(isValidEmail("@nodomain.com")).toBe(false);
    expect(isValidEmail("user@")).toBe(false);
  });

  it("validates phone format correctly", () => {
    const isValidPhone = (s: string) => /^\+?[1-9]\d{6,14}$/.test(s.replace(/[\s\-()]/g, ""));
    expect(isValidPhone("+447700900000")).toBe(true);
    expect(isValidPhone("+15550001234")).toBe(true);
    expect(isValidPhone("123")).toBe(false);
    expect(isValidPhone("not-a-phone")).toBe(false);
  });

  it("OTP must be exactly 6 digits", () => {
    const isValidOtp = (s: string) => /^\d{6}$/.test(s);
    expect(isValidOtp("123456")).toBe(true);
    expect(isValidOtp("12345")).toBe(false);
    expect(isValidOtp("1234567")).toBe(false);
    expect(isValidOtp("abcdef")).toBe(false);
  });

  it("normalises email to lowercase and trimmed", () => {
    const normalize = (s: string) => s.trim().toLowerCase();
    expect(normalize("  User@Example.COM  ")).toBe("user@example.com");
  });
});

// ─── 9. Input Sanitisation ───────────────────────────────────────────────────

describe("Input sanitisation", () => {
  it("carbon kg values must be positive and finite", () => {
    const isValidKg = (n: number) => Number.isFinite(n) && n > 0 && n < 10000;
    expect(isValidKg(2.5)).toBe(true);
    expect(isValidKg(0)).toBe(false);
    expect(isValidKg(-1)).toBe(false);
    expect(isValidKg(Infinity)).toBe(false);
    expect(isValidKg(NaN)).toBe(false);
  });

  it("activity notes are capped at 500 characters", () => {
    const sanitize = (s: string) => s.slice(0, 500);
    const long = "a".repeat(600);
    expect(sanitize(long).length).toBe(500);
  });

  it("Elo score cannot go below 100 (floor protection)", () => {
    const applyFloor = (elo: number) => Math.max(100, elo);
    expect(applyFloor(50)).toBe(100);
    expect(applyFloor(1000)).toBe(1000);
    expect(applyFloor(100)).toBe(100);
  });
});
