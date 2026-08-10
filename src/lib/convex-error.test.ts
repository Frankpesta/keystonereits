import { describe, expect, it } from "vitest";
import { ConvexError } from "convex/values";
import { getConvexErrorMessage } from "./convex-error";

describe("getConvexErrorMessage", () => {
  it("extracts the string payload from a ConvexError", () => {
    const err = new ConvexError("Invalid email or password.");
    expect(getConvexErrorMessage(err)).toBe("Invalid email or password.");
  });

  it("falls back to the default message for a non-ConvexError", () => {
    expect(getConvexErrorMessage(new Error("boom"))).toBe(
      "Something went wrong. Please try again."
    );
  });

  it("falls back for a ConvexError with a non-string payload", () => {
    const err = new ConvexError({ code: "RATE_LIMITED" });
    expect(getConvexErrorMessage(err)).toBe("Something went wrong. Please try again.");
  });

  it("accepts a custom fallback message", () => {
    expect(getConvexErrorMessage(new Error("boom"), "Custom fallback")).toBe("Custom fallback");
  });

  it("falls back for a plain thrown string or unknown value", () => {
    expect(getConvexErrorMessage("just a string")).toBe("Something went wrong. Please try again.");
    expect(getConvexErrorMessage(undefined)).toBe("Something went wrong. Please try again.");
  });
});
