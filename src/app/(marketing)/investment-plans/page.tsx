import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { Section, SectionKicker } from "@/components/marketing/section";
import { InvestmentPlanCards } from "@/components/marketing/investment-plan-cards";
import { ReturnsDisclosure } from "@/components/marketing/returns-disclosure";
import { HowItWorksSteps, type Step } from "@/components/marketing/how-it-works-steps";
import { WhyParticipateGrid } from "@/components/marketing/why-participate-grid";
import { InsuranceNotice } from "@/components/marketing/insurance-notice";
import { PageFaq } from "@/components/marketing/page-faq";
import { ClosingCta } from "@/components/marketing/closing-cta";

export const metadata: Metadata = {
  title: "Investment Plans",
  description:
    "Keystone REIT offers structured investment plans designed to make real estate participation more accessible. Plans starting from $200 with plan-dependent weekly ROI of 4–8%.",
};

const PARTICIPATION_STEPS: Step[] = [
  { number: "01", title: "Select Your Plan", description: "Choose the investment plan that fits your goals." },
  { number: "02", title: "Complete Your Participation", description: "Review terms, complete registration and the investment process." },
  { number: "03", title: "Funds Are Pooled", description: "Capital from investors is pooled through our mutual fund structure." },
  { number: "04", title: "Capital Is Deployed", description: "Toward acquiring/furnishing serviced apartments & short-term rentals." },
  { number: "05", title: "Properties Are Operated", description: "Professionally managed, rented to guests daily/short-term." },
  { number: "06", title: "Income Is Distributed", description: "Dividends per investment amount and applicable plan terms." },
];

const COMPARISON = [
  { name: "Foundation", from: "$200", description: "A lower entry point for those beginning their real estate participation journey." },
  { name: "Growth", from: "$10,000", description: "For participants looking to increase their level of capital participation." },
  { name: "Premium", from: "$50,000", description: "For participants seeking a higher level of participation in the Keystone REIT model." },
  { name: "Elite", from: "$100,000", description: "Our highest available plan level for significant capital participation." },
];

const DISCLOSURES = [
  { label: "Investment Amount", description: "The minimum amount required for the selected plan." },
  { label: "Weekly ROI", description: "The plan-dependent weekly ROI applicable to the selected plan." },
  { label: "Duration", description: "All current plans have a 1-year duration." },
  { label: "Distribution", description: "All current plans provide for weekly distribution, subject to the applicable terms." },
  { label: "Terms & Conditions", description: "Each participant should review all applicable terms and conditions before confirming participation." },
];

const PAGE_FAQ = [
  { question: "What is the minimum amount to start?", answer: "The Foundation Plan starts from $200." },
  {
    question: "How many investment plans are available?",
    answer: "Keystone REIT currently offers four plans: Foundation — $200 at 4% weekly; Growth — $10,000 at 5% weekly; Premium — $50,000 at 6% weekly; Elite — $100,000 at 8% weekly.",
  },
  { question: "How long does each plan last?", answer: "All four plans currently have a 1-year duration." },
  { question: "How are distributions made?", answer: "Distributions are made weekly, according to the applicable terms of the selected plan." },
  {
    question: "Where does the capital go?",
    answer: "Funds are pooled through our mutual fund structure and deployed toward acquiring and furnishing serviced apartments and short-term rental properties.",
  },
  { question: "How is income generated?", answer: "The properties are rented to guests on a daily or short-term basis, generating rental income." },
  { question: "Do I have to manage the property myself?", answer: "No. Keystone REIT professionally manages the property and investment process." },
  { question: "Are the properties insured?", answer: "Yes. The underlying properties are insured against covered risks." },
  {
    question: "Can I change my plan after participating?",
    answer: "Any changes, withdrawals, transfers, or other modifications are subject to the applicable terms of the selected plan. Please review the plan terms or contact Keystone REIT for clarification.",
  },
];

