// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerSimpleAuthRoutes } from "./simpleLogin";
import { simpleAuth } from "./simpleAuth";
import * as db from "../db";
import { ENV } from "./env";

vi.mock("../db", () => ({
  upsertUser: vi.fn(),
}));

vi.mock("./simpleAuth", () => ({
  simpleAuth: {
    createSessionToken: vi.fn(),
    authenticateRequest: vi.fn(),
  },
}));

vi.mock("./env", () => ({
  ENV: {
    isProduction: false,
  },
}));

// Mock express app
const mockApp = {
  post: vi.fn(),
  get: vi.fn(),
};

describe("simpleLogin", () => {
  let handlers: Record<string, Function> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Capture route handlers
    mockApp.post.mockImplementation((path, handler) => {
      handlers[`POST:${path}`] = handler;
    });
    mockApp.get.mockImplementation((path, handler) => {
      handlers[`GET:${path}`] = handler;
    });

    registerSimpleAuthRoutes(mockApp as any);
  });

  describe("POST /api/simple-auth/login", () => {
    it("should return 403 in production without demo auth", async () => {
      vi.mocked(ENV).isProduction = true;
      process.env.ALLOW_DEMO_AUTH = "false";

      const req = { body: { email: "test@test.com", name: "Test" } };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

      await handlers["POST:/api/simple-auth/login"](req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Simple login is disabled in production" });
    });

    it("should fail validation if email or name is missing", async () => {
      vi.mocked(ENV).isProduction = false;
      const req = { body: {} };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

      await handlers["POST:/api/simple-auth/login"](req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Email and name required" });
    });

    it("should create user, session, and set cookie on success", async () => {
      vi.mocked(ENV).isProduction = false;
      vi.mocked(simpleAuth.createSessionToken).mockResolvedValue("test-token");
      
      const req = { body: { email: " Test@example.com ", name: "Test User" } };
      const res = { 
        status: vi.fn().mockReturnThis(), 
        json: vi.fn(),
        cookie: vi.fn()
      };

      await handlers["POST:/api/simple-auth/login"](req, res);

      expect(db.upsertUser).toHaveBeenCalledWith(expect.objectContaining({
        email: "test@example.com",
        name: "Test User"
      }));
      expect(simpleAuth.createSessionToken).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalledWith(expect.any(String), "test-token", expect.any(Object));
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        user: expect.objectContaining({ email: "test@example.com" })
      });
    });
  });

  describe("POST /api/simple-auth/logout", () => {
    it("should clear cookie and return success", () => {
      const req = {};
      const res = { clearCookie: vi.fn(), json: vi.fn() };

      handlers["POST:/api/simple-auth/logout"](req, res);

      expect(res.clearCookie).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });
  });

  describe("GET /api/simple-auth/me", () => {
    it("should return 401 if not authenticated", async () => {
      vi.mocked(simpleAuth.authenticateRequest).mockResolvedValue(null);
      const req = {};
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };

      await handlers["GET:/api/simple-auth/me"](req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Not authenticated" });
    });

    it("should return user if authenticated", async () => {
      const mockUser = { openId: "123", email: "test@test.com" };
      vi.mocked(simpleAuth.authenticateRequest).mockResolvedValue(mockUser as any);
      const req = {};
      const res = { json: vi.fn() };

      await handlers["GET:/api/simple-auth/me"](req, res);

      expect(res.json).toHaveBeenCalledWith({ user: mockUser });
    });
  });
});
