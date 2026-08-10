"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * `progress` (0–1) is pure data computed by lib/investment-progress.ts —
 * this component's only job is to tween the DOM from whatever it's
 * currently showing to the new value, so a data refresh animates smoothly
 * instead of snapping. See docs/05-user-dashboard.md's investment detail
 * section.
 */
export function InvestmentProgressBar({ progress }: { progress: number }) {
  const fillRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef({ value: 0 });
  const [displayPercent, setDisplayPercent] = useState(0);

  useEffect(() => {
    const targetPercent = Math.round(progress * 100);
    const fillTween = fillRef.current
      ? gsap.to(fillRef.current, { width: `${progress * 100}%`, duration: 1, ease: "power2.out" })
      : null;
    const counterTween = gsap.to(counterRef.current, {
      value: targetPercent,
      duration: 1,
      ease: "power2.out",
      onUpdate: () => setDisplayPercent(Math.round(counterRef.current.value)),
    });
    return () => {
      fillTween?.kill();
      counterTween.kill();
    };
  }, [progress]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Progress to maturity</span>
        <span className="font-medium">{displayPercent}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
        <div ref={fillRef} className="h-full w-0 rounded-full bg-primary" />
      </div>
    </div>
  );
}
