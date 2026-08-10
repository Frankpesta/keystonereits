"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { DownloadIcon } from "lucide-react";

import { api } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { downloadCsv } from "@/lib/csv-export";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function DateRangeFilters({
  idPrefix,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
}: {
  idPrefix: string;
  fromDate: string;
  setFromDate: (v: string) => void;
  toDate: string;
  setToDate: (v: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-from`}>From</Label>
        <Input id={`${idPrefix}-from`} type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-to`}>To</Label>
        <Input id={`${idPrefix}-to`} type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
      </div>
    </div>
  );
}

function UserReportTab() {
  const sessionToken = useSessionToken();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const report = useQuery(api.admin.reports.userReport, {
    sessionToken,
    fromDate: fromDate ? new Date(fromDate).getTime() : undefined,
    toDate: toDate ? new Date(toDate).getTime() + 24 * 60 * 60 * 1000 - 1 : undefined,
  });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>User Report</CardTitle>
        <Button
          variant="outline"
          size="sm"
          disabled={!report?.length}
          onClick={() =>
            downloadCsv(
              "user-report.csv",
              (report ?? []).map((r) => ({
                name: r.name,
                email: r.email,
                status: r.status,
                kycStatus: r.kycStatus,
                available: r.available,
                invested: r.invested,
                profit: r.profit,
                joined: formatDate(r.createdAt),
              }))
            )
          }
        >
          <DownloadIcon className="size-4" />
          Export CSV
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <DateRangeFilters idPrefix="user-report" fromDate={fromDate} setFromDate={setFromDate} toDate={toDate} setToDate={setToDate} />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>KYC</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Invested</TableHead>
              <TableHead>Profit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(report ?? []).map((r) => (
              <TableRow key={r.userId}>
                <TableCell>{r.name}</TableCell>
                <TableCell>
                  <StatusBadge status={r.status} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={r.kycStatus} />
                </TableCell>
                <TableCell>{formatCurrency(r.available)}</TableCell>
                <TableCell>{formatCurrency(r.invested)}</TableCell>
                <TableCell>{formatCurrency(r.profit)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function FinancialReportTab() {
  const sessionToken = useSessionToken();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const report = useQuery(api.admin.reports.financialReport, {
    sessionToken,
    fromDate: fromDate ? new Date(fromDate).getTime() : undefined,
    toDate: toDate ? new Date(toDate).getTime() + 24 * 60 * 60 * 1000 - 1 : undefined,
  });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Financial Report</CardTitle>
        <Button
          variant="outline"
          size="sm"
          disabled={!report?.length}
          onClick={() =>
            downloadCsv(
              "financial-report.csv",
              (report ?? []).map((r) => ({
                user: r.userName,
                type: r.type,
                amount: r.amount,
                status: r.status,
                date: formatDate(r.createdAt),
              }))
            )
          }
        >
          <DownloadIcon className="size-4" />
          Export CSV
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <DateRangeFilters idPrefix="financial-report" fromDate={fromDate} setFromDate={setFromDate} toDate={toDate} setToDate={setToDate} />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(report ?? []).map((r) => (
              <TableRow key={r._id}>
                <TableCell>{r.userName}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell>
                  <StatusBadge status={r.status} />
                </TableCell>
                <TableCell>{formatCurrency(r.amount)}</TableCell>
                <TableCell>{formatDate(r.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function InvestmentReportTab() {
  const sessionToken = useSessionToken();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const report = useQuery(api.admin.reports.investmentReport, {
    sessionToken,
    fromDate: fromDate ? new Date(fromDate).getTime() : undefined,
    toDate: toDate ? new Date(toDate).getTime() + 24 * 60 * 60 * 1000 - 1 : undefined,
  });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Investment Report</CardTitle>
        <Button
          variant="outline"
          size="sm"
          disabled={!report?.length}
          onClick={() =>
            downloadCsv(
              "investment-report.csv",
              (report ?? []).map((r) => ({
                investor: r.userName,
                plan: r.planName ?? "",
                amount: r.amount,
                status: r.status,
                accruedProfit: r.accruedProfit,
                startDate: formatDate(r.startDate),
                maturityDate: formatDate(r.maturityDate),
              }))
            )
          }
        >
          <DownloadIcon className="size-4" />
          Export CSV
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <DateRangeFilters idPrefix="investment-report" fromDate={fromDate} setFromDate={setFromDate} toDate={toDate} setToDate={setToDate} />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Investor</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Matures</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(report ?? []).map((r) => (
              <TableRow key={r._id}>
                <TableCell>{r.userName}</TableCell>
                <TableCell>{r.planName}</TableCell>
                <TableCell>{formatCurrency(r.amount)}</TableCell>
                <TableCell>
                  <StatusBadge status={r.status} />
                </TableCell>
                <TableCell>{formatDate(r.maturityDate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function AdminReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Reports</h1>
        <p className="text-muted-foreground">Filter and export platform data.</p>
      </div>

      <Tabs defaultValue="user">
        <TabsList>
          <TabsTrigger value="user">User</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="investment">Investment</TabsTrigger>
        </TabsList>
        <TabsContent value="user">
          <UserReportTab />
        </TabsContent>
        <TabsContent value="financial">
          <FinancialReportTab />
        </TabsContent>
        <TabsContent value="investment">
          <InvestmentReportTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
