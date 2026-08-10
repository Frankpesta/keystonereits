// @vitest-environment node
import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { api } from "./_generated/api";
import schema from "./schema";
import { convexTestModules } from "./test.setup";
import { createVerifiedUser } from "./lib/testHelpers";

async function fakeUpload(t: ReturnType<typeof convexTest>) {
  return await t.run((ctx) => ctx.storage.store(new Blob(["fake document"], { type: "application/pdf" })));
}

const BASE_FIELDS = {
  fullName: "Jane Doe",
  dateOfBirth: "1990-01-01",
  address: "123 Main St, Springfield",
  documentType: "passport",
};

describe("kyc.submit", () => {
  it("creates a pending application and flips the user's kycStatus", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken, user } = await createVerifiedUser(t);
    const documentFileId = await fakeUpload(t);

    const result = await t.mutation(api.kyc.submit, { sessionToken, ...BASE_FIELDS, documentFileId });
    expect(result).toEqual({ ok: true });

    const application = await t.query(api.kyc.myApplication, { sessionToken });
    expect(application).toMatchObject({ status: "pending", fullName: "Jane Doe" });
    expect(application?.documentUrl).toBeTruthy();

    const updatedUser = await t.run((ctx) => ctx.db.get(user._id));
    expect(updatedUser?.kycStatus).toBe("pending");
  });

  it("rejects submission while a review is already pending", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createVerifiedUser(t, { kycStatus: "pending" });
    const documentFileId = await fakeUpload(t);

    await expect(
      t.mutation(api.kyc.submit, { sessionToken, ...BASE_FIELDS, documentFileId })
    ).rejects.toThrow(ConvexError);
  });

  it("rejects submission while approved", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createVerifiedUser(t, { kycStatus: "approved" });
    const documentFileId = await fakeUpload(t);

    await expect(
      t.mutation(api.kyc.submit, { sessionToken, ...BASE_FIELDS, documentFileId })
    ).rejects.toThrow(ConvexError);
  });

  it("allows resubmission after info_required and clears the prior review note", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken, user } = await createVerifiedUser(t, { kycStatus: "info_required" });
    const documentFileId = await fakeUpload(t);

    await t.run((ctx) =>
      ctx.db.insert("kycApplications", {
        userId: user._id,
        status: "info_required",
        fullName: "Old Name",
        dateOfBirth: "1990-01-01",
        address: "Old address",
        documentType: "passport",
        documentFileId,
        reviewNote: "Document was blurry, please retake.",
        submittedAt: Date.now() - 10_000,
      })
    );

    await t.mutation(api.kyc.submit, { sessionToken, ...BASE_FIELDS, documentFileId });

    const application = await t.query(api.kyc.myApplication, { sessionToken });
    expect(application?.status).toBe("pending");
    expect(application?.reviewNote).toBeUndefined();

    const rows = await t.run((ctx) => ctx.db.query("kycApplications").collect());
    expect(rows).toHaveLength(1); // patched in place, not a second row
  });

  it("returns null myApplication before any submission", async () => {
    const t = convexTest(schema, convexTestModules);
    const { sessionToken } = await createVerifiedUser(t);
    expect(await t.query(api.kyc.myApplication, { sessionToken })).toBeNull();
  });
});
