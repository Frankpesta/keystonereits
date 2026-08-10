// @vitest-environment node
import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { api } from "./_generated/api";
import schema from "./schema";
import { convexTestModules } from "./test.setup";
import { createVerifiedUser } from "./lib/testHelpers";
import type { Id } from "./_generated/dataModel";

async function seedNotification(t: ReturnType<typeof convexTest>, userId: Id<"users">, read = false) {
  return await t.run((ctx) =>
    ctx.db.insert("notifications", {
      userId,
      type: "deposit_credited",
      title: "Deposit credited",
      body: "Your deposit has been credited.",
      read,
      createdAt: Date.now(),
    })
  );
}

describe("notifications", () => {
  it("unreadCount reflects only this user's unread rows", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken, user } = await createVerifiedUser(t);
    await seedNotification(t, user._id, false);
    await seedNotification(t, user._id, false);
    await seedNotification(t, user._id, true);

    expect(await t.query(api.notifications.unreadCount, { sessionToken })).toBe(2);
  });

  it("markRead flips a single notification and updates the count", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken, user } = await createVerifiedUser(t);
    const id = await seedNotification(t, user._id, false);

    await t.mutation(api.notifications.markRead, { sessionToken, notificationId: id });
    expect(await t.query(api.notifications.unreadCount, { sessionToken })).toBe(0);
  });

  it("markAllRead clears every unread notification", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken, user } = await createVerifiedUser(t);
    await seedNotification(t, user._id, false);
    await seedNotification(t, user._id, false);

    const result = await t.mutation(api.notifications.markAllRead, { sessionToken });
    expect(result).toEqual({ ok: true, count: 2 });
    expect(await t.query(api.notifications.unreadCount, { sessionToken })).toBe(0);
  });

  it("prevents marking another user's notification as read", async () => {
    const t = convexTest(schema, convexTestModules);
    const owner = await createVerifiedUser(t);
    const stranger = await createVerifiedUser(t);
    const id = await seedNotification(t, owner.user._id, false);

    await expect(
      t.mutation(api.notifications.markRead, { sessionToken: stranger.sessionToken, notificationId: id })
    ).rejects.toThrow(ConvexError);
  });
});
