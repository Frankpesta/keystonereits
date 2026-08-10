"use client";

import { useQuery } from "convex/react";
import { api } from "@/lib/convex-api";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReturnsDisclosure } from "./returns-disclosure";

function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    amount
  );
}

/**
 * Reads live from Convex (status: "active") rather than hardcoding the four
 * plans, so admin edits in Phase 6 show up here immediately.
 */
export function PlanComparisonTable() {
  const plans = useQuery(api.investmentPlans.listActive);

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Plan</TableHead>
              <TableHead>Minimum Participation</TableHead>
              <TableHead>Weekly ROI</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Distribution</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans === undefined
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : plans.map((plan) => (
                  <TableRow key={plan._id}>
                    <TableCell className="font-display font-semibold text-foreground">{plan.name}</TableCell>
                    <TableCell>{formatUsd(plan.minAmount)}</TableCell>
                    <TableCell>{(plan.dailyReturnPercent * 7).toFixed(0)}%</TableCell>
                    <TableCell>{Math.round(plan.durationDays / 365)} Year</TableCell>
                    <TableCell>Weekly</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
      <div className="border-t p-4">
        <ReturnsDisclosure />
      </div>
    </div>
  );
}
