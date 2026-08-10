import { COMPANY_NAME, COMPANY_REGISTRATION_NO, COMPANY_WEBSITE } from "./nav-data";

/**
 * Registration No. 11793537 + website recur everywhere trust is being
 * established (footer, /about, /about/trust-and-protection, /faq) — fixed
 * brand facts, not decorative text. One component, reused.
 */
export function CompanyInfo({ className }: { className?: string }) {
  return (
    <p className={className}>
      {COMPANY_NAME} — Registration No.: {COMPANY_REGISTRATION_NO} · Website: {COMPANY_WEBSITE}
    </p>
  );
}
