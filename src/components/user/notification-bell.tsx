"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useMutation, useQuery } from "convex/react";
import { BellIcon } from "lucide-react";

import { api } from "@/lib/convex-api";
import type { Id } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { userNotificationHref } from "@/lib/notification-links";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const sessionToken = useSessionToken();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const unreadCount = useQuery(api.notifications.unreadCount, { sessionToken });
  const notifications = useQuery(api.notifications.myNotifications, { sessionToken });
  const markAllRead = useMutation(api.notifications.markAllRead);
  const markRead = useMutation(api.notifications.markRead);

  const recent = notifications?.slice(0, 5) ?? [];

  async function handleSelect(n: { _id: Id<"notifications">; read: boolean; type: string; relatedId?: string }) {
    if (!n.read) await markRead({ sessionToken, notificationId: n._id });
    setOpen(false);
    const href = userNotificationHref(n.type, n.relatedId);
    if (href) router.push(href);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={unreadCount ? `Notifications (${unreadCount} unread)` : "Notifications"}
        >
          <BellIcon />
          {!!unreadCount && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2.5">
          <span className="text-sm font-medium">Notifications</span>
          {!!unreadCount && (
            <button
              type="button"
              onClick={() => markAllRead({ sessionToken })}
              className="text-xs text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {recent.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            recent.map((n) => (
              <button
                key={n._id}
                type="button"
                onClick={() => handleSelect(n)}
                className={cn(
                  "flex w-full flex-col gap-0.5 border-b px-3 py-2.5 text-left text-sm last:border-b-0 hover:bg-muted/60",
                  !n.read && "bg-primary/5"
                )}
              >
                <span className="flex items-center gap-1.5 font-medium">
                  {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />}
                  {n.title}
                </span>
                <span className="line-clamp-2 text-muted-foreground">{n.body}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(n.createdAt, { addSuffix: true })}
                </span>
              </button>
            ))
          )}
        </div>
        <div className="border-t p-2">
          <Button asChild variant="ghost" size="sm" className="w-full">
            <Link href="/dashboard/notifications">View all</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
