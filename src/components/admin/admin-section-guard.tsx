"use client";

import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { ShieldAlertIcon } from "lucide-react";
import type { ReactNode } from "react";

import { api } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { adminSectionForPath, canAccessAdminSection } from "@/lib/admin-access";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Central role gate for every /admin/* page. The sidebar already hides links
 * a given role can't use, but that doesn't stop direct URL entry — this
 * renders a real 403 (not a silent redirect) per docs/06-admin-dashboard.md's
 * Definition of Done, wrapped once here instead of repeated on every page.
 */
export function AdminSectionGuard({ children }: { children: ReactNode }) {
  const sessionToken = useSessionToken();
  const pathname = usePathname();
  const admin = useQuery(api.admins.currentAdmin, { sessionToken });

  if (admin === undefined) return null;

  const section = adminSectionForPath(pathname);
  if (section && !canAccessAdminSection(admin.role, section)) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlertIcon className="size-5 text-destructive" />
            <CardTitle>403 — Access Denied</CardTitle>
          </div>
          <CardDescription>
            Your role ({admin.role}) does not have access to this section. Contact a super admin if you believe
            this is a mistake.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return children;
}
