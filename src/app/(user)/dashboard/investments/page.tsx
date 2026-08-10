"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";

import { api } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { formatCurrency, formatDate } from "@/lib/format";
import { computeInvestmentProgress } from "@/lib/investment-progress";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const ADMIN_STATUS_COPY: Record<string, string> = {
  admin_paused: "Paused by support — contact us for details.",
  admin_ended: "Ended by support — contact us for details.",
};

export default function InvestmentsPage() {
  const sessionToken = useSessionToken();
  const investments = useQuery(api.investments.myInvestments, { sessionToken });
  const [now] = useState(() => Date.now());

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Active Investments</h1>
        <p className="text-muted-foreground">Track every investment you&apos;ve made, past and present.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(investments ?? []).map((inv) => {
          const progress = computeInvestmentProgress(inv.startDate, inv.maturityDate, now);
          return (
            <Link key={inv._id} href={`/dashboard/investments/${inv._id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{inv.plan?.name ?? "Investment"}</CardTitle>
                    <StatusBadge status={inv.status} />
                  </div>
                  <CardDescription>Started {formatDate(inv.startDate)}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">{formatCurrency(inv.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Matures</span>
                    <span className="font-medium">{formatDate(inv.maturityDate)}</span>
                  </div>
                  <Progress value={progress * 100} />
                  {ADMIN_STATUS_COPY[inv.status] && (
                    <p className="text-xs text-muted-foreground">{ADMIN_STATUS_COPY[inv.status]}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      {investments?.length === 0 && (
        <p className="text-sm text-muted-foreground">
          You don&apos;t have any investments yet. <Link href="/dashboard/invest" className="text-primary hover:underline">Browse plans</Link>.
        </p>
      )}
    </div>
  );
}
