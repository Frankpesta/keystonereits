"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

import { api } from "@/lib/convex-api";
import type { Doc } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { getConvexErrorMessage } from "@/lib/convex-error";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SuccessBurst } from "@/components/shared/success-burst";

type Plan = Doc<"investmentPlans"> & { requiresKyc: boolean };

function InvestDialog({ plan, onClose }: { plan: Plan; onClose: () => void }) {
  const sessionToken = useSessionToken();
  const user = useQuery(api.users.currentUser, { sessionToken });
  const balance = useQuery(api.balances.myBalance, { sessionToken });
  const invest = useMutation(api.investments.invest);
  const [amount, setAmount] = useState(String(plan.minAmount));
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const amountNum = Number(amount);
  const available = balance?.available ?? 0;
  const kycBlocked = plan.requiresKyc && user?.kycStatus !== "approved";
  const error = kycBlocked
    ? "Complete KYC verification before investing in this plan."
    : !Number.isFinite(amountNum) || amountNum <= 0
      ? "Enter a valid amount."
      : amountNum < plan.minAmount || amountNum > plan.maxAmount
        ? `Amount must be between ${formatCurrency(plan.minAmount)} and ${formatCurrency(plan.maxAmount)}.`
        : amountNum > available
          ? "This exceeds your available balance."
          : null;

  async function handleConfirm(e: FormEvent) {
    e.preventDefault();
    if (error) return;
    setSubmitting(true);
    try {
      await invest({ sessionToken, planId: plan._id, amount: amountNum });
      toast.success(`Invested ${formatCurrency(amountNum)} into ${plan.name}.`);
      setConfirmed(true);
      setTimeout(onClose, 900);
    } catch (err) {
      toast.error(getConvexErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {confirmed ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <SuccessBurst />
            <p className="font-medium text-foreground">Investment confirmed</p>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(amountNum)} invested in {plan.name}.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Invest in {plan.name}</DialogTitle>
              <DialogDescription>
                {plan.weeklyReturnPercent.toFixed(2)}% weekly return over {plan.durationDays} days.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleConfirm} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="invest-amount">Amount (USD)</Label>
                <Input
                  id="invest-amount"
                  type="number"
                  min={plan.minAmount}
                  max={plan.maxAmount}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={kycBlocked}
                />
                {error ? (
                  <p className="text-sm text-destructive">
                    {error}
                    {kycBlocked && (
                      <>
                        {" "}
                        <Link href="/dashboard/kyc" className="underline">
                          Complete KYC
                        </Link>
                        .
                      </>
                    )}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Available balance: {formatCurrency(available)}
                  </p>
                )}
              </div>
              <dl className="grid grid-cols-2 gap-3 rounded-lg border p-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Duration</dt>
                  <dd className="font-medium">{plan.durationDays} days</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Weekly return</dt>
                  <dd className="font-medium">{plan.weeklyReturnPercent.toFixed(2)}%</dd>
                </div>
              </dl>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!!error || submitting}>
                  {submitting ? <Loader2Icon className="size-4 animate-spin" /> : "Confirm Investment"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function InvestPage() {
  const sessionToken = useSessionToken();
  const user = useQuery(api.users.currentUser, { sessionToken });
  const plans = useQuery(api.investmentPlans.listActive);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Investment Plans</h1>
        <p className="text-muted-foreground">Choose a plan and start earning weekly returns.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(plans ?? []).map((plan) => (
          <Card key={plan._id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              {plan.requiresKyc && user && user.kycStatus !== "approved" && (
                <p className="text-xs font-medium text-warning">Requires KYC verification</p>
              )}
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Min / Max</span>
                <span className="font-medium">
                  {formatCurrency(plan.minAmount)} – {formatCurrency(plan.maxAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{plan.durationDays} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weekly return</span>
                <span className="font-medium">{plan.weeklyReturnPercent.toFixed(2)}%</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => setSelectedPlan(plan)}>
                View &amp; Invest
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {selectedPlan && <InvestDialog plan={selectedPlan} onClose={() => setSelectedPlan(null)} />}
    </div>
  );
}
