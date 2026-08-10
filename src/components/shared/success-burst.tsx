"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const PARTICLE_ANGLES_DEG = [0, 60, 120, 180, 240, 300];

/**
 * A brief (~300ms) success flourish — checkmark scale-in with a few
 * particles bursting outward and fading. Mount it conditionally right when
 * an action completes (investment confirmed, withdrawal submitted, KYC
 * approved) rather than leaving it permanently in the tree.
 */
export function SuccessBurst({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const check = root.querySelector<HTMLElement>("[data-success-check]");
    const particles = Array.from(root.querySelectorAll<HTMLElement>("[data-success-particle]"));

    if (check) animate(check, { scale: [0, 1], duration: 260, ease: "outBack" });

    particles.forEach((particle, i) => {
      const angle = (PARTICLE_ANGLES_DEG[i] ?? 0) * (Math.PI / 180);
      animate(particle, {
        translateX: Math.cos(angle) * 24,
        translateY: Math.sin(angle) * 24,
        opacity: [1, 0],
        scale: [1, 0.4],
        duration: 300,
        delay: 60,
        ease: "outQuad",
      });
    });
  }, []);

  return (
    <div ref={rootRef} className={cn("relative flex items-center justify-center", className)}>
      {PARTICLE_ANGLES_DEG.map((angle) => (
        <span
          key={angle}
          data-success-particle
          className="absolute size-1.5 rounded-full bg-success"
          style={{ left: "50%", top: "50%", marginLeft: -3, marginTop: -3 }}
        />
      ))}
      <div
        data-success-check
        className="relative flex size-10 items-center justify-center rounded-full bg-success/15 text-success"
      >
        <CheckIcon className="size-5" />
      </div>
    </div>
  );
}
