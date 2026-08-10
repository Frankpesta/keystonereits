/**
 * Shared hashing primitives for Convex's default (Web Crypto-capable) runtime.
 * Used for session tokens and OTP codes — high/moderate-entropy secrets where
 * a fast digest is appropriate because the surrounding flow (session lookup,
 * OTP attempt-limiting) is what actually defends against brute force.
 * Passwords use `convex/lib/password.ts` (PBKDF2), not this file.
 */

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

/** Cryptographically random URL-safe token, e.g. for session tokens. */
export function randomToken(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return toHex(bytes.buffer);
}

/** Random numeric OTP code, e.g. randomDigits(6) -> "038291". */
export function randomDigits(length = 6): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b % 10).join("");
}

/** Short, human-typeable referral code. Excludes ambiguous characters (0/O, 1/I). */
export function randomReferralCode(length = 8): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}
