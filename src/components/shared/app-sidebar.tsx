"use client";

import * as React from "react";
import Link from "next/link";

import { NavMain } from "@/components/shared/nav-main";
import { NavUser, type NavUserMenuItem } from "@/components/shared/nav-user";
import { LogoMark } from "@/components/shared/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import type {
  SidebarBrand,
  SidebarNavGroup,
  SidebarUser,
} from "@/components/shared/dashboard-nav-types";

export function AppSidebar({
  brand,
  navGroups,
  user,
  userMenuItems,
  onLogout,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  brand: SidebarBrand;
  navGroups: SidebarNavGroup[];
  user: SidebarUser;
  userMenuItems?: NavUserMenuItem[];
  onLogout?: () => void;
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={brand.href}>
                <div className="flex aspect-square size-8 shrink-0 items-center justify-center">
                  <LogoMark size={32} />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-display font-semibold">
                    {brand.name}
                  </span>
                  {brand.subtitle ? (
                    <span className="truncate text-xs text-muted-foreground">
                      {brand.subtitle}
                    </span>
                  ) : null}
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="pt-2">
        <NavMain groups={navGroups} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} menuItems={userMenuItems} onLogout={onLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
