import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { getCurrentUser } from "./lib/auth";
import { getPlatformConfig } from "./settings";
import { writeTransaction } from "./lib/ledger";
import { notifyAdminsByRole } from "./lib/notify";
import type { Doc } from "./_generated/dataModel";

const DEPOSIT_NOTIFY_ROLES: Doc<"admins">["role"][] = ["super", "finance"];

export const generateUploadUrl = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await getCurrentUser(ctx, args.sessionToken);
    return await ctx.storage.generateUploadUrl();
  },
});

const CATEGORY = v.union(
  v.literal("fiat_deposit"),
  v.literal("general"),
  v.literal("kyc"),
  v.literal("withdrawal"),
  v.literal("other")
);

export const createTicket = mutation({
  args: {
    sessionToken: v.string(),
    subject: v.string(),
    category: CATEGORY,
    message: v.string(),
    fileId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.sessionToken);
    const subject = args.subject.trim();
    const message = args.message.trim();
    if (!subject) throw new ConvexError("Enter a subject for your ticket.");
    if (!message) throw new ConvexError("Enter a message describing your request.");

    const now = Date.now();
    const ticketId = await ctx.db.insert("supportTickets", {
      userId: user._id,
      subject,
      category: args.category,
      status: "open",
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("supportMessages", {
      ticketId,
      authorType: "user",
      authorId: user._id,
      body: message,
      fileId: args.fileId,
      createdAt: now,
    });

    return { ok: true as const, ticketId };
  },
});

export const postMessage = mutation({
  args: {
    sessionToken: v.string(),
    ticketId: v.id("supportTickets"),
    body: v.string(),
    fileId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.sessionToken);
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket || ticket.userId !== user._id) throw new ConvexError("Ticket not found.");
    if (ticket.status === "closed") {
      throw new ConvexError("This ticket is closed. Open a new ticket if you need further help.");
    }
    const body = args.body.trim();
    if (!body) throw new ConvexError("Enter a message.");

    const now = Date.now();
    await ctx.db.insert("supportMessages", {
      ticketId: args.ticketId,
      authorType: "user",
      authorId: user._id,
      body,
      fileId: args.fileId,
      createdAt: now,
    });
    await ctx.db.patch(args.ticketId, { status: "pending_admin", updatedAt: now });

    // A support reply isn't one of the "notify admins on user action" event
    // types wired up elsewhere — an assigned admin gets emailed directly
    // instead. An unassigned ticket just relies on the admin queue to surface it.
    if (ticket.assignedTo) {
      const assignedAdmin = await ctx.db.get(ticket.assignedTo);
      if (assignedAdmin) {
        await ctx.scheduler.runAfter(0, internal.emailActions.sendSupportTicketReplyEmail, {
          to: assignedAdmin.email,
          recipientName: assignedAdmin.name,
          ticketSubject: ticket.subject,
          messageBody: body,
          ticketId: args.ticketId,
          isAdminRecipient: true,
        });
      }
    }

    return { ok: true as const };
  },
});

/**
 * Fiat deposits don't have a dedicated table row (see docs/05-user-dashboard.md) —
 * a support ticket IS the request. The minimum is enforced here, not just
 * client-side, since createTicket alone has no concept of a deposit amount
 * to validate. Read from `settings` (admin-configurable, see
 * convex/admin/settings.ts) rather than hardcoded, per docs/06-admin-dashboard.md.
 */
export const requestFiatDeposit = mutation({
  args: { sessionToken: v.string(), amountUsd: v.number() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.sessionToken);
    const { fiatDepositMinimumUsd } = await getPlatformConfig(ctx);
    if (!Number.isFinite(args.amountUsd) || args.amountUsd < fiatDepositMinimumUsd) {
      throw new ConvexError(`Fiat deposits require a minimum of $${fiatDepositMinimumUsd.toLocaleString()}.`);
    }

    const now = Date.now();
    const ticketId = await ctx.db.insert("supportTickets", {
      userId: user._id,
      subject: `Fiat deposit request — $${args.amountUsd.toLocaleString()}`,
      category: "fiat_deposit",
      status: "open",
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("supportMessages", {
      ticketId,
      authorType: "user",
      authorId: user._id,
      body: `I'd like to make a fiat deposit of $${args.amountUsd.toLocaleString()}. Please send me your bank account details.`,
      createdAt: now,
    });

    // The ticket IS the fiat deposit request, but it also needs a `deposits`
    // row so /admin/deposits shows fiat alongside crypto in one queue (see
    // docs/06-admin-dashboard.md) — linked back via supportTicketId.
    const depositId = await ctx.db.insert("deposits", {
      userId: user._id,
      method: "fiat",
      amountUsd: args.amountUsd,
      supportTicketId: ticketId,
      status: "pending",
      createdAt: now,
    });
    await writeTransaction(ctx, {
      userId: user._id,
      type: "deposit",
      amount: args.amountUsd,
      status: "pending",
      relatedId: depositId,
    });
    await ctx.db.insert("notifications", {
      userId: user._id,
      type: "deposit_received",
      title: "Deposit Received",
      body: `Your $${args.amountUsd.toLocaleString()} fiat deposit request was received — check your support ticket for bank details.`,
      read: false,
      createdAt: now,
    });
    await notifyAdminsByRole(ctx, {
      roles: DEPOSIT_NOTIFY_ROLES,
      type: "admin_deposit_submitted",
      title: "New Deposit Submitted",
      body: `${user.firstName} ${user.lastName} requested a $${args.amountUsd.toLocaleString()} fiat deposit.`,
    });
    await ctx.scheduler.runAfter(0, internal.emailActions.sendDepositReceivedEmail, {
      to: user.email,
      firstName: user.firstName,
      amountUsd: args.amountUsd,
      method: "fiat",
      userId: user._id,
    });

    return { ok: true as const, ticketId, depositId };
  },
});

export const myTickets = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.sessionToken);
    return await ctx.db
      .query("supportTickets")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(100);
  },
});

export const ticketMessages = query({
  args: { sessionToken: v.string(), ticketId: v.id("supportTickets") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.sessionToken);
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket || ticket.userId !== user._id) throw new ConvexError("Ticket not found.");

    const messages = await ctx.db
      .query("supportMessages")
      .withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId))
      .collect();

    return {
      ticket,
      messages: await Promise.all(
        messages.map(async (m) => ({
          ...m,
          fileUrl: m.fileId ? await ctx.storage.getUrl(m.fileId) : null,
        }))
      ),
    };
  },
});
