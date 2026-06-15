import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import Assistant from "./Assistant";

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockChatMutate = vi.fn();
let mockIsAuthenticated = true;
let mockChatPending = false;
let mockChatOnSuccess: ((data: any) => void) | null = null;
let mockChatOnError: ((e: any) => void) | null = null;

vi.mock("@/lib/trpc", () => ({
  trpc: {
    assistant: {
      chat: {
        useMutation: ({ onSuccess, onError }: any) => {
          mockChatOnSuccess = onSuccess;
          mockChatOnError = onError;
          return { mutate: mockChatMutate, isPending: mockChatPending };
        },
      },
    },
  },
}));

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: mockIsAuthenticated }),
}));

vi.mock("@/const", () => ({
  getLoginUrl: () => "/login",
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("streamdown", () => ({
  Streamdown: ({ children }: { children: string }) => <span>{children}</span>,
}));

vi.mock("@/components/Icons", () => ({
  IconAdd: () => <span />,
  IconArrowForward: () => <span data-testid="icon-send" />,
  IconChatbubble: () => <span />,
  IconCheckmark: () => <span />,
  IconCpu: () => <span data-testid="icon-cpu" />,
  IconPulse: () => <span data-testid="icon-pulse" />,
  IconRobot: () => <span data-testid="icon-robot" />,
  IconStar: () => <span />,
  IconZap: () => <span />,
}));

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Assistant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthenticated = true;
    mockChatPending = false;
    mockChatOnSuccess = null;
    mockChatOnError = null;
    // jsdom doesn't implement scrollIntoView — mock it so useEffect doesn't throw
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  // ── Unauthenticated State ──────────────────────────────────────────────────

  it("shows unauthenticated prompt when not logged in", () => {
    mockIsAuthenticated = false;
    render(<Assistant />);
    expect(screen.getByText(/meet rebon ai/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in to chat/i })).toBeInTheDocument();
  });

  it("unauthenticated sign in link points to login URL", () => {
    mockIsAuthenticated = false;
    render(<Assistant />);
    const link = screen.getByRole("link", { name: /sign in to chat/i });
    expect(link).toHaveAttribute("href", "/login");
  });

  it("does not render chat input when not authenticated", () => {
    mockIsAuthenticated = false;
    render(<Assistant />);
    expect(screen.queryByPlaceholderText(/ask rebon ai/i)).not.toBeInTheDocument();
  });

  // ── Authenticated State: Initial UI ───────────────────────────────────────

  it("renders the ReBon AI heading when authenticated", () => {
    render(<Assistant />);
    // The page has both h1 "ReBon AI" and h2 "Hi! I'm ReBon AI" — check the h1 specifically
    const headings = screen.getAllByRole("heading", { name: /rebon ai/i });
    expect(headings.length).toBeGreaterThan(0);
    expect(headings[0]).toBeInTheDocument();
  });

  it("shows the greeting message before any chat", () => {
    render(<Assistant />);
    expect(screen.getByText(/hi! i'm rebon ai/i)).toBeInTheDocument();
  });

  it("renders all 5 suggested prompt buttons", () => {
    render(<Assistant />);
    expect(screen.getByText(/what's my biggest carbon category/i)).toBeInTheDocument();
    expect(screen.getByText(/reduce my transport emissions/i)).toBeInTheDocument();
    expect(screen.getByText(/100kg co₂ mean/i)).toBeInTheDocument();
    expect(screen.getByText(/3 easy wins/i)).toBeInTheDocument();
    expect(screen.getByText(/compare to the average person/i)).toBeInTheDocument();
  });

  it("renders the chat input field", () => {
    render(<Assistant />);
    expect(screen.getByPlaceholderText(/ask rebon ai anything/i)).toBeInTheDocument();
  });

  it("renders the send button", () => {
    render(<Assistant />);
    expect(screen.getByRole("button", { name: "" })).toBeInTheDocument();
  });

  it("send button is disabled when input is empty", () => {
    render(<Assistant />);
    // Find the send button (the icon button at the end of the input row)
    const buttons = screen.getAllByRole("button");
    const sendButton = buttons[buttons.length - 1];
    expect(sendButton).toBeDisabled();
  });

  it("send button is enabled when input has text", () => {
    render(<Assistant />);
    const input = screen.getByPlaceholderText(/ask rebon ai anything/i);
    fireEvent.change(input, { target: { value: "Hello" } });
    const buttons = screen.getAllByRole("button");
    const sendButton = buttons[buttons.length - 1];
    expect(sendButton).not.toBeDisabled();
  });

  // ── Sending Messages ───────────────────────────────────────────────────────

  it("calls chat mutation when send button is clicked", () => {
    render(<Assistant />);
    const input = screen.getByPlaceholderText(/ask rebon ai anything/i);
    fireEvent.change(input, { target: { value: "How do I reduce emissions?" } });
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[buttons.length - 1]);
    expect(mockChatMutate).toHaveBeenCalledWith(
      expect.objectContaining({ message: "How do I reduce emissions?", history: [] })
    );
  });

  it("calls chat mutation on Enter key press", () => {
    render(<Assistant />);
    const input = screen.getByPlaceholderText(/ask rebon ai anything/i);
    fireEvent.change(input, { target: { value: "What is carbon?" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: false });
    expect(mockChatMutate).toHaveBeenCalledWith(
      expect.objectContaining({ message: "What is carbon?" })
    );
  });

  it("does NOT send on Shift+Enter", () => {
    render(<Assistant />);
    const input = screen.getByPlaceholderText(/ask rebon ai anything/i);
    fireEvent.change(input, { target: { value: "Draft message" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: true });
    expect(mockChatMutate).not.toHaveBeenCalled();
  });

  it("does not send when input is empty or whitespace", () => {
    render(<Assistant />);
    const input = screen.getByPlaceholderText(/ask rebon ai anything/i);
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: false });
    expect(mockChatMutate).not.toHaveBeenCalled();
  });

  it("clears input after sending a message", () => {
    render(<Assistant />);
    const input = screen.getByPlaceholderText(/ask rebon ai anything/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Hello there" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: false });
    expect(input.value).toBe("");
  });

  it("sends a suggested prompt when clicked", () => {
    render(<Assistant />);
    fireEvent.click(screen.getByText(/what's my biggest carbon category/i));
    expect(mockChatMutate).toHaveBeenCalledWith(
      expect.objectContaining({ message: "What's my biggest carbon category?" })
    );
  });

  // ── Message Display ────────────────────────────────────────────────────────

  it("displays the user message in the chat after sending", async () => {
    render(<Assistant />);
    const input = screen.getByPlaceholderText(/ask rebon ai anything/i);
    fireEvent.change(input, { target: { value: "Hello ReBon" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: false });
    await waitFor(() => {
      expect(screen.getByText("Hello ReBon")).toBeInTheDocument();
    });
  });

  it("hides the greeting after a message is sent", async () => {
    render(<Assistant />);
    const input = screen.getByPlaceholderText(/ask rebon ai anything/i);
    fireEvent.change(input, { target: { value: "Hi" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: false });
    await waitFor(() => {
      expect(screen.queryByText(/hi! i'm rebon ai/i)).not.toBeInTheDocument();
    });
  });

  it("shows thinking indicator while waiting for response", () => {
    mockChatPending = true;
    render(<Assistant />);
    expect(screen.getByText(/thinking/i)).toBeInTheDocument();
  });

  it("shows assistant reply when chat mutation succeeds", async () => {
    render(<Assistant />);
    const input = screen.getByPlaceholderText(/ask rebon ai anything/i);
    fireEvent.change(input, { target: { value: "Hi" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: false });
    // Simulate successful response
    mockChatOnSuccess?.({ content: "Hello! I'm your carbon coach.", provider: "groq", latencyMs: 430 });
    await waitFor(() => {
      expect(screen.getByText("Hello! I'm your carbon coach.")).toBeInTheDocument();
    });
  });

  it("disables input while chat is pending", () => {
    mockChatPending = true;
    render(<Assistant />);
    const input = screen.getByPlaceholderText(/ask rebon ai anything/i);
    expect(input).toBeDisabled();
  });

  // ── Suggested Prompts Disappear After First Message ────────────────────────

  it("hides suggested prompts after sending first message", async () => {
    render(<Assistant />);
    fireEvent.click(screen.getByText(/3 easy wins/i));
    await waitFor(() => {
      expect(screen.queryByText(/what's my biggest carbon category/i)).not.toBeInTheDocument();
    });
  });
});
