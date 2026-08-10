import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { Section, SectionKicker } from "@/components/marketing/section";
import { InsuranceNotice } from "@/components/marketing/insurance-notice";
import { ReturnsDisclosure } from "@/components/marketing/returns-disclosure";
import { ClosingCta } from "@/components/marketing/closing-cta";

export const metadata: Metadata = {
  title: "Why Keystone REIT",
  description:
    "Real estate has long been one of the world's most established asset classes. Discover why Keystone REIT offers a more accessible way to participate.",
};

const REASONS_1_TO_4 = [
  {
    number: "01",
    title: "Accessible Real Estate Participation",
    description:
      "You don't need to purchase an entire property to participate in real estate. With investment opportunities starting from $200, Keystone REIT provides a more accessible entry point for individuals who want to participate in the real estate market. Start where you are. Build from there.",
  },
  {
    number: "02",
    title: "Your Capital Is Connected To Real Property",
    description:
      "Our model is built around tangible real estate. Funds are pooled through our mutual fund structure and deployed toward acquiring and furnishing serviced apartments and short-term rental properties. These properties are then operated as accommodation for guests, creating rental activity around the underlying assets. Real property. Real operations. A structured participation model.",
  },
  {
    number: "03",
    title: "Professional Property Management",
    description:
      "Real estate can be rewarding, but managing property yourself can be demanding. Finding suitable properties, furnishing them, managing guests, maintaining standards, and handling daily operations all require time and expertise. Keystone REIT manages these processes professionally, allowing investors to participate without taking on the day-to-day responsibilities of property management. We manage the property operations. You participate in the opportunity.",
  },
  {
    number: "04",
    title: "Income-Generating Property Model",
    description:
      "Keystone REIT focuses on serviced apartments and short-term rental properties with the potential to generate rental income through guest stays. The income generated from these properties is distributed to investors as dividends based on their investment amount and the applicable terms of the investment. Our investment plans currently provide plan-dependent weekly ROI of 4–8%. Returns are dependent on the selected investment plan and its applicable terms and are not guaranteed.",
  },
];

const REASONS_6_TO_8 = [
  {
    number: "06",
    title: "Asset Protection",
    description:
      "We understand the importance of protecting the underlying real estate assets. Our properties are insured against covered risks, providing an additional layer of protection for the assets supporting the business. This forms part of our broader commitment to responsible property management.",
  },
  {
    number: "07",
    title: "Transparency Matters",
    description:
      "Trust is earned through clarity. At Keystone REIT, we believe investors should be able to understand: where the capital is being deployed; how the real estate model works; how properties generate rental income; how investment plans are structured; how distributions are determined. Our goal is to build a platform where the opportunity is easy to understand and the investment process is straightforward.",
  },
  {
    number: "08",
    title: "Built For Different Types Of Investors",
    description:
      "You may be new to real estate. You may already understand property investment. You may simply be looking for a more accessible way to participate in the real estate market. Wherever you are on your journey, Keystone REIT provides a structured way to participate in professionally managed real estate without requiring you to personally own and manage an entire property. Your real estate journey doesn't have to start with a building. It can start from $200.",
  },
];

const STRUCTURED_STEPS = [
  { title: "Funds Are Pooled", description: "Capital from investors is pooled through our mutual fund structure." },
  {
    title: "Properties Are Acquired",
    description: "Capital is deployed toward suitable serviced apartments and short-term rental properties.",
  },
  {
    title: "Properties Are Prepared & Operated",
    description: "Properties are furnished and professionally managed for guest accommodation.",
  },
  { title: "Rental Income Is Generated", description: "Guest stays create rental activity from the properties." },
  {
    title: "Income Is Distributed",
    description: "Generated income is distributed to investors as dividends according to their investment amount and applicable investment terms.",
  },
];

