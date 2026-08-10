"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useGsap, gsap } from "@/hooks/use-gsap";

/**
 * A brief fade/slide on the main content area whenever the route changes —
 * deliberately minimal so it doesn't fight Next.js's own navigation model
 * the way a heavy page-transition library would.
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const scope = useGsap<HTMLDivElement>(
    ({ scope: transitionScope }) => {
      if (!transitionScope.current) return;
      gsap.from(transitionScope.current, {
        opacity: 0,
        y: 8,
        duration: 0.35,
        ease: "power2.out",
      });
    },
    [pathname]
  );

  return <div ref={scope}>{children}</div>;
}
