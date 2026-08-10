import { ConvexError } from "convex/values";

const FALLBACK = "Something went wrong. Please try again.";

/** Every mutation in convex/auth.ts throws `new ConvexError("<message>")` with a plain string payload. */
export function getConvexErrorMessage(err: unknown, fallback = FALLBACK): string {
  if (err instanceof ConvexError && typeof err.data === "string") {
    return err.data;
  }
  return fallback;
}
