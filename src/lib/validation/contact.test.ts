import { describe, expect, it } from "vitest";
import { contactSchema } from "./contact";

const valid = {
  name: "Jane Doe",
  email: "jane@example.com",
  subject: "Question about plans",
  message: "I'd like to know more about the Growth plan.",
};

describe("contactSchema", () => {
  it("accepts a fully valid payload", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("lowercases and trims email", () => {
    const result = contactSchema.safeParse({ ...valid, email: "  Jane@Example.com  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("jane@example.com");
  });

  it("rejects an empty name", () => {
    expect(contactSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(contactSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects an empty subject", () => {
    expect(contactSchema.safeParse({ ...valid, subject: "" }).success).toBe(false);
  });

  it("rejects a message under 10 characters", () => {
    expect(contactSchema.safeParse({ ...valid, message: "too short" }).success).toBe(false);
  });
});
