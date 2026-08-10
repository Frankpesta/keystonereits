import type { Id } from "@/lib/convex-api";

/**
 * Convex file uploads are a two-step handshake: a mutation mints a
 * short-lived signed URL, then the file is POSTed to it directly (bypassing
 * the Convex function call size limit). Shared by the KYC and support-ticket
 * attachment flows.
 */
export async function uploadFile(uploadUrl: string, file: File): Promise<Id<"_storage">> {
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!res.ok) throw new Error("File upload failed. Please try again.");
  const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };
  return storageId;
}
