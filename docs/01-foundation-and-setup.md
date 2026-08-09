# Phase 1 — Foundation & Setup

## Objective
Stand up a clean, correctly-configured Next.js 16 project with every core library wired
in, a working (empty) Convex project, and a locked-in brown-based design system that
every later phase will reuse without re-deciding colors, spacing, or component
conventions.

## 1. Initialize the project

```bash
pnpm create next-app@latest keystonereits --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd keystonereits
```

Confirm Next.js resolves to **16.x**. Enable `typescript.strict` in `tsconfig.json` if not
already on.

## 2. Install core dependencies

```bash
pnpm add convex zustand resend react-email @react-email/components gsap animejs recharts
pnpm add class-variance-authority clsx tailwind-merge lucide-react date-fns zod
pnpm add -D @types/animejs
```

## 3. shadcn/ui

```bash
pnpm dlx shadcn@latest init
```

- Style: **default** (not "new-york" unless the team prefers it — pick one and stay consistent).
- Base color: **neutral**. We will override tokens with the brown palette below, do NOT pick a pre-built colored theme.
- CSS variables: **yes**.
- **Do not enable dark mode.** If the init wizard scaffolds a `.dark` block in `globals.css`, delete it — the app ships light-theme only, no toggle, no `dark:` classes anywhere.

Install the components we know we'll need across the app so later phases don't stop to add them one at a time:

```bash
pnpm dlx shadcn@latest add button input label form card table badge avatar
pnpm dlx shadcn@latest add dropdown-menu dialog alert-dialog sheet tabs select
pnpm dlx shadcn@latest add toast sonner separator skeleton progress tooltip
pnpm dlx shadcn@latest add sidebar breadcrumb pagination command popover
pnpm dlx shadcn@latest add avatar badge calendar chart
```