export default function WhyKeystoneReitPage() {
  return (
    <>
      <PageHero
        kicker="Why Keystone REIT"
        title="Real estate participation, made simple."
        description={
          <>
            Real estate has long been one of the world&apos;s most established asset classes. Yet, participating in
            property ownership or income-generating real estate has traditionally required substantial capital,
            time, expertise, and ongoing management. Keystone REIT offers a different approach.
          </>
        }
        ctas={[{ label: "Get Started", href: "/signup" }]}
      />

      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-lg leading-relaxed text-muted-foreground">
            Through our professionally managed real estate model, investors can participate in serviced apartments
            and short-term rental properties from $200, without having to personally source properties, furnish
            apartments, manage guests, or handle day-to-day operations.
          </p>
        </div>
      </Section>

      <Section muted className="border-y">
        <div className="text-center">
          <SectionKicker>Why Choose Keystone REIT?</SectionKicker>
        </div>
        <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-10">
          {REASONS_1_TO_4.map((reason) => (
            <div key={reason.number} className="grid gap-2 sm:grid-cols-[3rem_1fr]">
              <span className="font-display text-2xl font-semibold text-accent/50">{reason.number}</span>
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">{reason.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{reason.description}</p>
                {reason.number === "04" ? <ReturnsDisclosure className="mt-3" /> : null}
              </div>
            </div>
          ))}

          {/* 05 — A Structured Approach, rendered as its own sub-list to keep the numbered flow while giving the five-step breakdown room */}
          <div className="grid gap-2 sm:grid-cols-[3rem_1fr]">
            <span className="font-display text-2xl font-semibold text-accent/50">05</span>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">A Structured Approach</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                We believe participation in real estate should be clear and easy to understand. Our model follows a
                straightforward process:
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {STRUCTURED_STEPS.map((step) => (
                  <li key={step.title} className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{step.title}</span> — {step.description}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm font-medium text-foreground">
                One clear model, professionally managed from property acquisition to operations.
              </p>
            </div>
          </div>

          {REASONS_6_TO_8.map((reason) => (
            <div key={reason.number} className="grid gap-2 sm:grid-cols-[3rem_1fr]">
              <span className="font-display text-2xl font-semibold text-accent/50">{reason.number}</span>
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">{reason.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{reason.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <InsuranceNotice />
        </div>
      </Section>

      <Section muted className="border-y">
        <div className="mx-auto max-w-3xl text-center">
          <SectionKicker>Our Approach</SectionKicker>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            We focus on the property. You focus on your goals.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
            Keystone REIT combines real estate opportunities with professional property management. Our focus is on
            identifying suitable properties, preparing them for the short-term rental market, managing their
            operations, and creating a structured environment through which investors can participate.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Accessibility", description: "Making real estate participation available to more people." },
            { title: "Professional Management", description: "Managing property operations with care and structure." },
            { title: "Transparency", description: "Keeping the investment model clear and understandable." },
            { title: "Responsibility", description: "Managing the underlying assets with a long-term mindset." },
          ].map((principle) => (
            <div key={principle.title} className="rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <h3 className="font-display text-base font-semibold text-foreground">{principle.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{principle.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <SectionKicker>Why Now?</SectionKicker>
          <h2 className="mt-3 text-balance font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Real estate is evolving. Participation should too.
          </h2>
          <div className="mx-auto mt-6 flex max-w-2xl flex-col gap-4 text-muted-foreground">
            <p>
              The way people access real estate is changing. Short-term accommodation, serviced apartments, and
              professionally managed rental properties have created new opportunities within the property market.
            </p>
            <p>
              Keystone REIT is positioned to make participation in this evolving real estate landscape more
              accessible. Instead of requiring every individual to independently find a property, raise substantial
              capital, furnish it, and manage guests, our model brings these processes together under professional
              management.
            </p>
          </div>
          <p className="mx-auto mt-6 max-w-xl font-display text-lg font-medium text-foreground">
            Less complexity. More accessibility. A smarter way to participate in real estate.
          </p>
        </div>
      </Section>

      <ClosingCta
        title="Ready to participate? Real estate. Made more accessible."
        description="With investment opportunities starting from $200, Keystone REIT provides a structured way to participate in professionally managed serviced apartments and short-term rental properties."
        ctas={[
          { label: "View Investment Plans", href: "/investment-plans" },
          { label: "Get Started", href: "/signup" },
        ]}
      />
    </>
  );
}
