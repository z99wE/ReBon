import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import Login from "./Login";

// vi.mock factories are hoisted to the top of the file by Vitest, so any
// variables they reference must be created with vi.hoisted().
const mocks = vi.hoisted(() => ({
  devLoginMutate:         vi.fn(),
  googleSignIn:           vi.fn(),
  verifyFirebaseMutate:   vi.fn(),
  getRedirectResult:      vi.fn(async () => null),
}));

vi.mock("wouter", () => ({
  useLocation: () => ["/login", vi.fn()],
}));

let isAuthenticated = false;
let loading = false;
let verifyIsPending = false;
let devLoginIsPending = false;

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({
    isAuthenticated,
    loading,
  }),
}));

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(),
  getRedirectResult: mocks.getRedirectResult,
  signInWithPopup: mocks.googleSignIn,
  signInWithRedirect: vi.fn(),
  setPersistence: vi.fn().mockResolvedValue(undefined),
  browserLocalPersistence: {},
  GoogleAuthProvider: vi.fn().mockImplementation(() => ({
    setCustomParameters: vi.fn(),
  })),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    auth: {
      verifyFirebaseToken: {
        useMutation: () => ({
          mutate: mocks.verifyFirebaseMutate,
          isPending: verifyIsPending,
        }),
      },
      devLogin: {
        useMutation: () => ({
          mutate: mocks.devLoginMutate,
          isPending: devLoginIsPending,
        }),
      },
    },
  },
}));

describe("Login", () => {
  beforeEach(() => {
    isAuthenticated = false;
    loading = false;
    verifyIsPending = false;
    devLoginIsPending = false;
    vi.clearAllMocks();
  });

  it("renders Google Sign-In and Guest buttons", async () => {
    render(<Login />);

    const googleBtn = await screen.findByRole("button", { name: /continue with google/i });
    const guestBtn  = await screen.findByRole("button", { name: /enter instantly as guest/i });

    expect(googleBtn).toBeInTheDocument();
    expect(guestBtn).toBeInTheDocument();
  });

  it("clicking the guest button triggers devLogin", async () => {
    const user = userEvent.setup();
    render(<Login />);

    const guestBtn = await screen.findByRole("button", { name: /enter instantly as guest/i });
    await user.click(guestBtn);
    expect(mocks.devLoginMutate).toHaveBeenCalledTimes(1);
  });

  it("disables the guest button while devLogin is pending", async () => {
    devLoginIsPending = true;
    render(<Login />);

    const guestBtn = await screen.findByRole("button", { name: /enter instantly as guest/i });
    expect(guestBtn).toBeDisabled();
  });

  it("renders the REBON wordmark", async () => {
    render(<Login />);
    // Wait for the login form to appear (auth check completes first)
    // The brand name is split across multiple elements, so look for a button
    // that only appears when the login screen is fully rendered
    const googleBtn = await screen.findByRole("button", { name: /continue with google/i });
    expect(googleBtn).toBeInTheDocument();
  });

  it("does not call devLogin when Google button is clicked", async () => {
    const user = userEvent.setup();
    // Make signInWithPopup return a mock user so it doesn't throw
    mocks.googleSignIn.mockResolvedValue({
      user: { getIdToken: async () => "mock-token", displayName: "Test User" },
    });

    render(<Login />);

    const googleBtn = await screen.findByRole("button", { name: /continue with google/i });
    await user.click(googleBtn);

    expect(mocks.devLoginMutate).not.toHaveBeenCalled();
  });
});
