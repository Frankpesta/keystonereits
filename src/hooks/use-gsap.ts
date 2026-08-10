"use client";

import { useEffect, useLayoutEffect, useRef, type DependencyList, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// useLayoutEffect warns ("does nothing on the server") when it runs during
// SSR, which client components still do for their initial HTML — swap to a
// plain useEffect there, same as every other GSAP+Next.js integration does.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Scopes every tween/ScrollTrigger created inside `setup` to this
 * component's DOM subtree via gsap.context(), and reverts (kills) all of
 * them automatically on unmount or dependency change — the one place this
 * cleanup is implemented, so no component leaks a ScrollTrigger. Returns a
 * ref to attach to the root element being animated/observed.
 */
export function useGsap<T extends HTMLElement>(
  setup: (context: { scope: RefObject<T | null> }) => void,
  deps: DependencyList = []
) {
  const scope = useRef<T>(null);

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => setup({ scope }), scope);
    return () => ctx.revert();
  }, deps);

  return scope;
}

export { gsap, ScrollTrigger };
