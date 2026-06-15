import type { Express } from "express";
import { simpleAuth } from "./simpleAuth";
import { COOKIE_NAME } from "@shared/const";
import * as db from "../db";

export function registerSimpleAuthRoutes(app: Express) {
  // Simple login endpoint - creates a user session
  app.post("/api/simple-auth/login", async (req, res) => {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ error: "Email and name required" });
    }

    try {
      // Create or update user
      const openId = `user_${email.replace(/[^a-zA-Z0-9]/g, "_")}`;
      await db.upsertUser({
        openId,
        email,
        name,
        lastSignedIn: new Date(),
      });

      // Create session token
      const sessionToken = await simpleAuth.createSessionToken(openId, {
        name,
        email,
      });

      // Set cookie
      res.cookie(COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      });

      res.json({ success: true, user: { openId, email, name } });
    } catch (error) {
      console.error("[SimpleAuth] Login failed:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Logout endpoint
  app.post("/api/simple-auth/logout", (req, res) => {
    res.clearCookie(COOKIE_NAME);
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