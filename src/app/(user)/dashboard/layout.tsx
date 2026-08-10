import { redirect } from "next/navigation";
import { api } from "@/lib/convex-api";
import { convexServerClient } from "@/lib/auth/convex-server";
import { getUserSessionToken } from "@/lib/auth/session";
import { SessionTokenProvider } from "@/lib/auth/session-context";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/user/user-sidebar";
import { DashboardHeader } from "@/components/user/dashboard-header";
import { RouteTransition } from "@/components/shared/route-transition";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const token = await getUserSessionToken();
  if (!token) redirect("/login");

  try {
    await convexServerClient().query(api.users.currentUser, { sessionToken: token });
  } catch {
    redirect("/login");
  }

  return (
    <SessionTokenProvider token={token}>
      <SidebarProvider>
        <UserSidebar />
        <SidebarInset>
          <DashboardHeader />
          <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <RouteTransition>{children}</RouteTransition>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </SessionTokenProvider>
  );
}
