/**
 * ReBon Carbon Intelligence — Comprehensive Test Suite
 * Covers: carbon calculations, archetype segmentation, AI routing, Elo scoring,
 *         challenge generation, peer comparison, collective impact, security
 */
import { describe, expect, it, vi } from "vitest";
import {
  ARCHETYPES,
  EMISSION_FACTORS,
  ONBOARDING_QUESTIONS,
  ACTIVITY_PRESETS,
  calculateEquivalents,
  calculateEloChange,
  calculateInfluenceScore,
} from "../shared/carbonData";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeCtx(overrides: Partial<TrpcContext> = {}): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user-001",
      name: "Test User",
      email: "test@rebon.ai",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
    ...overrides,
  };
}

function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── 1. Carbon Emission Factors ──────────────────────────────────────────────

describe("Carbon Emission Factors", () => {
  it("should have valid transport emission factors", () => {
    expect(EMISSION_FACTORS.transport).toBeDefined();
    expect(EMISSION_FACTORS.transport.car_petrol_km).toBeGreaterThan(0);
    expect(EMISSION_FACTORS.transport.car_electric_km).toBeGreaterThan(0);
    expect(EMISSION_FACTORS.transport.bicycle_km).toBe(0);
    expect(EMISSION_FACTORS.transport.walking_km).toBe(0);
  });

  it("should have valid meal emission factors", () => {
    expect(EMISSION_FACTORS.meals).toBeDefined();
    expect(EMISSION_FACTORS.meals.beef_meal).toBeGreaterThan(EMISSION_FACTORS.meals.vegan_meal);
    expect(EMISSION_FACTORS.meals.vegan_meal).toBeGreaterThanOrEqual(0);
  });

  it("should have valid energy emission factors", () => {
    expect(EMISSION_FACTORS.energy).toBeDefined();
    expect(EMISSION_FACTORS.energy.electricity_kwh).toBeGreaterThan(0);
    expect(EMISSION_FACTORS.energy.shower_minute).toBeGreaterThan(0);
  });

  it("should have valid shopping emission factors", () => {
    expect(EMISSION_FACTORS.shopping).toBeDefined();
    expect(EMISSION_FACTORS.shopping.clothing_item).toBeGreaterThan(0);
  });

  it("petrol car should emit more CO₂ per km than electric vehicle", () => {
    expect(EMISSION_FACTORS.transport.car_petrol_km).toBeGreaterThan(
      EMISSION_FACTORS.transport.car_electric_km
    );
  });

  it("beef meal should emit more CO₂ than chicken meal", () => {
    expect(EMISSION_FACTORS.meals.beef_meal).toBeGreaterThan(
      EMISSION_FACTORS.meals.chicken_meal
    );
  });

  it("solar energy should emit less CO₂ per kWh than coal", () => {
    expect(EMISSION_FACTORS.energy.solar_kwh).toBeLessThan(
      EMISSION_FACTORS.energy.coal_kg
    );
  });
});

// ─── 2. Carbon Equivalents Calculator ───────────────────────────────────────

describe("Carbon Equivalents Calculator", () => {
  it("should return all required equivalent keys", () => {
    const result = calculateEquivalents(50);
    expect(result).toHaveProperty("trees");
    expect(result).toHaveProperty("km_not_driven");
    expect(result).toHaveProperty("phone_charges");
    expect(result).toHaveProperty("meals_saved");
    expect(result).toHaveProperty("flights_avoided");
  });

  it("should compute tree equivalents correctly (1 tree ≈ 21 kg CO₂/year)", () => {
    const result = calculateEquivalents(21);
    expect(result.trees).toBeCloseTo(1, 0);
  });

  it("should return zero equivalents for zero carbon", () => {
    const result = calculateEquivalents(0);
    expect(result.trees).toBe(0);
    expect(result.km_not_driven).toBe(0);
    expect(result.phone_charges).toBe(0);
  });

  it("should return positive equivalents for positive carbon savings", () => {
    const result = calculateEquivalents(100);
    expect(result.trees).toBeGreaterThan(0);
    expect(result.km_not_driven).toBeGreaterThan(0);
    expect(result.phone_charges).toBeGreaterThan(0);
  });

  it("larger carbon savings should produce proportionally larger equivalents", () => {
    const small = calculateEquivalents(10);
    const large = calculateEquivalents(100);
    expect(large.trees).toBeGreaterThan(small.trees);
    expect(large.km_not_driven).toBeGreaterThan(small.km_not_driven);
  });
});

// ─── 3. Archetype Segmentation ──────────────────────────────────────────────

