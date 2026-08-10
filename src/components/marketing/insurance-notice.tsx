import { ShieldCheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** The "properties are insured against covered risks" line — recurs everywhere trust is established. */
export function InsuranceNotice({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-start gap-3 rounded-xl border border-accent/20 bg-secondary/40 p-5 shadow-sm", className)}>
      <ShieldCheckIcon className="mt-0.5 size-5 shrink-0 text-accent" />
      <p className="text-sm leading-relaxed text-foreground/80">
        Our underlying properties are insured against covered risks, providing an additional layer of protection for
        the assets supporting the business.
      </p>
    </div>
  );
}
