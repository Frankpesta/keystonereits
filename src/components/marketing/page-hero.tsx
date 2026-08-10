import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { SectionKicker } from "./section";

export type HeroCta = { label: string; href: string; variant?: "default" | "outline" };

/**
 * Shared inner-page hero — centered title/description/CTAs on a warm
 * gradient-glow background. Optional `kicker` label sits above the title;
 * pass it wherever a page benefits from a short section-of-the-site cue.
 */
export function PageHero({
  kicker,
  title,
  description,
  ctas,
  children,
}: {
  kicker?: string;
  title: string;
  description?: ReactNode;
  ctas?: HeroCta[];
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b bg-secondary/40">
      <div
        className="pointer-events-none absolute -top-32 right-[-8%] size-[26rem] rounded-full bg-accent/15 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-40 left-[-10%] size-[26rem] rounded-full bg-primary/10 blur-[100px]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8 lg:py-32">
        {kicker ? <SectionKicker className="justify-center">{kicker}</SectionKicker> : null}
        <h1
          className={`text-balance font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl ${kicker ? "mt-6" : ""}`}
        >
          {title}
        </h1>
        {description ? (
          <div className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            {description}
          </div>
        ) : null}
        {ctas?.length ? (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {ctas.map((cta) => (
              <Button key={cta.label} size="lg" variant={cta.variant ?? "default"} asChild>
                <Link href={cta.href}>{cta.label}</Link>
              </Button>
            ))}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}
