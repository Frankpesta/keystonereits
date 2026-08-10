"use client";

import { useEffect } from "react";
import { useQuery } from "convex/react";

import { api } from "@/lib/convex-api";
import type { Doc } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { useKycWizardStore } from "@/stores/kyc-wizard-store";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DOCUMENT_TYPES } from "@/lib/validation/kyc";
import { formatDate } from "@/lib/format";
import { KycWizard } from "./kyc-wizard";

const RESUBMITTABLE_STATUSES = new Set(["not_started", "rejected", "info_required"]);

type KycApplicationView = Doc<"kycApplications"> & { documentUrl: string | null; selfieUrl: string | null };

function StatusOverview({ application }: { application: KycApplicationView }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Verification status</CardTitle>
          <StatusBadge status={application.status} />
        </div>
        <CardDescription>Submitted {formatDate(application.submittedAt)}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Full name</dt>
            <dd className="font-medium">{application.fullName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Document type</dt>
            <dd className="font-medium">
              {DOCUMENT_TYPES.find((d) => d.value === application.documentType)?.label ?? application.documentType}
            </dd>
          </div>
        </dl>
        {application.status === "under_review" && (
          <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            Our team is currently reviewing your submission. We&apos;ll notify you once a decision is made.
          </p>
        )}
        {application.status === "approved" && (
          <p className="rounded-lg bg-success/10 p-3 text-sm text-success">
            Your identity has been verified. You have full access to deposits, investments, and withdrawals.
          </p>
        )}
        {application.status === "pending" && (
          <p className="rounded-lg bg-warning/10 p-3 text-sm text-warning">
            Your application is in the queue and will be reviewed shortly.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function KycPage() {
  const sessionToken = useSessionToken();
  const application = useQuery(api.kyc.myApplication, { sessionToken });
  const reset = useKycWizardStore((s) => s.reset);

  const needsResubmission = application === null || RESUBMITTABLE_STATUSES.has(application?.status ?? "");

  // Enter every resubmission fresh, in case a prior aborted attempt left stale data.
  useEffect(() => {
    if (needsResubmission) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [application?._id]);

  if (application === undefined) return null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Identity Verification</h1>
        <p className="text-muted-foreground">
          Verify your identity to unlock deposits, investments, and withdrawals.
        </p>
      </div>

      {application && !needsResubmission && <StatusOverview application={application} />}

      {application?.status === "info_required" && application.reviewNote && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent>
            <p className="font-medium">Additional information requested</p>
            <p className="text-sm text-muted-foreground">{application.reviewNote}</p>
          </CardContent>
        </Card>
      )}
      {application?.status === "rejected" && application.reviewNote && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent>
            <p className="font-medium">Application rejected</p>
            <p className="text-sm text-muted-foreground">{application.reviewNote}</p>
          </CardContent>
        </Card>
      )}

      {needsResubmission && <KycWizard />}
    </div>
  );
}
