"use client";

import { cn } from "@/lib/utils";
import { useGsap, gsap } from "@/hooks/use-gsap";
import type { ReactNode, RefObject } from "react";

/**
 * Every marketing page's section wrapper — animating it here (fade + a
 * slight y-translate on scroll into view, once) gives every page the same
 * subtle scroll reveal for free, rather than wiring ScrollTrigger into each
 * page individually. Kept deliberately restrained (short duration, small
 * travel distance) — this is a financial product, not a portfolio site.
 */
export function Section({
  children,
  className,
  muted,
  as: Comp = "section",
}: {
  children: ReactNode;
  className?: string;
  muted?: boolean;
  as?: "section" | "div";
}) {
  const scope = useGsap<HTMLElement>(({ scope: sectionScope }) => {
    if (!sectionScope.current) return;
    gsap.from(sectionScope.current, {
      opacity: 0,
      y: 24,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: sectionScope.current,
        start: "top 85%",
        once: true,
      },
    });
  }, []);

  return (
    // Cast needed because `Comp` is a dynamic "section" | "div" — both are
    // plain HTMLElements at runtime, but TS can't narrow a generic ref
    // against that union of intrinsic element types.
    <Comp ref={scope as RefObject<HTMLDivElement>} className={cn(muted && "bg-secondary/30", className)}>
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">{children}</div>
    </Comp>
  );
}

export function SectionKicker({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-3 text-xs font-semibold tracking-[0.22em] text-accent uppercase",
        className
      )}
    >
      <span className="h-px w-6 bg-accent/50" aria-hidden />
      {children}
      <span className="h-px w-6 bg-accent/50" aria-hidden />
    </p>
  );
}
