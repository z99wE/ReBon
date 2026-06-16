import "@testing-library/jest-dom";
import { afterEach, beforeAll, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Set required environment variables for tests
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = "test-secret-key-for-jwt-signing-in-tests";
if (!process.env.VITE_APP_ID) process.env.VITE_APP_ID = "test-app-id";
if (!process.env.DATABASE_URL) process.env.DATABASE_URL = "mysql://test:test@localhost/test";
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = "test-jwt-secret";
if (!process.env.OWNER_OPEN_ID) process.env.OWNER_OPEN_ID = "test-owner-id";

// Mock ResizeObserver
beforeAll(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock matchMedia
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock window.scrollTo
  window.scrollTo = vi.fn();

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  global.localStorage = localStorageMock as any;
});
