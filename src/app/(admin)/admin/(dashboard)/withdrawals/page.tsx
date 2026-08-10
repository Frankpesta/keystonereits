"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

import { api } from "@/lib/convex-api";
import type { Id } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { getConvexErrorMessage } from "@/lib/convex-error";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge, formatLabel } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const NEXT_STEP: Record<string, { label: string; mutation: "approve" | "markProcessing" | "complete" } | undefined> = {
  pending: { label: "Approve", mutation: "approve" },
  under_review: { label: "Approve", mutation: "approve" },
  approved: { label: "Mark Processing", mutation: "markProcessing" },
  processing: { label: "Mark Completed", mutation: "complete" },
};

function WithdrawalDrawer({ withdrawalId, onClose }: { withdrawalId: Id<"withdrawals">; onClose: () => void }) {
  const sessionToken = useSessionToken();
  const detail = useQuery(api.admin.withdrawals.detail, { sessionToken, withdrawalId });
  const approve = useMutation(api.admin.withdrawals.approve);
  const markProcessing = useMutation(api.admin.withdrawals.markProcessing);
  const complete = useMutation(api.admin.withdrawals.complete);
  const rejectOrFail = useMutation(api.admin.withdrawals.rejectOrFail);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!detail) return null;
  const nextStep = NEXT_STEP[detail.status];
  const isTerminal = ["completed", "rejected", "failed", "cancelled"].includes(detail.status);

  async function advance() {
    if (!nextStep) return;
    setSubmitting(true);
    try {
      const mutations = { approve, markProcessing, complete };
      await mutations[nextStep.mutation]({ sessionToken, withdrawalId });
      toast.success(`Withdrawal moved to ${nextStep.label === "Approve" ? "approved" : nextStep.label.toLowerCase()}.`);
      onClose();
    } catch (err) {
      toast.error(getConvexErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOutcome(e: FormEvent, outcome: "rejected" | "failed") {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Enter a reason.");
      return;
    }
    setSubmitting(true);
    try {
      await rejectOrFail({ sessionToken, withdrawalId, outcome, reason: reason.trim() });
      toast.success(`Withdrawal marked ${outcome}.`);
      onClose();
    } catch (err) {
      toast.error(getConvexErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SheetContent className="flex flex-col gap-6 overflow-y-auto sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Withdrawal request</SheetTitle>
        <SheetDescription>Requested {formatDate(detail.createdAt)}</SheetDescription>
      </SheetHeader>
      <div className="flex flex-col gap-4 px-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">User</span>
          <span className="font-medium">{detail.user ? `${detail.user.firstName} ${detail.user.lastName}` : "Unknown"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Source</span>
          <span className="font-medium">{formatLabel(detail.balanceSource)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-medium">{formatCurrency(detail.amountUsd)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Current balance ({detail.balanceSource})</span>
          <span className="font-medium">{formatCurrency(detail.balance?.[detail.balanceSource] ?? 0)}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground">Destination</span>
          <code className="break-all rounded bg-muted p-2 text-xs">
            {detail.walletAddress} ({detail.network})
          </code>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Status</span>
          <StatusBadge status={detail.status} />
        </div>
      </div>

      {!isTerminal && (
        <div className="flex flex-col gap-3 border-t px-4 pt-4">
          {nextStep && (
            <Button onClick={advance} disabled={submitting}>
              {submitting ? <Loader2Icon className="size-4 animate-spin" /> : nextStep.label}
            </Button>
          )}
          <Textarea placeholder="Reason for reject/fail..." value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" disabled={submitting} onClick={(e) => handleOutcome(e, "rejected")}>
              Reject
            </Button>
            <Button type="button" variant="outline" className="flex-1" disabled={submitting} onClick={(e) => handleOutcome(e, "failed")}>
              Fail
            </Button>
          </div>
        </div>
      )}
    </SheetContent>
  );
}

export default function AdminWithdrawalsPage() {
  const sessionToken = useSessionToken();
  const [status, setStatus] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<Id<"withdrawals"> | null>(null);

  const withdrawals = useQuery(api.admin.withdrawals.list, {
    sessionToken,
    status:
      status === "all"
        ? undefined
        : (status as
            | "pending"
            | "under_review"
            | "approved"
            | "processing"
            | "completed"
            | "rejected"
            | "failed"
            | "cancelled"),
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Withdrawals</h1>
        <p className="text-muted-foreground">Approve, process, and complete withdrawal requests.</p>
      </div>

      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="sm:w-56" aria-label="Filter by status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="under_review">Under Review</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="processing">Processing</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
        </SelectContent>
      </Select>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(withdrawals ?? []).map((w) => (
                <TableRow
                  key={w._id}
                  className="cursor-pointer"
                  tabIndex={0}
                  role="button"
                  onClick={() => setSelectedId(w._id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedId(w._id);
                    }
                  }}
                >
                  <TableCell>{w.userName}</TableCell>
                  <TableCell>{formatLabel(w.balanceSource)}</TableCell>
                  <TableCell>{formatCurrency(w.amountUsd)}</TableCell>
                  <TableCell>
                    <StatusBadge status={w.status} />
                  </TableCell>
                  <TableCell>{formatDate(w.createdAt)}</TableCell>
                </TableRow>
              ))}
              {withdrawals && withdrawals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No withdrawals match these filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        {selectedId && <WithdrawalDrawer withdrawalId={selectedId} onClose={() => setSelectedId(null)} />}
      </Sheet>
    </div>
  );
}