export default function InvestmentPlansPage() {
  return (
    <>
      <PageHero
        kicker="Investment Plans"
        title="Choose your real estate participation plan"
        description="Keystone REIT offers structured investment plans designed to make real estate participation more accessible at different levels of capital. With plans starting from $200 and plan-dependent weekly ROI ranging from 4% to 8%, you can choose the option that best matches your preferred level of participation."
        ctas={[{ label: "Get Started", href: "/signup" }]}
      />

      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>Our Investment Plans</SectionKicker>
          <p className="mt-2 text-sm text-muted-foreground">All plans: 1-year duration, weekly distribution.</p>
        </div>
        <div className="mt-12">
          <InvestmentPlanCards />
        </div>
      </Section>

      <Section muted className="border-y">
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>How Your Participation Works</SectionKicker>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            From capital to real estate income
          </h2>
          <p className="mt-4 text-muted-foreground">
            Regardless of the plan selected, your participation follows the Keystone REIT model.
          </p>
        </div>
        <div className="mt-14">
          <HowItWorksSteps steps={PARTICIPATION_STEPS} columns={3} />
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>Why Participate Through Keystone REIT?</SectionKicker>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            We handle the property side. You participate in the opportunity.
          </h2>
        </div>
        <div className="mt-12">
          <WhyParticipateGrid />
        </div>
      </Section>

      <Section muted className="border-y">
        <div className="mx-auto max-w-3xl text-center">
          <SectionKicker>Real Estate At The Core</SectionKicker>
          <h2 className="mt-3 text-balance font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Your participation is connected to real property
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
            Keystone REIT focuses on serviced apartments and short-term rental properties. Capital is deployed
            toward acquiring and furnishing properties that can generate rental income through short-term
            accommodation.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <InsuranceNotice />
          </div>
          <p className="mt-6 font-display text-lg font-medium text-foreground">
            Real property. Professional management. Accessible participation.
          </p>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>Which Plan Is Right For You?</SectionKicker>
          <p className="mt-3 text-muted-foreground">Start where you are. Participate at your level.</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {COMPARISON.map((plan) => (
            <div
              key={plan.name}
              className="rounded-xl border bg-card p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="font-display text-lg font-semibold text-foreground">{plan.name}</h3>
              <p className="mt-1 font-display text-2xl font-semibold text-primary">From {plan.from}</p>
              <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          There is no need to start at the highest level. Choose the plan that aligns with your financial
          circumstances and objectives.
        </p>
      </Section>

      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-[color-mix(in_oklch,var(--primary),black_35%)] text-primary-foreground">
        <div
          className="pointer-events-none absolute top-0 right-0 size-[26rem] -translate-y-1/3 translate-x-1/4 rounded-full bg-accent/25 blur-[110px]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h2 className="text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Real estate participation can start small.
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-relaxed text-primary-foreground/85">
            You don&apos;t need to purchase an entire apartment to participate in real estate. With the Foundation
            Plan starting from $200, Keystone REIT provides an accessible entry point into a professionally managed
            real estate participation model.
          </p>
        </div>
      </section>

      <Section muted className="border-b">
        <div className="mx-auto max-w-3xl text-center">
          <SectionKicker>Important Information</SectionKicker>
          <h2 className="mt-3 font-display text-2xl font-semibold text-foreground">
            Understand your plan before participating
          </h2>
          <p className="mt-4 text-center text-muted-foreground">
            Before selecting an investment plan, carefully review the applicable information, including:
          </p>
          <dl className="mt-8 flex flex-col gap-4 text-left">
            {DISCLOSURES.map((d) => (
              <div key={d.label} className="rounded-lg border bg-card p-4 shadow-sm">
                <dt className="font-display font-semibold text-foreground">{d.label}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{d.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>Frequently Asked Questions</SectionKicker>
        </div>
        <div className="mx-auto mt-10 max-w-2xl">
          <PageFaq items={PAGE_FAQ} idPrefix="plans" />
        </div>
        <div className="mx-auto mt-8 max-w-xl">
          <ReturnsDisclosure className="text-center" />
        </div>
      </Section>

      <ClosingCta
        title="Ready to participate? Find your place in real estate."
        description="Real estate participation doesn't have to begin with buying an entire property. With Keystone REIT, you can start from $200 and participate through a professionally managed real estate model."
        ctas={[
          { label: "Get Started", href: "/signup" },
          { label: "Contact Us", href: "/contact" },
        ]}
      />
    </>
  );
}
