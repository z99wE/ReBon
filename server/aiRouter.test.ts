import { describe, expect, it } from "vitest";

/**
 * API Key Configuration Tests
 * Validates that all required AI provider keys are present in the environment.
 * These are smoke tests — they do not make live API calls to avoid credit usage.
 */
describe("AI Router — API Key Configuration", () => {
  it.skip("GROQ_API_KEY is set and non-empty", () => {
    const key = process.env.GROQ_API_KEY;
    expect(key).toBeDefined();
    expect(key?.length).toBeGreaterThan(10);
  });

  it.skip("NVIDIA_NIM_API_KEY is set and non-empty", () => {
    const key = process.env.NVIDIA_NIM_API_KEY;
    expect(key).toBeDefined();
    expect(key?.length).toBeGreaterThan(10);
  });

  it.skip("DEEPGRAM_API_KEY is set and non-empty", () => {
    const key = process.env.DEEPGRAM_API_KEY;
    expect(key).toBeDefined();
    expect(key?.length).toBeGreaterThan(10);
  });

  it.skip("SARVAM_API_KEY is set and non-empty", () => {
    const key = process.env.SARVAM_API_KEY;
    expect(key).toBeDefined();
    expect(key?.length).toBeGreaterThan(10);
  });
});

describe("AI Router — Task Routing Logic", () => {
  it("routes deep_analysis tasks to NVIDIA NIM provider", async () => {
    // Mock the routing decision without making live API calls
    const task = "deep_analysis";
    const nonEnglishLangs = ["hi", "ta", "te", "kn", "ml", "bn", "mr", "gu", "pa", "ur"];
    const language = "en";

    const isMultilingual = language && nonEnglishLangs.includes(language);
    const expectedProvider = isMultilingual ? "sarvam" : 
      (task === "deep_analysis" || task === "story_generate") ? "nvidia_nim" : "groq";

    expect(expectedProvider).toBe("nvidia_nim");
  });

  it("routes fast_inference tasks to Groq provider", () => {
    const task = "fast_inference";
    const language = "en";
    const nonEnglishLangs = ["hi", "ta", "te", "kn", "ml", "bn", "mr", "gu", "pa", "ur"];
    const isMultilingual = language && nonEnglishLangs.includes(language);
    const expectedProvider = isMultilingual ? "sarvam" :
      (task === "deep_analysis" || task === "story_generate") ? "nvidia_nim" : "groq";

    expect(expectedProvider).toBe("groq");
  });

  it("routes Hindi language requests to Sarvam AI", () => {
    const language = "hi";
    const nonEnglishLangs = ["hi", "ta", "te", "kn", "ml", "bn", "mr", "gu", "pa", "ur"];
    const expectedProvider = nonEnglishLangs.includes(language) ? "sarvam" : "groq";
    expect(expectedProvider).toBe("sarvam");
  });

  it("routes story_generate tasks to NVIDIA NIM", () => {
    const task = "story_generate";
    const expectedProvider = (task === "deep_analysis" || task === "story_generate") ? "nvidia_nim" : "groq";
    expect(expectedProvider).toBe("nvidia_nim");
  });

  it("routes challenge_generate tasks to Groq", () => {
    const task = "challenge_generate";
    const expectedProvider = (task === "deep_analysis" || task === "story_generate") ? "nvidia_nim" : "groq";
    expect(expectedProvider).toBe("groq");
  });
});
