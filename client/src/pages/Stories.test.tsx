import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import Stories from "./Stories";

let authState = { isAuthenticated: true };
let storiesData: any[] = [];
const generateMutate = vi.fn();
const shareMutate = vi.fn();

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => authState,
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    stories: {
      list: {
        useQuery: () => ({ data: storiesData, refetch: vi.fn() }),
      },
      generate: {
        useMutation: () => ({
          mutate: generateMutate,
          isPending: false,
          data: {
            headline: "You made progress",
            narrative: "Your actions mattered.",
            carbonSavedKg: 42,
            equivalents: { trees: 2, km_not_driven: 50 },
          },
        }),
      },
      share: {
        useMutation: () => ({
          mutate: shareMutate,
        }),
      },
    },
  },
}));

describe("Stories", () => {
  beforeEach(() => {
    authState = { isAuthenticated: true };
    storiesData = [];
    generateMutate.mockReset();
    shareMutate.mockReset();
  });

  it("shows the sign in gate when signed out", () => {
    authState = { isAuthenticated: false };

    render(<Stories />);

    expect(screen.getByText(/sign in to generate your impact story/i)).toBeInTheDocument();
  });

  it("renders the story generator and archive", () => {
    storiesData = [
      {
        id: 1,
        period: "week",
        generatedAt: "2026-06-01T00:00:00.000Z",
        headline: "Great week",
        narrative: "You saved a lot.",
        carbonSavedKg: 12,
        shareCount: 3,
        aiProvider: "groq",
      },
    ];

    render(<Stories />);

    expect(screen.getByRole("button", { name: /generate story/i })).toBeInTheDocument();
    expect(screen.getByText(/story archive/i)).toBeInTheDocument();
    expect(screen.getByText(/great week/i)).toBeInTheDocument();
  });

  it("calls the generate mutation when requested", async () => {
    const user = userEvent.setup();

    render(<Stories />);

    await user.click(screen.getByRole("button", { name: /generate story/i }));
    expect(generateMutate).toHaveBeenCalledWith({ period: "week" });
  });
});
