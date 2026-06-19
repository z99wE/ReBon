import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerSimpleAuthRoutes } from "./simpleLogin";
import axios from "axios";

import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  app.set("trust proxy", 1); // Trust first proxy (Cloud Run / GCP gateway)
  const server = createServer(app);

  // ── Firebase Auth Same-Origin Proxy ─────────────────────────────────────────
  app.all("/__/auth/*", async (req, res) => {
    try {
      const targetUrl = `https://buildwithai-499306.firebaseapp.com${req.originalUrl}`;
      const response = await axios({
        method: req.method as any,
        url: targetUrl,
        headers: {
          ...req.headers,
          host: "buildwithai-499306.firebaseapp.com",
        },
        data: req, // Stream the raw request body
        responseType: "arraybuffer",
        validateStatus: () => true,
      });

      Object.entries(response.headers).forEach(([key, val]) => {
        if (val !== undefined && key.toLowerCase() !== "content-encoding") {
          res.setHeader(key, val as any);
        }
      });

      res.status(response.status).send(response.data);
    } catch (error) {
      console.error("Firebase auth proxy error:", error);
      res.status(500).send("Proxy error");
    }
  });

  app.get("/__/firebase/init.json", async (req, res) => {
    try {
      const targetUrl = `https://buildwithai-499306.firebaseapp.com${req.originalUrl}`;
      const response = await axios.get(targetUrl);
      res.json(response.data);
    } catch (error) {
      console.error("Firebase init proxy error:", error);
      res.status(500).send("Proxy error");
    }
  });


  // ── Security headers (Helmet) ───────────────────────────────────────────────
  // CSP disabled to allow Vite HMR in dev; re-enable with strict policy in prod
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // ── Rate limiting ────────────────────────────────────────────────────────────
  // Auth endpoints: 10 requests per 15 minutes (brute-force protection)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: "Too many auth attempts. Please try again in 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // AI endpoints: 30 requests per minute (cost + abuse protection)
  const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: { error: "AI rate limit reached. Please wait a moment before trying again." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // General API: 200 requests per minute
  const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Apply specific limiters before the general one
  app.use("/api/simple-auth", authLimiter);
  app.use("/api/trpc/assistant", aiLimiter);
  app.use("/api/trpc/challenges.generate", aiLimiter);
  app.use("/api/trpc/stories.generate", aiLimiter);
  app.use("/api/trpc/activities.logVoice", aiLimiter);
  app.use("/api/trpc", generalLimiter);

  // ── Body parser ──────────────────────────────────────────────────────────────
  // JSON: 2MB limit (prevents DoS via large JSON payloads)
  // urlencoded: 15MB limit (supports voice audio uploads encoded as base64)
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  registerSimpleAuthRoutes(app);

  // ── tRPC API ─────────────────────────────────────────────────────────────────
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
