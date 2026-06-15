import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateOtp, hashOtp, sendEmailOtp, verifyOtpHash } from "./otpAuth";

beforeEach(() => {
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_PORT;
  delete process.env.SMTP_SECURE;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASS;
});

describe("otpAuth", () => {
  it("generates a 6 digit OTP", () => {
    expect(generateOtp()).toMatch(/^\d{6}$/);
  });

  it("hashes and verifies OTPs", () => {
    const otp = "123456";
    const hash = hashOtp(otp);
    expect(verifyOtpHash(otp, hash)).toBe(true);
    expect(verifyOtpHash("654321", hash)).toBe(false);
  });

  it("does not log OTPs in dev fallback email mode", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const result = await sendEmailOtp("demo@example.com", "123456");

    expect(result.preview).toBe("DEV_MODE:123456");
    expect(logSpy).not.toHaveBeenCalled();
    logSpy.mockRestore();
  });
});
