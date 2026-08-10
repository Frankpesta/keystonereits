"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";

import { api } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const STATUSES = ["pending", "under_review", "approved", "rejected", "info_required"] as const;

function QueueTable({ status }: { status: (typeof STATUSES)[number] }) {
  const sessionToken = useSessionToken();
  const applications = useQuery(api.admin.kyc.queue, { sessionToken, status });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Applicant</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {(applications ?? []).map((app) => (
          <TableRow key={app._id}>
            <TableCell>
              <Link href={`/admin/kyc/${app._id}`} className="font-medium hover:underline">
                {app.userName}
              </Link>
            </TableCell>
            <TableCell>{app.userEmail}</TableCell>
            <TableCell>{formatDate(app.submittedAt)}</TableCell>
            <TableCell>
              <StatusBadge status={app.status} />
            </TableCell>
          </TableRow>
        ))}
        {applications && applications.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground">
              No applications in this queue.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default function AdminKycPage() {
  const [tab, setTab] = useState<(typeof STATUSES)[number]>("pending");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">KYC Review</h1>
        <p className="text-muted-foreground">Review identity verification submissions.</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="under_review">Under Review</TabsTrigger>
          <TabsTrigger value="info_required">Info Required</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        {STATUSES.map((status) => (
          <TabsContent key={status} value={status}>
            <Card>
              <CardContent>
                <QueueTable status={status} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
