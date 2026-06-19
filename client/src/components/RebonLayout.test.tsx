import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import RebonLayout from "./RebonLayout";

let authState: { user: { name?: string } | null; isAuthenticated: boolean; logout: () => void } = {
  user: null,
  isAuthenticated: false,
  logout: vi.fn(),
};

let locationState = "/";

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => authState,
}));

vi.mock("wouter", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
  useLocation: () => [locationState, vi.fn()],
}));

vi.mock("@/const", () => ({
  getLoginUrl: () => "/login",
}));

describe("RebonLayout", () => {
  beforeEach(() => {
    authState = { user: null, isAuthenticated: false, logout: vi.fn() };
    locationState = "/";
  });

  it("shows the auth gate when the user is signed out", () => {
    render(<RebonLayout><div>content</div></RebonLayout>);

    expect(screen.getByRole("heading", { name: /sign in to rebon/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in \/ register/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to home/i })).toBeInTheDocument();
  });

  it("renders the shell and active navigation when signed in", () => {
    authState = { user: { name: "Test User" }, isAuthenticated: true, logout: vi.fn() };

    render(<RebonLayout><main>app content</main></RebonLayout>);

    expect(screen.getByText("app content")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /toggle navigation/i })).toBeInTheDocument();
    expect(screen.getByText(/sign out/i)).toBeInTheDocument();
  });
});
