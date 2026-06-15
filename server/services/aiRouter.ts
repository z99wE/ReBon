/**
 * ReBon Multi-Model AI Router
 * Routes requests to Groq (speed), NVIDIA NIM (depth), or Sarvam AI (multilingual)
 * based on task type and user context.
 *
 * Groq model tiers:
 *   llama-3.1-8b-instant     → fast/cheap: challenge generation, coaching, quick parsing
 *   llama-3.3-70b-versatile  → high-quality fallback for complex reasoning
 */

import axios from "axios";

export type AIRouteTask =
  | "fast_inference"      // Groq 8b: leaderboard, quick calculations, challenge scoring
  | "deep_analysis"       // NVIDIA NIM: impact modeling, causal analysis, complex insights
  | "multilingual"        // Sarvam AI: non-English queries, regional language support
  | "challenge_generate"  // Groq 8b: fast challenge generation
  | "story_generate"      // NVIDIA NIM: deep narrative generation
  | "coach_response";     // Groq 8b: coaching responses

export interface AIRouterRequest {
  task: AIRouteTask;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  language?: string; // ISO 639-1 code, e.g. "hi", "ta", "en"
  maxTokens?: number;
  temperature?: number;
}

export interface AIRouterResponse {
  content: string;
  model: string;
  provider: "groq" | "nvidia_nim" | "sarvam";
  latencyMs: number;
}

// ─── Groq model constants ─────────────────────────────────────────────────────
const GROQ_FAST_MODEL = "llama-3.1-8b-instant";   // low-latency, low-cost
const GROQ_HEAVY_MODEL = "llama-3.3-70b-versatile"; // high-quality fallback

// ─── Groq (Fast Inference) ────────────────────────────────────────────────────
async function callGroq(
  messages: AIRouterRequest["messages"],
  maxTokens = 1024,
  temperature = 0.7,
  model = GROQ_FAST_MODEL
): Promise<AIRouterResponse> {
  const start = Date.now();
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not configured");

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    }
  );

  return {
    content: response.data.choices[0].message.content,
    model: response.data.model,
    provider: "groq",
    latencyMs: Date.now() - start,
  };
}

// ─── NVIDIA NIM (Deep Analysis) ───────────────────────────────────────────────
async function callNvidiaNIM(
  messages: AIRouterRequest["messages"],
  maxTokens = 2048,
  temperature = 0.6
): Promise<AIRouterResponse> {
  const start = Date.now();
  const apiKey = process.env.NVIDIA_NIM_API_KEY;
  if (!apiKey) throw new Error("NVIDIA_NIM_API_KEY not configured");

  const response = await axios.post(
    "https://integrate.api.nvidia.com/v1/chat/completions",
    {
      model: "meta/llama-3.3-70b-instruct",
      messages,
      max_tokens: maxTokens,
      temperature,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    }
  );

  return {
    content: response.data.choices[0].message.content,
    model: response.data.model,
    provider: "nvidia_nim",
    latencyMs: Date.now() - start,
  };
}

// ─── Sarvam AI (Multilingual) ─────────────────────────────────────────────────
async function callSarvam(
  messages: AIRouterRequest["messages"],
  language = "en-IN",
  maxTokens = 1024
): Promise<AIRouterResponse> {
  const start = Date.now();
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) throw new Error("SARVAM_API_KEY not configured");

  const response = await axios.post(
    "https://api.sarvam.ai/v1/chat/completions",
    {
      model: "sarvam-m",
      messages,
      max_tokens: maxTokens,
    },
    {
      headers: {
        "api-subscription-key": apiKey,
        "Content-Type": "application/json",
      },
      timeout: 20000,
    }
  );

  return {
    content: response.data.choices[0].message.content,
    model: "sarvam-m",
    provider: "sarvam",
    latencyMs: Date.now() - start,
  };
}

// ─── Main Router ──────────────────────────────────────────────────────────────
export async function routeAI(req: AIRouterRequest): Promise<AIRouterResponse> {
  const { task, messages, language, maxTokens, temperature } = req;

  // Detect non-English languages → route to Sarvam AI
  const nonEnglishLanguages = ["hi", "ta", "te", "kn", "ml", "bn", "mr", "gu", "pa", "ur"];
  if (language && nonEnglishLanguages.includes(language)) {
    try {
      return await callSarvam(messages, language, maxTokens);
    } catch (err) {
      console.warn("[AIRouter] Sarvam AI failed, falling back to Groq:", err);
      return await callGroq(messages, maxTokens, temperature, GROQ_FAST_MODEL);
    }
  }

  switch (task) {
    case "deep_analysis":
    case "story_generate": {
      // High-value tasks → NVIDIA NIM (70B depth), fallback to Groq 70B
      try {
        return await callNvidiaNIM(messages, maxTokens, temperature);
      } catch (err) {
        console.warn("[AIRouter] NVIDIA NIM failed, falling back to Groq 70B:", err);
        return await callGroq(messages, maxTokens, temperature, GROQ_HEAVY_MODEL);
      }
    }

    case "multilingual": {
      try {
        return await callSarvam(messages, language ?? "en-IN", maxTokens);
      } catch (err) {
        console.warn("[AIRouter] Sarvam AI failed, falling back to Groq:", err);
        return await callGroq(messages, maxTokens, temperature, GROQ_FAST_MODEL);
      }
    }

    // Fast/cheap tasks → Groq 8B instant; fallback to NVIDIA NIM only on hard failure
    case "fast_inference":
    case "challenge_generate":
    case "coach_response":
    default: {
      try {
        return await callGroq(messages, maxTokens, temperature, GROQ_FAST_MODEL);
      } catch (err) {
        console.warn("[AIRouter] Groq 8B failed, falling back to NVIDIA NIM:", err);
        return await callNvidiaNIM(messages, maxTokens, temperature);
      }
    }
  }
}

// ─── Deepgram Voice Transcription ─────────────────────────────────────────────
export async function transcribeWithDeepgram(audioBuffer: Buffer, mimeType = "audio/webm"): Promise<string> {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) throw new Error("DEEPGRAM_API_KEY not configured");

  const response = await axios.post(
    "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&language=en",
    audioBuffer,
    {
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": mimeType,
      },
      timeout: 30000,
    }
  );

  const transcript = response.data?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";
  return transcript;
}
