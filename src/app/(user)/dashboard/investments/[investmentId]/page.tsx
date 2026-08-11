"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";

import { api } from "@/lib/convex-api";
import type { Id } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { formatCurrency, formatDate } from "@/lib/format";
import { computeInvestmentProgress } from "@/lib/investment-progress";
import { StatusBadge } from "@/components/shared/status-badge";
import { InvestmentProgressBar } from "@/components/user/investment-progress-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ADMIN_STATUS_COPY: Record<string, string> = {
  admin_paused: "This investment has been paused by our support team. Contact us for details.",
  admin_ended: "This investment was ended early by our support team. Contact us for details.",
};

export default function InvestmentDetailPage() {
  const params = useParams<{ investmentId: string }>();
  const sessionToken = useSessionToken();
  const investment = useQuery(api.investments.myInvestment, {
    sessionToken,
    investmentId: params.investmentId as Id<"investments">,
  });

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (investment === undefined) return null;

  const progress = computeInvestmentProgress(investment.startDate, investment.maturityDate, now);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">{investment.plan?.name ?? "Investment"}</h1>
        <p className="text-muted-foreground">Investment details and progress toward maturity.</p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Overview</CardTitle>
          <StatusBadge status={investment.status} />
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {ADMIN_STATUS_COPY[investment.status] && (
            <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              {ADMIN_STATUS_COPY[investment.status]}
            </p>
          )}
          <InvestmentProgressBar progress={progress} />
          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">Amount invested</dt>
              <dd className="font-medium">{formatCurrency(investment.amount)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Accrued profit</dt>
              <dd className="font-medium">{formatCurrency(investment.accruedProfit)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Start date</dt>
              <dd className="font-medium">{formatDate(investment.startDate)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Maturity date</dt>
              <dd className="font-medium">{formatDate(investment.maturityDate)}</dd>
            </div>
          </dl>
          {investment.plan && (
            <dl className="grid grid-cols-2 gap-4 border-t pt-4 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-muted-foreground">Plan</dt>
                <dd className="font-medium">{investment.plan.name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Duration</dt>
                <dd className="font-medium">{investment.plan.durationDays} days</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Weekly return</dt>
                <dd className="font-medium">{investment.plan.weeklyReturnPercent.toFixed(2)}%</dd>
              </div>
            </dl>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
