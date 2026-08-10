"use client";

import Link from "next/link";
import { useQuery } from "convex/react";

import { api } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { StatusBadge } from "@/components/shared/status-badge";

export function KycStatusPill() {
  const sessionToken = useSessionToken();
  const user = useQuery(api.users.currentUser, { sessionToken });
  if (!user) return null;

  return (
    <Link
      href="/dashboard/kyc"
      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
    >
      <span className="hidden sm:inline">KYC:</span>
      <StatusBadge status={user.kycStatus} />
    </Link>
  );
}
