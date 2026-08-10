// @vitest-environment node
import { describe, expect, it } from "vitest";
import { randomDigits, randomReferralCode, randomToken, sha256Hex } from "./crypto";

describe("sha256Hex", () => {
  it("produces a stable, known digest", async () => {
    // echo -n "hello" | sha256sum
    expect(await sha256Hex("hello")).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
    );
  });

  it("produces different digests for different input", async () => {
    expect(await sha256Hex("a")).not.toBe(await sha256Hex("b"));
  });

  it("is deterministic", async () => {
    expect(await sha256Hex("same input")).toBe(await sha256Hex("same input"));
  });
});

describe("randomToken", () => {
  it("defaults to a 64-char hex string (32 bytes)", () => {
    expect(randomToken()).toMatch(/^[0-9a-f]{64}$/);
  });

  it("never repeats across calls", () => {
    const tokens = new Set(Array.from({ length: 50 }, () => randomToken()));
    expect(tokens.size).toBe(50);
  });
});

describe("randomDigits", () => {
  it("defaults to a 6-digit numeric string", () => {
    expect(randomDigits()).toMatch(/^\d{6}$/);
  });

  it("respects a custom length", () => {
    expect(randomDigits(4)).toMatch(/^\d{4}$/);
  });
});

describe("randomReferralCode", () => {
  it("defaults to 8 characters from the safe alphabet", () => {
    expect(randomReferralCode()).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/);
  });

  it("excludes ambiguous characters 0/O/1/I", () => {
    const codes = Array.from({ length: 200 }, () => randomReferralCode());
    expect(codes.join("")).not.toMatch(/[01IO]/);
  });
});
