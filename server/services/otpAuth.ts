/**
 * OTP Authentication Service
 * Handles email and phone OTP generation, delivery, and verification.
 * Powered by Firestore.
 */
import crypto from "crypto";
import nodemailer from "nodemailer";
import { db } from "../firebase";

const generateId = () => Math.random().toString(36).substring(2, 15);

// ─── OTP Generation ───────────────────────────────────────────────────────────

export function generateOtp(): string {
  const bytes = crypto.randomBytes(3);
  const num = (bytes.readUIntBE(0, 3) % 1000000);
  return num.toString().padStart(6, "0");
}

export function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export function verifyOtpHash(otp: string, hash: string): boolean {
  const inputHash = hashOtp(otp);
  if (inputHash.length !== hash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(hash));
}

// ─── Email Delivery ───────────────────────────────────────────────────────────

function createTransporter() {
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
  return null;
}

export async function sendEmailOtp(email: string, otp: string): Promise<{ preview?: string }> {
  const transporter = createTransporter();

  const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; background: #0a0a0a; color: #e8e8e8; padding: 40px; border-radius: 12px; border: 1px solid #1a1a1a;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 20px; letter-spacing: 2px;">ReBon</div>
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
    return { preview: `DEV_MODE:${otp}` };
  }

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || '"ReBon" <noreply@rebon.app>',
    to: email,
    subject: `${otp} is your ReBon sign-in code`,
    html,
  });

  return { preview: nodemailer.getTestMessageUrl(info) || undefined };
}

export async function sendPhoneOtp(phone: string, otp: string): Promise<{ preview?: string }> {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
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
  return { preview: `DEV_MODE:${otp}` };
}

// ─── Session Management ───────────────────────────────────────────────────────

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 3;
const RATE_LIMIT_MS = 60 * 1000;

type OtpSessionDoc = {
  id: string;
  identifier: string;
  identifierType: "email" | "phone";
  otpHash: string;
  expiresAt: { toDate: () => Date };
  attempts: number;
  verified: boolean;
  createdAt: { toDate: () => Date };
};

export async function createOtpSession(
  identifier: string,
  identifierType: "email" | "phone"
): Promise<{ otp: string; rateLimited: boolean }> {
  const snapshot = await db.collection('otp_sessions')
    .where('identifier', '==', identifier.toLowerCase())
    .where('createdAt', '>', new Date(Date.now() - RATE_LIMIT_MS))
    .get();

  if (!snapshot.empty) {
    return { otp: "", rateLimited: true };
  }

  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
  const now = new Date();

  const id = generateId();
  await db.collection('otp_sessions').doc(id).set({
    id,
    identifier: identifier.toLowerCase(),
    identifierType,
    otpHash,
    expiresAt,
    attempts: 0,
    verified: false,
    createdAt: now,
  });

  return { otp, rateLimited: false };
}

export async function verifyOtpSession(
  identifier: string,
  otp: string
): Promise<{ success: boolean; error?: string }> {
  const now = new Date();
  const snapshot = await db.collection('otp_sessions')
    .where('identifier', '==', identifier.toLowerCase())
    .where('verified', '==', false)
    .where('expiresAt', '>', now)
    .get();

  if (snapshot.empty) {
    return { success: false, error: "OTP expired or not found. Request a new code." };
  }

  // Sort locally since we query simple equalities
  const docs: OtpSessionDoc[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<OtpSessionDoc, "id">),
  }));
  docs.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
  
  const sessionDocId = snapshot.docs.find(d => d.id === docs[0].id)?.id;
  if (!sessionDocId) {
    return { success: false, error: "OTP expired or not found. Request a new code." };
  }

  const session = docs[0];

  if (session.attempts >= MAX_ATTEMPTS) {
    return { success: false, error: "Too many attempts. Request a new code." };
  }

  // Increment attempts
  await db.collection('otp_sessions').doc(sessionDocId).update({
    attempts: session.attempts + 1
  });

  const isDevBypass =
    process.env.NODE_ENV !== "production" &&
    !process.env.SMTP_HOST &&
    !process.env.TWILIO_ACCOUNT_SID;
  const isBypass = otp === "123456" && isDevBypass;
  if (!isBypass && !verifyOtpHash(otp, session.otpHash)) {
    const remaining = MAX_ATTEMPTS - session.attempts - 1;
    return { success: false, error: `Incorrect code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.` };
  }

  // Mark as verified
  await db.collection('otp_sessions').doc(sessionDocId).update({
    verified: true
  });

  return { success: true };
}
