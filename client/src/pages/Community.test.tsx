import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import Community from "./Community";

let authState = { isAuthenticated: true };
let feedData: any[] = [];
let influencersData: any[] = [];
const likeMutate = vi.fn();

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => authState,
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    influencer: {
      feed: {
        useQuery: () => ({ data: feedData, isLoading: false, refetch: vi.fn() }),
      },
      topInfluencers: {
        useQuery: () => ({ data: influencersData }),
      },
      like: {
        useMutation: () => ({ mutate: likeMutate }),
      },
    },
  },
}));

describe("Community", () => {
  beforeEach(() => {
    authState = { isAuthenticated: true };
    feedData = [];
    influencersData = [];
    likeMutate.mockReset();
  });

  it("renders the empty feed state", () => {
    render(<Community />);

    expect(screen.getByText(/live community feed/i)).toBeInTheDocument();
    expect(screen.getByText(/no activity yet/i)).toBeInTheDocument();
  });

  it("renders influencers and feed items", () => {
    influencersData = [{ id: 1, name: "Ava", influenceScore: 120 }];
    feedData = [
      {
        id: 10,
        type: "story",
        title: "Shared a story",
        body: "Great month",
        createdAt: "2026-06-10T00:00:00.000Z",
        likeCount: 2,
        user: { name: "Ava" },
      },
    ];

    render(<Community />);

    expect(screen.getByText(/top influencers/i)).toBeInTheDocument();
    expect(screen.getByText(/120 pts/i)).toBeInTheDocument();
    expect(screen.getByText(/shared a story/i)).toBeInTheDocument();
  });
});
