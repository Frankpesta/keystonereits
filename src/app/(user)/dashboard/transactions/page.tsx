"use client";

import { useState } from "react";
import { useQuery } from "convex/react";

import { api } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge, formatLabel } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaginationControls } from "@/components/user/pagination-controls";

const TYPES = [
  "deposit",
  "investment",
  "profit_accrual",
  "withdrawal",
  "referral_earning",
  "admin_adjustment",
  "fee",
] as const;

const STATUSES = [
  "pending",
  "under_review",
  "processing",
  "approved",
  "completed",
  "credited",
  "rejected",
  "failed",
  "cancelled",
] as const;

const PAGE_SIZE = 15;

export default function TransactionsPage() {
  const sessionToken = useSessionToken();
  const [type, setType] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filterKey = `${type}|${status}|${fromDate}|${toDate}`;
  const { cursor, pageNumber, hasPrev, goNext, goPrev } = useCursorPagination(filterKey);

  const page = useQuery(api.transactions.myTransactions, {
    sessionToken,
    paginationOpts: { numItems: PAGE_SIZE, cursor },
    type: type === "all" ? undefined : (type as (typeof TYPES)[number]),
    status: status === "all" ? undefined : status,
    fromDate: fromDate ? new Date(fromDate).getTime() : undefined,
    toDate: toDate ? new Date(toDate).getTime() + 24 * 60 * 60 * 1000 - 1 : undefined,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Transactions</h1>
        <p className="text-muted-foreground">A unified record of every deposit, investment, and withdrawal.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="filter-type">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="filter-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {formatLabel(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="filter-status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="filter-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {formatLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="from-date">From</Label>
            <Input id="from-date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="to-date">To</Label>
            <Input id="to-date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(page?.page ?? []).map((tx) => (
                <TableRow key={tx._id}>
                  <TableCell>{formatDate(tx.createdAt)}</TableCell>
                  <TableCell>{formatLabel(tx.type)}</TableCell>
                  <TableCell>
                    <StatusBadge status={tx.status} />
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(tx.amount)}</TableCell>
                </TableRow>
              ))}
              {page && page.page.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No transactions match these filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <PaginationControls
            pageNumber={pageNumber}
            hasPrev={hasPrev}
            hasNext={!!page && !page.isDone}
            onPrev={goPrev}
            onNext={() => page && goNext(page.continueCursor, page.isDone)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
