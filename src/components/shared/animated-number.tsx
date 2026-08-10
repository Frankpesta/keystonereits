"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Tweens the displayed number from its current value to `value` whenever it
 * changes (not just on mount) — writes straight to the DOM node in
 * `onUpdate` rather than React state, since this fires on every animation
 * frame and would otherwise re-render the whole card on each tick.
 */
export function AnimatedNumber({
  value,
  formatter = (n: number) => Math.round(n).toLocaleString(),
  duration = 1,
  className,
}: {
  value: number;
  formatter?: (n: number) => string;
  duration?: number;
  className?: string;
}) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const counter = useRef({ value: 0 });

  useEffect(() => {
    const tween = gsap.to(counter.current, {
      value,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        if (spanRef.current) spanRef.current.textContent = formatter(counter.current.value);
      },
    });
    return () => {
      tween.kill();
    };
    // formatter/duration are expected to be stable across renders for a
    // given card; only `value` should restart the tween.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span ref={spanRef} className={className}>
      {formatter(0)}
    </span>
  );
}
