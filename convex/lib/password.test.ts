// @vitest-environment node
import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("hashPassword / verifyPassword", () => {
  it("hashes into the pbkdf2$iterations$salt$hash format", async () => {
    const stored = await hashPassword("correct horse battery staple");
    const parts = stored.split("$");
    expect(parts).toHaveLength(4);
    expect(parts[0]).toBe("pbkdf2");
    expect(Number(parts[1])).toBeGreaterThan(0);
    expect(parts[2]).toMatch(/^[0-9a-f]{32}$/); // 16-byte salt
    expect(parts[3]).toMatch(/^[0-9a-f]{64}$/); // 32-byte derived key
  });

  it("verifies the correct password", async () => {
    const stored = await hashPassword("s3cret-Passw0rd!");
    expect(await verifyPassword("s3cret-Passw0rd!", stored)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const stored = await hashPassword("s3cret-Passw0rd!");
    expect(await verifyPassword("wrong-password", stored)).toBe(false);
  });

  it("produces a different salt (and therefore different hash) each time", async () => {
    const a = await hashPassword("same-password");
    const b = await hashPassword("same-password");
    expect(a).not.toBe(b);
    expect(await verifyPassword("same-password", a)).toBe(true);
    expect(await verifyPassword("same-password", b)).toBe(true);
  });

  it("rejects malformed stored hashes instead of throwing", async () => {
    await expect(verifyPassword("anything", "not-a-valid-hash")).resolves.toBe(false);
    await expect(verifyPassword("anything", "pbkdf2$abc$$")).resolves.toBe(false);
  });

  it("rejects a value using an unrecognized scheme", async () => {
    await expect(verifyPassword("anything", "bcrypt$10$salt$hash")).resolves.toBe(false);
  });
});
