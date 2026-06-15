import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LogActivity from "./LogActivity";

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    activities: {
      log: {
        useMutation: () => ({
          mutate: vi.fn(),
          isPending: false,
        }),
      },
      logVoice: {
        useMutation: () => ({
          mutate: vi.fn(),
          isPending: false,
        }),
      },
    },
    challenges: {
      list: {
        useQuery: () => ({ data: [] }),
      },
      complete: {
        useMutation: () => ({
          mutate: vi.fn(),
          isPending: false,
        }),
      },
    },
  },
}));

describe("LogActivity", () => {
  it("renders the quick logging surface", () => {
    render(<LogActivity />);

    expect(screen.getByRole("heading", { name: /log activity/i })).toBeInTheDocument();
    expect(screen.getByText(/speak to log/i)).toBeInTheDocument();
    expect(screen.getByText(/transport/i)).toBeInTheDocument();
    expect(screen.getByText(/meals/i)).toBeInTheDocument();
    expect(screen.getByText(/energy/i)).toBeInTheDocument();
    expect(screen.getByText(/shopping/i)).toBeInTheDocument();
  });
});
