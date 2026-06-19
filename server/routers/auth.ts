import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { upsertUser } from "../db";
import { createOtpSession, sendEmailOtp, sendPhoneOtp, verifyOtpSession } from "../services/otpAuth";
import { SignJWT } from "jose";
import { Buffer } from "buffer";
import { ENV } from "../_core/env";
import { auth as firebaseAuth } from "../services/firebaseAdmin";

export const authRouter = router({
  me: publicProcedure.query(opts => opts.ctx.user),
  verifyFirebaseToken: publicProcedure
    .input(z.object({ idToken: z.string(), name: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const decodedToken = await firebaseAuth.verifyIdToken(input.idToken);
        const openId = `firebase:${decodedToken.uid}`;
        const email = decodedToken.email || "";
        const name = input.name || decodedToken.name || email.split("@")[0] || "Firebase User";
        
        await upsertUser({
          openId,
          name,
          email: email || undefined,
          loginMethod: "firebase",
          lastSignedIn: new Date(),
        });
        
        const secret = Buffer.from(ENV.cookieSecret, 'utf-8');
        const token = await new SignJWT({
          openId,
          appId: ENV.appId,
          name,
          email,
        })
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setExpirationTime("30d")
          .sign(secret);
          
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });
        return { success: true };
      } catch (error: any) {
        console.error("Firebase token verification failed:", error);
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: error.message || "Invalid Firebase ID token",
        });
      }
    }),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
  sendOtp: publicProcedure
    .input(z.object({ identifier: z.string().min(3).max(320), identifierType: z.enum(["email", "phone"]) }))
    .mutation(async ({ input }) => {
      if (input.identifierType === "email") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.identifier)) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid email address" });
      } else {
        if (!/^\+?[1-9]\d{6,14}$/.test(input.identifier.replace(/\s/g, ""))) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid phone number" });
      }
      const { otp, rateLimited } = await createOtpSession(input.identifier, input.identifierType);
      if (rateLimited) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Please wait 60 seconds before requesting a new code" });
      let preview: string | undefined;
      if (input.identifierType === "email") { const r = await sendEmailOtp(input.identifier, otp); preview = r.preview; }
      else { const r = await sendPhoneOtp(input.identifier, otp); preview = r.preview; }
      return { sent: true, preview: (!process.env.SMTP_HOST || process.env.NODE_ENV !== "production") ? preview : undefined };
    }),
  devLogin: publicProcedure
    .mutation(async ({ ctx }) => {
      const openId = `dev:demo_user`;
      const name = "Demo User";
      const email = "demo@rebon.app";
      await upsertUser({
        openId,
        name,
        email,
        loginMethod: "email_otp",
        lastSignedIn: new Date(),
      });
      const secret = Buffer.from(ENV.cookieSecret, 'utf-8');
      const token = await new SignJWT({
        openId,
        appId: ENV.appId,
        name,
        email,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(secret);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });
      return { success: true };
    }),
  verifyOtp: publicProcedure
    .input(z.object({ identifier: z.string().min(3).max(320), otp: z.string().length(6).regex(/^\d{6}$/, "OTP must be 6 digits"), name: z.string().min(1).max(64).optional() }))
    .mutation(async ({ input, ctx }) => {
      const result = await verifyOtpSession(input.identifier, input.otp);
      if (!result.success) throw new TRPCError({ code: "UNAUTHORIZED", message: result.error });
      const openId = `otp:${input.identifier.toLowerCase()}`;
      const isEmail = input.identifier.includes("@");
      await upsertUser({ openId, name: input.name || (isEmail ? input.identifier.split("@")[0] : input.identifier), email: isEmail ? input.identifier.toLowerCase() : undefined, loginMethod: isEmail ? "email_otp" : "phone_otp", lastSignedIn: new Date() });
      const secret = Buffer.from(ENV.cookieSecret, 'utf-8');
      const displayName = input.name || (isEmail ? input.identifier.split("@")[0] : input.identifier);
      const token = await new SignJWT({ openId, appId: ENV.appId, name: displayName, email: isEmail ? input.identifier.toLowerCase() : "" }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("30d").sign(secret);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });
      return { success: true };
    }),
});
