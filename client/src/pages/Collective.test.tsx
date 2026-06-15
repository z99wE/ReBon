import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import Collective from "./Collective";

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockCreateMutate = vi.fn();
const mockJoinMutate = vi.fn();
const mockWhatIfMutate = vi.fn();

let mockIsAuthenticated = true;
let mockMyCollectives: any[] = [];
let mockPublicCollectives: any[] = [];
let mockCreatePending = false;
let mockJoinPending = false;
let mockWhatIfPending = false;
let mockWhatIfData: any = null;

vi.mock("@/lib/trpc", () => ({
  trpc: {
    collective: {
      myCollectives: {
        useQuery: () => ({ data: mockMyCollectives, refetch: vi.fn() }),
      },
      publicList: {
        useQuery: () => ({ data: mockPublicCollectives }),
      },
      create: {
        useMutation: ({ onSuccess, onError }: any) => ({
          mutate: mockCreateMutate.mockImplementation((args: any) => {
            if (args.name) onSuccess();
          }),
          isPending: mockCreatePending,
        }),
      },
      join: {
        useMutation: ({ onSuccess, onError }: any) => ({
          mutate: mockJoinMutate.mockImplementation((args: any) => {
            if (args.inviteCode) onSuccess();
          }),
          isPending: mockJoinPending,
        }),
      },
      whatIf: {
        useMutation: ({ onError }: any) => ({
          mutate: mockWhatIfMutate,
          isPending: mockWhatIfPending,
          data: mockWhatIfData,
        }),
      },
    },
  },
}));

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: mockIsAuthenticated }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/components/Icons", () => ({
  IconAdd: () => <span data-testid="icon-add" />,
  IconArrowForward: () => <span />,
  IconCheckmark: () => <span />,
  IconCopy: () => <span data-testid="icon-copy" />,
  IconGlobe: () => <span />,
  IconPeople: () => <span data-testid="icon-people" />,
  IconPulse: () => <span data-testid="icon-pulse" />,
  IconStar: () => <span />,
}));

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Collective", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthenticated = true;
    mockMyCollectives = [];
    mockPublicCollectives = [];
    mockCreatePending = false;
    mockJoinPending = false;
    mockWhatIfPending = false;
    mockWhatIfData = null;
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the CarbonCollective heading", () => {
    render(<Collective />);
    expect(screen.getByRole("heading", { name: /carboncollective/i })).toBeInTheDocument();
  });

  it("renders the Public Collectives section", () => {
    render(<Collective />);
    expect(screen.getByText(/public collectives/i)).toBeInTheDocument();
  });

  it("shows 'No collectives yet' when public list is empty", () => {
    mockPublicCollectives = [];
    render(<Collective />);
    expect(screen.getByText(/no collectives yet/i)).toBeInTheDocument();
  });

  it("renders public collectives when data is present", () => {
    mockPublicCollectives = [
      { id: 1, name: "Green Warriors", memberCount: 12, totalCarbonKg: 320.5, inviteCode: "GRWX1234" },
    ];
    render(<Collective />);
    expect(screen.getByText("Green Warriors")).toBeInTheDocument();
    expect(screen.getByText("GRWX1234")).toBeInTheDocument();
    expect(screen.getByText(/12 members/i)).toBeInTheDocument();
  });

  it("renders multiple public collectives", () => {
    mockPublicCollectives = [
      { id: 1, name: "EcoTeam", memberCount: 5, totalCarbonKg: 100, inviteCode: "ECO12345" },
      { id: 2, name: "ClimateHeroes", memberCount: 20, totalCarbonKg: 800, inviteCode: "CLH12345" },
    ];
    render(<Collective />);
    expect(screen.getByText("EcoTeam")).toBeInTheDocument();
    expect(screen.getByText("ClimateHeroes")).toBeInTheDocument();
  });

  // ── Auth-gated Actions ─────────────────────────────────────────────────────

  it("shows Join and Create buttons when authenticated", () => {
    render(<Collective />);
    expect(screen.getByRole("button", { name: /^join$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
  });

  it("hides Join and Create buttons when not authenticated", () => {
    mockIsAuthenticated = false;
    render(<Collective />);
    expect(screen.queryByRole("button", { name: /^join$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /create/i })).not.toBeInTheDocument();
  });

  // ── Create Form ────────────────────────────────────────────────────────────

  it("shows create form when Create button is clicked", () => {
    render(<Collective />);
    fireEvent.click(screen.getByRole("button", { name: /create/i }));
    expect(screen.getByText(/create a collective/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/collective name/i)).toBeInTheDocument();
  });

  it("hides create form when Cancel is clicked", () => {
    render(<Collective />);
    fireEvent.click(screen.getByRole("button", { name: /create/i }));
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText(/create a collective/i)).not.toBeInTheDocument();
  });

  it("calls create mutation with name and description", () => {
    render(<Collective />);
    fireEvent.click(screen.getByRole("button", { name: /create/i }));
    fireEvent.change(screen.getByPlaceholderText(/collective name/i), { target: { value: "My Team" } });
    fireEvent.change(screen.getByPlaceholderText(/description/i), { target: { value: "A great team" } });
    // Click the Create button inside the form
    const createBtns = screen.getAllByRole("button", { name: /create/i });
    fireEvent.click(createBtns[createBtns.length - 1]);
    expect(mockCreateMutate).toHaveBeenCalledWith({ name: "My Team", description: "A great team" });
  });

  it("disables create button when name is empty", () => {
    render(<Collective />);
    fireEvent.click(screen.getByRole("button", { name: /create/i }));
    const createBtns = screen.getAllByRole("button", { name: /create/i });
    expect(createBtns[createBtns.length - 1]).toBeDisabled();
  });

  // ── Join Form ──────────────────────────────────────────────────────────────

  it("shows join form when Join button is clicked", () => {
    render(<Collective />);
    fireEvent.click(screen.getByRole("button", { name: /^join$/i }));
    expect(screen.getByText(/join with invite code/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/8-character code/i)).toBeInTheDocument();
  });

  it("hides join form when Cancel is clicked", () => {
    render(<Collective />);
    fireEvent.click(screen.getByRole("button", { name: /^join$/i }));
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText(/join with invite code/i)).not.toBeInTheDocument();
  });

  it("uppercases the invite code input", () => {
    render(<Collective />);
    fireEvent.click(screen.getByRole("button", { name: /^join$/i }));
    const input = screen.getByPlaceholderText(/8-character code/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "abc12345" } });
    expect(input.value).toBe("ABC12345");
  });

  it("disables join button when invite code is less than 4 chars", () => {
    render(<Collective />);
    fireEvent.click(screen.getByRole("button", { name: /^join$/i }));
    const input = screen.getByPlaceholderText(/8-character code/i);
    fireEvent.change(input, { target: { value: "AB" } });
    expect(screen.getByRole("button", { name: /confirm join/i })).toBeDisabled();
  });

  it("calls join mutation with the entered invite code", () => {
    render(<Collective />);
    fireEvent.click(screen.getByRole("button", { name: /^join$/i }));
    const input = screen.getByPlaceholderText(/8-character code/i);
    fireEvent.change(input, { target: { value: "ABCD1234" } });
    fireEvent.click(screen.getByRole("button", { name: /confirm join/i }));
    expect(mockJoinMutate).toHaveBeenCalledWith({ inviteCode: "ABCD1234" });
  });

  // ── My Collectives ─────────────────────────────────────────────────────────

  it("shows My Collectives section when user has collectives", () => {
    mockMyCollectives = [
      { id: 1, name: "Team Green", description: "Our team", memberCount: 5, totalCarbonKg: 200, inviteCode: "TGR12345" },
    ];
    render(<Collective />);
    expect(screen.getByText("My Collectives")).toBeInTheDocument();
    expect(screen.getByText("Team Green")).toBeInTheDocument();
  });

  it("shows invite code for my collective", () => {
    mockMyCollectives = [
      { id: 1, name: "Team Green", description: "", memberCount: 3, totalCarbonKg: 50, inviteCode: "XYZ12345" },
    ];
    render(<Collective />);
    expect(screen.getByText("XYZ12345")).toBeInTheDocument();
  });

  it("shows member count and carbon for my collective", () => {
    mockMyCollectives = [
      { id: 1, name: "Team Green", description: "", memberCount: 7, totalCarbonKg: 123.4, inviteCode: "ABC12345" },
    ];
    render(<Collective />);
    expect(screen.getByText("7 members")).toBeInTheDocument();
    expect(screen.getByText("123.4 kg CO₂")).toBeInTheDocument();
  });

  it("does not show My Collectives section when user has none", () => {
    mockMyCollectives = [];
    render(<Collective />);
    expect(screen.queryByText("My Collectives")).not.toBeInTheDocument();
  });

  it("does not show My Collectives when not authenticated", () => {
    mockIsAuthenticated = false;
    mockMyCollectives = [{ id: 1, name: "Hidden", description: "", memberCount: 1, totalCarbonKg: 0, inviteCode: "HID12345" }];
    render(<Collective />);
    expect(screen.queryByText("My Collectives")).not.toBeInTheDocument();
  });

  // ── Accessibility ───────────────────────────────────────────────────────────

  it("has no axe violations on base render", async () => {
    const { axe, toHaveNoViolations } = await import("jest-axe");
    expect.extend(toHaveNoViolations);
    const { container } = render(<Collective />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no axe violations with Create form open", async () => {
    const { axe, toHaveNoViolations } = await import("jest-axe");
    expect.extend(toHaveNoViolations);
    const { container } = render(<Collective />);
    fireEvent.click(screen.getByRole("button", { name: /create/i }));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has no axe violations with Join form open", async () => {
    const { axe, toHaveNoViolations } = await import("jest-axe");
    expect.extend(toHaveNoViolations);
    const { container } = render(<Collective />);
    fireEvent.click(screen.getByRole("button", { name: /^join$/i }));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

