// @vitest-environment node
import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { api } from "../_generated/api";
import schema from "../schema";
import { convexTestModules } from "../test.setup";
import { createAdmin } from "../lib/testHelpers";

describe("admin/admins.create", () => {
  it("creates a new admin with a hashed password", async () => {
    const t = convexTest(schema, convexTestModules);
    const { admin, sessionToken } = await createAdmin(t, { role: "super" });

    const result = await t.mutation(api.admin.admins.create, {
      sessionToken,
      name: "New Admin",
      email: "newadmin@example.com",
      password: "SuperSecret1",
      role: "finance",
    });
    expect(result.ok).toBe(true);

    const created = await t.run((ctx) => ctx.db.get(result.adminId));
    expect(created).toMatchObject({ email: "newadmin@example.com", role: "finance", status: "active" });
    expect(created?.passwordHash).not.toBe("SuperSecret1");

    const logs = await t.run((ctx) => ctx.db.query("auditLogs").collect());
    expect(logs).toMatchObject([{ adminId: admin._id, action: "admin_create" }]);
  });

  it("rejects a duplicate email", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "super", email: "dup@example.com" });

    await expect(
      t.mutation(api.admin.admins.create, {
        sessionToken,
        name: "Dup",
        email: "dup@example.com",
        password: "SuperSecret1",
        role: "finance",
      })
    ).rejects.toThrow(ConvexError);
  });

  it("rejects a non-super admin", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "finance" });

    await expect(
      t.mutation(api.admin.admins.create, {
        sessionToken,
        name: "New",
        email: "new@example.com",
        password: "SuperSecret1",
        role: "support",
      })
    ).rejects.toThrow(ConvexError);
  });
});

describe("admin/admins.updateRole + setStatus", () => {
  it("changes another admin's role", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "super" });
    const { admin: target } = await createAdmin(t, { role: "support" });

    await t.mutation(api.admin.admins.updateRole, { sessionToken, adminId: target._id, role: "finance" });
    const updated = await t.run((ctx) => ctx.db.get(target._id));
    expect(updated?.role).toBe("finance");
  });

  it("prevents an admin from changing their own role", async () => {
    const t = convexTest(schema, convexTestModules);
    const { admin, sessionToken } = await createAdmin(t, { role: "super" });

    await expect(
      t.mutation(api.admin.admins.updateRole, { sessionToken, adminId: admin._id, role: "support" })
    ).rejects.toThrow(ConvexError);
  });

  it("prevents an admin from disabling their own account", async () => {
    const t = convexTest(schema, convexTestModules);
    const { admin, sessionToken } = await createAdmin(t, { role: "super" });

    await expect(
      t.mutation(api.admin.admins.setStatus, { sessionToken, adminId: admin._id, status: "disabled" })
    ).rejects.toThrow(ConvexError);
  });

  it("disables another admin's account", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "super" });
    const { admin: target } = await createAdmin(t, { role: "support" });

    await t.mutation(api.admin.admins.setStatus, { sessionToken, adminId: target._id, status: "disabled" });
    const updated = await t.run((ctx) => ctx.db.get(target._id));
    expect(updated?.status).toBe("disabled");
  });
});
