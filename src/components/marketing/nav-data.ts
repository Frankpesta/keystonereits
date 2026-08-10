export type NavLink = { label: string; href: string };

export type NavDropdownData = {
  label: string;
  items: NavLink[];
};

export const NAV_DROPDOWNS: NavDropdownData[] = [
  {
    label: "About Us",
    items: [
      { label: "About Keystone REIT", href: "/about" },
      { label: "Our Mission", href: "/about/mission" },
      { label: "Why Keystone REIT", href: "/about/why-keystone-reit" },
      { label: "Trust & Protection", href: "/about/trust-and-protection" },
    ],
  },
  {
    label: "Properties",
    items: [
      { label: "Our Properties", href: "/properties" },
      { label: "Serviced Apartments", href: "/properties/serviced-apartments" },
      { label: "Property Portfolio", href: "/properties/portfolio" },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "FAQs", href: "/faq" },
      { label: "How Real Estate Participation Works", href: "/how-it-works" },
      { label: "Real Estate Insights", href: "/resources/real-estate-insights" },
      { label: "Investment Guide", href: "/resources/investment-guide" },
    ],
  },
];

export const NAV_LINKS: NavLink[] = [{ label: "How It Works", href: "/how-it-works" }, { label: "Investment Plans", href: "/investment-plans" }];

export const FOOTER_QUICK_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Investment Plans", href: "/investment-plans" },
  { label: "Why Real Estate?", href: "/about/why-keystone-reit" },
  { label: "FAQs", href: "/faq" },
  { label: "Contact Us", href: "/contact" },
];

export const FOOTER_LEGAL_LINKS: NavLink[] = [
  { label: "Terms and Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

export const COMPANY_NAME = "Keystone REIT";
export const COMPANY_REGISTRATION_NO = "11793537";
export const COMPANY_TAGLINE = "Real Estate. Made More Accessible.";
