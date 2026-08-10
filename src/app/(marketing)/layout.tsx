import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { RouteTransition } from "@/components/shared/route-transition";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <RouteTransition>{children}</RouteTransition>
      </main>
      <SiteFooter />
    </>
  );
}
