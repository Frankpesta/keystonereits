// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { api } from "../_generated/api";
import schema from "../schema";
import { convexTestModules } from "../test.setup";
import { createAdmin, createVerifiedUser } from "../lib/testHelpers";

describe("admin/support.queue + thread", () => {
  it("lists tickets joined with the user's name and filters by status", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "support" });
    const { sessionToken: userToken } = await createVerifiedUser(t, { firstName: "Ada", lastName: "Lovelace" });
    await t.mutation(api.support.createTicket, {
      sessionToken: userToken,
      subject: "Help",
      category: "general",
      message: "Need help.",
    });

    const queue = await t.query(api.admin.support.queue, { sessionToken, status: "open" });
    expect(queue).toHaveLength(1);
    expect(queue[0].userName).toBe("Ada Lovelace");
  });
});

describe("admin/support.reply", () => {
  it("appears in the user's own Phase-5 thread view (shared table, real-time by construction)", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "support" });
    const { user, sessionToken: userToken } = await createVerifiedUser(t);
    const { ticketId } = await t.mutation(api.support.createTicket, {
      sessionToken: userToken,
      subject: "Help",
      category: "general",
      message: "Need help.",
    });

    await t.mutation(api.admin.support.reply, { sessionToken, ticketId, body: "We're looking into it." });

    // The user's own query (convex/support.ts ticketMessages) reads the same
    // supportMessages rows — this is what makes the reply show up without a
    // manual refresh on their side.
    const userView = await t.query(api.support.ticketMessages, { sessionToken: userToken, ticketId });
    expect(userView.messages).toHaveLength(2);
    expect(userView.messages[1]).toMatchObject({ authorType: "admin", body: "We're looking into it." });
    expect(userView.ticket.status).toBe("pending_user");

    const notifications = await t.run((ctx) => ctx.db.query("notifications").collect());
    expect(notifications).toMatchObject([{ userId: user._id, type: "support_reply" }]);

    vi.useFakeTimers();
    try {
      await t.finishAllScheduledFunctions(vi.runAllTimers);
    } finally {
      vi.useRealTimers();
    }
    const emailLog = await t.run((ctx) => ctx.db.query("emailLog").collect());
    expect(emailLog).toMatchObject([{ recipientEmail: user.email, status: "sent" }]);
  });

  it("rejects a non-support admin", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "finance" });
    const { sessionToken: userToken } = await createVerifiedUser(t);
    const { ticketId } = await t.mutation(api.support.createTicket, {
      sessionToken: userToken,
      subject: "Help",
      category: "general",
      message: "Need help.",
    });

    await expect(
      t.mutation(api.admin.support.reply, { sessionToken, ticketId, body: "hi" })
    ).rejects.toThrow(ConvexError);
  });
});

describe("admin/support.assign + close", () => {
  it("assigns and unassigns a ticket", async () => {
    const t = convexTest(schema, convexTestModules);
    const { admin, sessionToken } = await createAdmin(t, { role: "support" });
    const { sessionToken: userToken } = await createVerifiedUser(t);
    const { ticketId } = await t.mutation(api.support.createTicket, {
      sessionToken: userToken,
      subject: "Help",
      category: "general",
      message: "Need help.",
    });

    await t.mutation(api.admin.support.assign, { sessionToken, ticketId, assignedTo: admin._id });
    let ticket = await t.run((ctx) => ctx.db.get(ticketId));
    expect(ticket?.assignedTo).toBe(admin._id);

    await t.mutation(api.admin.support.assign, { sessionToken, ticketId, assignedTo: null });
    ticket = await t.run((ctx) => ctx.db.get(ticketId));
    expect(ticket?.assignedTo).toBeUndefined();
  });

  it("closes a ticket, after which the user cannot post further messages", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "support" });
    const { sessionToken: userToken } = await createVerifiedUser(t);
    const { ticketId } = await t.mutation(api.support.createTicket, {
      sessionToken: userToken,
      subject: "Help",
      category: "general",
      message: "Need help.",
    });

    await t.mutation(api.admin.support.close, { sessionToken, ticketId });

    await expect(
      t.mutation(api.support.postMessage, { sessionToken: userToken, ticketId, body: "still there?" })
    ).rejects.toThrow(ConvexError);
  });
});
