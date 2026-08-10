"use client";

import { LayoutDashboardIcon, UsersIcon, WalletIcon } from "lucide-react";

import { AppSidebar } from "@/components/shared/app-sidebar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { SidebarNavGroup } from "@/components/shared/dashboard-nav-types";

const SWATCHES = [
  { name: "background", className: "bg-background border" },
  { name: "foreground", className: "bg-foreground" },
  { name: "primary", className: "bg-primary" },
  { name: "secondary", className: "bg-secondary" },
  { name: "accent", className: "bg-accent" },
  { name: "muted", className: "bg-muted" },
  { name: "destructive", className: "bg-destructive" },
  { name: "success", className: "bg-success" },
  { name: "warning", className: "bg-warning" },
];

const ALL_STATUSES = [
  "approved",
  "confirmed",
  "credited",
  "completed",
  "active",
  "pending",
  "under_review",
  "confirming",
  "maturing",
  "processing",
  "info_required",
  "rejected",
  "failed",
  "cancelled",
  "draft",
  "not_started",
  "archived",
  "closed",
];

// Nav config (including icon component refs) is defined inside this Client
// Component on purpose: React component references can't cross the Server ->
// Client boundary as props, so every dashboard sidebar (user/admin, Phase 5/6)
// must define its NavItem[] here, not receive it from a server page.
const placeholderNav: SidebarNavGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", url: "/style-guide", icon: LayoutDashboardIcon }],
  },
  {
    label: "Example",
    items: [
      { title: "Users", url: "/style-guide/users", icon: UsersIcon },
      { title: "Balances", url: "/style-guide/balances", icon: WalletIcon },
    ],
  },
];

export function StyleGuideContent() {
  return (
    <SidebarProvider>
      <AppSidebar
        brand={{ name: "Keystone REIT", subtitle: "Style Guide", href: "/style-guide" }}
        navGroups={placeholderNav}
        user={{ name: "Demo User", email: "demo@keystonereits.com" }}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="font-display text-lg font-semibold">Style Guide</h1>
        </header>
        <main className="flex flex-1 flex-col gap-10 p-6">
          <section>
            <h2 className="mb-3 font-display text-xl font-semibold">Colors</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {SWATCHES.map((s) => (
                <div key={s.name} className="flex flex-col gap-2">
                  <div className={`h-16 w-full rounded-lg ${s.className}`} />
                  <span className="text-sm text-muted-foreground">{s.name}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-semibold">Typography</h2>
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-display text-4xl font-semibold">
                  Real Estate. Made More Accessible.
                </p>
                <p className="text-sm text-muted-foreground">font-display (Fraunces)</p>
              </div>
              <div>
                <p className="font-sans text-lg">
                  Keystone REIT provides an accessible way to participate in real estate.
                </p>
                <p className="text-sm text-muted-foreground">font-sans (Plus Jakarta Sans)</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-semibold">Buttons</h2>
            <div className="flex flex-wrap gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-semibold">Status Badges</h2>
            <div className="flex flex-wrap gap-2">
              {ALL_STATUSES.map((status) => (
                <StatusBadge key={status} status={status} />
              ))}
            </div>
          </section>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
