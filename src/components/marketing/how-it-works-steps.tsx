import { cn } from "@/lib/utils";

export type Step = { number: string; title: string; description: string };

/**
 * The 4/5/6/7-step "how it works" flow appears near-verbatim across many
 * pages with different step counts/copy per page — shared layout, copy
 * passed in per call site.
 */
export function HowItWorksSteps({ steps, columns = 3 }: { steps: Step[]; columns?: 2 | 3 | 4 }) {
  return (
    <div
      className={cn(
        "grid gap-8",
        columns === 2 && "sm:grid-cols-2",
        columns === 3 && "sm:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "sm:grid-cols-2 lg:grid-cols-4"
      )}
    >
      {steps.map((step) => (
        <div key={step.number} className="relative">
          <span className="font-display text-5xl font-semibold text-accent/30">{step.number}</span>
          <span className="mt-3 block h-px w-10 bg-accent/40" aria-hidden />
          <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{step.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
        </div>
      ))}
    </div>
  );
}
