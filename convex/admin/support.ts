import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import { getCurrentAdmin, requireRole } from "../lib/auth";
import type { Doc } from "../_generated/dataModel";

const SUPPORT_ROLES: Doc<"admins">["role"][] = ["super", "support"];
const CATEGORY = v.union(
  v.literal("fiat_deposit"),
  v.literal("general"),
  v.literal("kyc"),
  v.literal("withdrawal"),
  v.literal("other")
);
const STATUS = v.union(v.literal("open"), v.literal("pending_admin"), v.literal("pending_user"), v.literal("closed"));

export const queue = query({
  args: { sessionToken: v.string(), status: v.optional(STATUS), category: v.optional(CATEGORY) },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, SUPPORT_ROLES);

    const all = args.status
      ? await ctx.db.query("supportTickets").withIndex("by_status", (q) => q.eq("status", args.status!)).order("desc").take(300)
      : await ctx.db.query("supportTickets").order("desc").take(300);

    const filtered = all.filter((t) => !args.category || t.category === args.category);
    return await Promise.all(
      filtered.map(async (ticket) => {
        const [user, assignedAdmin] = await Promise.all([
          ctx.db.get(ticket.userId),
          ticket.assignedTo ? ctx.db.get(ticket.assignedTo) : null,
        ]);
        return {
          ...ticket,
          userName: user ? `${user.firstName} ${user.lastName}` : "Unknown user",
          userEmail: user?.email,
          assignedAdminName: assignedAdmin?.name,
        };
      })
    );
  },
});

export const thread = query({
  args: { sessionToken: v.string(), ticketId: v.id("supportTickets") },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, SUPPORT_ROLES);

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new ConvexError("Ticket not found.");
    const [user, messages] = await Promise.all([
      ctx.db.get(ticket.userId),
      ctx.db.query("supportMessages").withIndex("by_ticket", (q) => q.eq("ticketId", args.ticketId)).collect(),
    ]);

    return {
      ticket,
      user,
      messages: await Promise.all(
        messages.map(async (m) => ({ ...m, fileUrl: m.fileId ? await ctx.storage.getUrl(m.fileId) : null }))
      ),
    };
  },
});

/**
 * Writes into the SAME `supportMessages`/`supportTickets` rows the user's
 * Phase-5 thread view subscribes to via useQuery — no separate "push" step
 * needed for the reply to show up in real time on their side.
 */
export const reply = mutation({
  args: { sessionToken: v.string(), ticketId: v.id("supportTickets"), body: v.string(), fileId: v.optional(v.id("_storage")) },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, SUPPORT_ROLES);

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new ConvexError("Ticket not found.");
    const body = args.body.trim();
    if (!body) throw new ConvexError("Enter a message.");

    const now = Date.now();
    await ctx.db.insert("supportMessages", {
      ticketId: args.ticketId,
      authorType: "admin",
      authorId: admin._id,
      body,
      fileId: args.fileId,
      createdAt: now,
    });
    await ctx.db.patch(args.ticketId, { status: "pending_user", updatedAt: now });

    await ctx.db.insert("notifications", {
      userId: ticket.userId,
      type: "support_reply",
      title: "New Reply on Your Ticket",
      body: `Support replied to "${ticket.subject}".`,
      relatedId: args.ticketId,
      read: false,
      createdAt: now,
    });
    const user = await ctx.db.get(ticket.userId);
    if (user) {
      await ctx.scheduler.runAfter(0, internal.emailActions.sendSupportTicketReplyEmail, {
        to: user.email,
        recipientName: user.firstName,
        ticketSubject: ticket.subject,
        messageBody: body,
        ticketId: args.ticketId,
        isAdminRecipient: false,
        userId: user._id,
      });
    }

    return { ok: true as const };
  },
});

export const assign = mutation({
  args: { sessionToken: v.string(), ticketId: v.id("supportTickets"), assignedTo: v.union(v.id("admins"), v.null()) },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, SUPPORT_ROLES);

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new ConvexError("Ticket not found.");
    await ctx.db.patch(args.ticketId, { assignedTo: args.assignedTo ?? undefined, updatedAt: Date.now() });

    return { ok: true as const };
  },
});

export const close = mutation({
  args: { sessionToken: v.string(), ticketId: v.id("supportTickets") },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, SUPPORT_ROLES);

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new ConvexError("Ticket not found.");
    await ctx.db.patch(args.ticketId, { status: "closed", updatedAt: Date.now() });

    return { ok: true as const };
  },
});