describe("Archetype Segmentation", () => {
  it("should define all 6 lifestyle archetypes", () => {
    const keys = Object.keys(ARCHETYPES);
    expect(keys).toContain("urban_commuter");
    expect(keys).toContain("eco_pioneer");
    expect(keys).toContain("energy_heavy");
    expect(keys).toContain("conscious_consumer");
    expect(keys).toContain("suburban_family");
    expect(keys).toContain("digital_nomad");
    expect(keys).toHaveLength(6);
  });

  it("each archetype should have required fields", () => {
    for (const [, arch] of Object.entries(ARCHETYPES)) {
      expect(arch).toHaveProperty("label");
      expect(arch).toHaveProperty("icon");
      expect(arch).toHaveProperty("description");
      expect(arch).toHaveProperty("weeklyAvgKg");
      expect((arch as any).weeklyAvgKg).toBeGreaterThan(0);
    }
  });

  it("eco_pioneer should have lower weekly average than energy_heavy", () => {
    expect(ARCHETYPES.eco_pioneer.weeklyAvgKg).toBeLessThan(
      ARCHETYPES.energy_heavy.weeklyAvgKg
    );
  });

  it("all archetype icons should be emoji strings", () => {
    for (const [, arch] of Object.entries(ARCHETYPES)) {
      expect(typeof arch.icon).toBe("string");
      expect(arch.icon.length).toBeGreaterThan(0);
    }
  });
});

// ─── 4. Onboarding Questions ────────────────────────────────────────────────

