import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import DashboardLayout from "./DashboardLayout";

let authState: { loading: boolean; user: { name?: string; email?: string } | null; logout: () => void } = {
  loading: false,
  user: null,
  logout: vi.fn(),
};

let locationState = "/";
const sidebarState = { state: "expanded", toggleSidebar: vi.fn() };

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => authState,
}));

vi.mock("@/_core/hooks/useMobile", () => ({
  useIsMobile: () => false,
}));

vi.mock("wouter", () => ({
  useLocation: () => [locationState, vi.fn()],
}));

vi.mock("@/const", () => ({
  getLoginUrl: () => "/login",
}));

vi.mock("@/components/ui/sidebar", async () => {
  const React = await import("react");
  return {
    SidebarProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Sidebar: ({ children }: { children: React.ReactNode }) => <aside>{children}</aside>,
    SidebarContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SidebarFooter: ({ children }: { children: React.ReactNode }) => <footer>{children}</footer>,
    SidebarHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
    SidebarInset: ({ children }: { children: React.ReactNode }) => <section>{children}</section>,
    SidebarMenu: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
    SidebarMenuButton: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => <button onClick={onClick}>{children}</button>,
    SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
    SidebarTrigger: ({ children }: { children?: React.ReactNode }) => <button>{children ?? "Trigger"}</button>,
    useSidebar: () => sidebarState,
  };
});

vi.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AvatarFallback: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => <button onClick={onClick}>{children}</button>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => <button onClick={onClick}>{children}</button>,
}));

vi.mock("./DashboardLayoutSkeleton", () => ({
  DashboardLayoutSkeleton: () => <div>Loading shell</div>,
}));

describe("DashboardLayout", () => {
  beforeEach(() => {
    authState = { loading: false, user: null, logout: vi.fn() };
    locationState = "/";
    sidebarState.state = "expanded";
    sidebarState.toggleSidebar = vi.fn();
    localStorage.clear();
  });

  it("shows the sign-in gate when the user is missing", () => {
    render(<DashboardLayout>content</DashboardLayout>);

    expect(screen.getByText(/sign in to continue/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("renders the dashboard shell for an authenticated user", () => {
    authState = { loading: false, user: { name: "Test User", email: "test@rebon.ai" }, logout: vi.fn() };

    render(<DashboardLayout><div>Dashboard content</div></DashboardLayout>);

    expect(screen.getByText("Dashboard content")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /toggle navigation/i })).toBeInTheDocument();
    expect(screen.getByText("Navigation")).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });
});
