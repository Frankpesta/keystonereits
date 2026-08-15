"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { AlertTriangleIcon, ArrowRightIcon } from "lucide-react";

import { api } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge, formatLabel } from "@/components/shared/status-badge";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { SuccessBurst } from "@/components/shared/success-burst";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const KYC_BANNER_COPY: Record<string, string> = {
  not_started: "Verify your identity to unlock investing in our higher-tier plans.",
  pending: "Your KYC application is submitted and awaiting review.",
  under_review: "Our team is currently reviewing your KYC application.",
  rejected: "Your KYC application was rejected. Please review and resubmit.",
  info_required: "We need more information to complete your KYC review.",
};

function BalanceCard({ title, value, highlight }: { title: string; value: number | undefined; highlight?: boolean }) {
  return (
    <Card className={cn(highlight && "ring-primary/30 bg-primary/5")}>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl">
          {value === undefined ? "—" : <AnimatedNumber value={value} formatter={formatCurrency} />}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

export default function DashboardOverviewPage() {
  const sessionToken = useSessionToken();
  const user = useQuery(api.users.currentUser, { sessionToken });
  const balance = useQuery(api.balances.myBalance, { sessionToken });
  const investments = useQuery(api.investments.myInvestments, { sessionToken });
  const transactionsPage = useQuery(api.transactions.myTransactions, {
    sessionToken,
    paginationOpts: { numItems: 5, cursor: null },
  });
  const notifications = useQuery(api.notifications.myNotifications, { sessionToken });

  const previousKycStatus = useRef<string | undefined>(undefined);
  const [showKycApprovedBanner, setShowKycApprovedBanner] = useState(false);

  useEffect(() => {
    if (!user) return;
    const prev = previousKycStatus.current;
    const justApproved = prev !== undefined && prev !== "approved" && user.kycStatus === "approved";
    previousKycStatus.current = user.kycStatus;
    if (justApproved) {
      setShowKycApprovedBanner(true);
      const timeout = setTimeout(() => setShowKycApprovedBanner(false), 4000);
      return () => clearTimeout(timeout);
    }
  }, [user]);

  const activeInvestments = (investments ?? [])
    .filter((i) => i.status === "active" || i.status === "maturing")
    .slice(0, 5);
  const recentTransactions = transactionsPage?.page ?? [];
  const recentNotifications = (notifications ?? []).slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      {showKycApprovedBanner && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="flex items-center gap-3">
            <SuccessBurst className="shrink-0" />
            <div>
              <p className="font-medium text-foreground">Identity verified</p>
              <p className="text-sm text-muted-foreground">
                Your KYC application has been approved. You now have full access to deposits, investments, and
                withdrawals.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {user && user.kycStatus !== "approved" && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangleIcon className="mt-0.5 size-5 shrink-0 text-warning" />
              <div>
                <p className="font-medium">Identity verification {formatLabel(user.kycStatus).toLowerCase()}</p>
                <p className="text-sm text-muted-foreground">{KYC_BANNER_COPY[user.kycStatus]}</p>
              </div>
            </div>
            <Button asChild size="sm">
              <Link href="/dashboard/kyc">
                {user.kycStatus === "not_started" ? "Start verification" : "View KYC status"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BalanceCard title="Available Balance" value={balance?.available} />
        <BalanceCard title="Investment Balance" value={balance?.invested} />
        <BalanceCard title="Profit Balance" value={balance?.profit} />
        <BalanceCard title="Total Portfolio Value" value={balance?.portfolioValue} highlight />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Active Investments</CardTitle>
            <Link href="/dashboard/investments" className="flex items-center gap-1 text-sm text-primary hover:underline">
              View all <ArrowRightIcon className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {activeInvestments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active investments yet.</p>
            ) : (
              activeInvestments.map((inv) => (
                <Link
                  key={inv._id}
                  href={`/dashboard/investments/${inv._id}`}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{inv.plan?.name ?? "Investment"}</p>
                    <p className="text-muted-foreground">Matures {formatDate(inv.maturityDate)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{formatCurrency(inv.amount)}</span>
                    <StatusBadge status={inv.status} />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Link href="/dashboard/transactions" className="flex items-center gap-1 text-sm text-primary hover:underline">
              View all <ArrowRightIcon className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No transactions yet.</p>
            ) : (
              recentTransactions.map((tx) => (
                <div key={tx._id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <div>
                    <p className="font-medium">{formatLabel(tx.type)}</p>
                    <p className="text-muted-foreground">{formatDate(tx.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{formatCurrency(tx.amount)}</span>
                    <StatusBadge status={tx.status} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent Notifications</CardTitle>
          <Link href="/dashboard/notifications" className="flex items-center gap-1 text-sm text-primary hover:underline">
            View all <ArrowRightIcon className="size-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {recentNotifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            recentNotifications.map((n) => (
              <div key={n._id} className="flex items-start justify-between gap-3 rounded-lg border p-3 text-sm">
                <div>
                  <p className="font-medium">{n.title}</p>
                  <p className="text-muted-foreground">{n.body}</p>
                </div>
                {!n.read && <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
