import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangleIcon } from "lucide-react";
import { Section } from "@/components/marketing/section";
import { CompanyInfo } from "@/components/marketing/company-info";
import { COMPANY_REGISTRATION_NO } from "@/components/marketing/nav-data";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Keystone REIT's Terms and Conditions governing use of our website and participation in our investment plans.",
};

type LegalBlock =
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "cta"; label: string; href: string };

type LegalSection = { number: number; title: string; blocks: LegalBlock[] };

const p = (text: string): LegalBlock => ({ kind: "p", text });
const ul = (items: string[]): LegalBlock => ({ kind: "ul", items });
const cta = (label: string, href: string): LegalBlock => ({ kind: "cta", label, href });

const PLAN_SUMMARY = [
  { name: "Foundation Plan", min: "$200", roi: "4%", duration: "1 Year", distribution: "Weekly" },
  { name: "Growth Plan", min: "$10,000", roi: "5%", duration: "1 Year", distribution: "Weekly" },
  { name: "Premium Plan", min: "$50,000", roi: "6%", duration: "1 Year", distribution: "Weekly" },
  { name: "Elite Plan", min: "$100,000", roi: "8%", duration: "1 Year", distribution: "Weekly" },
];

const SECTIONS_BEFORE_PLANS: LegalSection[] = [
  {
    number: 1,
    title: "ABOUT KEYSTONE REIT",
    blocks: [
      p("Keystone REIT provides an accessible way to participate in professionally managed real estate through a structured investment model focused on serviced apartments and short-term rental properties."),
      p("Our model involves pooling funds from investors and deploying capital toward the acquisition, furnishing, and operation of income-generating real estate assets."),
      p(`Company Registration Number: ${COMPANY_REGISTRATION_NO}`),
      p('Throughout these Terms & Conditions, "Keystone REIT", "we", "us", and "our" refer to Keystone REIT.'),
      p('"Investor", "participant", "you", and "your" refer to any individual or entity accessing our services, applying for an investment plan, or participating in an investment plan.'),
    ],
  },
  {
    number: 2,
    title: "ELIGIBILITY",
    blocks: [
      p("To participate in a Keystone REIT investment plan, you must:"),
      ul([
        "Be legally capable of entering into a binding agreement.",
        "Provide accurate and complete information during registration.",
        "Provide any identification or verification documents reasonably required.",
        "Meet any applicable eligibility requirements for the selected investment plan.",
        "Comply with all applicable laws and regulations.",
      ]),
      p("Keystone REIT reserves the right to refuse, suspend, or terminate an application or participation where required information cannot be verified or where participation would create legal, regulatory, compliance, or operational concerns."),
    ],
  },
  {
    number: 3,
    title: "ACCOUNT REGISTRATION",
    blocks: [
      p("Where an account is required, you are responsible for providing accurate, current, and complete information."),
      p("You must notify Keystone REIT if any information provided during registration changes."),
      p("You are responsible for maintaining the confidentiality of your account credentials and for activities carried out through your account."),
      p("You should notify us immediately if you believe that your account has been accessed without authorization."),
      p("Keystone REIT may request additional information or documentation to verify your identity, source of funds, or other information where reasonably necessary."),
    ],
  },
];

