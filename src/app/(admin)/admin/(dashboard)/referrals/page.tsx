"use client";

import { useState } from "react";
import { useQuery } from "convex/react";

import { api } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminReferralsPage() {
  const sessionToken = useSessionToken();
  const [search, setSearch] = useState("");
  const overview = useQuery(api.admin.referrals.overview, { sessionToken, search: search || undefined });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Referrals</h1>
        <p className="text-muted-foreground">Platform-wide referral activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Total referral earnings paid</CardDescription>
            <CardTitle className="text-2xl">{overview ? formatCurrency(overview.totalEarnings) : "—"}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total referral earning events</CardDescription>
            <CardTitle className="text-2xl">{overview?.totalCount ?? "—"}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Input
        placeholder="Search by referrer name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="sm:max-w-sm"
      />

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referrer</TableHead>
                <TableHead>Referred user</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(overview?.earnings ?? []).map((e) => (
                <TableRow key={e._id}>
                  <TableCell>
                    <div className="font-medium">{e.referrerName}</div>
                    <div className="text-xs text-muted-foreground">{e.referrerEmail}</div>
                  </TableCell>
                  <TableCell>{e.referredName}</TableCell>
                  <TableCell>{formatCurrency(e.amount)}</TableCell>
                  <TableCell>{formatDate(e.createdAt)}</TableCell>
                </TableRow>
              ))}
              {overview && overview.earnings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No referral earnings match this search.
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
