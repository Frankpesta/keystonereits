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
import { StatusBadge, formatLabel } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const CAN_SUSPEND: string[] = ["super", "compliance"];
const CAN_ADJUST_BALANCE: string[] = ["super", "finance"];

function SuspendDialog({ userId, currentStatus }: { userId: Id<"users">; currentStatus: string }) {
  const sessionToken = useSessionToken();
  const updateStatus = useMutation(api.admin.users.updateStatus);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"active" | "suspended" | "restricted">(
    currentStatus === "active" ? "suspended" : "active"
  );
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
      await updateStatus({ sessionToken, userId, status, reason: reason.trim() });
      toast.success("User status updated.");
      setOpen(false);
      setReason("");
    } catch (err) {
      toast.error(getConvexErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Change Account Status</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change account status</DialogTitle>
          <DialogDescription>This action is audit-logged and visible on the user&apos;s account.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="account-status">New status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger id="account-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="restricted">Restricted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="status-reason">Reason</Label>
            <Textarea id="status-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
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

function AdjustBalanceDialog({
  userId,
  balance,
}: {
  userId: Id<"users">;
  balance: { available: number; invested: number; profit: number } | null | undefined;
}) {
  const sessionToken = useSessionToken();
  const adjustBalance = useMutation(api.admin.users.adjustBalance);
  const [open, setOpen] = useState(false);
  const [balanceType, setBalanceType] = useState<"available" | "invested" | "profit">("available");
  const [direction, setDirection] = useState<"credit" | "debit">("credit");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const current = balance?.[balanceType] ?? 0;
  const amountNum = Number(amount);
  const projected = Number.isFinite(amountNum) ? current + (direction === "credit" ? amountNum : -amountNum) : current;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    if (!reason.trim()) {
      toast.error("Enter a reason.");
      return;
    }
    setSubmitting(true);
    try {
      await adjustBalance({ sessionToken, userId, balanceType, direction, amount: amountNum, reason: reason.trim() });
      toast.success("Balance adjusted.");
      setOpen(false);
      setAmount("");
      setReason("");
    } catch (err) {
      toast.error(getConvexErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Manual Balance Adjustment</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manual balance adjustment</DialogTitle>
          <DialogDescription>Credits or debits a balance directly. This is audit-logged.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="adjust-balance-type">Balance</Label>
              <Select value={balanceType} onValueChange={(v) => setBalanceType(v as typeof balanceType)}>
                <SelectTrigger id="adjust-balance-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="invested">Invested</SelectItem>
                  <SelectItem value="profit">Profit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="adjust-balance-direction">Direction</Label>
              <Select value={direction} onValueChange={(v) => setDirection(v as typeof direction)}>
                <SelectTrigger id="adjust-balance-direction" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Credit (add)</SelectItem>
                  <SelectItem value="debit">Debit (remove)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="adjust-amount">Amount (USD)</Label>
            <Input id="adjust-amount" type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3 text-sm">
            <span className="text-muted-foreground">Current: {formatCurrency(current)}</span>
            <span className="font-medium">After: {formatCurrency(projected)}</span>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="adjust-reason">Reason</Label>
            <Textarea id="adjust-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2Icon className="size-4 animate-spin" /> : "Confirm Adjustment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminUserDetailPage() {
  const params = useParams<{ userId: string }>();
  const sessionToken = useSessionToken();
  const userId = params.userId as Id<"users">;
  const detail = useQuery(api.admin.users.detail, { sessionToken, userId });
  const admin = useQuery(api.admins.currentAdmin, { sessionToken });

  if (detail === undefined) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">
            {detail.user.firstName} {detail.user.lastName}
          </h1>
          <p className="text-muted-foreground">{detail.user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={detail.user.status} />
          <StatusBadge status={detail.user.kycStatus} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {admin && CAN_SUSPEND.includes(admin.role) && (
          <SuspendDialog userId={userId} currentStatus={detail.user.status} />
        )}
        {admin && CAN_ADJUST_BALANCE.includes(admin.role) && (
          <AdjustBalanceDialog userId={userId} balance={detail.balance} />
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Available</CardDescription>
            <CardTitle className="text-xl">{formatCurrency(detail.balance?.available ?? 0)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Invested</CardDescription>
            <CardTitle className="text-xl">{formatCurrency(detail.balance?.invested ?? 0)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Profit</CardDescription>
            <CardTitle className="text-xl">{formatCurrency(detail.balance?.profit ?? 0)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Investments ({detail.investments.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {detail.investments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No investments.</p>
          ) : (
            detail.investments.map((inv) => (
              <div key={inv._id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <span>{inv.plan?.name ?? "Investment"}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatCurrency(inv.amount)}</span>
                  <StatusBadge status={inv.status} />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Deposits ({detail.deposits.length})</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {detail.deposits.length === 0 ? (
              <p className="text-sm text-muted-foreground">No deposits.</p>
            ) : (
              detail.deposits.map((d) => (
                <div key={d._id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <span>{formatLabel(d.method)}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{formatCurrency(d.amountUsd)}</span>
                    <StatusBadge status={d.status} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Withdrawals ({detail.withdrawals.length})</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {detail.withdrawals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No withdrawals.</p>
            ) : (
              detail.withdrawals.map((w) => (
                <div key={w._id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <span>{formatLabel(w.balanceSource)}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{formatCurrency(w.amountUsd)}</span>
                    <StatusBadge status={w.status} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {detail.transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions.</p>
          ) : (
            detail.transactions.map((t) => (
              <div key={t._id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <span>
                  {formatLabel(t.type)} · {formatDate(t.createdAt)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatCurrency(t.amount)}</span>
                  <StatusBadge status={t.status} />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Activity</CardTitle>
          <CardDescription>Admin actions taken on this account.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {detail.auditEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No admin actions on this account yet.</p>
          ) : (
            detail.auditEntries.map((entry) => (
              <div key={entry._id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <span>{formatLabel(entry.action)}</span>
                <span className="text-muted-foreground">{formatDate(entry.createdAt)}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
