import type { Metadata } from "next";
import { Section } from "@/components/marketing/section";
import { COMPANY_REGISTRATION_NO } from "@/components/marketing/nav-data";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Keystone REIT collects, uses, stores, protects, and discloses personal information.",
};

type LegalBlock =
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] };

type LegalSection = { number: number; title: string; blocks: LegalBlock[] };

const p = (text: string): LegalBlock => ({ kind: "p", text });
const ul = (items: string[]): LegalBlock => ({ kind: "ul", items });

const SECTIONS: LegalSection[] = [
  {
    number: 1,
    title: "INTRODUCTION",
    blocks: [
      p('Keystone REIT ("Keystone REIT," "we," "us," or "our") respects your privacy and is committed to protecting the personal information you provide when you visit our website, use our services, create an account, submit an inquiry, or participate in our investment plans.'),
      p("This Privacy Policy explains how we collect, use, store, protect, and disclose personal information when you interact with Keystone REIT through our website, our online platforms, and related services."),
      p("By accessing or using our website, you acknowledge that you have read and understood this Privacy Policy."),
      p("If you do not agree with the practices described in this Privacy Policy, please discontinue use of our website and services."),
    ],
  },
  {
    number: 2,
    title: "ABOUT KEYSTONE REIT",
    blocks: [
      p("Keystone REIT provides an accessible way to participate in professionally managed real estate through serviced apartments and short-term rental properties."),
      p("Our business involves the pooling and management of capital through our investment structure and the acquisition, furnishing, and management of real estate assets."),
      p(`Registration No.: ${COMPANY_REGISTRATION_NO}`),
    ],
  },
  {
    number: 3,
    title: "INFORMATION WE COLLECT",
    blocks: [
      p("We may collect different categories of information depending on how you interact with us."),
      p("Personal Information — this may include:"),
      ul([
        "Full name",
        "Email address",
        "Telephone number",
        "Residential or correspondence address",
        "Date of birth",
        "Identification information",
        "Nationality or country of residence",
        "Bank or payment information",
        "Investment and transaction information",
        "Account credentials",
        "Information provided when contacting our support team",
        "Any other information you voluntarily provide to us",
      ]),
      p("Verification Information — where required for identity verification, compliance, fraud prevention, or regulatory purposes, we may collect information from identification documents and other verification materials, including identification numbers, document details, photographs, or other information necessary to verify your identity."),
      p("Technical Information — when you visit our website, we may automatically collect certain technical information, including:"),
      ul([
        "IP address",
        "Browser type",
        "Device type",
        "Operating system",
        "Website pages visited",
        "Date and time of visits",
        "Referring website",
        "General usage and interaction information",
        "Cookies and similar technologies",
      ]),
    ],
  },
  {
    number: 4,
    title: "HOW WE COLLECT INFORMATION",
    blocks: [
      p("We may collect information:"),
      ul([
        "Directly from you when you register or create an account",
        "When you submit an investment application",
        "When you make an inquiry",
        "When you contact us",
        "When you subscribe to communications from us",
        "When you use our website",
        "Through cookies and similar technologies",
        "From service providers assisting us with verification, payments, technology, security, or other business functions",
        "From publicly available sources where appropriate and lawful",
        "Where required or permitted by applicable law",
      ]),
    ],
  },
  {
    number: 5,
    title: "HOW WE USE YOUR INFORMATION",
    blocks: [
      p("We may use your personal information for purposes including:"),
      p("Providing Our Services — to create and manage your account, process your participation, administer investment-related activities, communicate with you, and provide customer support."),
      p("Identity Verification — to verify your identity and conduct appropriate customer due diligence where required."),
      p("Processing Transactions — to process payments, distributions, withdrawals, and other financial transactions associated with your participation."),
      p("Communication — to send information relating to your account, investment plans, transactions, updates, notices, and customer service matters."),
      p("Security and Fraud Prevention — to detect, investigate, prevent, and respond to fraud, unauthorized activity, security incidents, or other misuse of our website and services."),
      p("Legal and Regulatory Compliance — to comply with applicable laws, regulations, legal processes, court orders, regulatory requirements, and legitimate requests from competent authorities."),
      p("Improving Our Website — to understand how visitors use our website, improve our services, develop new features, and enhance the user experience."),
      p("Marketing — where permitted by applicable law and, where required, with your consent, we may use your information to send promotional communications about Keystone REIT, our services, investment opportunities, educational materials, or other relevant information. You may unsubscribe from marketing communications at any time."),
    ],
  },
  {
    number: 6,
    title: "HOW WE SHARE YOUR INFORMATION",
    blocks: [
      p("We do not sell your personal information to third parties."),
      p("However, we may share information where necessary for legitimate business, operational, legal, or regulatory purposes. This may include sharing information with:"),
      p("Service Providers — third-party companies that provide services such as:"),
      ul([
        "Payment processing",
        "Identity verification",
        "Information technology",
        "Cloud hosting",
        "Website management",
        "Cybersecurity",
        "Communications",
        "Customer support",
        "Analytics",
        "Professional services",
      ]),
      p("These providers may only process information as necessary to provide their services to us and subject to appropriate contractual or legal protections."),
      p("Professional Advisers — we may share information with lawyers, accountants, auditors, consultants, financial professionals, and other professional advisers where reasonably necessary."),
      p("Regulators and Authorities — we may disclose information where required by law, regulation, legal process, court order, or a lawful request from a government, regulatory, or law-enforcement authority."),
      p("Business Transactions — if Keystone REIT is involved in a merger, acquisition, restructuring, financing, sale of assets, or similar corporate transaction, personal information may be transferred as part of that transaction, subject to applicable privacy requirements."),
    ],
  },
  {
    number: 7,
    title: "COOKIES AND SIMILAR TECHNOLOGIES",
    blocks: [
      p("Our website may use cookies, pixels, tags, analytics tools, and similar technologies."),
      p("These technologies may help us:"),
      ul([
        "Keep our website functioning properly",
        "Remember preferences",
        "Understand website traffic",
        "Improve website performance",
        "Analyze visitor behavior",
        "Measure marketing effectiveness",
        "Improve the user experience",
      ]),
      p("You may be able to control or disable cookies through your browser settings. Disabling certain cookies may affect the functionality of parts of our website."),
    ],
  },
  {
    number: 8,
    title: "THIRD-PARTY WEBSITES AND SERVICES",
    blocks: [
      p("Our website may contain links to third-party websites, platforms, payment providers, social media services, or other external services."),
      p("We are not responsible for the privacy practices, security, content, or policies of third-party websites."),
      p("We encourage you to review the privacy policies of any third-party service before providing personal information."),
    ],
  },
  {
    number: 9,
    title: "DATA SECURITY",
    blocks: [
      p("We take reasonable technical and organizational measures designed to protect personal information against unauthorized access, loss, misuse, alteration, disclosure, or destruction."),
      p("These measures may include access controls, authentication procedures, security monitoring, encryption where appropriate, and other safeguards."),
      p("However, no method of transmitting or storing information electronically can be guaranteed to be completely secure. You should therefore take appropriate precautions when providing information online."),
    ],
  },
  {
    number: 10,
    title: "DATA RETENTION",
    blocks: [
      p("We retain personal information only for as long as reasonably necessary for the purposes described in this Privacy Policy, including to:"),
      ul([
        "Provide our services",
        "Maintain business and financial records",
        "Meet legal and regulatory requirements",
        "Resolve disputes",
        "Enforce agreements",
        "Prevent fraud",
        "Maintain security",
        "Fulfill other legitimate business purposes",
      ]),
      p("The length of time information is retained may vary depending on the nature of the information and the purpose for which it was collected."),
    ],
  },
  {
    number: 11,
    title: "INTERNATIONAL DATA TRANSFERS",
    blocks: [
      p("Some of our service providers or business partners may process information outside the country in which you reside."),
      p("Where personal information is transferred internationally, we will take reasonable steps to ensure that appropriate safeguards are in place and that the transfer is handled in accordance with applicable data protection laws."),
    ],
  },
  {
    number: 12,
    title: "YOUR PRIVACY RIGHTS",
    blocks: [
      p("Depending on applicable law and your circumstances, you may have rights relating to your personal information. These may include the right to:"),
      ul([
        "Request access to personal information we hold about you",
        "Request correction of inaccurate or incomplete information",
        "Request deletion of personal information where legally applicable",
        "Request restriction of certain processing",
        "Object to certain uses of your information",
        "Withdraw consent where processing is based on consent",
        "Request a copy of certain information in a portable format",
        "Lodge a complaint with an appropriate data protection authority",
      ]),
      p("Some rights may be subject to legal or regulatory limitations. To exercise an applicable privacy right, please contact us using the details provided below."),
    ],
  },
  {
    number: 13,
    title: "MARKETING COMMUNICATIONS",
    blocks: [
      p("We may occasionally send you information about Keystone REIT, our services, educational materials, updates, and investment opportunities."),
      p("Where required by applicable law, we will obtain your consent before sending certain marketing communications."),
      p("You can unsubscribe from marketing emails by using the unsubscribe option included in the communication or by contacting us."),
      p("Please note that even if you opt out of marketing communications, we may still send important service-related communications, such as account notifications, transaction confirmations, security notices, and other necessary administrative messages."),
    ],
  },
  {
    number: 14,
    title: "CHILDREN'S PRIVACY",
    blocks: [
      p("Our services are not intended for children."),
      p("We do not knowingly collect personal information from children where such collection is prohibited by applicable law."),
      p("If you believe that a child has provided personal information to us without appropriate authorization, please contact us so that we can take appropriate action."),
    ],
  },
  {
    number: 15,
    title: "INVESTMENT AND FINANCIAL INFORMATION",
    blocks: [
      p("Information relating to your investment participation, transactions, payment details, and account activity may be collected and processed to administer our services and meet applicable legal, financial, accounting, compliance, and regulatory obligations."),
      p("We may retain transaction and investment records for the period required by applicable law and regulatory requirements."),
      p("Nothing in this Privacy Policy constitutes investment advice or an offer, solicitation, or recommendation regarding any investment plan."),
    ],
  },
  {
    number: 16,
    title: "CHANGES TO THIS PRIVACY POLICY",
    blocks: [
      p("We may update this Privacy Policy from time to time to reflect changes in our services, technology, legal requirements, or business practices."),
      p('When we make changes, we will update the "Last Updated" date at the top of this Privacy Policy.'),
      p("We encourage you to periodically review this page to remain informed about how we handle personal information."),
    ],
  },
];

