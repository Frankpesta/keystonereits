import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusTone = "success" | "warning" | "destructive" | "muted";

const TONE_CLASSES: Record<StatusTone, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  muted: "bg-muted text-muted-foreground",
};

/**
 * Every status literal used across the schema, mapped to the four-tone
 * convention from the design system. Keep this exhaustive as new statuses
 * are introduced rather than letting call sites pass a `tone` override.
 */
export const STATUS_TONE_MAP: Record<string, StatusTone> = {
  // success
  approved: "success",
  confirmed: "success",
  credited: "success",
  completed: "success",
  active: "success",
  sent: "success",
  // warning
  pending: "warning",
  under_review: "warning",
  confirming: "warning",
  maturing: "warning",
  processing: "warning",
  info_required: "warning",
  restricted: "warning",
  open: "warning",
  pending_admin: "warning",
  pending_user: "warning",
  admin_paused: "warning",
  // destructive
  rejected: "destructive",
  failed: "destructive",
  cancelled: "destructive",
  suspended: "destructive",
  // muted
  draft: "muted",
  not_started: "muted",
  archived: "muted",
  closed: "muted",
  paused: "muted",
  admin_ended: "muted",
  disabled: "muted",
};

export function formatLabel(status: string) {
  return status
    .split("_")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: string;
  label?: string;
  className?: string;
}) {
  const tone = STATUS_TONE_MAP[status] ?? "muted";

  return (
    <Badge variant="outline" className={cn("border-transparent", TONE_CLASSES[tone], className)}>
      {label ?? formatLabel(status)}
    </Badge>
  );
}
