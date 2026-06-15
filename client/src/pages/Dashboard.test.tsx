import React from "react";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import Dashboard from "./Dashboard";

vi.mock("wouter", () => ({
  Link: ({ children, href, ...props }: { children: ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { name: "Mina" },
  }),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    user: {
      profile: {
        useQuery: () => ({
          data: {
            archetype: "eco_pioneer",
            eloScore: 1188,
            influenceScore: 63,
          },
        }),
      },
    },
    activities: {
      list: {
        useQuery: () => ({
          data: [
            { id: 1, label: "Bike commute", subcategory: "bicycle_km", category: "transport", carbonKg: 0, loggedAt: new Date().toISOString() },
          ],
        }),
      },
    },
    challenges: {
      list: {
        useQuery: () => ({
          data: [
            { id: 1, title: "Walk more", description: "Try a short walk", category: "transport", difficulty: "easy", carbonSavingKg: 1, completedAt: null },
          ],
        }),
      },
    },
  },
}));

describe("Dashboard", () => {
  it("renders the core stats and quick actions", () => {
    render(<Dashboard />);

    expect(screen.getByText(/welcome back, mina/i)).toBeInTheDocument();
    expect(screen.getByText("Elo Score")).toBeInTheDocument();
    expect(screen.getByText("Weekly CO₂")).toBeInTheDocument();
    expect(screen.getByText("Log Activity")).toBeInTheDocument();
    expect(screen.getByText("Recent Activity")).toBeInTheDocument();
  });
});
