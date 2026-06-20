import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Login from "./Login";

const mockDevLoginMutate = vi.fn();
const mockGoogleSignIn = vi.fn();

vi.mock("wouter", () => ({
  useLocation: () => ["/login", vi.fn()],
}));

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    loading: false,
  }),
}));

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(),
  getRedirectResult: vi.fn(async () => null),
  signInWithPopup: vi.fn(),
  signInWithRedirect: vi.fn(),
  GoogleAuthProvider: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    auth: {
      verifyFirebaseToken: {
        useMutation: () => ({
          mutate: vi.fn(),
          isPending: false,
        }),
      },
      devLogin: {
        useMutation: () => ({
          mutate: mockDevLoginMutate,
          isPending: false,
        }),
      },
    },
  },
}));

describe("Login", () => {
  it("renders Google Sign-In and Guest buttons, clicking guest triggers devLogin", async () => {
    const user = userEvent.setup();
    render(<Login />);

    const googleBtn = await screen.findByRole("button", { name: /continue with google/i });
    const guestBtn = await screen.findByRole("button", { name: /enter instantly as guest/i });

    expect(googleBtn).toBeInTheDocument();
    expect(guestBtn).toBeInTheDocument();

    await user.click(guestBtn);
    expect(mockDevLoginMutate).toHaveBeenCalled();
  });
});
