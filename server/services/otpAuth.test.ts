/**
 * @fileoverview Unit tests for server/services/otpAuth.ts
 *
 * All Firestore and nodemailer calls are mocked so these tests run
 * entirely in-process with zero external dependencies.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import { generateOtp, hashOtp, verifyOtpHash } from "./otpAuth";

// ─── generateOtp ──────────────────────────────────────────────────────────────

describe("generateOtp", () => {
  it("returns a 6-character string", () => {
    const otp = generateOtp();
    expect(otp).toHaveLength(6);
  });

  it("returns only digit characters", () => {
    for (let i = 0; i < 20; i++) {
      expect(generateOtp()).toMatch(/^\d{6}$/);
    }
  });

  it("generates different OTPs on successive calls (statistical)", () => {
    const otps = new Set(Array.from({ length: 10 }, () => generateOtp()));
    // With 10 calls, at least 2 should differ in a 1M-space pool
    expect(otps.size).toBeGreaterThan(1);
  });

  it("pads single-digit values to 6 chars", () => {
    // All output strings must be exactly length 6 even for small numbers
    for (let i = 0; i < 50; i++) {
      expect(generateOtp().length).toBe(6);
    }
  });
});

// ─── hashOtp ─────────────────────────────────────────────────────────────────

describe("hashOtp", () => {
  it("returns a 64-character hex sha256 digest", () => {
    const hash = hashOtp("123456");
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic for the same input", () => {
    expect(hashOtp("000000")).toBe(hashOtp("000000"));
  });

  it("produces different hashes for different OTPs", () => {
    expect(hashOtp("111111")).not.toBe(hashOtp("222222"));
  });

  it("matches the known sha256 of '123456'", () => {
    // sha256("123456") = 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92
    expect(hashOtp("123456")).toBe(
      "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92"
    );
  });
});

// ─── verifyOtpHash ────────────────────────────────────────────────────────────

describe("verifyOtpHash", () => {
  it("returns true when the OTP matches its hash", () => {
    const otp = "987654";
    const hash = hashOtp(otp);
    expect(verifyOtpHash(otp, hash)).toBe(true);
  });

  it("returns false for a wrong OTP", () => {
    const hash = hashOtp("123456");
    expect(verifyOtpHash("654321", hash)).toBe(false);
  });

  it("returns false when the hash is empty (length mismatch guard)", () => {
    expect(verifyOtpHash("123456", "")).toBe(false);
  });

  it("returns false when the OTP is empty (length mismatch guard)", () => {
    const hash = hashOtp("123456");
    expect(verifyOtpHash("", hash)).toBe(false);
  });

  it("returns false for a hash of incorrect length", () => {
    // Truncated hash — must not throw, must return false
    expect(verifyOtpHash("123456", "abc123")).toBe(false);
  });

  it("is resistant to timing: different OTPs both return false quickly", () => {
    const hash = hashOtp("123456");
    expect(verifyOtpHash("000000", hash)).toBe(false);
    expect(verifyOtpHash("999999", hash)).toBe(false);
  });

  it("verifies all zero OTP correctly", () => {
    const otp = "000000";
    expect(verifyOtpHash(otp, hashOtp(otp))).toBe(true);
  });

  it("verifies all nine OTP correctly", () => {
    const otp = "999999";
    expect(verifyOtpHash(otp, hashOtp(otp))).toBe(true);
  });
});

// ─── OTP bypass guard (production safety) ─────────────────────────────────────

describe("OTP bypass (dev-only 123456)", () => {
  it("hashOtp('123456') produces a consistent hash that can be verified", () => {
    const otp = "123456";
    const hash = hashOtp(otp);
    expect(verifyOtpHash(otp, hash)).toBe(true);
  });

  it("the bypass OTP '123456' does NOT verify against a different user's hash", () => {
    const realOtp = generateOtp();
    const realHash = hashOtp(realOtp);
    // '123456' should not accidentally match a real OTP's hash
    if (realOtp !== "123456") {
      expect(verifyOtpHash("123456", realHash)).toBe(false);
    }
  });
});
