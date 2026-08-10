// convex/tsconfig.json typechecks this directory as its own isolated
// project and never pulls in vitest's ambient `vite/client` types (that only
// happens implicitly at the repo root, via vitest.config.mts). Test files
// here use `import.meta.glob` (a Vite/Vitest build-time feature) to hand
// convex-test its module registry — this augmentation lets Convex's own
// bundler typecheck them without pulling in `vite` as a real dependency.
interface ImportMeta {
  glob(pattern: string): Record<string, () => Promise<unknown>>;
}
