import "@testing-library/jest-dom/vitest";

// jsdom has no matchMedia implementation; gsap's ScrollTrigger plugin calls
// it eagerly on registration (see src/hooks/use-gsap.ts), which otherwise
// crashes any test that transitively imports a component using that hook.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