const SECTIONS_AFTER_PLANS: LegalSection[] = [
  {
    number: 5,
    title: "INVESTMENT PROCESS",
    blocks: [
      p("Before participating in a plan, you are expected to review the information relating to that plan, including:"),
      ul([
        "Minimum participation amount",
        "Applicable ROI",
        "Duration",
        "Distribution schedule",
        "Applicable fees, if any",
        "Withdrawal or exit provisions",
        "Other applicable terms and conditions",
      ]),
      p("Participation becomes effective only after the applicable registration, verification, payment, and acceptance processes have been completed."),
      p("Keystone REIT may reject a transaction where required verification has not been completed or where the transaction does not satisfy applicable requirements."),
    ],
  },
  {
    number: 6,
    title: "USE OF FUNDS",
    blocks: [
      p("Funds received through the investment structure are pooled and deployed in accordance with the Keystone REIT investment model."),
      p("The model focuses on acquiring and furnishing serviced apartments and short-term rental properties and operating those properties as guest accommodation."),
      p("Property-related activities may include:"),
      ul([
        "Property acquisition",
        "Furnishing and preparation",
        "Property management",
        "Guest accommodation",
        "Maintenance and operational activities",
        "Other activities reasonably connected with the operation of the properties",
      ]),
      p("The exact deployment of funds may vary according to the investment structure, property opportunities, operating requirements, and applicable terms."),
    ],
  },
  {
    number: 7,
    title: "REAL ESTATE OPERATIONS",
    blocks: [
      p("Keystone REIT may acquire, furnish, operate, lease, manage, or otherwise arrange for the operation of serviced apartments and short-term rental properties."),
      p("Property performance may be affected by factors including:"),
      ul([
        "Occupancy levels",
        "Guest demand",
        "Seasonal changes",
        "Property operating costs",
        "Maintenance and repairs",
        "Local market conditions",
        "Regulatory requirements",
        "Economic conditions",
        "Property-specific circumstances",
      ]),
      p("No representation is made that any particular property will maintain a specific occupancy level or generate a particular amount of rental income."),
    ],
  },
  {
    number: 8,
    title: "DISTRIBUTIONS AND ROI",
    blocks: [
      p("The investment plans currently advertise plan-dependent weekly ROI ranging from 4% to 8%, depending on the selected plan."),
      p("The applicable rate is determined by the investment plan selected by the participant."),
      p("Distributions are scheduled weekly in accordance with the applicable plan terms."),
      p("The stated ROI should be understood as the applicable rate associated with the selected plan and not as a representation that future investment performance is guaranteed."),
      p("Any distribution is subject to the applicable investment agreement, plan terms, operational requirements, and applicable law."),
    ],
  },
  {
    number: 9,
    title: "INVESTMENT RISK",
    blocks: [
      p("Participation in an investment involves risk."),
      p("Although Keystone REIT's model is based on real estate assets and rental activity, the performance of an investment may be affected by circumstances beyond our control."),
      p("Potential risks may include:"),
      ul([
        "Changes in property values",
        "Changes in rental demand",
        "Reduced occupancy",
        "Property damage",
        "Maintenance expenses",
        "Operating costs",
        "Changes in economic conditions",
        "Changes in laws or regulations",
        "Market conditions",
        "Delays or interruptions in property operations",
        "Unexpected business expenses",
        "Other risks associated with real estate and investment activities",
      ]),
      p("Insurance on underlying properties provides protection only for risks and circumstances covered by the relevant insurance policy and does not eliminate investment risk."),
      p("Investment involves risk. You should only participate after carefully considering your circumstances and reviewing all applicable investment information."),
    ],
  },
  {
    number: 10,
    title: "NO GUARANTEE OF FUTURE PERFORMANCE",
    blocks: [
      p("Information regarding ROI, rental income, property performance, or investment opportunities is provided for informational purposes and in accordance with the applicable terms of the relevant plan."),
      p("Past performance or projected performance does not guarantee future results."),
      p("Keystone REIT does not represent that investment performance will remain unchanged or that a particular level of rental income will always be generated."),
    ],
  },
  {
    number: 11,
    title: "INVESTMENT DURATION",
    blocks: [
      p("The current Keystone REIT investment plans have a stated duration of one year."),
      p("The commencement and completion dates applicable to a participant will be determined according to the relevant investment documentation and confirmation provided by Keystone REIT."),
      p("Participants should carefully review the applicable duration before participating."),
    ],
  },
  {
    number: 12,
    title: "WITHDRAWALS, EARLY EXIT AND PLAN CHANGES",
    blocks: [
      p("Withdrawals, early exits, transfers, plan changes, or cancellations are subject to the terms applicable to the participant's selected plan and investment agreement."),
      p("Not every plan may permit early withdrawal or modification."),
      p("Where an early withdrawal or other modification is permitted, additional conditions, notice requirements, deductions, fees, or other restrictions may apply."),
      p("Participants should review the specific terms of their plan before requesting a withdrawal or change."),
    ],
  },
  {
    number: 13,
    title: "PAYMENTS",
    blocks: [
      p("All payments must be made through payment methods approved or provided by Keystone REIT."),
      p("You are responsible for ensuring that payment information supplied by you is accurate."),
      p("Keystone REIT is not responsible for delays caused by banks, payment processors, telecommunications providers, or other third-party service providers outside our reasonable control."),
      p("We may request additional information regarding the source or destination of funds where required for verification, compliance, or security purposes."),
    ],
  },
  {
    number: 14,
    title: "FEES AND CHARGES",
    blocks: [
      p("Any fees, charges, administrative costs, or deductions applicable to a particular investment plan will be disclosed in the relevant plan information or investment documentation."),
      p("Where applicable, such fees may be deducted from amounts payable or otherwise charged in accordance with the relevant terms."),
      p("Keystone REIT reserves the right to introduce or amend fees where permitted by applicable law and subject to any required notice."),
    ],
  },
  {
    number: 15,
    title: "TAX RESPONSIBILITIES",
    blocks: [
      p("You are responsible for determining and complying with any tax obligations arising from your participation in a Keystone REIT investment plan."),
      p("Keystone REIT does not provide personal tax, accounting, or financial advice."),
      p("You should obtain independent professional advice regarding your individual tax position where necessary."),
    ],
  },
  {
    number: 16,
    title: "ACCURACY OF INFORMATION",
    blocks: [
      p("We make reasonable efforts to ensure that information published on our website is accurate and up to date."),
      p("However, website content may occasionally contain errors, omissions, outdated information, or typographical errors."),
      p("Keystone REIT reserves the right to correct, update, modify, or remove website content at any time."),
      p("Information on the website should not be interpreted as a substitute for the specific terms and documentation applicable to your investment."),
    ],
  },
  {
    number: 17,
    title: "INVESTMENT INFORMATION IS NOT PERSONAL FINANCIAL ADVICE",
    blocks: [
      p("Information provided on the Keystone REIT website is general information about our business, investment model, properties, and investment plans."),
      p("It does not constitute personalized financial, investment, legal, accounting, or tax advice."),
      p("You are responsible for determining whether participation is appropriate for your circumstances. You should seek independent professional advice where necessary before making an investment decision."),
    ],
  },
  {
    number: 18,
    title: "PROPERTY INSURANCE",
    blocks: [
      p("Keystone REIT may maintain insurance coverage on underlying properties against specified covered risks."),
      p("Insurance coverage is subject to the terms, conditions, exclusions, limits, and requirements of the relevant insurance policy."),
      p("Insurance does not guarantee investment performance, rental income, property value, or the return of invested capital."),
    ],
  },
  {
    number: 19,
    title: "WEBSITE USE",
    blocks: [
      p("You agree to use the Keystone REIT website only for lawful purposes. You must not:"),
      ul([
        "Use the website for fraudulent purposes.",
        "Attempt to gain unauthorized access to our systems.",
        "Interfere with the operation or security of the website.",
        "Upload malicious software or harmful code.",
        "Copy or reproduce protected website content without permission.",
        "Misrepresent your identity.",
        "Use another person's account without authorization.",
        "Engage in activities that could damage Keystone REIT or its users.",
      ]),
      p("Keystone REIT may restrict or terminate access to the website where these Terms & Conditions are breached."),
    ],
  },
  {
    number: 20,
    title: "INTELLECTUAL PROPERTY",
    blocks: [
      p("Unless otherwise stated, the content of the Keystone REIT website, including our logo, branding, text, graphics, photographs, designs, videos, layouts, and other materials, belongs to or is used by Keystone REIT with appropriate rights."),
      p("You may not reproduce, modify, distribute, publish, sell, or commercially exploit our intellectual property without prior written permission."),
    ],
  },
  {
    number: 21,
    title: "THIRD-PARTY SERVICES",
    blocks: [
      p("Our website or platform may contain links, integrations, payment services, communication services, or other features provided by third parties."),
      p("Keystone REIT is not responsible for the availability, security, content, or performance of third-party services that are outside our reasonable control. Your use of third-party services may be subject to separate terms and privacy policies."),
    ],
  },
  {
    number: 22,
    title: "PRIVACY AND PERSONAL INFORMATION",
    blocks: [
      p("Keystone REIT may collect and process personal information necessary to provide our services, manage accounts, verify participants, process transactions, communicate with users, and comply with applicable legal and regulatory requirements."),
      p("Personal information will be handled in accordance with our Privacy Policy. By using our website and services, you acknowledge that your information may be processed for legitimate business, operational, security, verification, and compliance purposes."),
      cta("View Privacy Policy", "/privacy"),
    ],
  },
  {
    number: 23,
    title: "COMMUNICATIONS",
    blocks: [
      p("By providing your contact information, you agree that Keystone REIT may communicate with you regarding:"),
      ul([
        "Your account",
        "Investment participation",
        "Distributions",
        "Transactions",
        "Verification",
        "Plan information",
        "Important service updates",
        "Changes to applicable terms",
        "Other matters relating to your participation",
      ]),
      p("Where permitted, you may also receive marketing communications. You may opt out of promotional communications where applicable."),
    ],
  },
  {
    number: 24,
    title: "SUSPENSION OR TERMINATION",
    blocks: [
      p("Keystone REIT may suspend or terminate access to the website or services where reasonably necessary, including where:"),
      ul([
        "These Terms & Conditions have been breached.",
        "Information provided is false, incomplete, or misleading.",
        "Fraud or suspicious activity is detected.",
        "Required verification cannot be completed.",
        "Continued access may create legal, regulatory, security, or operational concerns.",
        "Required by applicable law or competent authorities.",
      ]),
      p("Termination of website access does not automatically extinguish rights or obligations that have already arisen under an applicable investment agreement."),
    ],
  },
  {
    number: 25,
    title: "LIMITATION OF LIABILITY",
    blocks: [
      p("To the extent permitted by applicable law, Keystone REIT shall not be responsible for losses arising from circumstances beyond its reasonable control, including third-party service interruptions, payment processing failures, telecommunications failures, natural events, changes in law, market conditions, or other events outside our reasonable control."),
      p("Nothing in these Terms & Conditions excludes or limits liability that cannot lawfully be excluded or limited under applicable law."),
    ],
  },
  {
    number: 26,
    title: "FORCE MAJEURE",
    blocks: [
      p("Keystone REIT shall not be responsible for delay or failure to perform an obligation where such delay or failure results from circumstances beyond our reasonable control."),
      p("Such circumstances may include natural disasters, fire, government action, regulatory changes, civil disturbance, war, strikes, infrastructure failures, technology failures, epidemics, pandemics, or other extraordinary events."),
    ],
  },
  {
    number: 27,
    title: "CHANGES TO THESE TERMS",
    blocks: [
      p("Keystone REIT may update these Terms & Conditions from time to time. Changes may be made to reflect:"),
      ul([
        "Changes in our services",
        "Changes in investment plans",
        "Changes in applicable law",
        "Changes in business operations",
        "Security or compliance requirements",
      ]),
      p('The updated version will be published on this page with a revised "Last Updated" date.'),
      p("You should review these Terms & Conditions periodically."),
    ],
  },
  {
    number: 28,
    title: "GOVERNING LAW",
    blocks: [
      p("These Terms & Conditions shall be governed by and interpreted in accordance with the applicable laws of the Federal Republic of Nigeria, unless otherwise required by applicable law or expressly provided in the relevant investment documentation."),
      p("Any dispute arising in connection with these Terms & Conditions shall be subject to the jurisdiction of the appropriate courts or dispute-resolution forum applicable under Nigerian law."),
    ],
  },
  {
    number: 29,
    title: "SEVERABILITY",
    blocks: [
      p("If any provision of these Terms & Conditions is determined to be invalid, unlawful, or unenforceable, the remaining provisions shall continue to the extent permitted by applicable law."),
    ],
  },
  {
    number: 30,
    title: "ENTIRE AGREEMENT",
    blocks: [
      p("These Terms & Conditions, together with any applicable investment agreement, plan-specific terms, privacy policy, and other documents expressly incorporated by reference, constitute the terms governing your use of the Keystone REIT website and participation in our services."),
      p("Where there is a conflict between these Terms & Conditions and a specific investment agreement, the terms of the specific investment agreement shall apply to the extent of the conflict."),
    ],
  },
  {
    number: 31,
    title: "CONTACT US",
    blocks: [
      p("If you have questions regarding these Terms & Conditions, your investment plan, or Keystone REIT's services, please contact us through the official contact channels provided on our website."),
      cta("Contact Keystone REIT", "/contact"),
    ],
  },
];

