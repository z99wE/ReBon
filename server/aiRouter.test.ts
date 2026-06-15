import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import { routeAI, transcribeWithDeepgram } from "./services/aiRouter";

vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
  },
}));

const postMock = vi.mocked(axios.post);

beforeEach(() => {
  vi.resetAllMocks();
  process.env.GROQ_API_KEY = "groq-test-key";
  process.env.NVIDIA_NIM_API_KEY = "nvidia-test-key";
  process.env.SARVAM_API_KEY = "sarvam-test-key";
  process.env.DEEPGRAM_API_KEY = "deepgram-test-key";
});

describe("aiRouter", () => {
  it("routes deep analysis requests to NVIDIA NIM", async () => {
    postMock.mockResolvedValueOnce({
      data: {
        choices: [{ message: { content: "deep answer" } }],
        model: "meta/llama-3.3-70b-instruct",
      },
    });

    const result = await routeAI({
      task: "deep_analysis",
      messages: [{ role: "user", content: "Analyze" }],
      maxTokens: 256,
    });

    expect(result.provider).toBe("nvidia_nim");
    expect(result.content).toBe("deep answer");
    expect(postMock).toHaveBeenCalledWith(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      expect.objectContaining({
        model: "meta/llama-3.3-70b-instruct",
        max_tokens: 256,
      }),
      expect.objectContaining({
        timeout: 30000,
      })
    );
  });

  it("routes fast inference requests to Groq", async () => {
    postMock.mockResolvedValueOnce({
      data: {
        choices: [{ message: { content: "fast answer" } }],
        model: "llama-3.1-8b-instant",
      },
    });

    const result = await routeAI({
      task: "fast_inference",
      messages: [{ role: "user", content: "Quick summary" }],
      maxTokens: 128,
      temperature: 0.2,
    });

    expect(result.provider).toBe("groq");
    expect(result.content).toBe("fast answer");
    expect(postMock).toHaveBeenCalledWith(
      "https://api.groq.com/openai/v1/chat/completions",
      expect.objectContaining({
        model: "llama-3.1-8b-instant",
        max_tokens: 128,
        temperature: 0.2,
      }),
      expect.objectContaining({
        timeout: 15000,
      })
    );
  });

  it("routes multilingual requests to Sarvam", async () => {
    postMock.mockResolvedValueOnce({
      data: {
        choices: [{ message: { content: "sarvam answer" } }],
      },
    });

    const result = await routeAI({
      task: "coach_response",
      language: "hi",
      messages: [{ role: "user", content: "हैलो" }],
    });

    expect(result.provider).toBe("sarvam");
    expect(result.content).toBe("sarvam answer");
    expect(postMock).toHaveBeenCalledWith(
      "https://api.sarvam.ai/v1/chat/completions",
      expect.objectContaining({
        model: "sarvam-m",
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          "api-subscription-key": "sarvam-test-key",
        }),
        timeout: 20000,
      })
    );
  });

  it("falls back to Groq when Sarvam fails", async () => {
    postMock
      .mockRejectedValueOnce(new Error("Sarvam down"))
      .mockResolvedValueOnce({
        data: {
          choices: [{ message: { content: "fallback answer" } }],
          model: "llama-3.1-8b-instant",
        },
      });

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const result = await routeAI({
      task: "coach_response",
      language: "hi",
      messages: [{ role: "user", content: "help" }],
    });

    expect(result.provider).toBe("groq");
    expect(result.content).toBe("fallback answer");
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("transcribes audio with Deepgram", async () => {
    postMock.mockResolvedValueOnce({
      data: {
        results: {
          channels: [
            {
              alternatives: [
                {
                  transcript: "hello world",
                },
              ],
            },
          ],
        },
      },
    });

    const transcript = await transcribeWithDeepgram(Buffer.from("audio"), "audio/webm");

    expect(transcript).toBe("hello world");
    expect(postMock).toHaveBeenCalledWith(
      expect.stringContaining("api.deepgram.com"),
      expect.any(Buffer),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Token deepgram-test-key",
          "Content-Type": "audio/webm",
        }),
        timeout: 30000,
      })
    );
  });
});
