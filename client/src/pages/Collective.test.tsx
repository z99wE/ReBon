import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import Collective from "./Collective";

let authState = { isAuthenticated: true };
let myCollectives: any[] = [];
let publicCollectives: any[] = [];
const createMutate = vi.fn();
const joinMutate = vi.fn();
const whatIfMutate = vi.fn();

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => authState,
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    collective: {
      myCollectives: {
        useQuery: () => ({ data: myCollectives, refetch: vi.fn() }),
      },
      publicList: {
        useQuery: () => ({ data: publicCollectives }),
      },
      create: {
        useMutation: () => ({ mutate: createMutate, isPending: false }),
      },
      join: {
        useMutation: () => ({ mutate: joinMutate, isPending: false }),
      },
      whatIf: {
        useMutation: () => ({ mutate: whatIfMutate, isPending: false, data: null }),
      },
    },
  },
}));

describe("Collective", () => {
  beforeEach(() => {
    authState = { isAuthenticated: true };
    myCollectives = [];
    publicCollectives = [];
    createMutate.mockReset();
    joinMutate.mockReset();
    whatIfMutate.mockReset();
  });

  it("renders the empty state for public collectives", () => {
    render(<Collective />);

    expect(screen.getByText(/carboncollective/i)).toBeInTheDocument();
    expect(screen.getByText(/no collectives yet/i)).toBeInTheDocument();
  });

  it("opens the create and join forms", async () => {
    const user = userEvent.setup();
    render(<Collective />);

    await user.click(screen.getByRole("button", { name: /create/i }));
    await user.click(screen.getByRole("button", { name: /^join$/i }));

    expect(screen.getByText(/create a collective/i)).toBeInTheDocument();
    expect(screen.getByText(/join with invite code/i)).toBeInTheDocument();
  });
});
