/**
 * Single source of truth for which admin roles can reach which admin
 * section — imported by both the admin nav/layout (client-side filtering +
 * 403 rendering) and every convex/admin/*.ts module (server-side
 * `requireRole` enforcement), so the two can never drift.
 *
 * Individual mutations may still gate more tightly than their section's view
 * roles (e.g. everyone who can view /admin/users can see a user's detail
 * page, but only a narrower set can actually suspend one) — that's decided
 * per-mutation via `requireRole`, not here.
 */
export type AdminRole =
  | "super"
  | "finance"
  | "kyc"
  | "investment"
  | "compliance"
  | "support"
  | "marketing";

export const ADMIN_ROLES: AdminRole[] = [
  "super",
  "finance",
  "kyc",
  "investment",
  "compliance",
  "support",
  "marketing",
];

export type AdminSectionKey =
  | "overview"
  | "users"
  | "kyc"
  | "deposits"
  | "withdrawals"
  | "investment-plans"
  | "investments"
  | "referrals"
  | "support"
  | "email-center"
  | "reports"
  | "audit-logs"
  | "admins"
  | "settings";

const ALL_ROLES = ADMIN_ROLES;

export const ADMIN_SECTION_ROLES: Record<AdminSectionKey, AdminRole[]> = {
  overview: ALL_ROLES,
  users: ["super", "compliance", "finance", "support"],
  kyc: ["super", "kyc", "compliance"],
  deposits: ["super", "finance"],
  withdrawals: ["super", "finance"],
  "investment-plans": ["super", "investment"],
  investments: ["super", "investment"],
  referrals: ["super", "marketing", "finance"],
  support: ["super", "support"],
  "email-center": ["super", "marketing"],
  reports: ["super", "finance", "compliance"],
  "audit-logs": ["super", "compliance"],
  admins: ["super"],
  settings: ["super"],
};

export const ADMIN_SECTION_PATHS: Record<AdminSectionKey, string> = {
  overview: "/admin",
  users: "/admin/users",
  kyc: "/admin/kyc",
  deposits: "/admin/deposits",
  withdrawals: "/admin/withdrawals",
  "investment-plans": "/admin/investment-plans",
  investments: "/admin/investments",
  referrals: "/admin/referrals",
  support: "/admin/support",
  "email-center": "/admin/email-center",
  reports: "/admin/reports",
  "audit-logs": "/admin/audit-logs",
  admins: "/admin/admins",
  settings: "/admin/settings",
};

export function canAccessAdminSection(role: AdminRole, section: AdminSectionKey): boolean {
  return ADMIN_SECTION_ROLES[section].includes(role);
}

/** Longest-prefix match against a pathname, e.g. "/admin/users/123" -> "users". */
export function adminSectionForPath(pathname: string): AdminSectionKey | null {
  const entries = Object.entries(ADMIN_SECTION_PATHS) as [AdminSectionKey, string][];
  const sorted = entries.sort((a, b) => b[1].length - a[1].length);
  for (const [section, path] of sorted) {
    // "/admin" (overview) must match exactly — every other admin path is
    // technically a sub-path of it and would otherwise shadow real 404s.
    if (path === "/admin") {
      if (pathname === path) return section;
      continue;
    }
    if (pathname === path || pathname.startsWith(`${path}/`)) return section;
  }
  return null;
}
