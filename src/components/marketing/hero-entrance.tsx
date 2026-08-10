"use client";

import type { ReactNode } from "react";
import { useGsap, gsap } from "@/hooks/use-gsap";

/** Staggers its direct children in on mount — used for the homepage hero's kicker/headline/copy/CTA stack. */
export function HeroEntrance({ children, className }: { children: ReactNode; className?: string }) {
  const scope = useGsap<HTMLDivElement>(({ scope: heroScope }) => {
    if (!heroScope.current) return;
    gsap.from(heroScope.current.children, {
      opacity: 0,
      y: 20,
      duration: 0.7,
      stagger: 0.12,
      ease: "power2.out",
    });
  }, []);

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
