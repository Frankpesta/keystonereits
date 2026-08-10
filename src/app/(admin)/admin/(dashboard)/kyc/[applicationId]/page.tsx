"use client";

import { useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

import { api } from "@/lib/convex-api";
import type { Id } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { getConvexErrorMessage } from "@/lib/convex-error";
import { formatDate } from "@/lib/format";
import { DOCUMENT_TYPES } from "@/lib/validation/kyc";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

function ReasonDialog({
  triggerLabel,
  title,
  description,
  onSubmit,
}: {
  triggerLabel: string;
  title: string;
  description: string;
  onSubmit: (reason: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Enter a reason.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(reason.trim());
      setOpen(false);
      setReason("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason..." />
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2Icon className="size-4 animate-spin" /> : "Confirm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminKycDetailPage() {
  const params = useParams<{ applicationId: string }>();
  const router = useRouter();
  const sessionToken = useSessionToken();
  const applicationId = params.applicationId as Id<"kycApplications">;
  const detail = useQuery(api.admin.kyc.detail, { sessionToken, applicationId });
  const approve = useMutation(api.admin.kyc.approve);
  const reject = useMutation(api.admin.kyc.reject);
  const requestInfo = useMutation(api.admin.kyc.requestInfo);
  const [approving, setApproving] = useState(false);

  if (detail === undefined) return null;

  const isDecided = detail.status !== "pending" && detail.status !== "under_review";

  async function handleApprove() {
    setApproving(true);
    try {
      await approve({ sessionToken, applicationId });
      toast.success("Application approved.");
      router.push("/admin/kyc");
    } catch (err) {
      toast.error(getConvexErrorMessage(err));
    } finally {
      setApproving(false);
    }
  }

  async function handleReject(reason: string) {
    try {
      await reject({ sessionToken, applicationId, reason });
      toast.success("Application rejected.");
      router.push("/admin/kyc");
    } catch (err) {
      toast.error(getConvexErrorMessage(err));
    }
  }

  async function handleRequestInfo(reason: string) {
    try {
      await requestInfo({ sessionToken, applicationId, reason });
      toast.success("Requested more information from the user.");
      router.push("/admin/kyc");
    } catch (err) {
      toast.error(getConvexErrorMessage(err));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">{detail.fullName}</h1>
          <p className="text-muted-foreground">
            {detail.user?.email} · Submitted {formatDate(detail.submittedAt)}
          </p>
        </div>
        <StatusBadge status={detail.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Full name</dt>
              <dd className="font-medium">{detail.fullName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Date of birth</dt>
              <dd className="font-medium">{detail.dateOfBirth}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Address</dt>
              <dd className="font-medium">{detail.address}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Document type</dt>
              <dd className="font-medium">
                {DOCUMENT_TYPES.find((d) => d.value === detail.documentType)?.label ?? detail.documentType}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Identity document</CardTitle>
          </CardHeader>
          <CardContent>
            {detail.documentUrl ? (
              <a href={detail.documentUrl} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element -- signed Convex storage URL, not a static asset */}
                <img src={detail.documentUrl} alt="Identity document" className="max-h-80 w-full rounded-lg border object-contain" />
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">No document on file.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Selfie</CardTitle>
          </CardHeader>
          <CardContent>
            {detail.selfieUrl ? (
              <a href={detail.selfieUrl} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element -- signed Convex storage URL, not a static asset */}
                <img src={detail.selfieUrl} alt="Selfie" className="max-h-80 w-full rounded-lg border object-contain" />
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">No selfie submitted.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {!isDecided && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleApprove} disabled={approving}>
            {approving ? <Loader2Icon className="size-4 animate-spin" /> : "Approve"}
          </Button>
          <ReasonDialog
            triggerLabel="Request More Info"
            title="Request more information"
            description="This note is shown to the user and they can resubmit."
            onSubmit={handleRequestInfo}
          />
          <ReasonDialog
            triggerLabel="Reject"
            title="Reject application"
            description="This note is shown to the user as the rejection reason."
            onSubmit={handleReject}
          />
        </div>
      )}
    </div>
  );
}
