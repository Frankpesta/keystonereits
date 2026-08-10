import { COMPANY_NAME, COMPANY_REGISTRATION_NO } from "./nav-data";

/**
 * Registration No. 11793537 recurs everywhere trust is being established
 * (footer, /about, /about/trust-and-protection, /faq) — a fixed brand fact,
 * not decorative text. One component, reused.
 */
export function CompanyInfo({ className }: { className?: string }) {
  return (
    <p className={className}>
      {COMPANY_NAME} — Registration No.: {COMPANY_REGISTRATION_NO}
    </p>
  );
}
