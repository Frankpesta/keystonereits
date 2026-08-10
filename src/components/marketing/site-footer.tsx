import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { COMPANY_NAME, COMPANY_REGISTRATION_NO, COMPANY_WEBSITE, FOOTER_LEGAL_LINKS, FOOTER_QUICK_LINKS } from "./nav-data";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2">
              <Logo height={36} />
            </Link>
            <p className="mt-2 font-display text-sm text-muted-foreground">Real Estate. Made More Accessible.</p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {COMPANY_NAME} provides investors with an accessible way to participate in professionally managed real
              estate through serviced apartments and short-term rental properties.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Registration No.: {COMPANY_REGISTRATION_NO} · Website: {COMPANY_WEBSITE}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Quick Links</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {FOOTER_QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {FOOTER_LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-sm text-muted-foreground">
          © {year} {COMPANY_NAME}. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
