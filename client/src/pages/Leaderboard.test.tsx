import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import Leaderboard from "./Leaderboard";

let leaderboardData: any = {
  season: { name: "Spring Season", endDate: "2026-06-30" },
  entries: [],
};
let isLoading = false;

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: 1 } }),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    leaderboard: {
      current: {
        useQuery: () => ({ data: leaderboardData, isLoading }),
      },
    },
  },
}));

const FULL_ENTRIES = [
  { userId: 1, eloScore: 1200, activitiesLogged: 14, streakDays: 3, user: { name: "Alex", archetypeLabel: "Urban Commuter" } },
  { userId: 2, eloScore: 1100, activitiesLogged: 11, streakDays: 2, user: { name: "Maya", archetypeLabel: "Eco Pioneer" } },
  { userId: 3, eloScore: 1000, activitiesLogged: 9,  streakDays: 1, user: { name: "Jo",   archetypeLabel: "Digital Nomad" } },
];

describe("Leaderboard", () => {
  beforeEach(() => {
    isLoading = false;
    leaderboardData = { season: { name: "Spring Season", endDate: "2026-06-30" }, entries: [] };
  });

  it("renders the leaderboard heading", () => {
    render(<Leaderboard />);
    expect(screen.getByRole("heading", { name: /leaderboard/i })).toBeInTheDocument();
  });

  it("renders the empty rankings state", () => {
    render(<Leaderboard />);
    expect(screen.getByText(/no rankings yet/i)).toBeInTheDocument();
  });

  it("renders a populated leaderboard with all player names", () => {
    leaderboardData = { season: { name: "Spring Season", endDate: "2026-06-30" }, entries: FULL_ENTRIES };

    render(<Leaderboard />);

    // Names may appear multiple times (e.g. in podium + list), so use getAllByText
    expect(screen.getAllByText("Alex").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Maya").length).toBeGreaterThanOrEqual(1);
  });

  it("displays the season name from API data", () => {
    leaderboardData = { season: { name: "Spring Season", endDate: "2026-06-30" }, entries: FULL_ENTRIES };
    render(<Leaderboard />);
    expect(screen.getByText(/spring season/i)).toBeInTheDocument();
  });

  it("displays Elo scores for ranked users", () => {
    leaderboardData = { season: { name: "Spring Season", endDate: "2026-06-30" }, entries: FULL_ENTRIES };
    render(<Leaderboard />);
    // At least one element showing the score value should appear on screen
    expect(screen.getAllByText(/1200/).length).toBeGreaterThanOrEqual(1);
  });

  it("renders without crashing when data is undefined", () => {
    leaderboardData = undefined;
    expect(() => render(<Leaderboard />)).not.toThrow();
  });
});
