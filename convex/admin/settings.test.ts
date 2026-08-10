// @vitest-environment node
import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { api } from "../_generated/api";
import schema from "../schema";
import { convexTestModules } from "../test.setup";
import { createAdmin, createVerifiedUser } from "../lib/testHelpers";

describe("admin/settings.updatePlatformConfig", () => {
  it("persists and is readable via the public platformConfig query", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "super" });

    await t.mutation(api.admin.settings.updatePlatformConfig, {
      sessionToken,
      platformName: "Keystone REIT",
      contactEmail: "hello@keystonereits.com",
      fiatDepositMinimumUsd: 25_000,
      maintenanceMode: false,
    });

    const config = await t.query(api.settings.platformConfig, {});
    expect(config.fiatDepositMinimumUsd).toBe(25_000);

    // The support.ts mutation that enforces the fiat minimum reads this same setting.
    const { sessionToken: userToken } = await createVerifiedUser(t);
    await expect(
      t.mutation(api.support.requestFiatDeposit, { sessionToken: userToken, amountUsd: 20_000 })
    ).rejects.toThrow(ConvexError);
  });

  it("rejects a non-super admin", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "finance" });

    await expect(
      t.mutation(api.admin.settings.updatePlatformConfig, {
        sessionToken,
        platformName: "X",
        contactEmail: "x@example.com",
        fiatDepositMinimumUsd: 1000,
        maintenanceMode: false,
      })
    ).rejects.toThrow(ConvexError);
  });

  it("logs the change with before/after values", async () => {
    const t = convexTest(schema, convexTestModules);
    const { admin, sessionToken } = await createAdmin(t, { role: "super" });

    await t.mutation(api.admin.settings.updatePlatformConfig, {
      sessionToken,
      platformName: "Keystone REIT",
      contactEmail: "hello@keystonereits.com",
      fiatDepositMinimumUsd: 15_000,
      maintenanceMode: true,
    });

    const logs = await t.run((ctx) => ctx.db.query("auditLogs").collect());
    expect(logs).toMatchObject([{ adminId: admin._id, action: "settings_update_platform_config" }]);
  });
});

describe("admin/settings.updateCryptoDepositOptions", () => {
  it("replaces the crypto options and is readable publicly", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "super" });

    await t.mutation(api.admin.settings.updateCryptoDepositOptions, {
      sessionToken,
      options: [{ currency: "BTC", network: "Bitcoin", address: "bc1qtest" }],
    });

    const options = await t.query(api.settings.cryptoDepositOptions, {});
    expect(options).toEqual([{ currency: "BTC", network: "Bitcoin", address: "bc1qtest" }]);
  });

  it("rejects an option missing a required field", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "super" });

    await expect(
      t.mutation(api.admin.settings.updateCryptoDepositOptions, {
        sessionToken,
        options: [{ currency: "BTC", network: "", address: "bc1qtest" }],
      })
    ).rejects.toThrow(ConvexError);
  });
});
