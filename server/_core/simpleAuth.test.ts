// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { simpleAuth } from "./simpleAuth";
import * as db from "../db";
import { COOKIE_NAME } from "@shared/const";
import type { Request } from "express";
import { ENV } from "./env";

vi.mock("../db", () => ({
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
}));

describe("simpleAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createSessionToken and verifySession", () => {
    it("should create and successfully verify a valid token", async () => {
      const openId = "test-user-123";
      const token = await simpleAuth.createSessionToken(openId, {
        name: "Test User",
        email: "test@example.com",
      });

      expect(typeof token).toBe("string");

      const session = await simpleAuth.verifySession(token);
      expect(session).not.toBeNull();
      expect(session?.openId).toBe(openId);
      expect(session?.name).toBe("Test User");
      expect(session?.email).toBe("test@example.com");
    });

    it("should return null for invalid or tampered tokens", async () => {
      const session = await simpleAuth.verifySession("invalid-token.string.here");
      expect(session).toBeNull();
    });

    it("should return null if cookie is empty", async () => {
      const session = await simpleAuth.verifySession("");
      expect(session).toBeNull();
    });
  });

  describe("authenticateRequest", () => {
    it("should authenticate and auto-create a user if one does not exist", async () => {
      const token = await simpleAuth.createSessionToken("new-user-123", {
        name: "New",
        email: "new@example.com",
      });

      const req = {
        headers: {
          cookie: `${COOKIE_NAME}=${token}`,
        },
      } as unknown as Request;

      // Mock user not existing initially, then existing after creation
      vi.mocked(db.getUserByOpenId)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ openId: "new-user-123", name: "New", email: "new@example.com" } as any);

      const user = await simpleAuth.authenticateRequest(req);
      
      expect(user).not.toBeNull();
      expect(user?.openId).toBe("new-user-123");
      expect(db.upsertUser).toHaveBeenCalledTimes(2); // Auto-create, then lastSignedIn update
    });

    it("should update lastSignedIn if the user already exists", async () => {
      const token = await simpleAuth.createSessionToken("existing-user", {
        name: "Existing",
      });

      const req = {
        headers: {
          cookie: `${COOKIE_NAME}=${token}`,
        },
      } as unknown as Request;

      vi.mocked(db.getUserByOpenId).mockResolvedValueOnce({ openId: "existing-user", name: "Existing" } as any);

      const user = await simpleAuth.authenticateRequest(req);
      
      expect(user).not.toBeNull();
      expect(db.upsertUser).toHaveBeenCalledTimes(1);
    });

    it("should return null if no cookie is present", async () => {
      const req = {
        headers: {},
      } as unknown as Request;

      const user = await simpleAuth.authenticateRequest(req);
      expect(user).toBeNull();
    });
  });
});
