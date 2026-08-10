// @vitest-environment node
import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { api } from "./_generated/api";
import schema from "./schema";
import { convexTestModules } from "./test.setup";

const VALID = {
  name: "Jane Doe",
  email: "jane@example.com",
  subject: "Question about plans",
  message: "I'd like to know more about the Growth plan.",
};

describe("contact.submit", () => {
  it("persists a new contactMessages row with status 'new'", async () => {
    const t = convexTest(schema, convexTestModules);
    const result = await t.mutation(api.contact.submit, VALID);
    expect(result).toEqual({ ok: true });

    const rows = await t.run((ctx) => ctx.db.query("contactMessages").collect());
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ ...VALID, status: "new" });
    expect(typeof rows[0].createdAt).toBe("number");
  });

  it("normalizes email casing/whitespace before storing", async () => {
    const t = convexTest(schema, convexTestModules);
    await t.mutation(api.contact.submit, { ...VALID, email: "  Jane@Example.com  " });

    const rows = await t.run((ctx) => ctx.db.query("contactMessages").collect());
    expect(rows[0].email).toBe("jane@example.com");
  });

  it("rejects an invalid email", async () => {
    const t = convexTest(schema, convexTestModules);
    await expect(t.mutation(api.contact.submit, { ...VALID, email: "not-an-email" })).rejects.toThrow(ConvexError);
  });

  it("rejects a message under 10 characters", async () => {
    const t = convexTest(schema, convexTestModules);
    await expect(t.mutation(api.contact.submit, { ...VALID, message: "too short" })).rejects.toThrow(ConvexError);
  });

  it("records multiple submissions as separate rows", async () => {
    const t = convexTest(schema, convexTestModules);
    await t.mutation(api.contact.submit, VALID);
    await t.mutation(api.contact.submit, { ...VALID, subject: "A different question" });

    const rows = await t.run((ctx) => ctx.db.query("contactMessages").collect());
    expect(rows).toHaveLength(2);
  });
});
