import React from "react";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
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

// Mutable mock state so tests can control data independently
let profileData: any = { archetype: "eco_pioneer", eloScore: 1188, influenceScore: 63 };
let activitiesData: any[] = [
  { id: 1, label: "Bike commute", subcategory: "bicycle_km", category: "transport", carbonKg: 0, loggedAt: new Date().toISOString() },
];
let challengesData: any[] = [
  { id: 1, title: "Walk more", description: "Try a short walk", category: "transport", difficulty: "easy", carbonSavingKg: 1, completedAt: null },
];
let profileLoading = false;

vi.mock("@/lib/trpc", () => ({
  trpc: {
    user: {
      profile: {
        useQuery: () => ({ data: profileData, isLoading: profileLoading }),
      },
    },
    activities: {
      list: {
        useQuery: () => ({ data: activitiesData }),
      },
    },
    challenges: {
      list: {
        useQuery: () => ({ data: challengesData }),
      },
    },
  },
}));

describe("Dashboard", () => {
  beforeEach(() => {
    profileData = { archetype: "eco_pioneer", eloScore: 1188, influenceScore: 63 };
    activitiesData = [
      { id: 1, label: "Bike commute", subcategory: "bicycle_km", category: "transport", carbonKg: 0, loggedAt: new Date().toISOString() },
    ];
    challengesData = [
      { id: 1, title: "Walk more", description: "Try a short walk", category: "transport", difficulty: "easy", carbonSavingKg: 1, completedAt: null },
    ];
    profileLoading = false;
  });

  it("renders the core stats and quick actions", () => {
    render(<Dashboard />);

    expect(screen.getByText(/welcome back, mina/i)).toBeInTheDocument();
    expect(screen.getByText("Elo Score")).toBeInTheDocument();
    expect(screen.getByText("Weekly CO₂")).toBeInTheDocument();
    expect(screen.getByText("Log Activity")).toBeInTheDocument();
    expect(screen.getByText("Recent Activity")).toBeInTheDocument();
  });

  it("displays the user Elo score from profile data", () => {
    render(<Dashboard />);
    // The score 1188 should appear somewhere in the rendered output
    expect(screen.getByText("1188")).toBeInTheDocument();
  });

  it("renders the recent activity label from the mock list", () => {
    render(<Dashboard />);
    expect(screen.getByText(/bike commute/i)).toBeInTheDocument();
  });

  it("renders a challenge title from the mock list", () => {
    render(<Dashboard />);
    expect(screen.getByText(/walk more/i)).toBeInTheDocument();
  });

  it("renders with an empty activities list without crashing", () => {
    activitiesData = [];
    render(<Dashboard />);
    // Page should still render key structure
    expect(screen.getByText(/welcome back, mina/i)).toBeInTheDocument();
  });

  it("renders with an empty challenges list without crashing", () => {
    challengesData = [];
    render(<Dashboard />);
    expect(screen.getByText(/welcome back, mina/i)).toBeInTheDocument();
  });

  it("has a heading element for accessibility", () => {
    render(<Dashboard />);
    expect(screen.getAllByRole("heading").length).toBeGreaterThan(0);
  });
});
