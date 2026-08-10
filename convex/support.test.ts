// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { api } from "./_generated/api";
import schema from "./schema";
import { convexTestModules } from "./test.setup";
import { createAdmin, createVerifiedUser } from "./lib/testHelpers";
import type { Id } from "./_generated/dataModel";

describe("support tickets", () => {
  it("createTicket opens a ticket with a first message", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken, user } = await createVerifiedUser(t);

    const result = await t.mutation(api.support.createTicket, {
      sessionToken,
      subject: "Need help with deposit",
      category: "general",
      message: "My deposit hasn't shown up yet.",
    });
    expect(result.ok).toBe(true);

    const tickets = await t.query(api.support.myTickets, { sessionToken });
    expect(tickets).toMatchObject([{ subject: "Need help with deposit", status: "open", userId: user._id }]);

    const thread = await t.query(api.support.ticketMessages, {
      sessionToken,
      ticketId: result.ticketId as Id<"supportTickets">,
    });
    expect(thread.messages).toHaveLength(1);
    expect(thread.messages[0]).toMatchObject({ authorType: "user", body: "My deposit hasn't shown up yet." });
  });

  it("prefills a fiat_deposit category ticket", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createVerifiedUser(t);

    const result = await t.mutation(api.support.createTicket, {
      sessionToken,
      subject: "Fiat deposit request",
      category: "fiat_deposit",
      message: "I'd like to deposit $10,000 via bank transfer.",
    });

    const [ticket] = await t.query(api.support.myTickets, { sessionToken });
    expect(ticket.category).toBe("fiat_deposit");
    void result;
  });

  it("postMessage appends to the thread and flips status to pending_admin", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createVerifiedUser(t);
    const { ticketId } = await t.mutation(api.support.createTicket, {
      sessionToken,
      subject: "Question",
      category: "general",
      message: "First message.",
    });

    await t.mutation(api.support.postMessage, {
      sessionToken,
      ticketId: ticketId as Id<"supportTickets">,
      body: "Following up on this.",
    });

    const thread = await t.query(api.support.ticketMessages, {
      sessionToken,
      ticketId: ticketId as Id<"supportTickets">,
    });
    expect(thread.messages).toHaveLength(2);
    expect(thread.ticket.status).toBe("pending_admin");
  });

  it("emails the assigned admin when the user replies (admins have no in-app notifications)", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createVerifiedUser(t);
    const { admin } = await createAdmin(t, { role: "support" });
    const { ticketId } = await t.mutation(api.support.createTicket, {
      sessionToken,
      subject: "Question",
      category: "general",
      message: "First message.",
    });
    await t.run((ctx) => ctx.db.patch(ticketId as Id<"supportTickets">, { assignedTo: admin._id }));

    await t.mutation(api.support.postMessage, {
      sessionToken,
      ticketId: ticketId as Id<"supportTickets">,
      body: "Following up on this.",
    });

    vi.useFakeTimers();
    try {
      await t.finishAllScheduledFunctions(vi.runAllTimers);
    } finally {
      vi.useRealTimers();
    }
    const emailLog = await t.run((ctx) => ctx.db.query("emailLog").collect());
    expect(emailLog).toMatchObject([{ recipientEmail: admin.email, status: "sent" }]);
  });

  it("rejects posting to a closed ticket", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createVerifiedUser(t);
    const { ticketId } = await t.mutation(api.support.createTicket, {
      sessionToken,
      subject: "Question",
      category: "general",
      message: "First message.",
    });
    await t.run((ctx) => ctx.db.patch(ticketId as Id<"supportTickets">, { status: "closed" }));

    await expect(
      t.mutation(api.support.postMessage, {
        sessionToken,
        ticketId: ticketId as Id<"supportTickets">,
        body: "Still there?",
      })
    ).rejects.toThrow(ConvexError);
  });

  it("requestFiatDeposit opens a fiat_deposit ticket at or above the $10k minimum", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createVerifiedUser(t);

    const result = await t.mutation(api.support.requestFiatDeposit, { sessionToken, amountUsd: 10_000 });
    expect(result.ok).toBe(true);

    const [ticket] = await t.query(api.support.myTickets, { sessionToken });
    expect(ticket.category).toBe("fiat_deposit");

    const deposits = await t.run((ctx) => ctx.db.query("deposits").collect());
    expect(deposits).toMatchObject([
      { method: "fiat", amountUsd: 10_000, status: "pending", supportTicketId: result.ticketId },
    ]);
  });

  it("rejects a fiat deposit request under the $10k minimum", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createVerifiedUser(t);

    await expect(
      t.mutation(api.support.requestFiatDeposit, { sessionToken, amountUsd: 9_999 })
    ).rejects.toThrow(ConvexError);

    expect(await t.query(api.support.myTickets, { sessionToken })).toEqual([]);
  });

  it("prevents a stranger from reading or posting to another user's ticket", async () => {
    const t = convexTest(schema, convexTestModules);
    const owner = await createVerifiedUser(t);
    const stranger = await createVerifiedUser(t);
    const { ticketId } = await t.mutation(api.support.createTicket, {
      sessionToken: owner.sessionToken,
      subject: "Private",
      category: "general",
      message: "Confidential.",
    });

    await expect(
      t.query(api.support.ticketMessages, {
        sessionToken: stranger.sessionToken,
        ticketId: ticketId as Id<"supportTickets">,
      })
    ).rejects.toThrow(ConvexError);

    await expect(
      t.mutation(api.support.postMessage, {
        sessionToken: stranger.sessionToken,
        ticketId: ticketId as Id<"supportTickets">,
        body: "Hi",
      })
    ).rejects.toThrow(ConvexError);
  });
});
