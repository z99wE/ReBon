import type { Express } from "express";
import { z } from "zod";
import { simpleAuth } from "./simpleAuth";
import { COOKIE_NAME } from "@shared/const";
import * as db from "../db";
import { ENV } from "./env";

const simpleLoginSchema = z.object({
  email: z.string().trim().email().max(320),
  name: z.string().trim().min(1).max(64),
});

export function registerSimpleAuthRoutes(app: Express) {
  // Simple login endpoint - creates a user session
  app.post("/api/simple-auth/login", async (req, res) => {
    if (ENV.isProduction && process.env.ALLOW_DEMO_AUTH !== "true") {
      return res.status(403).json({ error: "Simple login is disabled in production" });
    }

    const parsed = simpleLoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Email and name required" });
    }

    const { email, name } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    try {
      // Create or update user
      const openId = `user_${normalizedEmail.replace(/[^a-z0-9]/g, "_")}`;
      await db.upsertUser({
        openId,
        email: normalizedEmail,
        name,
        lastSignedIn: new Date(),
      });

      // Create session token
      const sessionToken = await simpleAuth.createSessionToken(openId, {
        name,
        email: normalizedEmail,
      });

      // Set cookie
      res.cookie(COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: ENV.isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      });

      res.json({ success: true, user: { openId, email: normalizedEmail, name } });
    } catch (error) {
      console.error("[SimpleAuth] Login failed:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Logout endpoint
  app.post("/api/simple-auth/logout", (req, res) => {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: ENV.isProduction,
      sameSite: "lax",
      path: "/",
    });
    res.json({ success: true });
  });

  // Get current user
  app.get("/api/simple-auth/me", async (req, res) => {
    try {
      const user = await simpleAuth.authenticateRequest(req);
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      res.json({ user });
    } catch (error) {
      res.status(401).json({ error: "Not authenticated" });
    }
  });
}