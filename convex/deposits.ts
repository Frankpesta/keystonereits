import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { getCurrentUser } from "./lib/auth";
import { writeTransaction } from "./lib/ledger";
import { notifyAdminsByRole } from "./lib/notify";
import { CRYPTO_DEPOSIT_OPTIONS_KEY, type CryptoDepositOption } from "./settings";
import type { Doc } from "./_generated/dataModel";

const DEPOSIT_NOTIFY_ROLES: Doc<"admins">["role"][] = ["super", "finance"];

export const generateUploadUrl = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await getCurrentUser(ctx, args.sessionToken);
    return await ctx.storage.generateUploadUrl();
  },
});

export const submitCrypto = mutation({
  args: {
    sessionToken: v.string(),
    amountUsd: v.number(),
    currency: v.string(),
    network: v.string(),
    proofFileId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.sessionToken);

    if (!Number.isFinite(args.amountUsd) || args.amountUsd <= 0) {
      throw new ConvexError("Enter a valid deposit amount.");
    }

    const optionsRow = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", CRYPTO_DEPOSIT_OPTIONS_KEY))
      .unique();
    const options = (optionsRow?.value as CryptoDepositOption[] | undefined) ?? [];
    const validOption = options.some(
      (o) => o.currency === args.currency && o.network === args.network
    );
    if (!validOption) throw new ConvexError("Select a supported currency and network.");

    const depositId = await ctx.db.insert("deposits", {
      userId: user._id,
      method: "crypto",
      amountUsd: args.amountUsd,
      currency: args.currency,
      network: args.network,
      proofFileId: args.proofFileId,
      status: "pending",
      createdAt: Date.now(),
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
      body: `Your $${args.amountUsd.toLocaleString()} crypto deposit was received and is pending verification.`,
      read: false,
      createdAt: Date.now(),
    });
    await notifyAdminsByRole(ctx, {
      roles: DEPOSIT_NOTIFY_ROLES,
      type: "admin_deposit_submitted",
      title: "New Deposit Submitted",
      body: `${user.firstName} ${user.lastName} submitted a $${args.amountUsd.toLocaleString()} crypto deposit for review.`,
    });
    await ctx.scheduler.runAfter(0, internal.emailActions.sendDepositReceivedEmail, {
      to: user.email,
      firstName: user.firstName,
      amountUsd: args.amountUsd,
      method: "crypto",
      userId: user._id,
    });

    return { ok: true as const, depositId };
  },
});

export const myDeposits = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx, args.sessionToken);
    return await ctx.db
      .query("deposits")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);
  },
});
