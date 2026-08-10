"use client";

import { useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

import { api } from "@/lib/convex-api";
import type { Id } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { getConvexErrorMessage } from "@/lib/convex-error";
import { formatCurrency, formatDate } from "@/lib/format";
import { computeInvestmentProgress } from "@/lib/investment-progress";
import { StatusBadge, formatLabel } from "@/components/shared/status-badge";
import { InvestmentProgressBar } from "@/components/user/investment-progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

type OverrideAction = "pause" | "end" | "restart";

function OverrideDialog({
  action,
  label,
  description,
  onConfirm,
  disabled,
}: {
  action: OverrideAction;
  label: string;
  description: string;
  onConfirm: (reason: string) => Promise<void>;
  disabled?: boolean;
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
      await onConfirm(reason.trim());
      setOpen(false);
      setReason("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={action === "restart" ? "default" : "outline"} disabled={disabled}>
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{label} this investment?</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Textarea
            placeholder="Reason (required, shown to the user)..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
          <AlertDialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2Icon className="size-4 animate-spin" /> : `Confirm ${label}`}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function AdminInvestmentDetailPage() {
  const params = useParams<{ investmentId: string }>();
  const sessionToken = useSessionToken();
  const investmentId = params.investmentId as Id<"investments">;
  const detail = useQuery(api.admin.investments.detail, { sessionToken, investmentId });
  const pause = useMutation(api.admin.investments.pause);
  const end = useMutation(api.admin.investments.end);
  const restart = useMutation(api.admin.investments.restart);
  const [now] = useState(() => Date.now());

  if (detail === undefined) return null;

  async function runOverride(mutationFn: typeof pause, reason: string) {
    try {
      await mutationFn({ sessionToken, investmentId, reason });
      toast.success("Investment updated.");
    } catch (err) {
      toast.error(getConvexErrorMessage(err));
      throw err;
    }
  }

  const canPause = detail.status === "active" || detail.status === "maturing";
  const canEnd = detail.status === "active" || detail.status === "maturing" || detail.status === "admin_paused";
  const canRestart = detail.status === "admin_paused";
  const progress = computeInvestmentProgress(detail.startDate, detail.maturityDate, now);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">{detail.plan?.name ?? "Investment"}</h1>
          <p className="text-muted-foreground">
            {detail.user ? `${detail.user.firstName} ${detail.user.lastName}` : "Unknown investor"} ·{" "}
            {detail.user?.email}
          </p>
        </div>
        <StatusBadge status={detail.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <InvestmentProgressBar progress={progress} />
          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">Amount</dt>
              <dd className="font-medium">{formatCurrency(detail.amount)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Accrued profit</dt>
              <dd className="font-medium">{formatCurrency(detail.accruedProfit)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Start date</dt>
              <dd className="font-medium">{formatDate(detail.startDate)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Maturity date</dt>
              <dd className="font-medium">{formatDate(detail.maturityDate)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <OverrideDialog
          action="pause"
          label="Pause"
          description="Pausing stops future daily profit accrual for this investment until restarted."
          onConfirm={(reason) => runOverride(pause, reason)}
          disabled={!canPause}
        />
        <OverrideDialog
          action="restart"
          label="Restart"
          description="Restarting resumes daily accrual for this investment."
          onConfirm={(reason) => runOverride(restart, reason)}
          disabled={!canRestart}
        />
        <OverrideDialog
          action="end"
          label="End"
          description="Ending an investment is not reversible from here — use manual balance adjustment separately if principal needs to be returned."
          onConfirm={(reason) => runOverride(end, reason)}
          disabled={!canEnd}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Override history</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {detail.overrides.length === 0 ? (
            <p className="text-sm text-muted-foreground">No manual overrides yet.</p>
          ) : (
            detail.overrides.map((o) => (
              <div key={o._id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <div>
                  <p className="font-medium">{formatLabel(o.action)}</p>
                  <p className="text-muted-foreground">{o.reason}</p>
                </div>
                <span className="text-muted-foreground">{formatDate(o.createdAt)}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
