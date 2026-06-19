import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Login from "./Login";

let sendOtpOnSuccess: ((value: { preview?: string }) => void) | undefined;

vi.mock("wouter", () => ({
  useLocation: () => ["/login", vi.fn()],
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    auth: {
      sendOtp: {
        useMutation: (opts: { onSuccess?: (value: { preview?: string }) => void }) => {
          sendOtpOnSuccess = opts.onSuccess;
          return {
            mutate: vi.fn(() => sendOtpOnSuccess?.({ preview: "DEV_MODE:123456" })),
            isPending: false,
          };
        },
      },
      verifyOtp: {
        useMutation: () => ({
          mutate: vi.fn(),
          isPending: false,
        }),
      },
      verifyFirebaseToken: {
        useMutation: () => ({
          mutate: vi.fn(),
          isPending: false,
        }),
      },
      devLogin: {
        useMutation: () => ({
          mutate: vi.fn(),
          isPending: false,
        }),
      },
    },
  },
}));

describe("Login", () => {
  it("shows the OTP step after requesting a code", async () => {
    const user = userEvent.setup();
    render(<Login />);

    await user.type(screen.getByLabelText(/email address/i), "demo@example.com");
    await user.click(screen.getByRole("button", { name: /send code/i }));

    expect(screen.getByRole("heading", { name: /enter your code/i })).toBeInTheDocument();
    expect(screen.getByText(/dev/i)).toBeInTheDocument();
  });
});
