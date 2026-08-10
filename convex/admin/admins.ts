import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { getCurrentAdmin, requireRole } from "../lib/auth";
import { logAdminAction } from "../lib/audit";
import { hashPassword } from "../lib/password";
import { passwordSchema, emailSchema } from "../../src/lib/validation/auth";

const ROLE = v.union(
  v.literal("super"),
  v.literal("finance"),
  v.literal("kyc"),
  v.literal("investment"),
  v.literal("compliance"),
  v.literal("support"),
  v.literal("marketing")
);

export const list = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, ["super"]);
    return await ctx.db.query("admins").order("desc").take(200);
  },
});

export const create = mutation({
  args: { sessionToken: v.string(), name: v.string(), email: v.string(), password: v.string(), role: ROLE },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, ["super"]);

    const name = args.name.trim();
    if (!name) throw new ConvexError("Enter a name.");
    const emailParsed = emailSchema.safeParse(args.email);
    if (!emailParsed.success) throw new ConvexError("Enter a valid email address.");
    const passwordParsed = passwordSchema.safeParse(args.password);
    if (!passwordParsed.success) throw new ConvexError(passwordParsed.error.issues[0]?.message ?? "Invalid password.");

    const existing = await ctx.db.query("admins").withIndex("by_email", (q) => q.eq("email", emailParsed.data)).unique();
    if (existing) throw new ConvexError("An admin with this email already exists.");

    const adminId = await ctx.db.insert("admins", {
      email: emailParsed.data,
      passwordHash: await hashPassword(passwordParsed.data),
      name,
      role: args.role,
      status: "active",
      createdAt: Date.now(),
    });

    await logAdminAction(ctx, {
      adminId: admin._id,
      action: "admin_create",
      targetType: "admin",
      targetId: adminId,
      after: { email: emailParsed.data, role: args.role },
    });

    return { ok: true as const, adminId };
  },
});

export const updateRole = mutation({
  args: { sessionToken: v.string(), adminId: v.id("admins"), role: ROLE },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, ["super"]);
    if (args.adminId === admin._id) throw new ConvexError("You cannot change your own role.");

    const target = await ctx.db.get(args.adminId);
    if (!target) throw new ConvexError("Admin not found.");

    await ctx.db.patch(args.adminId, { role: args.role });
    await logAdminAction(ctx, {
      adminId: admin._id,
      action: "admin_role_update",
      targetType: "admin",
      targetId: args.adminId,
      before: { role: target.role },
      after: { role: args.role },
    });

    return { ok: true as const };
  },
});

export const setStatus = mutation({
  args: { sessionToken: v.string(), adminId: v.id("admins"), status: v.union(v.literal("active"), v.literal("disabled")) },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, ["super"]);
    if (args.adminId === admin._id) throw new ConvexError("You cannot disable your own account.");

    const target = await ctx.db.get(args.adminId);
    if (!target) throw new ConvexError("Admin not found.");

    await ctx.db.patch(args.adminId, { status: args.status });
    await logAdminAction(ctx, {
      adminId: admin._id,
      action: "admin_status_update",
      targetType: "admin",
      targetId: args.adminId,
      before: { status: target.status },
      after: { status: args.status },
    });

    return { ok: true as const };
  },
});
