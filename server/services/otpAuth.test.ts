import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockDocs, mockCollection, mockTimestamp } = vi.hoisted(() => {
  const mockDocs: any[] = [];

  const mockTimestamp = (date = new Date()) => ({
    toDate: () => date,
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
  });

  const convertDatesToTimestamps = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (obj instanceof Date) {
      return mockTimestamp(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(convertDatesToTimestamps);
    }
    if (typeof obj === "object" && obj.constructor === Object) {
      const res: any = {};
      for (const key of Object.keys(obj)) {
        res[key] = convertDatesToTimestamps(obj[key]);
      }
      return res;
    }
    return obj;
  };

  const mockCollection = vi.fn((colName: string) => {
    const makeQueryChain = (filters: any[] = [], limitNum?: number) => {
      const getFilteredDocs = () => {
        let docs = mockDocs.filter(d => d._col === colName);
        for (const f of filters) {
          docs = docs.filter(d => {
            const docVal = d[f.field];
            if (f.op === "==") return docVal === f.val;
            if (f.op === ">=") return docVal >= f.val;
            if (f.op === "<") return docVal < f.val;
            if (f.op === ">") {
              const filterDate = f.val instanceof Date ? f.val.getTime() : f.val;
              const docDate = docVal instanceof Date ? docVal.getTime() : docVal;
              return docDate > filterDate;
            }
            return false;
          });
        }
        if (limitNum !== undefined) {
          docs = docs.slice(0, limitNum);
        }
        return docs;
      };

      const chain: any = {
        where: (field: string, op: string, val: any) => {
          return makeQueryChain([...filters, { field, op, val }], limitNum);
        },
        orderBy: () => {
          return chain;
        },
        limit: (num: number) => {
          return makeQueryChain(filters, num);
        },
        get: async () => {
          const docs = getFilteredDocs();
          return {
            docs: docs.map(d => ({
              data: () => convertDatesToTimestamps(d),
              id: d.id
            })),
            empty: docs.length === 0
          };
        }
      };
      return chain;
    };

    const collectionRef = {
      doc: (id: string) => {
        return {
          get: async () => {
            const found = mockDocs.find(d => d.id === id && d._col === colName);
            return {
              exists: !!found,
              data: () => convertDatesToTimestamps(found),
              id
            };
          },
          set: async (data: any) => {
            const existingIdx = mockDocs.findIndex(d => d.id === id && d._col === colName);
            if (existingIdx !== -1) {
              mockDocs[existingIdx] = { ...mockDocs[existingIdx], ...data };
            } else {
              mockDocs.push({ ...data, id, _col: colName });
            }
          },
          update: async (data: any) => {
            const existingIdx = mockDocs.findIndex(d => d.id === id && d._col === colName);
            if (existingIdx !== -1) {
              mockDocs[existingIdx] = { ...mockDocs[existingIdx], ...data };
            }
          }
        };
      },
      where: (field: string, op: string, val: any) => {
        return makeQueryChain([{ field, op, val }]);
      },
      limit: (num: number) => {
        return makeQueryChain([], num);
      },
      orderBy: () => {
        return makeQueryChain([]);
      },
      get: async () => {
        return makeQueryChain([]).get();
      }
    };
    return collectionRef;
  });

  return { mockDocs, mockCollection, mockTimestamp };
});

// Mock firebase-admin packages
vi.mock("firebase-admin/app", () => ({
  initializeApp: vi.fn(() => ({})),
  cert: vi.fn(),
  getApps: vi.fn(() => []),
}));

vi.mock("firebase-admin/firestore", () => ({
  getFirestore: vi.fn(() => ({
    collection: mockCollection,
  })),
}));

vi.mock("firebase-admin/auth", () => ({
  getAuth: vi.fn(() => ({})),
}));

import { generateOtp, hashOtp, sendEmailOtp, sendPhoneOtp, verifyOtpHash, createOtpSession, verifyOtpSession } from "./otpAuth";

beforeEach(() => {
  vi.clearAllMocks();
  mockDocs.length = 0;
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

  it("returns the OTP in dev fallback phone mode", async () => {
    const result = await sendPhoneOtp("+15550001234", "654321");

    expect(result.preview).toBe("DEV_MODE:654321");
  });

  it("creates an OTP session and stores a hash when there is no recent session", async () => {
    const result = await createOtpSession("demo@example.com", "email");

    expect(result.rateLimited).toBe(false);
    expect(result.otp).toMatch(/^\d{6}$/);

    const storedSession = mockDocs.find(d => d._col === "otp_sessions");
    expect(storedSession).toBeDefined();
    expect(storedSession.identifier).toBe("demo@example.com");
  });

  it("rate limits a recently created OTP session", async () => {
    mockDocs.push({
      id: "s1",
      identifier: "demo@example.com",
      createdAt: new Date(),
      _col: "otp_sessions"
    });

    const result = await createOtpSession("demo@example.com", "email");

    expect(result).toEqual({ otp: "", rateLimited: true });
  });

  it("verifies a valid OTP session", async () => {
    const session = {
      id: "s7",
      identifier: "demo@example.com",
      attempts: 0,
      otpHash: hashOtp("123456"),
      verified: false,
      expiresAt: new Date(Date.now() + 100000),
      createdAt: new Date(),
      _col: "otp_sessions"
    };
    mockDocs.push(session);

    const result = await verifyOtpSession("demo@example.com", "123456");

    expect(result).toEqual({ success: true });
    
    const updated = mockDocs.find(d => d.id === "s7");
    expect(updated.verified).toBe(true);
  });

  it("fails verification for incorrect OTP", async () => {
    const session = {
      id: "s3",
      identifier: "tester@example.com",
      otpHash: hashOtp("123456"),
      expiresAt: new Date(Date.now() + 10000),
      attempts: 1,
      verified: false,
      createdAt: new Date(),
      _col: "otp_sessions"
    };
    mockDocs.push(session);

    const res = await verifyOtpSession("tester@example.com", "999999");
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/Incorrect code/);
    
    const updated = mockDocs.find(d => d.id === "s3");
    expect(updated.attempts).toBe(2);
  });

  it("fails verification if max attempts reached", async () => {
    const session = {
      id: "s4",
      identifier: "locked@example.com",
      otpHash: hashOtp("123456"),
      expiresAt: new Date(Date.now() + 10000),
      attempts: 3,
      verified: false,
      createdAt: new Date(),
      _col: "otp_sessions"
    };
    mockDocs.push(session);

    const res = await verifyOtpSession("locked@example.com", "123456");
    expect(res.success).toBe(false);
    expect(res.error).toBe("Too many attempts. Request a new code.");
  });
});
