// `import.meta.glob` resolves at its OWN call site, so this must live at
// the convex/ root — calling it from a nested file (e.g. convex/lib/*.test.ts)
// produces keys relative to that nested directory instead of convex root,
// which breaks convex-test's resolution of nested function references like
// `internal.lib.otp.recordFailedOtpAttempt`. Every *.test.ts file imports
// this shared, correctly-rooted registry instead of calling glob itself.
export const convexTestModules = import.meta.glob("./**/*.{ts,tsx}");
