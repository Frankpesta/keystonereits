"use client";

import { Fragment, useState } from "react";
import { useQuery } from "convex/react";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";

import { api } from "@/lib/convex-api";
import type { Id } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
import { formatDate } from "@/lib/format";
import { formatLabel } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaginationControls } from "@/components/user/pagination-controls";

const TARGET_TYPES = ["all", "user", "kycApplication", "deposit", "withdrawal", "investment", "investmentPlan", "admin", "settings"] as const;
const PAGE_SIZE = 20;

export default function AdminAuditLogsPage() {
  const sessionToken = useSessionToken();
  const [targetType, setTargetType] = useState<string>("all");
  const [expanded, setExpanded] = useState<Id<"auditLogs"> | null>(null);

  const { cursor, pageNumber, hasPrev, goNext, goPrev } = useCursorPagination(targetType);
  const page = useQuery(api.admin.auditLogs.list, {
    sessionToken,
    paginationOpts: { numItems: PAGE_SIZE, cursor },
    targetType: targetType === "all" ? undefined : targetType,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Audit Logs</h1>
        <p className="text-muted-foreground">Every financial or administrative action, in order.</p>
      </div>

      <Select value={targetType} onValueChange={setTargetType}>
        <SelectTrigger className="sm:w-56" aria-label="Filter by target type">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TARGET_TYPES.map((t) => (
            <SelectItem key={t} value={t}>
              {t === "all" ? "All target types" : formatLabel(t)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead />
                <TableHead>Admin</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(page?.page ?? []).map((entry) => (
                <Fragment key={entry._id}>
                  <TableRow
                    className="cursor-pointer"
                    tabIndex={0}
                    role="button"
                    aria-expanded={expanded === entry._id}
                    onClick={() => setExpanded(expanded === entry._id ? null : entry._id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setExpanded(expanded === entry._id ? null : entry._id);
                      }
                    }}
                  >
                    <TableCell>
                      {expanded === entry._id ? <ChevronDownIcon className="size-4" /> : <ChevronRightIcon className="size-4" />}
                    </TableCell>
                    <TableCell>{entry.performedByName ?? "Unknown"}</TableCell>
                    <TableCell>{formatLabel(entry.action)}</TableCell>
                    <TableCell>
                      {entry.targetType} · {entry.targetId.slice(0, 8)}...
                    </TableCell>
                    <TableCell>{entry.amount !== undefined ? entry.amount : "—"}</TableCell>
                    <TableCell>{formatDate(entry.createdAt)}</TableCell>
                  </TableRow>
                  {expanded === entry._id && (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <div className="grid gap-4 rounded-lg bg-muted/50 p-4 sm:grid-cols-2">
                          <div>
                            <p className="mb-1 text-xs font-medium text-muted-foreground">Before</p>
                            <pre className="overflow-x-auto text-xs">{JSON.stringify(entry.before ?? null, null, 2)}</pre>
                          </div>
                          <div>
                            <p className="mb-1 text-xs font-medium text-muted-foreground">After</p>
                            <pre className="overflow-x-auto text-xs">{JSON.stringify(entry.after ?? null, null, 2)}</pre>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
              {page && page.page.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No audit log entries match this filter.
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
