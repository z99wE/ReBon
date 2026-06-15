import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import Mirror from "./Mirror";

let authState = { isAuthenticated: true };
let latestData: any = null;
const compareMutate = vi.fn();

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => authState,
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    mirror: {
      latest: {
        useQuery: () => ({ data: latestData, refetch: vi.fn() }),
      },
      compare: {
        useMutation: () => ({
          mutate: compareMutate,
          isPending: false,
        }),
      },
    },
  },
}));

describe("Mirror", () => {
  beforeEach(() => {
    authState = { isAuthenticated: true };
    latestData = null;
    compareMutate.mockReset();
  });

  it("shows the sign-in prompt when signed out", () => {
    authState = { isAuthenticated: false };

    render(<Mirror />);

    expect(screen.getByText(/sign in to compare with peers/i)).toBeInTheDocument();
  });

  it("renders a populated peer comparison", () => {
    latestData = {
      archetype: "eco_pioneer",
      userCarbonKg: 40,
      peerAvgKg: 55,
      percentileRank: 18,
      peerCount: 12,
      insights: ["You are below peer average", "Your transport mix is improving"],
    };

    render(<Mirror />);

    expect(screen.getByRole("button", { name: /run peer comparison/i })).toBeInTheDocument();
    expect(screen.getByText(/your weekly carbon/i)).toBeInTheDocument();
    expect(screen.getByText(/kg co₂ \(12 peers\)/i)).toBeInTheDocument();
    expect(screen.getByText(/rebon insights/i)).toBeInTheDocument();
  });

  it("triggers the compare action", async () => {
    const user = userEvent.setup();

    render(<Mirror />);

    await user.click(screen.getByRole("button", { name: /run peer comparison/i }));
    expect(compareMutate).toHaveBeenCalled();
  });
});
