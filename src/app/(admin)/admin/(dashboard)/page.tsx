"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { useQuery } from "convex/react";

import { api } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge, formatLabel } from "@/components/shared/status-badge";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { CHART_COLORS } from "@/lib/chart-theme";

const trendConfig = {
  deposits: { label: "Deposits", color: CHART_COLORS.success },
  withdrawals: { label: "Withdrawals", color: CHART_COLORS.destructive },
} satisfies ChartConfig;

const planConfig = {
  amount: { label: "Amount Invested", color: CHART_COLORS.primary },
} satisfies ChartConfig;

function KpiCard({
  title,
  value,
  currency = false,
}: {
  title: string;
  value: number | undefined;
  currency?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl">
          {value === undefined ? (
            "—"
          ) : (
            <AnimatedNumber value={value} formatter={currency ? formatCurrency : undefined} />
          )}
        </CardTitle>
      </CardHeader>
    </Card>
  );
}

export default function AdminOverviewPage() {
  const sessionToken = useSessionToken();
  const [now] = useState(() => Date.now());
  const kpis = useQuery(api.admin.dashboard.kpis, { sessionToken });
  const trend = useQuery(api.admin.dashboard.depositsVsWithdrawalsTrend, { sessionToken, now });
  const byPlan = useQuery(api.admin.dashboard.investmentsByPlan, { sessionToken });
  const recentActivity = useQuery(api.admin.dashboard.recentActivity, { sessionToken });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Overview</h1>
        <p className="text-muted-foreground">Platform-wide KPIs and activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Users" value={kpis?.totalUsers} />
        <KpiCard title="Verified Users" value={kpis?.verifiedUsers} />
        <KpiCard title="Pending KYC" value={kpis?.pendingKyc} />
        <KpiCard title="Total Deposited" value={kpis?.totalDeposited} currency />
        <KpiCard title="Pending Deposits" value={kpis?.pendingDeposits} />
        <KpiCard title="Total Withdrawn" value={kpis?.totalWithdrawn} currency />
        <KpiCard title="Pending Withdrawals" value={kpis?.pendingWithdrawals} />
        <KpiCard title="Total Invested" value={kpis?.totalInvested} currency />
        <KpiCard title="Active Investments" value={kpis?.activeInvestments} />
        <KpiCard title="Completed Investments" value={kpis?.completedInvestments} />
        <KpiCard title="Total Accrued Profit" value={kpis?.totalAccruedProfit} currency />
        <KpiCard title="Referral Earnings" value={kpis?.totalReferralEarnings} currency />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Deposits vs. Withdrawals</CardTitle>
            <CardDescription>Last 30 days, credited/completed only.</CardDescription>
          </CardHeader>
          <CardContent>
            {trend && trend.length > 0 ? (
              <ChartContainer config={trendConfig} className="aspect-auto h-64 w-full">
                <LineChart data={trend}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value: string) => formatDate(new Date(value).getTime())}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line dataKey="deposits" type="monotone" stroke="var(--color-deposits)" strokeWidth={2} dot={false} />
                  <Line dataKey="withdrawals" type="monotone" stroke="var(--color-withdrawals)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">No activity in this window yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Investments by Plan</CardTitle>
            <CardDescription>Total amount invested per plan.</CardDescription>
          </CardHeader>
          <CardContent>
            {byPlan && byPlan.length > 0 ? (
              <ChartContainer config={planConfig} className="aspect-auto h-64 w-full">
                <BarChart data={byPlan}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="plan" tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="amount" fill="var(--color-amount)" radius={4} />
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">No investments yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {(recentActivity ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity.</p>
          ) : (
            (recentActivity ?? []).map((activity) => (
              <div key={activity._id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <div>
                  <p className="font-medium">
                    {activity.userName} · {formatLabel(activity.type)}
                  </p>
                  <p className="text-muted-foreground">{formatDate(activity.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatCurrency(activity.amount)}</span>
                  <StatusBadge status={activity.status} />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
