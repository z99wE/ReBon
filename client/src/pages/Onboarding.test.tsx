import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import Onboarding from "./Onboarding";
import { ONBOARDING_QUESTIONS } from "../../../shared/carbonData";

let authState = { isAuthenticated: true };
let mutationData = {
  mutate: vi.fn(),
  isPending: false,
};

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => authState,
}));

vi.mock("wouter", () => ({
  useLocation: () => ["/onboarding", vi.fn()],
}));

vi.mock("@/const", () => ({
  getLoginUrl: () => "/login",
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    user: {
      completeOnboarding: {
        useMutation: () => mutationData,
      },
    },
  },
}));

describe("Onboarding", () => {
  beforeEach(() => {
    authState = { isAuthenticated: true };
    mutationData = { mutate: vi.fn(), isPending: false };
  });

  it("renders the first question for authenticated users", () => {
    render(<Onboarding />);

    expect(screen.getByText(/discover your carbon dna/i)).toBeInTheDocument();
    expect(screen.getByText(ONBOARDING_QUESTIONS[0].question)).toBeInTheDocument();
  });

  it("shows the sign-in gate when signed out", () => {
    authState = { isAuthenticated: false };

    render(<Onboarding />);

    expect(screen.getByText(/sign in to get your carbon dna/i)).toBeInTheDocument();
  });

  it("advances when an answer is selected", async () => {
    const user = userEvent.setup();
    render(<Onboarding />);

    await user.click(screen.getByRole("button", { name: ONBOARDING_QUESTIONS[0].options[0].label }));

    expect(screen.getByText(ONBOARDING_QUESTIONS[1].question)).toBeInTheDocument();
  });
});
