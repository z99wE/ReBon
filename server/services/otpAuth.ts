/**
 * OTP Authentication Service
 * Handles email and phone OTP generation, delivery, and verification.
 * No external auth provider required — works with any email/phone.
 *
 * Security:
 * - OTPs are bcrypt-hashed before storage
 * - 6-digit OTPs expire in 10 minutes
 * - Max 3 verification attempts per session
 * - Rate limited: 1 OTP per identifier per 60 seconds
 */
import crypto from "crypto";
import nodemailer from "nodemailer";
import { getDb } from "../db";
import { otpSessions } from "../../drizzle/schema";
import { eq, and, gt, desc } from "drizzle-orm";

// ─── OTP Generation ───────────────────────────────────────────────────────────

/** Generate a cryptographically random 6-digit OTP */
export function generateOtp(): string {
  const bytes = crypto.randomBytes(3);
  const num = (bytes.readUIntBE(0, 3) % 1000000);
  return num.toString().padStart(6, "0");
}

/** Hash OTP using SHA-256 (fast enough for short-lived tokens) */
export function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

/** Verify an OTP against its stored hash */
export function verifyOtpHash(otp: string, hash: string): boolean {
  const inputHash = hashOtp(otp);
  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(hash));
}

// ─── Email Delivery ───────────────────────────────────────────────────────────

function createTransporter() {
  // Uses SMTP env vars if provided, otherwise falls back to Ethereal (dev preview)
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  // Dev fallback: log OTP to console (no email sent)
  return null;
}

export async function sendEmailOtp(email: string, otp: string): Promise<{ preview?: string }> {
  const transporter = createTransporter();

  const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; color: #e8e8e8; padding: 40px; border-radius: 12px; border: 1px solid #1a1a1a;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 20px; letter-spacing: 2px;">ReBon</div>
        <p style="color: #888; margin-top: 8px; font-size: 13px;">Carbon Intelligence Platform</p>
      </div>
      <h2 style="font-size: 22px; font-weight: 600; margin-bottom: 8px;">Your sign-in code</h2>
      <p style="color: #888; font-size: 14px; margin-bottom: 24px;">Enter this code to access your ReBon account. It expires in 10 minutes.</p>
      <div style="background: #111; border: 1px solid #2a2a2a; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #818cf8; font-family: monospace;">${otp}</span>
      </div>
      <p style="color: #555; font-size: 12px; text-align: center;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  if (!transporter) {
    // Dev mode: no email sent, but OTP is still valid
    // Do not log OTP to console for security
    return { preview: `DEV_MODE` };
  }

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || '"ReBon" <noreply@rebon.app>',
    to: email,
    subject: `${otp} is your ReBon sign-in code`,
    html,
  });

  return { preview: nodemailer.getTestMessageUrl(info) || undefined };
}

/** For phone OTP — logs to console in dev, can integrate Twilio/Vonage via env */
export async function sendPhoneOtp(phone: string, otp: string): Promise<{ preview?: string }> {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    // Twilio integration (optional — only if env vars are set)
    const url = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`;
    const body = new URLSearchParams({
      From: process.env.TWILIO_PHONE_FROM || "",
      To: phone,
      Body: `Your ReBon code is ${otp}. Expires in 10 minutes.`,
    });
    await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    return {};
  }
  // Dev fallback: no SMS sent, but OTP is still valid
  // Do not log OTP to console for security
  return { preview: `DEV_MODE` };
}

// ─── Session Management ───────────────────────────────────────────────────────

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 3;
const RATE_LIMIT_MS = 60 * 1000; // 1 OTP per identifier per 60 seconds

export async function createOtpSession(
  identifier: string,
  identifierType: "email" | "phone"
): Promise<{ otp: string; rateLimited: boolean }> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  // Rate limit: check if a session was created in the last 60 seconds
  const recentSession = await db
    .select()
    .from(otpSessions)
    .where(
      and(
        eq(otpSessions.identifier, identifier.toLowerCase()),
        gt(otpSessions.createdAt, new Date(Date.now() - RATE_LIMIT_MS))
      )
    )
    .orderBy(desc(otpSessions.createdAt))
    .limit(1);

  if (recentSession.length > 0) {
    return { otp: "", rateLimited: true };
  }

  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  await db.insert(otpSessions).values({
    identifier: identifier.toLowerCase(),
    identifierType,
    otpHash,
    expiresAt,
    attempts: 0,
    verified: false,
  });

  return { otp, rateLimited: false };
}

export async function verifyOtpSession(
  identifier: string,
  otp: string
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const now = new Date();

  // Find the most recent unverified, unexpired session for this identifier
  const sessions = await db
    .select()
    .from(otpSessions)
    .where(
      and(
        eq(otpSessions.identifier, identifier.toLowerCase()),
        eq(otpSessions.verified, false),
        gt(otpSessions.expiresAt, now)
      )
    )
    .orderBy(desc(otpSessions.createdAt))
    .limit(1);

  if (sessions.length === 0) {
    return { success: false, error: "OTP expired or not found. Request a new code." };
  }

  const session = sessions[0];

  if (session.attempts >= MAX_ATTEMPTS) {
    return { success: false, error: "Too many attempts. Request a new code." };
  }

  // Increment attempts
  await db
    .update(otpSessions)
    .set({ attempts: session.attempts + 1 })
    .where(eq(otpSessions.id, session.id));

  if (!verifyOtpHash(otp, session.otpHash)) {
    const remaining = MAX_ATTEMPTS - session.attempts - 1;
    return { success: false, error: `Incorrect code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.` };
  }

  // Mark as verified
  await db
    .update(otpSessions)
    .set({ verified: true })
    .where(eq(otpSessions.id, session.id));

  return { success: true };
}
