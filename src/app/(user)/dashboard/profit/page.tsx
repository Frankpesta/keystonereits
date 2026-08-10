"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useQuery } from "convex/react";

import { api } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaginationControls } from "@/components/user/pagination-controls";
import { CHART_COLORS } from "@/lib/chart-theme";

const chartConfig = {
  amount: { label: "Profit", color: CHART_COLORS.primary },
} satisfies ChartConfig;

const PAGE_SIZE = 10;

export default function ProfitPage() {
  const sessionToken = useSessionToken();
  const balance = useQuery(api.balances.myBalance, { sessionToken });
  const totalEarned = useQuery(api.profitAccruals.totalEarned, { sessionToken });
  const series = useQuery(api.profitAccruals.chartSeries, { sessionToken });

  const { cursor, pageNumber, hasPrev, goNext, goPrev } = useCursorPagination(null);
  const historyPage = useQuery(api.profitAccruals.history, {
    sessionToken,
    paginationOpts: { numItems: PAGE_SIZE, cursor },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Profit Balance</h1>
        <p className="text-muted-foreground">Your daily investment returns over time.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Current profit balance</CardDescription>
            <CardTitle className="text-2xl">{balance ? formatCurrency(balance.profit) : "—"}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total profit earned all-time</CardDescription>
            <CardTitle className="text-2xl">
              {totalEarned === undefined ? "—" : formatCurrency(totalEarned)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily accruals</CardTitle>
          <CardDescription>Profit credited to your account each day.</CardDescription>
        </CardHeader>
        <CardContent>
          {series && series.length > 0 ? (
            <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
              <AreaChart data={series}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value: string) => formatDate(new Date(value).getTime())}
                />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Area
                  dataKey="amount"
                  type="monotone"
                  fill="var(--color-amount)"
                  stroke="var(--color-amount)"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">No profit accruals yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accrual history</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(historyPage?.page ?? []).map((row) => (
                <TableRow key={row._id}>
                  <TableCell>{row.accrualDate}</TableCell>
                  <TableCell>{row.plan?.name ?? "—"}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.amount)}</TableCell>
                </TableRow>
              ))}
              {historyPage && historyPage.page.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No accrual history yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <PaginationControls
            pageNumber={pageNumber}
            hasPrev={hasPrev}
            hasNext={!!historyPage && !historyPage.isDone}
            onPrev={goPrev}
            onNext={() => historyPage && goNext(historyPage.continueCursor, historyPage.isDone)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