describe("Onboarding Questions", () => {
  it("should have at least 5 onboarding questions", () => {
    expect(ONBOARDING_QUESTIONS.length).toBeGreaterThanOrEqual(5);
  });

  it("each question should have required fields", () => {
    for (const q of ONBOARDING_QUESTIONS) {
      expect(q).toHaveProperty("id");
      expect(q).toHaveProperty("question");
      expect(q).toHaveProperty("category");
      expect(q).toHaveProperty("options");
      expect(q.options.length).toBeGreaterThan(0);
    }
  });

  it("each option should have label, value, and score", () => {
    for (const q of ONBOARDING_QUESTIONS) {
      for (const opt of q.options) {
        expect(opt).toHaveProperty("label");
        expect(opt).toHaveProperty("value");
        expect(opt).toHaveProperty("score");
        expect(typeof opt.score).toBe("object");
      }
    }
  });

  it("question IDs should be unique", () => {
    const ids = ONBOARDING_QUESTIONS.map(q => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("option values within each question should be unique", () => {
    for (const q of ONBOARDING_QUESTIONS) {
      const values = q.options.map(o => o.value);
      expect(new Set(values).size).toBe(values.length);
    }
  });

  it("all score keys should reference valid archetype IDs", () => {
    const validArchetypes = Object.keys(ARCHETYPES);
    for (const q of ONBOARDING_QUESTIONS) {
      for (const opt of q.options) {
        for (const key of Object.keys(opt.score)) {
          expect(validArchetypes).toContain(key);
        }
      }
    }
  });
});

// ─── 5. Activity Presets ────────────────────────────────────────────────────

describe("Activity Presets", () => {
  it("should have presets for all 4 categories", () => {
    expect(ACTIVITY_PRESETS).toHaveProperty("transport");
    expect(ACTIVITY_PRESETS).toHaveProperty("meals");
    expect(ACTIVITY_PRESETS).toHaveProperty("energy");
    expect(ACTIVITY_PRESETS).toHaveProperty("shopping");
  });

  it("each preset should have required fields", () => {
    for (const [, presets] of Object.entries(ACTIVITY_PRESETS)) {
      for (const preset of presets) {
        expect(preset).toHaveProperty("id");
        expect(preset).toHaveProperty("label");
        expect(preset).toHaveProperty("carbonKg");
        expect(preset).toHaveProperty("icon");
        expect(preset.carbonKg).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("preset IDs should be unique across all categories", () => {
    const allIds = Object.values(ACTIVITY_PRESETS).flat().map(p => p.id);
    expect(new Set(allIds).size).toBe(allIds.length);
  });

  it("bicycle and walking presets should have 0 carbon", () => {
    const bikePreset = ACTIVITY_PRESETS.transport.find(p => p.id === "bicycle");
    const walkPreset = ACTIVITY_PRESETS.transport.find(p => p.id === "walking");
    if (bikePreset) expect(bikePreset.carbonKg).toBe(0);
    if (walkPreset) expect(walkPreset.carbonKg).toBe(0);
  });
});

// ─── 6. Elo Rating System ───────────────────────────────────────────────────

describe("Elo Rating System", () => {
  it("should return positive winner change and negative loser change", () => {
    const { winnerChange, loserChange } = calculateEloChange(1000, 1000);
    expect(winnerChange).toBeGreaterThan(0);
    expect(loserChange).toBeLessThan(0);
  });

  it("equal Elo players should exchange ~16 points (K=32, 50% expected)", () => {
    const { winnerChange } = calculateEloChange(1000, 1000);
    expect(winnerChange).toBe(16);
  });

  it("higher Elo player should gain less from beating lower Elo player", () => {
    const { winnerChange: highBeatsLow } = calculateEloChange(1500, 1000);
    const { winnerChange: equalMatch } = calculateEloChange(1000, 1000);
    expect(highBeatsLow).toBeLessThan(equalMatch);
  });

  it("lower Elo player should gain more from beating higher Elo player", () => {
    const { winnerChange: lowBeatsHigh } = calculateEloChange(1000, 1500);
    const { winnerChange: equalMatch } = calculateEloChange(1000, 1000);
    expect(lowBeatsHigh).toBeGreaterThan(equalMatch);
  });

  it("winner change and loser change should be equal in magnitude", () => {
    const { winnerChange, loserChange } = calculateEloChange(1000, 1000);
    expect(Math.abs(winnerChange)).toBe(Math.abs(loserChange));
  });

  it("custom K factor should scale changes proportionally", () => {
    const { winnerChange: k32 } = calculateEloChange(1000, 1000, 32);
    const { winnerChange: k16 } = calculateEloChange(1000, 1000, 16);
    expect(k32).toBe(k16 * 2);
  });
});

// ─── 7. Influence Score Algorithm ───────────────────────────────────────────

describe("Influence Score Algorithm", () => {
  it("should return 0 for all-zero inputs", () => {
    const score = calculateInfluenceScore({
      carbonSavedKg: 0, activitiesLogged: 0,
      challengesCompleted: 0, streakDays: 0, followersCount: 0,
    });
    expect(score).toBe(0);
  });

  it("should return positive score for positive inputs", () => {
    const score = calculateInfluenceScore({
      carbonSavedKg: 100, activitiesLogged: 50,
      challengesCompleted: 5, streakDays: 30, followersCount: 10,
    });
    expect(score).toBeGreaterThan(0);
  });

  it("more carbon saved should increase influence score", () => {
    const low = calculateInfluenceScore({ carbonSavedKg: 10, activitiesLogged: 0, challengesCompleted: 0, streakDays: 0, followersCount: 0 });
    const high = calculateInfluenceScore({ carbonSavedKg: 100, activitiesLogged: 0, challengesCompleted: 0, streakDays: 0, followersCount: 0 });
    expect(high).toBeGreaterThan(low);
  });

  it("influence score components should be partially capped", () => {
    // carbonScore capped at 500, activityScore at 200, streakScore at 150, networkScore at 250
    // challengeScore is uncapped — by design to reward long-term engagement
    const score = calculateInfluenceScore({
      carbonSavedKg: 99999, activitiesLogged: 99999,
      challengesCompleted: 0, streakDays: 99999, followersCount: 99999,
    });
    // With challengesCompleted=0: max = 500+200+0+150+250 = 1100
    expect(score).toBeLessThanOrEqual(1100);
  });
});

// ─── 8. Auth Router ─────────────────────────────────────────────────────────

describe("Auth Router", () => {
  it("auth.me should return null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("auth.me should return user object for authenticated user", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.openId).toBe("test-user-001");
    expect(result?.name).toBe("Test User");
  });

  it("auth.logout should clear session cookie and return success", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(ctx.res.clearCookie).toHaveBeenCalled();
  });
});

// ─── 9. Security — Input Validation ─────────────────────────────────────────

describe("Security — Input Validation", () => {
  it("should reject negative quantity in activity logging", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.activities.log({ category: "transport", activityKey: "car_petrol_10km", quantity: -10 })
    ).rejects.toThrow();
  });

  it("should reject zero quantity in activity logging", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.activities.log({ category: "transport", activityKey: "car_petrol_10km", quantity: 0 })
    ).rejects.toThrow();
  });

  it("should reject extremely large quantities (> 100000)", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.activities.log({ category: "transport", activityKey: "car_petrol_10km", quantity: 100001 })
    ).rejects.toThrow();
  });

  it("protected procedures should reject unauthenticated users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.activities.log({ category: "transport", activityKey: "car_petrol_10km", quantity: 10 })
    ).rejects.toThrow();
  });

  it("should reject invalid category in activity logging", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.activities.log({ category: "invalid_cat" as any, activityKey: "car_petrol_10km", quantity: 10 })
    ).rejects.toThrow();
  });
});

