/**
 * @fileoverview Unit tests for client/src/pages/Mirror.tsx
 *
 * Tests cover: unauthenticated state, authenticated (no data), and
 * authenticated (with comparison data) states.
 * All tRPC hooks and external dependencies are mocked.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import Mirror from "./Mirror";

expect.extend(toHaveNoViolations);

// ─── Auth mock ────────────────────────────────────────────────────────────────

let authState = { isAuthenticated: false };

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => authState,
}));

// ─── tRPC mock ────────────────────────────────────────────────────────────────

const mockRefetch = vi.fn();
const mockMutate = vi.fn();

let latestData: Record<string, unknown> | undefined = undefined;
let isMutationPending = false;

vi.mock("@/lib/trpc", () => ({
  trpc: {
    mirror: {
      latest: {
        useQuery: () => ({
          data: latestData,
          isLoading: false,
          refetch: mockRefetch,
        }),
      },
      compare: {
        useMutation: ({ onSuccess }: { onSuccess: () => void }) => ({
          mutate: () => {
            mockMutate();
            onSuccess();
          },
          isPending: isMutationPending,
        }),
      },
    },
  },
}));

// ─── sonner mock ──────────────────────────────────────────────────────────────

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

// ─── SocialShare mock ─────────────────────────────────────────────────────────

vi.mock("@/components/SocialShare", () => ({
  SocialShare: ({ text }: { text: string }) => (
    <div data-testid="social-share">{text}</div>
  ),
}));

// ─── Icons mock ───────────────────────────────────────────────────────────────

vi.mock("@/components/Icons", () => ({
  IconGitCompare: ({ className }: { className?: string }) => (
    <svg data-testid="icon-git-compare" className={className} />
  ),
  IconPeople: ({ className }: { className?: string }) => (
    <svg data-testid="icon-people" className={className} />
  ),
  IconPulse: ({ className }: { className?: string }) => (
    <svg data-testid="icon-pulse" className={className} />
  ),
  IconTrendingDown: ({ className }: { className?: string }) => (
    <svg data-testid="icon-trending-down" className={className} />
  ),
  IconTrendingUp: ({ className }: { className?: string }) => (
    <svg data-testid="icon-trending-up" className={className} />
  ),
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Mirror", () => {
  beforeEach(() => {
    authState = { isAuthenticated: false };
    latestData = undefined;
    isMutationPending = false;
    mockRefetch.mockClear();
    mockMutate.mockClear();
  });

  describe("unauthenticated state", () => {
    it("renders the CarbonMirror heading", () => {
      render(<Mirror />);
      expect(screen.getByRole("heading", { name: /carbonmirror/i })).toBeInTheDocument();
    });

    it("shows a sign-in prompt when not authenticated", () => {
      render(<Mirror />);
      expect(screen.getByText(/sign in to compare with peers/i)).toBeInTheDocument();
    });

    it("does NOT render the run comparison button when signed out", () => {
      render(<Mirror />);
      expect(screen.queryByRole("button", { name: /run peer comparison/i })).not.toBeInTheDocument();
    });

    it("has no accessibility violations when unauthenticated", async () => {
      const { container } = render(<Mirror />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("authenticated — no comparison data yet", () => {
    beforeEach(() => {
      authState = { isAuthenticated: true };
      latestData = undefined;
    });

    it("shows the Run Peer Comparison button", () => {
      render(<Mirror />);
      expect(screen.getByRole("button", { name: /run peer comparison/i })).toBeInTheDocument();
    });

    it("does NOT show peer comparison cards when data is empty", () => {
      render(<Mirror />);
      expect(screen.queryByText(/your weekly carbon/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/peer average/i)).not.toBeInTheDocument();
    });

    it("calls mutate when the button is clicked", () => {
      render(<Mirror />);
      fireEvent.click(screen.getByRole("button", { name: /run peer comparison/i }));
      expect(mockMutate).toHaveBeenCalledOnce();
    });

    it("calls refetch after a successful mutation", () => {
      render(<Mirror />);
      fireEvent.click(screen.getByRole("button", { name: /run peer comparison/i }));
      expect(mockRefetch).toHaveBeenCalledOnce();
    });

    it("shows 'Analyzing peers...' while mutation is pending", () => {
      isMutationPending = true;
      render(<Mirror />);
      expect(screen.getByText(/analyzing peers/i)).toBeInTheDocument();
    });

    it("disables the button while mutation is pending", () => {
      isMutationPending = true;
      render(<Mirror />);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("has no accessibility violations when authenticated with no data", async () => {
      const { container } = render(<Mirror />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("authenticated — with comparison data (below average)", () => {
    beforeEach(() => {
      authState = { isAuthenticated: true };
      latestData = {
        userCarbonKg: 40.0,
        peerAvgKg: 55.0,
        percentileRank: 28,
        archetype: null,
        peerCount: 142,
        insights: ["Try switching to plant-based meals 3x/week.", "Use public transit when possible."],
      };
    });

    it("shows the user's weekly carbon value", () => {
      render(<Mirror />);
      expect(screen.getByText("40.0")).toBeInTheDocument();
    });

    it("shows the peer average value", () => {
      render(<Mirror />);
      expect(screen.getByText("55.0")).toBeInTheDocument();
    });

    it("shows the peer count", () => {
      render(<Mirror />);
      expect(screen.getByText(/142 peers/i)).toBeInTheDocument();
    });

    it("shows the percentile rank", () => {
      render(<Mirror />);
      expect(screen.getByText("28th")).toBeInTheDocument();
    });

    it("shows the trending-down icon when below peer average", () => {
      render(<Mirror />);
      expect(screen.getByTestId("icon-trending-down")).toBeInTheDocument();
    });

    it("shows 'kg below peer average' when user is better than average", () => {
      render(<Mirror />);
      expect(screen.getByText(/below peer average/i)).toBeInTheDocument();
    });

    it("renders AI insights", () => {
      render(<Mirror />);
      expect(screen.getByText("ReBon Insights")).toBeInTheDocument();
      expect(screen.getByText(/plant-based meals/i)).toBeInTheDocument();
    });

    it("renders the SocialShare component with share text", () => {
      render(<Mirror />);
      expect(screen.getByTestId("social-share")).toBeInTheDocument();
    });

    it("share text mentions being in a good percentile", () => {
      render(<Mirror />);
      expect(screen.getByTestId("social-share").textContent).toContain("28th percentile");
    });

    it("has no accessibility violations with full comparison data", async () => {
      const { container } = render(<Mirror />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("authenticated — with comparison data (above average)", () => {
    beforeEach(() => {
      authState = { isAuthenticated: true };
      latestData = {
        userCarbonKg: 80.0,
        peerAvgKg: 55.0,
        percentileRank: 72,
        archetype: null,
        peerCount: 88,
        insights: [],
      };
    });

    it("shows 'kg above peer average' when user emits more than average", () => {
      render(<Mirror />);
      expect(screen.getByText(/above peer average/i)).toBeInTheDocument();
    });

    it("shows the trending-up icon when above peer average", () => {
      render(<Mirror />);
      expect(screen.getByTestId("icon-trending-up")).toBeInTheDocument();
    });

    it("does not render insights section when insights array is empty", () => {
      render(<Mirror />);
      expect(screen.queryByText("ReBon Insights")).not.toBeInTheDocument();
    });
  });
});
