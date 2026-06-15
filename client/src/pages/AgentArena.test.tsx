import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import AgentArena from "./AgentArena";

let authState = { isAuthenticated: true };
let peersData: any[] = [];
const initiateMutate = vi.fn();

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => authState,
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    agents: {
      list: {
        useQuery: () => ({ data: [], refetch: vi.fn() }),
      },
      getPeers: {
        useQuery: () => ({ data: peersData, isLoading: false }),
      },
      initiate: {
        useMutation: () => ({ mutate: initiateMutate, isPending: false }),
      },
    },
  },
}));

vi.mock("@/const", () => ({
  getLoginUrl: () => "/login",
}));

describe("AgentArena", () => {
  beforeEach(() => {
    authState = { isAuthenticated: true };
    peersData = [{ id: 2, name: "Peer One", archetype: "eco_pioneer", eloScore: 1100 }];
    initiateMutate.mockReset();
  });

  it("shows the sign in gate when signed out", () => {
    authState = { isAuthenticated: false };

    render(<AgentArena />);

    expect(screen.getByText(/sign in to access agent arena/i)).toBeInTheDocument();
  });

  it("renders the arena and starts a negotiation", async () => {
    const user = userEvent.setup();
    render(<AgentArena />);

    await user.click(screen.getByRole("button", { name: /select peer one as negotiation peer/i }));
    await user.click(screen.getByRole("button", { name: /start agent-to-agent negotiation/i }));

    expect(screen.getByText(/agent arena/i)).toBeInTheDocument();
    expect(initiateMutate).toHaveBeenCalledWith({ targetUserId: 2, category: "transport", proposedKg: 5 });
  });
});
