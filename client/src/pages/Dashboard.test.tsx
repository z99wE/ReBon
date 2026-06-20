/**
 * @fileoverview Unit tests for client/src/pages/Dashboard.tsx
 *
 * Tests cover: loading state, error state, empty data, and populated data.
 * All tRPC hooks, auth, router, and component deps are mocked.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import Dashboard from "./Dashboard";

expect.extend(toHaveNoViolations);

// ─── Shared mock state ────────────────────────────────────────────────────────

let mockUser = { name: "Alice Carbon", id: 1 };

let profileData: Record<string, unknown> | undefined = {
  eloScore: 1250,
  influenceScore: 42,
  archetype: null,
};
let profileLoading = false;
let profileError: { message: string } | null = null;

let activitiesData: Array<Record<string, unknown>> = [];
let activitiesLoading = false;

let challengesData: Array<Record<string, unknown>> = [];
let challengesLoading = false;

// ─── Auth mock ────────────────────────────────────────────────────────────────

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ user: mockUser, isAuthenticated: true }),
}));

// ─── tRPC mock ────────────────────────────────────────────────────────────────

vi.mock("@/lib/trpc", () => ({
  trpc: {
    user: {
      profile: {
        useQuery: () => ({
          data: profileData,
          isLoading: profileLoading,
          error: profileError,
        }),
      },
    },
    activities: {
      list: {
        useQuery: () => ({
          data: activitiesData,
          isLoading: activitiesLoading,
        }),
      },
    },
    challenges: {
      list: {
        useQuery: () => ({
          data: challengesData,
          isLoading: challengesLoading,
        }),
      },
    },
  },
}));

// ─── wouter mock ──────────────────────────────────────────────────────────────

vi.mock("wouter", () => ({
  Link: ({ children, href, className, "aria-label": ariaLabel }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    "aria-label"?: string;
  }) => (
    <a href={href} className={className} aria-label={ariaLabel}>
      {children}
    </a>
  ),
}));

// ─── SocialShare mock ─────────────────────────────────────────────────────────

vi.mock("@/components/SocialShare", () => ({
  SocialShare: ({ text }: { text: string }) => (
    <div data-testid="social-share">{text}</div>
  ),
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Dashboard", () => {
  beforeEach(() => {
    mockUser = { name: "Alice Carbon", id: 1 };
    profileData = { eloScore: 1250, influenceScore: 42, archetype: null };
    profileLoading = false;
    profileError = null;
    activitiesData = [];
    activitiesLoading = false;
    challengesData = [];
    challengesLoading = false;
  });

  // ─── Loading state ───────────────────────────────────────────────────────

  describe("loading state", () => {
    it("renders loading skeleton when profile is loading", () => {
      profileLoading = true;
      render(<Dashboard />);
      // Loading skeleton uses aria-hidden divs — page should not show main content
      expect(screen.queryByRole("heading", { name: /welcome back/i })).not.toBeInTheDocument();
    });
  });

  // ─── Error state ─────────────────────────────────────────────────────────

  describe("error state", () => {
    beforeEach(() => {
      profileError = { message: "Network error" };
    });

    it("shows an error message when profile fails to load", () => {
      render(<Dashboard />);
      expect(screen.getByText(/unable to load dashboard/i)).toBeInTheDocument();
    });

    it("shows the specific error message", () => {
      render(<Dashboard />);
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    it("shows a Retry button", () => {
      render(<Dashboard />);
      expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    });

    it("calls window.location.reload when Retry is clicked", () => {
      const reloadSpy = vi.fn();
      Object.defineProperty(window, "location", {
        value: { reload: reloadSpy },
        writable: true,
      });
      render(<Dashboard />);
      fireEvent.click(screen.getByRole("button", { name: /retry/i }));
      expect(reloadSpy).toHaveBeenCalledOnce();
    });
  });

  // ─── Populated state ─────────────────────────────────────────────────────

  describe("populated state — empty activities and challenges", () => {
    it("renders the welcome heading with the user's first name", () => {
      render(<Dashboard />);
      expect(screen.getByRole("heading", { name: /welcome back, alice/i })).toBeInTheDocument();
    });

    it("renders Elo Score stat card", () => {
      render(<Dashboard />);
      expect(screen.getByText("Elo Score")).toBeInTheDocument();
      expect(screen.getByText("1250")).toBeInTheDocument();
    });

    it("renders Weekly CO₂ stat card", () => {
      render(<Dashboard />);
      expect(screen.getByText("Weekly CO₂")).toBeInTheDocument();
    });

    it("renders Active Challenges stat card", () => {
      render(<Dashboard />);
      expect(screen.getByText("Active Challenges")).toBeInTheDocument();
    });

    it("renders Influence Score stat card", () => {
      render(<Dashboard />);
      expect(screen.getByText("Influence Score")).toBeInTheDocument();
    });

    it("renders the Weekly Carbon Budget section", () => {
      render(<Dashboard />);
      expect(screen.getByText("Weekly Carbon Budget")).toBeInTheDocument();
    });

    it("renders the progress bar with correct ARIA attributes", () => {
      render(<Dashboard />);
      const bar = screen.getByRole("progressbar", { name: /weekly carbon budget used/i });
      expect(bar).toBeInTheDocument();
      expect(bar).toHaveAttribute("aria-valuemin", "0");
      expect(bar).toHaveAttribute("aria-valuemax", "100");
    });

    it("renders the Quick Actions section", () => {
      render(<Dashboard />);
      expect(screen.getByRole("navigation", { name: /quick action links/i })).toBeInTheDocument();
    });

    it("renders all 4 quick action links", () => {
      render(<Dashboard />);
      expect(screen.getByRole("link", { name: /log activity/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /ask rebon ai/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /leaderboard/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /agent arena/i })).toBeInTheDocument();
    });

    it("shows empty state message in Recent Activity when no activities", () => {
      render(<Dashboard />);
      expect(screen.getByText(/no activities logged yet/i)).toBeInTheDocument();
    });

    it("shows 'Log your first activity' CTA when no activities", () => {
      render(<Dashboard />);
      expect(screen.getByRole("link", { name: /log your first activity/i })).toBeInTheDocument();
    });

    it("does NOT show challenge list items when challenges array is empty", () => {
      render(<Dashboard />);
      // The challenges detail section renders challenge titles — none should appear
      expect(screen.queryByText(/go car-free for a week/i)).not.toBeInTheDocument();
      // Stat card showing count "0" should be present
      expect(screen.getByText("Active Challenges")).toBeInTheDocument();
    });

    it("renders SocialShare component", () => {
      render(<Dashboard />);
      expect(screen.getByTestId("social-share")).toBeInTheDocument();
    });

    it("has no accessibility violations in default state", async () => {
      const { container } = render(<Dashboard />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  // ─── With activities ──────────────────────────────────────────────────────

  describe("populated state — with activities", () => {
    beforeEach(() => {
      activitiesData = [
        { id: 1, label: "Morning drive", subcategory: "car", category: "transport", carbonKg: "2.5", loggedAt: new Date().toISOString() },
        { id: 2, label: "Beef burger", subcategory: "beef", category: "food", carbonKg: "6.8", loggedAt: new Date().toISOString() },
      ];
    });

    it("renders activity labels", () => {
      render(<Dashboard />);
      expect(screen.getByText("Morning drive")).toBeInTheDocument();
      expect(screen.getByText("Beef burger")).toBeInTheDocument();
    });

    it("renders activity carbon values", () => {
      render(<Dashboard />);
      expect(screen.getByText("2.5 kg")).toBeInTheDocument();
      expect(screen.getByText("6.8 kg")).toBeInTheDocument();
    });

    it("shows total weekly CO2 in the budget section", () => {
      render(<Dashboard />);
      // Total = 2.5 + 6.8 = 9.3 — shown in budget as "9.3 / 70 kg CO₂"
      expect(screen.getByText(/9\.3 \/ 70 kg CO₂/)).toBeInTheDocument();
    });
  });

  // ─── With active challenges ───────────────────────────────────────────────

  describe("populated state — with active challenges", () => {
    beforeEach(() => {
      challengesData = [
        {
          id: 1,
          title: "Go car-free for a week",
          description: "Use public transport or cycling for all trips",
          category: "transport",
          difficulty: "hard",
          carbonSavingKg: 12,
          completedAt: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          title: "Plant-based week",
          description: "Eat plant-based for 7 days",
          category: "food",
          difficulty: "medium",
          carbonSavingKg: 8,
          completedAt: null,
          createdAt: new Date().toISOString(),
        },
      ];
    });

    it("renders the Active Challenges list alongside the stat card", () => {
      render(<Dashboard />);
      // Both stat card h2 and section p use "Active Challenges" text
      const allMatches = screen.getAllByText("Active Challenges");
      expect(allMatches.length).toBeGreaterThanOrEqual(2);
    });

    it("renders challenge titles", () => {
      render(<Dashboard />);
      expect(screen.getByText("Go car-free for a week")).toBeInTheDocument();
      expect(screen.getByText("Plant-based week")).toBeInTheDocument();
    });

    it("renders challenge difficulties", () => {
      render(<Dashboard />);
      expect(screen.getByText("hard")).toBeInTheDocument();
      expect(screen.getByText("medium")).toBeInTheDocument();
    });

    it("shows active challenge count in stats", () => {
      render(<Dashboard />);
      // 2 active challenges (neither completedAt)
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("shows high-emissions warning when budget is >80%", () => {
      // 9.3 kg / 70 kg default budget = 13.3% — not over 80%
      // Set high activity data to push over budget
      activitiesData = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        label: `Activity ${i + 1}`,
        subcategory: "car",
        category: "transport",
        carbonKg: "15",
        loggedAt: new Date().toISOString(),
      }));
      render(<Dashboard />);
      // 75 kg / 70 default = 107% → clamped to 100% → >80 → show warning
      expect(screen.getByText(/high emissions week/i)).toBeInTheDocument();
    });
  });

  // ─── Archetype display ────────────────────────────────────────────────────

  describe("archetype display", () => {
    it("shows archetype label and description when archetype is set", () => {
      profileData = {
        eloScore: 1000,
        influenceScore: 10,
        archetype: "urban_commuter",
      };
      render(<Dashboard />);
      // ARCHETYPES["urban_commuter"] should have a label
      expect(screen.getByText(/archetype:/i)).toBeInTheDocument();
    });

    it("does not show archetype line when archetype is null", () => {
      profileData = { eloScore: 1000, influenceScore: 10, archetype: null };
      render(<Dashboard />);
      expect(screen.queryByText(/archetype:/i)).not.toBeInTheDocument();
    });
  });

  // ─── Fallback user name ───────────────────────────────────────────────────

  describe("fallback user name", () => {
    it("shows 'Warrior' when user has no name (null user)", () => {
      // @ts-expect-error testing null user
      mockUser = { name: null, id: 1 };
      render(<Dashboard />);
      // name?.split(" ")[0] is undefined when name is null → ?? "Warrior" triggers
      expect(screen.getByText(/welcome back, warrior\./i)).toBeInTheDocument();
    });
  });
});
