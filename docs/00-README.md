# KeystoneREITs — Build Instructions Index

This folder contains phase-by-phase build instructions for **Claude Code**. Work through
the phases **in order**, top to bottom. Each phase file is self-contained: read it fully
before writing code, and do not start a phase until the previous phase's "Definition of
Done" checklist is fully satisfied.

## Phases

| # | File | Covers |
|---|------|--------|
| 1 | `01-foundation-and-setup.md` | Repo init, Next.js 16 App Router, Tailwind, shadcn/ui, Convex project, Zustand, design system (brown theme), folder structure |
| 2 | `02-database-and-backend.md` | Full Convex schema, indexes, and core backend function conventions for every module in the PRD |
| 3 | `03-authentication.md` | Custom auth (email+password+OTP), separate user vs admin auth, sessions, middleware, route protection |
| 4 | `04-public-website.md` | Marketing site: Home, About, Plans, How It Works, Properties, FAQ, Referral/Partners, Contact, legal pages |
| 5 | `05-user-dashboard.md` | User dashboard: KYC, balances, deposits (crypto + fiat), investing, active investments, withdrawals, referrals, notifications, support tickets, profile |
| 6 | `06-admin-dashboard.md` | Admin dashboard: users, KYC review, deposits/withdrawals, plan mgmt, manual balance & investment controls, email center, reports, audit logs, roles, settings, support ticket mgmt |
| 7 | `07-emails-notifications-cron.md` | React Email templates, Resend integration, Convex crons (daily profit accrual, investment maturity), in-app notifications |
| 8 | `08-animations-polish-deployment.md` | GSAP + Anime.js motion pass, Recharts polish, responsiveness, accessibility, performance, QA, deployment |
| — | `09-marketing-site-copy.md` | Reference doc (not a build phase): full approved copy + route/nav map for every public marketing page — read this alongside Phase 4 when building `(marketing)` |

## Non-negotiable project rules (apply to every phase)

- **Stack:** Next.js 16+ (App Router, Server Components + Server Actions where sensible), TypeScript strict mode, Tailwind CSS, shadcn/ui (Shadcn **blocks** for the sidebar layouts), Zustand, Convex (DB + file storage + cron + realtime), Resend + react-email, GSAP + Anime.js, Recharts.
- **No dark theme.** Build one light theme only. Do not add a theme toggle or `dark:` variants.
- **Main brand color is brown.** Use the design tokens defined in Phase 1 — do not freelance new colors.
- **Two completely separate routing + auth surfaces:** user-facing app and `/admin`. Never share session cookies, layouts, or auth logic between them beyond shared utility code.
- **Admin has no signup route.** Admin accounts are seeded/created by another admin only. Only `/admin/login` and `/admin/forgot-password` (+ reset) exist publicly.
- **All money math happens in Convex mutations**, never trusted from the client. Client only sends intent (amount, plan id, etc.); Convex validates min/max/balance and computes the rest.
- **Every financial or administrative admin action must write an audit log entry** (admin identity, action, affected record, amount if any, before/after values, timestamp) — this is not optional and should be a shared helper, not repeated by hand.
- **Fiat deposits require a support ticket**, minimum $10,000. Crypto deposits require the user to submit a transaction hash for manual admin verification. Neither is automated — see Phase 2 (schema) and Phase 5/6 for the flows.
- Use `pnpm` for package management unless the existing repo already uses something else.
- Keep components small and colocated; prefer server components by default, opt into client components (`"use client"`) only where interactivity/animation/Zustand/Convex hooks require it.

- **Public site copy is authored, not placeholder.** `09-marketing-site-copy.md` contains
  the real, approved copy for every marketing route plus the exact navbar structure
  (hover-opening dropdowns under About Us / Properties / Resources). Phase 4 must build
  from that file's content and routes verbatim — do not invent replacement copy for pages
  it covers, and do not restructure the nav.

Proceed to `01-foundation-and-setup.md`.
