import { z } from "zod";

/** Shared between the KYC wizard's personal-info step and convex/kyc.ts. */
export const kycPersonalSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  dateOfBirth: z.string().trim().min(1, "Date of birth is required"),
  address: z.string().trim().min(1, "Address is required"),
  documentType: z.string().trim().min(1, "Select a document type"),
});

export type KycPersonalInput = z.infer<typeof kycPersonalSchema>;

export const DOCUMENT_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "national_id", label: "National ID Card" },
  { value: "drivers_license", label: "Driver's License" },
] as const;
