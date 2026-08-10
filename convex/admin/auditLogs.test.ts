// @vitest-environment node
import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { api } from "../_generated/api";
import schema from "../schema";
import { convexTestModules } from "../test.setup";
import { createAdmin, createVerifiedUser } from "../lib/testHelpers";

describe("admin/auditLogs.list", () => {
  it("paginates and filters by admin", async () => {
    const t = convexTest(schema, convexTestModules);
    const { admin, sessionToken } = await createAdmin(t, { role: "compliance" });
    const { user } = await createVerifiedUser(t);

    await t.mutation(api.admin.users.updateStatus, { sessionToken, userId: user._id, status: "suspended", reason: "test" });
    await t.mutation(api.admin.users.updateStatus, { sessionToken, userId: user._id, status: "active", reason: "cleared" });

    const page = await t.query(api.admin.auditLogs.list, {
      sessionToken,
      paginationOpts: { numItems: 10, cursor: null },
      adminId: admin._id,
    });
    expect(page.page).toHaveLength(2);
    expect(page.page[0].performedByName).toBe(admin.name);
  });

  it("filters by targetType", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "compliance" });
    const { user } = await createVerifiedUser(t, { available: 500 });

    await t.mutation(api.admin.users.updateStatus, { sessionToken, userId: user._id, status: "suspended", reason: "test" });

    const page = await t.query(api.admin.auditLogs.list, {
      sessionToken,
      paginationOpts: { numItems: 10, cursor: null },
      targetType: "user",
    });
    expect(page.page).toHaveLength(1);
  });

  it("rejects a non-compliance, non-super admin", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "finance" });
    await expect(
      t.query(api.admin.auditLogs.list, { sessionToken, paginationOpts: { numItems: 10, cursor: null } })
    ).rejects.toThrow(ConvexError);
  });
});
