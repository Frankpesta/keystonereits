// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { api } from "../_generated/api";
import schema from "../schema";
import { convexTestModules } from "../test.setup";
import { createAdmin, createVerifiedUser } from "../lib/testHelpers";
import type { Id } from "../_generated/dataModel";

async function seedApplication(t: ReturnType<typeof convexTest>, userId: Id<"users">) {
  const documentFileId = await t.run((ctx) => ctx.storage.store(new Blob(["doc"], { type: "application/pdf" })));
  return await t.run((ctx) =>
    ctx.db.insert("kycApplications", {
      userId,
      status: "pending",
      fullName: "Jane Doe",
      dateOfBirth: "1990-01-01",
      address: "123 Main St",
      documentType: "passport",
      documentFileId,
      submittedAt: Date.now(),
    })
  );
}

describe("admin/kyc.queue + detail", () => {
  it("lists applications filtered by status, joined with the user's name", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "kyc" });
    const { user } = await createVerifiedUser(t, { firstName: "Ada", lastName: "Lovelace" });
    await seedApplication(t, user._id);

    const queue = await t.query(api.admin.kyc.queue, { sessionToken, status: "pending" });
    expect(queue).toHaveLength(1);
    expect(queue[0].userName).toBe("Ada Lovelace");
  });

  it("detail resolves a signed document URL", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "kyc" });
    const { user } = await createVerifiedUser(t);
    const applicationId = await seedApplication(t, user._id);

    const detail = await t.query(api.admin.kyc.detail, { sessionToken, applicationId });
    expect(detail.documentUrl).toBeTruthy();
    expect(detail.selfieUrl).toBeNull();
  });

  it("rejects a marketing-role admin", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "marketing" });
    await expect(t.query(api.admin.kyc.queue, { sessionToken })).rejects.toThrow(ConvexError);
  });
});

describe("admin/kyc.approve/reject/requestInfo", () => {
  it("approve flips application + user status and notifies the user", async () => {
    const t = convexTest(schema, convexTestModules);
    const { admin, sessionToken } = await createAdmin(t, { role: "kyc" });
    const { user } = await createVerifiedUser(t);
    const applicationId = await seedApplication(t, user._id);

    await t.mutation(api.admin.kyc.approve, { sessionToken, applicationId });

    const application = await t.run((ctx) => ctx.db.get(applicationId));
    expect(application?.status).toBe("approved");
    expect(application?.reviewedBy).toBe(admin._id);

    const updatedUser = await t.run((ctx) => ctx.db.get(user._id));
    expect(updatedUser?.kycStatus).toBe("approved");

    const notifications = await t.run((ctx) => ctx.db.query("notifications").collect());
    expect(notifications).toMatchObject([{ userId: user._id, type: "kyc_approved" }]);

    const logs = await t.run((ctx) => ctx.db.query("auditLogs").collect());
    expect(logs).toMatchObject([{ action: "kyc_approve" }]);

    vi.useFakeTimers();
    try {
      await t.finishAllScheduledFunctions(vi.runAllTimers);
    } finally {
      vi.useRealTimers();
    }
    const emailLog = await t.run((ctx) => ctx.db.query("emailLog").collect());
    expect(emailLog).toMatchObject([{ recipientEmail: user.email, status: "sent" }]);
  });

  it("reject requires a reason and stores it as reviewNote", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "kyc" });
    const { user } = await createVerifiedUser(t);
    const applicationId = await seedApplication(t, user._id);

    await expect(
      t.mutation(api.admin.kyc.reject, { sessionToken, applicationId, reason: "" })
    ).rejects.toThrow(ConvexError);

    await t.mutation(api.admin.kyc.reject, { sessionToken, applicationId, reason: "Document expired." });
    const application = await t.run((ctx) => ctx.db.get(applicationId));
    expect(application).toMatchObject({ status: "rejected", reviewNote: "Document expired." });
  });

  it("requestInfo sets info_required on both application and user", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "compliance" });
    const { user } = await createVerifiedUser(t);
    const applicationId = await seedApplication(t, user._id);

    await t.mutation(api.admin.kyc.requestInfo, {
      sessionToken,
      applicationId,
      reason: "Please upload a clearer photo.",
    });

    const application = await t.run((ctx) => ctx.db.get(applicationId));
    expect(application?.status).toBe("info_required");
    const updatedUser = await t.run((ctx) => ctx.db.get(user._id));
    expect(updatedUser?.kycStatus).toBe("info_required");
  });

  it("rejects a finance-role admin from approving", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createAdmin(t, { role: "finance" });
    const { user } = await createVerifiedUser(t);
    const applicationId = await seedApplication(t, user._id);

    await expect(t.mutation(api.admin.kyc.approve, { sessionToken, applicationId })).rejects.toThrow(ConvexError);
  });
});
