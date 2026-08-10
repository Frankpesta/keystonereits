import Image from "next/image";
import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { Section, SectionKicker } from "@/components/marketing/section";
import { HowItWorksSteps, type Step } from "@/components/marketing/how-it-works-steps";
import { WhyParticipateGrid } from "@/components/marketing/why-participate-grid";
import { InsuranceNotice } from "@/components/marketing/insurance-notice";
import { PageFaq } from "@/components/marketing/page-faq";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { unsplashUrl, MARKETING_IMAGES } from "@/lib/marketing-images";

export const metadata: Metadata = {
  title: "Investment Guide",
  description: "A simple guide to participating in real estate with Keystone REIT — from understanding the model to your first step.",
};

const GUIDE_STEPS: Step[] = [
  {
    number: "01",
    title: "Understand The Model",
    description: "Keystone REIT brings investors together through a structured mutual fund model rather than requiring each person to purchase and manage an entire apartment independently.",
  },
  {
    number: "02",
    title: "Capital Is Deployed Into Real Estate",
    description: "The pooled capital is used to acquire and furnish suitable serviced apartments and short-term rental properties, including Airbnb-style apartments.",
  },
  {
    number: "03",
    title: "Properties Are Operated",
    description: "Once properties are acquired and prepared, they are made available to guests on a daily or short-term basis. Keystone REIT manages the property operations.",
  },
  {
    number: "04",
    title: "Rental Income Is Generated",
    description: "Guests pay for their accommodation, creating rental income from the properties, which forms the basis for distributions to investors.",
  },
  {
    number: "05",
    title: "Investor Distributions",
    description: "Income generated from the properties is distributed to investors as dividends in accordance with the applicable investment terms. Weekly ROI is plan-dependent, 4–8%.",
  },
];

const BEFORE_YOU_START = [
  "The investment amount — know the minimum required for your preferred plan.",
  "The expected ROI — understand the applicable rate and how it is calculated.",
  "The investment duration — review how long your participation remains active.",
  "The distribution terms — understand when and how distributions are made.",
  "The applicable terms and conditions — read all relevant information before confirming your participation.",
];

const PAGE_FAQ = [
  { question: "What is the minimum amount required?", answer: "Investment opportunities with Keystone REIT start from $200." },
  {
    question: "Where does the pooled capital go?",
    answer: "Funds are pooled through our mutual fund structure and deployed toward acquiring and furnishing serviced apartments and short-term rental properties.",
  },
  { question: "How do the properties generate income?", answer: "The properties are rented to guests on a daily or short-term basis, generating rental income." },
  { question: "Do I have to manage a property myself?", answer: "No. Keystone REIT professionally manages the property and investment process." },
  {
    question: "How are investors paid?",
    answer: "Income generated from the properties is distributed to investors as dividends according to their investment amount and the applicable terms of their selected plan.",
  },
  { question: "What is the ROI?", answer: "The available plans have a plan-dependent weekly ROI of 4–8%. The applicable rate depends on the selected plan and its terms." },
  { question: "Are the properties insured?", answer: "Yes. The underlying properties are insured against covered risks." },
];

export default function InvestmentGuidePage() {
  return (
    <>
      <PageHero
        kicker="Resources"
        title="A simple guide to participating in real estate with Keystone REIT"
        description="Real estate participation doesn't have to be complicated. Keystone REIT provides an accessible way to participate in professionally managed real estate, with investment opportunities starting from $200."
      />

      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>Guide Steps</SectionKicker>
        </div>
        <div className="mt-14">
          <HowItWorksSteps steps={GUIDE_STEPS} columns={3} />
        </div>
      </Section>

      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-[color-mix(in_oklch,var(--primary),black_35%)] text-primary-foreground">
        <Image
          src={unsplashUrl(MARKETING_IMAGES.investmentGuideKeys.base, { w: 2000 })}
          alt={MARKETING_IMAGES.investmentGuideKeys.alt}
          fill
          sizes="100vw"
          className="object-cover opacity-20"
        />
        <div
          className="pointer-events-none absolute top-0 right-0 size-[26rem] -translate-y-1/3 translate-x-1/4 rounded-full bg-accent/20 blur-[110px]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h2 className="text-balance font-display text-3xl font-semibold sm:text-4xl">
            Real estate participation with a lower entry point
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-relaxed text-primary-foreground/85">
            One of the biggest barriers to real estate participation is the amount of capital traditionally
            required to get started. Keystone REIT provides investment opportunities starting from $200, allowing
            more people to access a professionally managed real estate participation model.
          </p>
        </div>
      </section>

      <Section muted className="border-y text-center">
        <SectionKicker>What Happens To The Capital?</SectionKicker>
        <p className="mx-auto mt-4 max-w-3xl text-balance font-display text-lg font-medium text-foreground">
          Pooled Capital → Property Acquisition → Furnishing & Preparation → Property Operations → Rental Income →
          Investor Distributions
        </p>
      </Section>

      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>Choosing An Investment Plan</SectionKicker>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Find the option that fits your goals
          </h2>
          <p className="mt-5 text-muted-foreground">
            Before participating, review the available investment plans carefully. Each plan may have different:
            minimum participation amount, duration, ROI, distribution structure, applicable terms and conditions.
          </p>
          <p className="mt-4 font-display text-lg font-semibold text-foreground">
            Starting from: $200 · Plan-dependent weekly ROI: 4–8%
          </p>
        </div>
      </Section>

      <Section muted className="border-y">
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

      <Section>
        <div className="mx-auto max-w-3xl">
          <InsuranceNotice />
        </div>
      </Section>

      <Section muted className="border-y">
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>Who Is This For?</SectionKicker>
          <p className="mt-5 text-muted-foreground">
            Keystone REIT may be suitable for individuals who want to participate in real estate without personally
            handling the acquisition, furnishing, guest management, and daily operation of short-term rental
            properties. It can be an option for people who want to start with a smaller amount of capital, want
            exposure to a professionally managed real estate model, prefer not to manage a property themselves, or
            want to explore an alternative way to participate in real estate.
          </p>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>Before You Get Started</SectionKicker>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Make an informed decision
          </h2>
        </div>
        <ol className="mx-auto mt-10 flex max-w-2xl flex-col gap-4">
          {BEFORE_YOU_START.map((item, i) => (
            <li
              key={item}
              className="flex gap-4 rounded-xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <span className="font-display text-lg font-semibold text-accent/60">{i + 1}</span>
              <p className="text-sm text-muted-foreground">{item}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-center font-medium text-foreground">Investing should always be a considered decision.</p>
      </Section>

      <Section muted className="border-y">
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>Frequently Asked Questions</SectionKicker>
        </div>
        <div className="mx-auto mt-10 max-w-2xl">
          <PageFaq items={PAGE_FAQ} idPrefix="investment-guide" />
        </div>
      </Section>

      <ClosingCta
        title="Keystone REIT — Real Estate. Made More Accessible."
        description="Participate in professionally managed real estate through serviced apartments and short-term rental properties. Starting from $200. Registration No.: 11793537."
        ctas={[
          { label: "View Investment Plans", href: "/investment-plans" },
          { label: "Contact Us", href: "/contact" },
        ]}
      />
    </>
  );
}
