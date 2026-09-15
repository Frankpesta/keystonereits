"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";

import { api } from "@/lib/convex-api";
import type { Id } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { formatDate } from "@/lib/format";
import { adminNotificationHref } from "@/lib/notification-links";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function AdminNotificationsPage() {
  const sessionToken = useSessionToken();
  const router = useRouter();
  const notifications = useQuery(api.notifications.adminNotifications, { sessionToken });
  const unreadCount = useQuery(api.notifications.adminUnreadCount, { sessionToken });
  const markRead = useMutation(api.notifications.markAdminRead);
  const markAllRead = useMutation(api.notifications.markAllAdminRead);

  async function handleSelect(n: { _id: Id<"notifications">; read: boolean; type: string; relatedId?: string }) {
    if (!n.read) await markRead({ sessionToken, notificationId: n._id });
    const href = adminNotificationHref(n.type, n.relatedId);
    if (href) router.push(href);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Notifications</h1>
          <p className="text-muted-foreground">Deposits, withdrawals, investments, and KYC submissions from users.</p>
        </div>
        {!!unreadCount && (
          <Button variant="outline" size="sm" onClick={() => markAllRead({ sessionToken })}>
            Mark all read
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="flex flex-col gap-2">
          {(notifications ?? []).length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            (notifications ?? []).map((n) => (
              <button
                key={n._id}
                type="button"
                onClick={() => handleSelect(n)}
                className={cn(
                  "flex items-start justify-between gap-3 rounded-lg border p-3 text-left text-sm hover:bg-muted/50",
                  !n.read && "bg-primary/5"
                )}
              >
                <div>
                  <p className="flex items-center gap-1.5 font-medium">
                    {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />}
                    {n.title}
                  </p>
                  <p className="text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(n.createdAt)}</p>
                </div>
              </button>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