Use `sonner` for all toasts (shadcn's current recommendation over the legacy `toast`).

### Sidebar

Pull an actual **shadcn block** for the sidebar shell rather than hand-building one:

```bash
pnpm dlx shadcn@latest add sidebar-07
```

(`sidebar-07` is the collapsible-icon dashboard sidebar block — inspect what's available via
`pnpm dlx shadcn@latest add` with no args if the exact block name differs at build time, and
pick the block described as a collapsible dashboard sidebar with grouped nav + user menu at
the bottom.) You will fork this into two variants in later phases: one nav config for the
user dashboard, one for admin — same underlying shell component, different `NavItem[]`
data passed in as props. Do not build two separate sidebar shells.

## 4. Design system — brown theme

Edit `src/app/globals.css` CSS variables to the palette below (HSL, matching shadcn's
token format). This is the **only** palette for the project — do not introduce ad hoc
colors in components.

```css
:root {
  --background: 36 33% 97%;        /* warm off-white */
  --foreground: 24 20% 14%;        /* near-black brown-tinted text */

  --primary: 24 38% 28%;           /* core brand brown */
  --primary-foreground: 36 33% 97%;

  --secondary: 30 20% 92%;         /* light warm neutral */
  --secondary-foreground: 24 20% 14%;

  --accent: 32 45% 45%;            /* lighter warm brown/tan accent */
  --accent-foreground: 36 33% 97%;

  --muted: 30 15% 94%;
  --muted-foreground: 24 10% 40%;

  --card: 0 0% 100%;
  --card-foreground: 24 20% 14%;

  --popover: 0 0% 100%;
  --popover-foreground: 24 20% 14%;

  --border: 30 15% 88%;
  --input: 30 15% 88%;
  --ring: 24 38% 28%;

  --destructive: 0 65% 45%;
  --destructive-foreground: 36 33% 97%;

  --success: 142 45% 32%;          /* custom token: add to tailwind config, used for
                                       "Approved / Credited / Completed" states */
  --warning: 38 80% 45%;           /* custom token: "Pending / Under Review" states */

  --radius: 0.65rem;
}
```

Extend `tailwind.config.ts` `theme.extend.colors` with `success` and `warning` mapped to
the CSS vars above (same pattern shadcn uses for `primary`/`destructive`), so
`bg-success`, `text-warning`, etc. are available.

Add two font families via `next/font`: a serif or slab display face for headings (evokes
"institutional / real-estate trust") and a clean grotesk for body/UI. Suggested pairing:
**Fraunces** (or **Source Serif 4**) for `--font-display`, **Inter** for `--font-sans`.
Wire both into `tailwind.config.ts` `fontFamily`.

### Status color convention (use everywhere, all later phases)
- `success` (green): Approved, Confirmed, Credited, Completed, Active
- `warning` (amber): Pending, Under Review, Confirming, Maturing, Processing
- `destructive` (red): Rejected, Failed, Cancelled
- `muted`: Draft, Not Started, Archived, Closed

Build one shared `<StatusBadge status={...} />` component in `src/components/shared/`
early (Phase 2/3) so every table/list in the app renders statuses identically.

## 5. Convex

```bash
pnpm dlx convex dev
```

This scaffolds `convex/` and `convex/_generated/`. Confirm `ConvexProvider` (client
components) is wired at the root via a small `src/app/convex-client-provider.tsx`
wrapped around `{children}` in `src/app/layout.tsx`. Store `NEXT_PUBLIC_CONVEX_URL` in
`.env.local`.

Do not write schema yet — that's Phase 2. Just confirm `pnpm dlx convex dev` connects and
the dashboard is reachable.

## 6. Zustand — scope of use

Zustand is for **client-only, ephemeral UI state** — sidebar collapsed/expanded, multi-step
wizard progress (e.g., investment confirmation flow, KYC upload steps), open/closed state
of complex modals, locally-drafted form state before submission. It is **not** a cache for
server data — all server data (balances, investments, users, etc.) is read live via Convex
`useQuery` hooks, which are already reactive. Mixing the two responsibilities is a common
mistake — call it out in code review if you see Convex data being copied into a Zustand
store "just to have it globally."

Create `src/stores/` for store files, one file per concern (e.g., `use-sidebar-store.ts`,
`use-invest-wizard-store.ts`).

## 7. Folder structure

```
src/
  app/
    (marketing)/          # Phase 4 — public site, its own layout
    (user)/                # Phase 5 — authenticated user app, its own layout
      dashboard/
    (admin)/                # Phase 6 — authenticated admin app, its own layout, own segment
      admin/
    api/                    # route handlers only where a Server Action doesn't fit
    layout.tsx               # root layout — fonts, ConvexProvider, Toaster only
    globals.css
  components/
    ui/                    # shadcn-generated, do not hand-edit unless necessary
    shared/                 # StatusBadge, EmptyState, PageHeader, DataTable wrapper, etc.
    marketing/
    user/
    admin/
    emails/                 # Phase 7 — react-email templates
  convex/                  # already at repo root by convex convention — see Phase 2
  stores/                  # zustand stores
  lib/
    utils.ts                # shadcn's cn() lives here
    validation/              # zod schemas shared between client forms and Convex args
  hooks/
```

Route groups `(marketing)`, `(user)`, `(admin)` keep three independent layouts (and
later, independent auth middleware branches) without polluting the URL with the group
name.

## Definition of Done
- [ ] `pnpm dev` runs with no errors, default Next.js page replaced with a placeholder that renders `<Button>` and confirms brown primary color is applied.
- [ ] No dark mode CSS, no theme toggle anywhere in the codebase.
- [ ] `pnpm dlx convex dev` connects successfully; empty schema deploys.
- [ ] Sidebar block is installed and renders (even with placeholder nav items) inside a throwaway test route.
- [ ] Folder structure above exists (empty folders with `.gitkeep` where needed).
- [ ] Fonts, color tokens, and `success`/`warning` tokens are confirmed working via a temporary `/style-guide` page showing swatches, both fonts, and a `<StatusBadge>` for every status value listed above. Delete this page at the end of Phase 8, not before — it's useful for QA throughout.
