"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";

import { api } from "@/lib/convex-api";
import type { Id } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminInvestmentsPage() {
  const sessionToken = useSessionToken();
  const searchParams = useSearchParams();
  const planFilter = searchParams.get("plan") as Id<"investmentPlans"> | null;

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");

  const investments = useQuery(api.admin.investments.list, {
    sessionToken,
    search: search || undefined,
    status:
      status === "all"
        ? undefined
        : (status as "pending" | "active" | "maturing" | "completed" | "cancelled" | "admin_paused" | "admin_ended"),
    planId: planFilter ?? undefined,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Investments</h1>
        <p className="text-muted-foreground">
          {planFilter ? "Investors in this plan." : "Every investment across the platform."}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Input
          placeholder="Search by investor name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-sm"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-52" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="maturing">Maturing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="admin_paused">Admin Paused</SelectItem>
            <SelectItem value="admin_ended">Admin Ended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Investor</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Accrued</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Matures</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(investments ?? []).map((inv) => (
                <TableRow key={inv._id}>
                  <TableCell>
                    <Link href={`/admin/investments/${inv._id}`} className="font-medium hover:underline">
                      {inv.userName}
                    </Link>
                  </TableCell>
                  <TableCell>{inv.planName}</TableCell>
                  <TableCell>{formatCurrency(inv.amount)}</TableCell>
                  <TableCell>{formatCurrency(inv.accruedProfit)}</TableCell>
                  <TableCell>
                    <StatusBadge status={inv.status} />
                  </TableCell>
                  <TableCell>{formatDate(inv.maturityDate)}</TableCell>
                </TableRow>
              ))}
              {investments && investments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No investments match these filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