const ACKNOWLEDGEMENT =
  "By using the Keystone REIT website and providing personal information to us, you acknowledge that you have had an opportunity to review this Privacy Policy and understand how we may collect and use your information as described above.";

function LegalSectionBlock({ section }: { section: LegalSection }) {
  return (
    <div className="mt-10">
      <h2 className="font-display text-xl font-semibold text-foreground">
        {section.number}. {section.title}
      </h2>
      <div className="mt-3 flex flex-col gap-3 text-muted-foreground">
        {section.blocks.map((block, i) =>
          block.kind === "ul" ? (
            <ul key={i} className="ml-5 flex list-disc flex-col gap-1.5">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p key={i}>{block.text}</p>
          )
        )}
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <Section>
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-semibold text-foreground">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last Updated: March 10, 2026</p>

        {SECTIONS.map((section) => (
          <LegalSectionBlock key={section.number} section={section} />
        ))}

        <div className="mt-10">
          <h2 className="font-display text-xl font-semibold text-foreground">17. CONTACT US</h2>
          <p className="mt-3 text-muted-foreground">
            If you have questions about this Privacy Policy, wish to exercise an applicable privacy right, or have
            concerns about how your personal information is handled, please contact Keystone REIT.
          </p>
          <div className="mt-4 rounded-xl border bg-card p-5 shadow-sm">
            <p className="font-display font-semibold text-foreground">Keystone REIT</p>
            <p className="mt-1 text-sm text-muted-foreground">Registration No.: {COMPANY_REGISTRATION_NO}</p>
            <p className="mt-1 text-sm text-muted-foreground">Email: [INSERT OFFICIAL PRIVACY/CONTACT EMAIL]</p>
            <p className="mt-1 text-sm text-muted-foreground">Address: [INSERT REGISTERED BUSINESS ADDRESS]</p>
          </div>
          <p className="mt-4 text-muted-foreground">
            We will make reasonable efforts to respond to privacy-related requests within the timeframe required by
            applicable law.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl font-semibold text-foreground">18. ACKNOWLEDGEMENT</h2>
          <p className="mt-3 text-muted-foreground">{ACKNOWLEDGEMENT}</p>
        </div>

        <div className="mt-12 border-t pt-6 text-center">
          <p className="font-display font-semibold text-foreground">Keystone REIT</p>
          <p className="mt-1 text-sm text-muted-foreground">Real Estate. Made More Accessible.</p>
        </div>
      </div>
    </Section>
  );
}
