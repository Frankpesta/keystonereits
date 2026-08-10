import { describe, expect, it } from "vitest";
import {
  loginSchema,
  otpVerifySchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  signupSchema,
} from "./auth";

const validSignup = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  password: "SuperSecret1",
  confirmPassword: "SuperSecret1",
  termsAccepted: true as const,
};

describe("signupSchema", () => {
  it("accepts a fully valid payload", () => {
    expect(signupSchema.safeParse(validSignup).success).toBe(true);
  });

  it("lowercases and trims email", () => {
    const result = signupSchema.safeParse({ ...validSignup, email: "  Jane@Example.com  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("jane@example.com");
  });

  it("rejects mismatched passwords", () => {
    const result = signupSchema.safeParse({ ...validSignup, confirmPassword: "Different1" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("confirmPassword");
    }
  });

  it("rejects a password under 8 characters", () => {
    const result = signupSchema.safeParse({ ...validSignup, password: "short1", confirmPassword: "short1" });
    expect(result.success).toBe(false);
  });

  it("rejects when terms are not accepted", () => {
    const result = signupSchema.safeParse({ ...validSignup, termsAccepted: false });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = signupSchema.safeParse({ ...validSignup, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("allows omitting optional fields (phone, country, referralCode)", () => {
    const { ...rest } = validSignup;
    expect(signupSchema.safeParse(rest).success).toBe(true);
  });
});

describe("loginSchema", () => {
  it("accepts email + non-empty password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
  });

  it("rejects an empty password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});

describe("otpVerifySchema", () => {
  it("accepts a 6-digit code", () => {
    expect(otpVerifySchema.safeParse({ email: "a@b.com", code: "038291" }).success).toBe(true);
  });

  it.each(["12345", "1234567", "abcdef", "12 345"])("rejects malformed code %s", (code) => {
    expect(otpVerifySchema.safeParse({ email: "a@b.com", code }).success).toBe(false);
  });
});

describe("requestPasswordResetSchema", () => {
  it("accepts a bare email", () => {
    expect(requestPasswordResetSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
  });
});

describe("resetPasswordSchema", () => {
  const base = {
    email: "a@b.com",
    code: "038291",
    newPassword: "SuperSecret1",
    confirmPassword: "SuperSecret1",
  };

  it("accepts a valid payload", () => {
    expect(resetPasswordSchema.safeParse(base).success).toBe(true);
  });

  it("rejects mismatched new/confirm passwords", () => {
    const result = resetPasswordSchema.safeParse({ ...base, confirmPassword: "Different1" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("confirmPassword");
    }
  });
});