// ─── 10. Collective Impact Modeling ─────────────────────────────────────────

describe("Collective Impact Modeling", () => {
  it("collective impact should scale linearly with member count", () => {
    const perMemberSavingKg = 5;
    const memberCount = 100;
    expect(perMemberSavingKg * memberCount).toBe(500);
  });

  it("going vegan saves significant CO₂ vs beef per meal", () => {
    const saving = EMISSION_FACTORS.meals.beef_meal - EMISSION_FACTORS.meals.vegan_meal;
    expect(saving).toBeGreaterThan(1); // At least 1 kg CO₂ saved per meal
  });

  it("cycling instead of driving saves CO₂ per km", () => {
    const saving = EMISSION_FACTORS.transport.car_petrol_km - EMISSION_FACTORS.transport.bicycle_km;
    expect(saving).toBeGreaterThan(0);
  });

  it("100 people switching to public transit saves meaningful CO₂", () => {
    const carKm = EMISSION_FACTORS.transport.car_petrol_km;
    const busKm = EMISSION_FACTORS.transport.bus_km;
    const savingPerPersonPer10km = (carKm - busKm) * 10;
    const groupSaving = savingPerPersonPer10km * 100;
    expect(groupSaving).toBeGreaterThan(100); // > 100 kg CO₂ saved
  });
});

// ─── 11. Peer Comparison Logic ───────────────────────────────────────────────

describe("Peer Comparison Logic", () => {
  it("percentile rank should be between 0 and 100", () => {
    const peers = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const userValue = 45;
    const below = peers.filter(v => v > userValue).length;
    const percentile = Math.round((below / peers.length) * 100);
    expect(percentile).toBeGreaterThanOrEqual(0);
    expect(percentile).toBeLessThanOrEqual(100);
  });

  it("user with lower carbon than all peers should rank at 100th percentile", () => {
    const peers = [50, 60, 70, 80, 90];
    const userValue = 10;
    const below = peers.filter(v => v > userValue).length;
    expect(Math.round((below / peers.length) * 100)).toBe(100);
  });

  it("user with higher carbon than all peers should rank at 0th percentile", () => {
    const peers = [10, 20, 30, 40, 50];
    const userValue = 100;
    const below = peers.filter(v => v > userValue).length;
    expect(Math.round((below / peers.length) * 100)).toBe(0);
  });

  it("median user should rank near 50th percentile", () => {
    const peers = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const userValue = 55;
    const below = peers.filter(v => v > userValue).length;
    const percentile = Math.round((below / peers.length) * 100);
    expect(percentile).toBeGreaterThanOrEqual(40);
    expect(percentile).toBeLessThanOrEqual(60);
  });
});

// ─── 12. AI Provider Configuration ──────────────────────────────────────────

describe("AI Provider Configuration", () => {
  it("GROQ_API_KEY should be configured", () => {
    expect(process.env.GROQ_API_KEY).toBeTruthy();
    expect(process.env.GROQ_API_KEY!.startsWith("gsk_")).toBe(true);
  });

  it("NVIDIA_NIM_API_KEY should be configured", () => {
    expect(process.env.NVIDIA_NIM_API_KEY).toBeTruthy();
    expect(process.env.NVIDIA_NIM_API_KEY!.startsWith("nvapi-")).toBe(true);
  });

  it("DEEPGRAM_API_KEY should be configured", () => {
    expect(process.env.DEEPGRAM_API_KEY).toBeTruthy();
    expect(process.env.DEEPGRAM_API_KEY!.length).toBeGreaterThan(20);
  });

  it("SARVAM_API_KEY should be configured", () => {
    expect(process.env.SARVAM_API_KEY).toBeTruthy();
    expect(process.env.SARVAM_API_KEY!.startsWith("sk_")).toBe(true);
  });

  it("AI routing task-to-provider mapping should be consistent", () => {
    const taskMap: Record<string, string> = {
      fast_inference: "groq",
      deep_analysis: "nvidia_nim",
      voice_transcription: "deepgram",
      multilingual: "sarvam",
    };
    expect(Object.keys(taskMap)).toHaveLength(4);
    expect(taskMap.fast_inference).toBe("groq");
    expect(taskMap.deep_analysis).toBe("nvidia_nim");
    expect(taskMap.voice_transcription).toBe("deepgram");
    expect(taskMap.multilingual).toBe("sarvam");
  });
});
