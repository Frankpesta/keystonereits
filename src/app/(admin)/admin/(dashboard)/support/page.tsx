"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";

import { api } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { formatDate } from "@/lib/format";
import { formatLabel } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const STATUSES = ["open", "pending_admin", "pending_user", "closed"] as const;
const CATEGORIES = ["all", "fiat_deposit", "general", "kyc", "withdrawal", "other"] as const;

function QueueTable({ status, category }: { status: (typeof STATUSES)[number]; category: string }) {
  const sessionToken = useSessionToken();
  const tickets = useQuery(api.admin.support.queue, {
    sessionToken,
    status,
    category: category === "all" ? undefined : (category as "fiat_deposit" | "general" | "kyc" | "withdrawal" | "other"),
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Subject</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Assigned</TableHead>
          <TableHead>Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {(tickets ?? []).map((t) => (
          <TableRow key={t._id}>
            <TableCell>
              <Link href={`/admin/support/${t._id}`} className="font-medium hover:underline">
                {t.subject}
              </Link>
            </TableCell>
            <TableCell>{t.userName}</TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={cn(t.category === "fiat_deposit" && "border-warning/40 bg-warning/10 text-warning")}
              >
                {formatLabel(t.category)}
              </Badge>
            </TableCell>
            <TableCell>{t.assignedAdminName ?? "Unassigned"}</TableCell>
            <TableCell>{formatDate(t.updatedAt)}</TableCell>
          </TableRow>
        ))}
        {tickets && tickets.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              No tickets in this queue.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default function AdminSupportPage() {
  const [tab, setTab] = useState<(typeof STATUSES)[number]>("open");
  const [category, setCategory] = useState<string>("all");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Support Tickets</h1>
        <p className="text-muted-foreground">
          Respond to user tickets — fiat deposit requests need bank details sent promptly.
        </p>
      </div>

      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="sm:w-56" aria-label="Filter by category">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CATEGORIES.map((c) => (
            <SelectItem key={c} value={c}>
              {c === "all" ? "All categories" : formatLabel(c)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="pending_admin">Pending Admin</TabsTrigger>
          <TabsTrigger value="pending_user">Pending User</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>
        {STATUSES.map((status) => (
          <TabsContent key={status} value={status}>
            <Card>
              <CardContent>
                <QueueTable status={status} category={category} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
