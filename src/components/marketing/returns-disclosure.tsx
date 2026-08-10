import { cn } from "@/lib/utils";

/** Keep near every ROI figure shown anywhere in the UI — a regulatory-flavored disclosure, not filler. */
export function ReturnsDisclosure({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      Weekly ROI is plan-dependent. Returns are not guaranteed and are subject to the applicable investment terms and
      risks.
    </p>
  );
}
