import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import Leaderboard from "./Leaderboard";

let leaderboardData: any = {
  season: { name: "Spring Season", endDate: "2026-06-30" },
  entries: [],
};

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: 1 } }),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    leaderboard: {
      current: {
        useQuery: () => ({ data: leaderboardData, isLoading: false }),
      },
    },
  },
}));

describe("Leaderboard", () => {
  beforeEach(() => {
    leaderboardData = { season: { name: "Spring Season", endDate: "2026-06-30" }, entries: [] };
  });

  it("renders the empty rankings state", () => {
    render(<Leaderboard />);

    expect(screen.getByRole("heading", { name: /leaderboard/i })).toBeInTheDocument();
    expect(screen.getByText(/no rankings yet/i)).toBeInTheDocument();
  });

  it("renders a populated leaderboard", () => {
    leaderboardData = {
      season: { name: "Spring Season", endDate: "2026-06-30" },
      entries: [
        { userId: 1, eloScore: 1200, activitiesLogged: 14, streakDays: 3, user: { name: "Alex", archetypeLabel: "Urban Commuter" } },
        { userId: 2, eloScore: 1100, activitiesLogged: 11, streakDays: 2, user: { name: "Maya", archetypeLabel: "Eco Pioneer" } },
        { userId: 3, eloScore: 1000, activitiesLogged: 9, streakDays: 1, user: { name: "Jo", archetypeLabel: "Digital Nomad" } },
      ],
    };

    render(<Leaderboard />);

    expect(screen.getByText(/spring season/i)).toBeInTheDocument();
    expect(screen.getByText("Alex")).toBeInTheDocument();
    expect(screen.getByText(/1100 pts/i)).toBeInTheDocument();
    expect(screen.getAllByText("Jo")).toHaveLength(2);
  });
});
