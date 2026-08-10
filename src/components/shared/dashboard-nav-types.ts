import type { LucideIcon } from "lucide-react";

// NOTE: values of these types (icon component refs especially) must be
// constructed inside a Client Component, e.g. the (user)/(admin) sidebar
// wrapper — component references can't be passed as props from a Server
// Component across the RSC boundary.

export type SidebarNavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: { title: string; url: string }[];
};

export type SidebarNavGroup = {
  label?: string;
  items: SidebarNavItem[];
};

export type SidebarUser = {
  name: string;
  email: string;
  avatarUrl?: string;
};

export type SidebarBrand = {
  name: string;
  subtitle?: string;
  href: string;
};
