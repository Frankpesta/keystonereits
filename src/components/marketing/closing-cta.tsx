import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { HeroCta } from "./page-hero";

/** The dark-brand closing CTA band nearly every page ends with. */
export function ClosingCta({
  title,
  description,
  ctas,
}: {
  title: string;
  description?: ReactNode;
  ctas: HeroCta[];
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-[color-mix(in_oklch,var(--primary),black_35%)] text-primary-foreground">
      <div
        className="pointer-events-none absolute top-0 right-0 size-[30rem] -translate-y-1/3 translate-x-1/4 rounded-full bg-accent/25 blur-[110px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 size-[24rem] translate-y-1/3 -translate-x-1/4 rounded-full bg-primary-foreground/10 blur-[110px]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h2 className="text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
        {description ? (
          <div className="mx-auto mt-5 max-w-xl text-pretty leading-relaxed text-primary-foreground/85">
            {description}
          </div>
        ) : null}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          {ctas.map((cta, i) => (
            <Button
              key={cta.label}
              size="lg"
              variant={i === 0 ? "secondary" : "outline"}
              className={i !== 0 ? "border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" : undefined}
              asChild
            >
              <Link href={cta.href}>{cta.label}</Link>
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
