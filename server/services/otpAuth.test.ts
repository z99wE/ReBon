import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateOtp, hashOtp, sendEmailOtp, sendPhoneOtp, verifyOtpHash, createOtpSession, verifyOtpSession } from "./otpAuth";
import { getDb } from "../db";

vi.mock("../db", () => ({
  getDb: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_PORT;
  delete process.env.SMTP_SECURE;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASS;
});

function makeSelectChain(rows: unknown[]) {
  const chain: Record<string, unknown> = {};
  chain.from = () => chain;
  chain.where = () => chain;
  chain.orderBy = () => chain;
  chain.limit = async () => rows;
  return chain;
}

function makeFakeDb(selectRows: unknown[]) {
  const insertValues = vi.fn(async () => undefined);
  const updateWhere = vi.fn(async () => undefined);
  return {
    select: vi.fn(() => makeSelectChain(selectRows)),
    insert: vi.fn(() => ({ values: insertValues })),
    update: vi.fn(() => ({ set: () => ({ where: updateWhere }) })),
    __mocks: { insertValues, updateWhere },
  };
}

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

  it("returns the OTP in dev fallback phone mode", async () => {
    const result = await sendPhoneOtp("+15550001234", "654321");

    expect(result.preview).toBe("DEV_MODE:654321");
  });

  it("creates an OTP session and stores a hash when there is no recent session", async () => {
    const fakeDb = makeFakeDb([]);
    vi.mocked(getDb).mockResolvedValue(fakeDb as never);

    const result = await createOtpSession("demo@example.com", "email");

    expect(result.rateLimited).toBe(false);
    expect(result.otp).toMatch(/^\d{6}$/);
    expect(fakeDb.insert).toHaveBeenCalled();
    expect(fakeDb.__mocks.insertValues).toHaveBeenCalled();
  });

  it("rate limits a recently created OTP session", async () => {
    const fakeDb = makeFakeDb([{ id: 1 }]);
    vi.mocked(getDb).mockResolvedValue(fakeDb as never);

    const result = await createOtpSession("demo@example.com", "email");

    expect(result).toEqual({ otp: "", rateLimited: true });
    expect(fakeDb.insert).not.toHaveBeenCalled();
  });

  it("verifies a valid OTP session", async () => {
    const session = {
      id: 7,
      attempts: 0,
      otpHash: hashOtp("123456"),
      verified: false,
    };
    const fakeDb = makeFakeDb([session]);
    vi.mocked(getDb).mockResolvedValue(fakeDb as never);

    const result = await verifyOtpSession("demo@example.com", "123456");

    expect(result).toEqual({ success: true });
    expect(fakeDb.__mocks.updateWhere).toHaveBeenCalledTimes(2);
  });
});
