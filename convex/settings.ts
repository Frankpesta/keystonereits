import { query } from "./_generated/server";
import type { QueryCtx, MutationCtx } from "./_generated/server";

/**
 * `settings` rows are a generic key/value store (schema.ts); this file gives
 * each key a typed public read. Values are maintained via /admin/settings
 * (convex/admin/settings.ts) — for MVP the initial rows are written once by
 * seed.ts so the app has something to read before an admin ever visits that
 * page.
 */

export type CryptoDepositOption = {
  currency: string; // e.g. "USDT", "BTC", "ETH"
  network: string; // e.g. "TRC20", "ERC20", "Bitcoin"
  address: string;
  note?: string;
};

export const CRYPTO_DEPOSIT_OPTIONS_KEY = "crypto_deposit_options";

/** Public — powers the deposit page's crypto currency/network/address picker. */
export const cryptoDepositOptions = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", CRYPTO_DEPOSIT_OPTIONS_KEY))
      .unique();
    return (row?.value as CryptoDepositOption[] | undefined) ?? [];
  },
});

export type PlatformConfig = {
  platformName: string;
  contactEmail: string;
  fiatDepositMinimumUsd: number;
  maintenanceMode: boolean;
};

export const PLATFORM_CONFIG_KEY = "platform_config";

export const DEFAULT_PLATFORM_CONFIG: PlatformConfig = {
  platformName: "Keystone REIT",
  contactEmail: "support@keystonereits.com",
  fiatDepositMinimumUsd: 10_000,
  maintenanceMode: false,
};

/** Shared by the public query below and any mutation that needs a config value (e.g. support.ts's fiat minimum check). */
export async function getPlatformConfig(ctx: QueryCtx | MutationCtx): Promise<PlatformConfig> {
  const row = await ctx.db
    .query("settings")
    .withIndex("by_key", (q) => q.eq("key", PLATFORM_CONFIG_KEY))
    .unique();
  return { ...DEFAULT_PLATFORM_CONFIG, ...(row?.value as Partial<PlatformConfig> | undefined) };
}

/** Public — the fiat minimum and platform name are read from here on both the marketing/user surfaces. */
export const platformConfig = query({
  args: {},
  handler: async (ctx) => getPlatformConfig(ctx),
});
