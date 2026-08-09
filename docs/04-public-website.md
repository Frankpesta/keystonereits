# Phase 4 — Public Website

## Objective
Build the marketing site that sits in front of the app — the trust-building layer for a
real-estate investment product. Server-rendered, fast, SEO-sane, all within the
`(marketing)` route group and the brown design system from Phase 1.

**Read `09-marketing-site-copy.md` before starting this phase.** It is the authoritative
source for every route, the full nav/dropdown structure, and the actual approved copy for
each page — this phase's job is to build the pages and components that render that copy
correctly, not to author new copy. Where this file and that one disagree on a route name,
`09-marketing-site-copy.md` wins (it reflects the final approved sitemap).

## Pages

The full route list, nav structure, and per-page copy live in `09-marketing-site-copy.md`.
Summary of routes to scaffold in `(marketing)`:

`/`, `/about`, `/about/mission`, `/about/why-keystone-reit`,
`/about/trust-and-protection`, `/how-it-works`, `/investment-plans`, `/properties`,
`/properties/serviced-apartments`, `/properties/portfolio`, `/faq`,
`/resources/real-estate-insights`, `/resources/investment-guide`, `/contact`, plus the
Phase-3 auth routes (`/login`, `/signup`, `/forgot-password`, `/reset-password`,
`/verify-email`, `/verify-login`) and `/terms`, `/privacy` (legal pages — no copy
supplied yet; scaffold with clear placeholder headings, do not invent legal text).

`/investment-plans` pulls live `investmentPlans` (status `active`) via a public Convex
query for the plan cards — seed data is the four plans given in
`09-marketing-site-copy.md` §8 (Foundation/Growth/Premium/Elite), but the page must read
from Convex, not hardcode them, so admin edits in Phase 6 are reflected immediately.

## Layout & navigation

`src/app/(marketing)/layout.tsx`:
- Sticky header per `09-marketing-site-copy.md` §1: Logo · Home · **About Us ▾** · How It
  Works · Investment Plans · **Properties ▾** · **Resources ▾** · Contact · Sign In | Get
  Started. The three `▾` items are **hover-opening dropdowns** on desktop (short close
  delay on mouseleave, no flicker) and tap-to-expand accordions inside the mobile sheet
  nav — build one shared `<NavDropdown>` component for all three rather than three
  bespoke implementations.
- Footer: quick links + legal links per the copy file's §2 footer block, company info
  (Registration No. 11793537, www.keystonereits.com) — reuse a shared `<CompanyInfo>` bit
  since it recurs across several pages per §16 of the copy file.

## Content/data rules
- Build every page's copy from `09-marketing-site-copy.md` verbatim — do not paraphrase
  or invent replacement copy for anything it covers.
- Build the recurring content blocks called out in that file's §16 ("Cross-page
  consistency notes") as shared components (`<HowItWorksSteps />`, `<WhyParticipateGrid
  />`, `<InsuranceNotice />`, `<PlanComparisonTable />`) and reuse them across the pages
  that repeat them — several sections are near-identical across 4–6 routes.
- Preserve each page's specific CTA button label exactly as given in the copy file — they
  are intentionally not normalized to one string across the site.
- Keep the "returns are not guaranteed" disclosure visible near every ROI figure
  rendered anywhere in the UI (marketing pages and, later, the dashboard), not only on
  the pages where the copy file spells it out.
- `/contact` has no supplied copy — build the functional contact form (→ Convex mutation
  → Resend notification per Phase 7) with minimal placeholder framing text, and flag it
  as still needing authored copy rather than inventing brand-voice content for it.
- This platform's deposit funding model (crypto primary + fiat from $10,000 via support
  ticket) is documented in the KeystoneREITs PRD, not in the marketing copy file — if/when
  a deposit-mechanics explanation is added to `/how-it-works` or `/faq`, source that
  detail from the PRD, not from invented copy.

## Definition of Done
- [ ] Every route above exists, renders with real (non-lorem) copy, and matches the Phase 1 design tokens with zero ad hoc colors.
- [ ] `/plans` reflects live Convex data — verify by toggling a seeded plan's status in the (not-yet-built) admin and confirming the public page updates.
- [ ] Header/footer are shared via the route-group layout, not duplicated per page.
- [ ] Contact form successfully writes a record / triggers the Phase-7 email action (stub the email call if Phase 7 isn't built yet, but leave a clear `// TODO Phase 7` marker).
- [ ] Fully responsive at mobile, tablet, desktop breakpoints — no horizontal scroll, mobile nav works.
- [ ] Lighthouse/basic SEO: page titles + meta descriptions set per route via Next.js `metadata` exports.
