// @vitest-environment node
import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { api } from "./_generated/api";
import schema from "./schema";
import { convexTestModules } from "./test.setup";
import { createVerifiedUser } from "./lib/testHelpers";
import { createSession } from "./lib/sessions";

describe("users.updateProfile", () => {
  it("patches name/phone/country", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken, user } = await createVerifiedUser(t);

    const result = await t.mutation(api.users.updateProfile, {
      sessionToken,
      firstName: "Janet",
      lastName: "Doerson",
      phone: "+1 555 0100",
      country: "US",
    });
    expect(result).toEqual({ ok: true });

    const updated = await t.run((ctx) => ctx.db.get(user._id));
    expect(updated).toMatchObject({ firstName: "Janet", lastName: "Doerson", phone: "+1 555 0100", country: "US" });
  });

  it("rejects an empty first name", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createVerifiedUser(t);

    await expect(
      t.mutation(api.users.updateProfile, { sessionToken, firstName: "  ", lastName: "Doe" })
    ).rejects.toThrow();
  });
});

describe("users.changePassword", () => {
  it("updates the password hash when the current password is correct", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createVerifiedUser(t);

    const result = await t.mutation(api.users.changePassword, {
      sessionToken,
      currentPassword: "SuperSecret1",
      newPassword: "BrandNewPass1",
      confirmPassword: "BrandNewPass1",
    });
    expect(result).toEqual({ ok: true });
  });

  it("rejects the wrong current password without changing anything", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken, user } = await createVerifiedUser(t);

    const result = await t.mutation(api.users.changePassword, {
      sessionToken,
      currentPassword: "wrong-password",
      newPassword: "BrandNewPass1",
      confirmPassword: "BrandNewPass1",
    });
    expect(result).toEqual({ ok: false, error: "Current password is incorrect." });

    const unchanged = await t.run((ctx) => ctx.db.get(user._id));
    expect(unchanged?.passwordHash).toBe(user.passwordHash);
  });

  it("keeps the caller's session alive but invalidates every other session", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken, user } = await createVerifiedUser(t);
    const { token: otherToken } = await t.run((ctx) =>
      createSession(ctx, { subjectId: user._id, subjectType: "user" })
    );

    await t.mutation(api.users.changePassword, {
      sessionToken,
      currentPassword: "SuperSecret1",
      newPassword: "BrandNewPass1",
      confirmPassword: "BrandNewPass1",
    });

    // Current session still works.
    await expect(t.query(api.users.currentUser, { sessionToken })).resolves.toMatchObject({ _id: user._id });
    // The other session was invalidated.
    await expect(t.query(api.users.currentUser, { sessionToken: otherToken })).rejects.toThrow();
  });
});
