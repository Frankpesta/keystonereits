import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentAdmin } from "./lib/auth";

/** Throws if the session is missing/expired/invalid — callers redirect to /admin/login on error. */
export const currentAdmin = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    return {
      _id: admin._id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };
  },
});
