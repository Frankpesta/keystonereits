import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, getCurrentAdmin } from "./lib/auth";

export const myNotifications = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.sessionToken);
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(200);
  },
});

export const unreadCount = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.sessionToken);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", user._id).eq("read", false))
      .take(100);
    return unread.length;
  },
});

export const markRead = mutation({
  args: { sessionToken: v.string(), notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.sessionToken);
    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== user._id) {
      throw new ConvexError("Notification not found.");
    }
    await ctx.db.patch(args.notificationId, { read: true });
    return { ok: true as const };
  },
});

export const markAllRead = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.sessionToken);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", user._id).eq("read", false))
      .take(200);
    for (const notification of unread) {
      await ctx.db.patch(notification._id, { read: true });
    }
    return { ok: true as const, count: unread.length };
  },
});

export const adminNotifications = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    return await ctx.db
      .query("notifications")
      .withIndex("by_admin", (q) => q.eq("adminId", admin._id))
      .order("desc")
      .take(200);
  },
});

export const adminUnreadCount = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_admin_read", (q) => q.eq("adminId", admin._id).eq("read", false))
      .take(100);
    return unread.length;
  },
});

export const markAdminRead = mutation({
  args: { sessionToken: v.string(), notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.adminId !== admin._id) {
      throw new ConvexError("Notification not found.");
    }
    await ctx.db.patch(args.notificationId, { read: true });
    return { ok: true as const };
  },
});

export const markAllAdminRead = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_admin_read", (q) => q.eq("adminId", admin._id).eq("read", false))
      .take(200);
    for (const notification of unread) {
      await ctx.db.patch(notification._id, { read: true });
    }
    return { ok: true as const, count: unread.length };
  },
});
