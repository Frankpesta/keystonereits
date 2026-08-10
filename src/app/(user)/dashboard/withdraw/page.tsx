"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

import { api } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { getConvexErrorMessage } from "@/lib/convex-error";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SuccessBurst } from "@/components/shared/success-burst";

type BalanceSource = "available" | "profit";

export default function WithdrawPage() {
  const sessionToken = useSessionToken();
  const balance = useQuery(api.balances.myBalance, { sessionToken });
  const withdrawals = useQuery(api.withdrawals.myWithdrawals, { sessionToken });
  const requestWithdrawal = useMutation(api.withdrawals.request);

  const [source, setSource] = useState<BalanceSource>("available");
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [network, setNetwork] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  const maxWithdrawable =
    source === "available" ? balance?.availableToWithdraw : balance?.profitAvailableToWithdraw;
  const amountNum = Number(amount);
  const error =
    !amount || !Number.isFinite(amountNum) || amountNum <= 0
      ? null
      : maxWithdrawable !== undefined && amountNum > maxWithdrawable
        ? `You can only withdraw up to ${formatCurrency(maxWithdrawable)} from this balance right now.`
        : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    if (error) {
      toast.error(error);
      return;
    }
    if (!walletAddress.trim() || !network.trim()) {
      toast.error("Enter a destination wallet address and network.");
      return;
    }

    setSubmitting(true);
    try {
      await requestWithdrawal({
        sessionToken,
        balanceSource: source,
        amountUsd: amountNum,
        walletAddress: walletAddress.trim(),
        network: network.trim(),
      });
      toast.success("Withdrawal request submitted.");
      setAmount("");
      setWalletAddress("");
      setNetwork("");
      setJustSubmitted(true);
      setTimeout(() => setJustSubmitted(false), 1200);
    } catch (err) {
      toast.error(getConvexErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Withdraw</h1>
        <p className="text-muted-foreground">Request a withdrawal from your available or profit balance.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New withdrawal request</CardTitle>
          <CardDescription>
            Funds are earmarked immediately and released once our team completes the transfer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {justSubmitted ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <SuccessBurst />
              <p className="font-medium text-foreground">Withdrawal request submitted</p>
              <p className="text-sm text-muted-foreground">
                Our team will process it and update the status below.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="withdraw-source">Source balance</Label>
                  <Select value={source} onValueChange={(v) => setSource(v as BalanceSource)}>
                    <SelectTrigger id="withdraw-source" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">
                        Available balance ({formatCurrency(balance?.availableToWithdraw ?? 0)} available)
                      </SelectItem>
                      <SelectItem value="profit">
                        Profit balance ({formatCurrency(balance?.profitAvailableToWithdraw ?? 0)} available)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="withdraw-amount">Amount (USD)</Label>
                  <Input
                    id="withdraw-amount"
                    type="number"
                    min={0}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="wallet-address">Destination wallet address</Label>
                  <Input
                    id="wallet-address"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="withdraw-network">Network</Label>
                  <Input
                    id="withdraw-network"
                    placeholder="e.g. TRC20"
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" disabled={submitting || !!error} className="self-end">
                {submitting ? <Loader2Icon className="size-4 animate-spin" /> : "Request Withdrawal"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Past withdrawal requests</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {(withdrawals ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No withdrawal requests yet.</p>
          ) : (
            (withdrawals ?? []).map((w) => (
              <div key={w._id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <div>
                  <p className="font-medium">
                    {w.balanceSource === "available" ? "Available" : "Profit"} · {w.network}
                  </p>
                  <p className="text-muted-foreground">{formatDate(w.createdAt)}</p>
                </div>
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
  );
}