function LegalSectionBlock({ section }: { section: LegalSection }) {
  return (
    <div className="mt-10">
      <h2 className="font-display text-xl font-semibold text-foreground">
        {section.number}. {section.title}
      </h2>
      <div className="mt-3 flex flex-col gap-3 text-muted-foreground">
        {section.blocks.map((block, i) => {
          if (block.kind === "ul") {
            return (
              <ul key={i} className="ml-5 flex list-disc flex-col gap-1.5">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          }
          if (block.kind === "cta") {
            return (
              <Link
                key={i}
                href={block.href}
                className="mt-1 inline-flex w-fit items-center text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                {block.label} →
              </Link>
            );
          }
          return <p key={i}>{block.text}</p>;
        })}
      </div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <Section>
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-semibold text-foreground">Terms &amp; Conditions</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last Updated: 10 March 2026</p>

        <div className="mt-6 flex flex-col gap-3 text-muted-foreground">
          <p>Welcome to Keystone REIT.</p>
          <p>
            These Terms &amp; Conditions govern your access to and use of the Keystone REIT website, platform,
            services, investment information, and participation in any investment plan made available through
            Keystone REIT.
          </p>
          <p>
            By accessing our website, creating an account, submitting an application, or participating in any
            Keystone REIT investment plan, you acknowledge that you have read, understood, and agreed to these
            Terms &amp; Conditions.
          </p>
          <p>If you do not agree with these Terms &amp; Conditions, please do not use our website or participate in our investment plans.</p>
        </div>

        {SECTIONS_BEFORE_PLANS.map((section) => (
          <LegalSectionBlock key={section.number} section={section} />
        ))}

        <div className="mt-10">
          <h2 className="font-display text-xl font-semibold text-foreground">4. INVESTMENT PLANS</h2>
          <p className="mt-3 text-muted-foreground">Keystone REIT currently provides the following investment plans:</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {PLAN_SUMMARY.map((plan) => (
              <div key={plan.name} className="rounded-xl border bg-card p-5 shadow-sm">
                <h3 className="font-display text-base font-semibold text-foreground">{plan.name}</h3>
                <dl className="mt-3 flex flex-col gap-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Minimum Participation</dt>
                    <dd className="font-medium text-foreground">{plan.min}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Plan-Dependent Weekly ROI</dt>
                    <dd className="font-medium text-foreground">{plan.roi}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Duration</dt>
                    <dd className="font-medium text-foreground">{plan.duration}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Distribution</dt>
                    <dd className="font-medium text-foreground">{plan.distribution}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
          <p className="mt-6 text-muted-foreground">
            The terms applicable to a particular investment are those stated for the selected plan and any
            additional agreement or documentation provided to the participant.
          </p>
          <p className="mt-3 text-muted-foreground">
            Keystone REIT reserves the right to modify, suspend, or discontinue an investment plan, subject to
            applicable law and the rights of existing participants.
          </p>
        </div>

        {SECTIONS_AFTER_PLANS.map((section) => (
          <LegalSectionBlock key={section.number} section={section} />
        ))}

        <div className="mt-12 border-t pt-6">
          <p className="font-display font-semibold text-foreground">KEYSTONE REIT</p>
          <CompanyInfo className="mt-1 text-sm text-muted-foreground" />
        </div>

        <div className="mt-8 flex items-start gap-3 rounded-xl border border-accent/20 bg-secondary/40 p-5 shadow-sm">
          <AlertTriangleIcon className="mt-0.5 size-5 shrink-0 text-accent" />
          <div className="flex flex-col gap-3 text-sm leading-relaxed text-foreground/80">
            <p className="font-display font-semibold text-foreground">Important Investment Notice</p>
            <p>Investment involves risk.</p>
            <p>
              The information presented on the Keystone REIT website is intended to explain our business model and
              available investment plans. It should not be interpreted as a guarantee of investment performance or
              as personalized financial, legal, tax, or investment advice.
            </p>
            <p>The stated weekly ROI applicable to our plans is plan-dependent and is subject to the specific terms of the selected investment plan.</p>
            <p>Before participating, carefully review the relevant investment documentation and consider obtaining independent professional advice where appropriate.</p>
            <p>By proceeding with an investment, you acknowledge that you have reviewed and accepted the applicable terms of the investment.</p>
          </div>
        </div>
      </div>
    </Section>
  );
}
