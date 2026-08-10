"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
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

function DepositDrawer({ depositId, onClose }: { depositId: Id<"deposits">; onClose: () => void }) {
  const sessionToken = useSessionToken();
  const detail = useQuery(api.admin.deposits.detail, { sessionToken, depositId });
  const verifyAndCredit = useMutation(api.admin.deposits.verifyAndCredit);
  const reject = useMutation(api.admin.deposits.reject);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleCredit() {
    setSubmitting(true);
    try {
      await verifyAndCredit({ sessionToken, depositId });
      toast.success("Deposit credited.");
      onClose();
    } catch (err) {
      toast.error(getConvexErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject(e: FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Enter a reason.");
      return;
    }
    setSubmitting(true);
    try {
      await reject({ sessionToken, depositId, reason: reason.trim() });
      toast.success("Deposit rejected.");
      onClose();
    } catch (err) {
      toast.error(getConvexErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!detail) return null;
  const isPending = detail.status === "pending" || detail.status === "under_review";

  return (
    <SheetContent className="flex flex-col gap-6 overflow-y-auto sm:max-w-md">
      <SheetHeader>
        <SheetTitle>{formatLabel(detail.method)} deposit</SheetTitle>
        <SheetDescription>Submitted {formatDate(detail.createdAt)}</SheetDescription>
      </SheetHeader>
      <div className="flex flex-col gap-4 px-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-medium">{formatCurrency(detail.amountUsd)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">User</span>
          <span className="font-medium">
            {detail.user ? `${detail.user.firstName} ${detail.user.lastName}` : "Unknown"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">User KYC status</span>
          <StatusBadge status={detail.user?.kycStatus ?? "not_started"} />
        </div>
        {detail.method === "crypto" ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Currency / Network</span>
              <span className="font-medium">
                {detail.currency} ({detail.network})
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Transaction hash</span>
              <code className="break-all rounded bg-muted p-2 text-xs">{detail.txHash}</code>
            </div>
          </>
        ) : (
          detail.supportTicket && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Support ticket</span>
              <Link href={`/admin/support/${detail.supportTicket._id}`} className="font-medium text-primary hover:underline">
                {detail.supportTicket.subject}
              </Link>
            </div>
          )
        )}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Status</span>
          <StatusBadge status={detail.status} />
        </div>
      </div>

      {isPending && (
        <div className="flex flex-col gap-3 border-t px-4 pt-4">
          <Button onClick={handleCredit} disabled={submitting}>
            {submitting ? <Loader2Icon className="size-4 animate-spin" /> : "Verify & Credit"}
          </Button>
          <form onSubmit={handleReject} className="flex flex-col gap-2">
            <Textarea placeholder="Rejection reason..." value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
            <Button type="submit" variant="outline" disabled={submitting}>
              Reject
            </Button>
          </form>
        </div>
      )}
    </SheetContent>
  );
}

export default function AdminDepositsPage() {
  const sessionToken = useSessionToken();
  const [method, setMethod] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [selectedDepositId, setSelectedDepositId] = useState<Id<"deposits"> | null>(null);

  const deposits = useQuery(api.admin.deposits.list, {
    sessionToken,
    method: method === "all" ? undefined : (method as "crypto" | "fiat"),
    status: status === "all" ? undefined : (status as "pending" | "under_review" | "credited" | "rejected"),
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Deposits</h1>
        <p className="text-muted-foreground">Verify and credit crypto and fiat deposit requests.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger className="sm:w-48" aria-label="Filter by method">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All methods</SelectItem>
            <SelectItem value="crypto">Crypto</SelectItem>
            <SelectItem value="fiat">Fiat</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-48" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="credited">Credited</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(deposits ?? []).map((d) => (
                <TableRow
                  key={d._id}
                  className="cursor-pointer"
                  tabIndex={0}
                  role="button"
                  onClick={() => setSelectedDepositId(d._id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedDepositId(d._id);
                    }
                  }}
                >
                  <TableCell>{d.userName}</TableCell>
                  <TableCell>{formatLabel(d.method)}</TableCell>
                  <TableCell>{formatCurrency(d.amountUsd)}</TableCell>
                  <TableCell>
                    <StatusBadge status={d.status} />
                  </TableCell>
                  <TableCell>{formatDate(d.createdAt)}</TableCell>
                </TableRow>
              ))}
              {deposits && deposits.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No deposits match these filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={!!selectedDepositId} onOpenChange={(open) => !open && setSelectedDepositId(null)}>
        {selectedDepositId && <DepositDrawer depositId={selectedDepositId} onClose={() => setSelectedDepositId(null)} />}
      </Sheet>
    </div>
  );
}
