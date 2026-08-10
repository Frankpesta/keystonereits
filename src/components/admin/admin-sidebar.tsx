"use client";

import { useQuery } from "convex/react";
import {
  ArrowDownToLineIcon,
  ArrowUpFromLineIcon,
  BriefcaseIcon,
  FileBarChart2Icon,
  LayoutDashboardIcon,
  LifeBuoyIcon,
  MailIcon,
  ScrollTextIcon,
  SettingsIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  UserCogIcon,
  UsersIcon,
  Users2Icon,
} from "lucide-react";

import { api } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { adminLogoutAction } from "@/app/(admin)/admin/actions";
import { AppSidebar } from "@/components/shared/app-sidebar";
import type { SidebarNavGroup, SidebarNavItem } from "@/components/shared/dashboard-nav-types";
import { ADMIN_SECTION_PATHS, canAccessAdminSection, type AdminRole, type AdminSectionKey } from "@/lib/admin-access";

const NAV_ITEMS: { section: AdminSectionKey; title: string; icon: SidebarNavItem["icon"] }[] = [
  { section: "overview", title: "Overview", icon: LayoutDashboardIcon },
  { section: "users", title: "Users", icon: UsersIcon },
  { section: "kyc", title: "KYC Review", icon: ShieldCheckIcon },
  { section: "deposits", title: "Deposits", icon: ArrowDownToLineIcon },
  { section: "withdrawals", title: "Withdrawals", icon: ArrowUpFromLineIcon },
  { section: "investment-plans", title: "Investment Plans", icon: TrendingUpIcon },
  { section: "investments", title: "Investments", icon: BriefcaseIcon },
  { section: "referrals", title: "Referrals", icon: Users2Icon },
  { section: "support", title: "Support Tickets", icon: LifeBuoyIcon },
  { section: "email-center", title: "Email Center", icon: MailIcon },
  { section: "reports", title: "Reports", icon: FileBarChart2Icon },
  { section: "audit-logs", title: "Audit Logs", icon: ScrollTextIcon },
  { section: "admins", title: "Admins & Roles", icon: UserCogIcon },
  { section: "settings", title: "Settings", icon: SettingsIcon },
];

export function AdminSidebar() {
  const sessionToken = useSessionToken();
  const admin = useQuery(api.admins.currentAdmin, { sessionToken });
  const role: AdminRole | null = admin?.role ?? null;

  const items: SidebarNavItem[] = NAV_ITEMS.filter((item) => !role || canAccessAdminSection(role, item.section)).map(
    (item) => ({ title: item.title, url: ADMIN_SECTION_PATHS[item.section], icon: item.icon })
  );
  const navGroups: SidebarNavGroup[] = [{ items }];

  return (
    <AppSidebar
      brand={{ name: "Keystone REIT", subtitle: "Admin Console", href: "/admin" }}
      navGroups={navGroups}
      user={{ name: admin?.name ?? "...", email: admin?.email ?? "" }}
      onLogout={() => adminLogoutAction()}
    />
  );
}
