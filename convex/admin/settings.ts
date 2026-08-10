import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";
import { getCurrentAdmin, requireRole } from "../lib/auth";
import { logAdminAction } from "../lib/audit";
import { CRYPTO_DEPOSIT_OPTIONS_KEY, PLATFORM_CONFIG_KEY, getPlatformConfig, type CryptoDepositOption } from "../settings";

export const updatePlatformConfig = mutation({
  args: {
    sessionToken: v.string(),
    platformName: v.string(),
    contactEmail: v.string(),
    fiatDepositMinimumUsd: v.number(),
    maintenanceMode: v.boolean(),
  },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, ["super"]);

    const platformName = args.platformName.trim();
    const contactEmail = args.contactEmail.trim();
    if (!platformName) throw new ConvexError("Enter a platform name.");
    if (!contactEmail) throw new ConvexError("Enter a contact email.");
    if (!Number.isFinite(args.fiatDepositMinimumUsd) || args.fiatDepositMinimumUsd <= 0) {
      throw new ConvexError("Enter a valid fiat deposit minimum.");
    }

    const before = await getPlatformConfig(ctx);
    const next = {
      platformName,
      contactEmail,
      fiatDepositMinimumUsd: args.fiatDepositMinimumUsd,
      maintenanceMode: args.maintenanceMode,
    };

    const row = await ctx.db.query("settings").withIndex("by_key", (q) => q.eq("key", PLATFORM_CONFIG_KEY)).unique();
    if (row) {
      await ctx.db.patch(row._id, { value: next });
    } else {
      await ctx.db.insert("settings", { key: PLATFORM_CONFIG_KEY, value: next });
    }

    await logAdminAction(ctx, {
      adminId: admin._id,
      action: "settings_update_platform_config",
      targetType: "settings",
      targetId: PLATFORM_CONFIG_KEY,
      before,
      after: next,
    });

    return { ok: true as const };
  },
});

export const updateCryptoDepositOptions = mutation({
  args: {
    sessionToken: v.string(),
    options: v.array(
      v.object({
        currency: v.string(),
        network: v.string(),
        address: v.string(),
        note: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const admin = await getCurrentAdmin(ctx, args.sessionToken);
    requireRole(admin, ["super"]);

    const options: CryptoDepositOption[] = args.options.map((o) => ({
      currency: o.currency.trim(),
      network: o.network.trim(),
      address: o.address.trim(),
      note: o.note?.trim() || undefined,
    }));
    for (const o of options) {
      if (!o.currency || !o.network || !o.address) {
        throw new ConvexError("Every crypto option needs a currency, network, and address.");
      }
    }

    const row = await ctx.db.query("settings").withIndex("by_key", (q) => q.eq("key", CRYPTO_DEPOSIT_OPTIONS_KEY)).unique();
    const before = (row?.value as CryptoDepositOption[] | undefined) ?? [];
    if (row) {
      await ctx.db.patch(row._id, { value: options });
    } else {
      await ctx.db.insert("settings", { key: CRYPTO_DEPOSIT_OPTIONS_KEY, value: options });
    }

    await logAdminAction(ctx, {
      adminId: admin._id,
      action: "settings_update_crypto_options",
      targetType: "settings",
      targetId: CRYPTO_DEPOSIT_OPTIONS_KEY,
      before: { count: before.length },
      after: { count: options.length },
    });

    return { ok: true as const };
  },
});
