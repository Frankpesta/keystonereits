import { redirect } from "next/navigation";
import { api } from "@/lib/convex-api";
import { convexServerClient } from "@/lib/auth/convex-server";
import { getAdminSessionToken } from "@/lib/auth/session";
import { SessionTokenProvider } from "@/lib/auth/session-context";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSectionGuard } from "@/components/admin/admin-section-guard";
import { RouteTransition } from "@/components/shared/route-transition";

export default async function AdminDashboardLayout({ children }: LayoutProps<"/admin">) {
  const token = await getAdminSessionToken();
  if (!token) redirect("/admin/login");

  try {
    await convexServerClient().query(api.admins.currentAdmin, { sessionToken: token });
  } catch {
    redirect("/admin/login");
  }

  return (
    <SessionTokenProvider token={token}>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <AdminHeader />
          <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <RouteTransition>
              <AdminSectionGuard>{children}</AdminSectionGuard>
            </RouteTransition>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </SessionTokenProvider>
  );
}
