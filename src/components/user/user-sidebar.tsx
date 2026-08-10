"use client";

import { useQuery } from "convex/react";
import {
  ArrowDownToLineIcon,
  ArrowUpFromLineIcon,
  BellIcon,
  LifeBuoyIcon,
  LayoutDashboardIcon,
  ReceiptIcon,
  TrendingUpIcon,
  UserCogIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";

import { api } from "@/lib/convex-api";
import { useSessionToken } from "@/lib/auth/session-context";
import { logoutAction } from "@/app/(auth)/actions";
import { AppSidebar } from "@/components/shared/app-sidebar";
import type { SidebarNavGroup } from "@/components/shared/dashboard-nav-types";

const NAV_GROUPS: SidebarNavGroup[] = [
  {
    items: [
      { title: "Overview", url: "/dashboard", icon: LayoutDashboardIcon },
      { title: "Deposit", url: "/dashboard/deposit", icon: ArrowDownToLineIcon },
      {
        title: "Invest",
        url: "/dashboard/invest",
        icon: TrendingUpIcon,
        items: [
          { title: "Plans", url: "/dashboard/invest" },
          { title: "Active Investments", url: "/dashboard/investments" },
        ],
      },
      { title: "Profit Balance", url: "/dashboard/profit", icon: WalletIcon },
      { title: "Withdraw", url: "/dashboard/withdraw", icon: ArrowUpFromLineIcon },
      { title: "Transactions", url: "/dashboard/transactions", icon: ReceiptIcon },
      { title: "Referrals", url: "/dashboard/referrals", icon: UsersIcon },
      { title: "Support", url: "/dashboard/support", icon: LifeBuoyIcon },
      { title: "Notifications", url: "/dashboard/notifications", icon: BellIcon },
      { title: "Profile & Security", url: "/dashboard/profile", icon: UserCogIcon },
    ],
  },
];

export function UserSidebar() {
  const sessionToken = useSessionToken();
  const user = useQuery(api.users.currentUser, { sessionToken });

  return (
    <AppSidebar
      brand={{ name: "Keystone REIT", subtitle: "Investor Portal", href: "/dashboard" }}
      navGroups={NAV_GROUPS}
      user={{
        name: user ? `${user.firstName} ${user.lastName}` : "...",
        email: user?.email ?? "",
      }}
      onLogout={() => logoutAction()}
    />
  );
}
