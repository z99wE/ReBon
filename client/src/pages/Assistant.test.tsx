import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import Assistant from "./Assistant";

let authState = { isAuthenticated: true };

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => authState,
}));

vi.mock("@/const", () => ({
  getLoginUrl: () => "/login",
}));

vi.mock("streamdown", () => ({
  Streamdown: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    assistant: {
      chat: {
        useMutation: () => ({
          mutate: vi.fn(),
          isPending: false,
        }),
      },
    },
  },
}));

describe("Assistant", () => {
  beforeEach(() => {
    authState = { isAuthenticated: true };
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it("renders the assistant chat surface when signed in", () => {
    render(<Assistant />);

    expect(screen.getByRole("heading", { name: /^rebon ai$/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ask rebon ai anything about carbon/i)).toBeInTheDocument();
    expect(screen.getByText(/hi! i'm rebon ai/i)).toBeInTheDocument();
  });

  it("shows the sign in call-to-action when signed out", () => {
    authState = { isAuthenticated: false };

    render(<Assistant />);

    expect(screen.getByText(/meet rebon ai/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in to chat/i })).toBeInTheDocument();
  });
});
