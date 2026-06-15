import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import Home from "./Home";

expect.extend(toHaveNoViolations);

let authState = { isAuthenticated: false };

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => authState,
}));

vi.mock("wouter", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock("@/const", () => ({
  getLoginUrl: () => "/login",
}));

describe("Home", () => {
  beforeEach(() => {
    authState = { isAuthenticated: false };
  });

  it("renders the marketing hero for signed out visitors", () => {
    render(<Home />);

    expect(screen.getByText(/agent-to-agent carbon negotiation platform/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /get started/i })).toBeInTheDocument();
    expect(screen.getByText(/what rebon does/i)).toBeInTheDocument();
  });

  it("shows the dashboard CTA when signed in", () => {
    authState = { isAuthenticated: true };

    render(<Home />);

    expect(screen.getByRole("link", { name: /open app/i })).toBeInTheDocument();
  });

  it("has no accessibility violations on the marketing landing page", async () => {
    const { container } = render(<Home />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no accessibility violations when signed in", async () => {
    authState = { isAuthenticated: true };
    const { container } = render(<Home />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
