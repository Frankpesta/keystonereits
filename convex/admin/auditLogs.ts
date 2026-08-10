import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { query } from "../_generated/server";
import { getCurrentAdmin, requireRole } from "../lib/auth";
import type { Doc } from "../_generated/dataModel";

const AUDIT_ROLES: Doc<"admins">["role"][] = ["super", "compliance"];

export const list = query({
  args: {
    sessionToken: v.string(),
    paginationOpts: paginationOptsValidator,
    adminId: v.optional(v.id("admins")),
    targetType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, AUDIT_ROLES);

    let dbQuery = args.adminId
      ? ctx.db.query("auditLogs").withIndex("by_admin", (q) => q.eq("adminId", args.adminId!)).order("desc")
      : ctx.db.query("auditLogs").order("desc");

    if (args.targetType) {
      dbQuery = dbQuery.filter((q) => q.eq(q.field("targetType"), args.targetType));
    }

    const page = await dbQuery.paginate(args.paginationOpts);
    const items = await Promise.all(
      page.page.map(async (entry) => {
        const performedBy = await ctx.db.get(entry.adminId);
        return { ...entry, performedByName: performedBy?.name };
      })
    );
    return { ...page, page: items };
  },
});
