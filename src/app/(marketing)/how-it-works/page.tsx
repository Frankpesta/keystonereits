import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { Section, SectionKicker } from "@/components/marketing/section";
import { HowItWorksSteps, type Step } from "@/components/marketing/how-it-works-steps";
import { InsuranceNotice } from "@/components/marketing/insurance-notice";
import { ReturnsDisclosure } from "@/components/marketing/returns-disclosure";
import { PageFaq } from "@/components/marketing/page-faq";
import { ClosingCta } from "@/components/marketing/closing-cta";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Keystone REIT provides a structured way for individuals to participate in real estate through a professionally managed mutual fund structure.",
};

const STEPS: Step[] = [
  {
    number: "01",
    title: "Investors Participate",
    description: "Individuals choose an available Keystone REIT investment plan and participate according to the plan's applicable terms. Investment opportunities start from $200.",
  },
  {
    number: "02",
    title: "Funds Are Pooled",
    description: "Funds from participating investors are pooled through our mutual fund structure. Pooling capital allows the fund to deploy resources toward real estate opportunities rather than requiring each participant to independently purchase an entire property.",
  },
  {
    number: "03",
    title: "Real Estate Is Acquired",
    description: "The pooled capital is used to acquire and furnish selected serviced apartments and short-term rental properties. Our focus is on properties with the potential to generate income through short-term accommodation.",
  },
  {
    number: "04",
    title: "Properties Are Operated",
    description: "The properties are professionally managed and made available to guests on a daily or short-term basis. The goal is simple: turn quality property into a professionally managed accommodation business.",
  },
  {
    number: "05",
    title: "Rental Income Is Generated",
    description: "Guests pay for their accommodation, creating rental income from the properties. The performance of the properties depends on factors such as occupancy, rental demand, operating costs, and market conditions.",
  },
  {
    number: "06",
    title: "Investor Distributions",
    description: "Income generated from the properties is distributed to investors as dividends based on their investment amount and the applicable terms of their selected investment plan. Plan-dependent weekly ROI ranges from 4–8%.",
  },
];

const DIFFERENCE = [
  {
    title: "Traditional Property Ownership",
    items: ["Property sourcing", "Purchase negotiations", "Furnishing", "Guest management", "Maintenance", "Marketing", "Bookings", "Daily operations"],
  },
  {
    title: "Keystone REIT",
    items: [
      "Property and operational process is professionally managed",
      "Investors participate through the investment structure",
      "Keystone REIT focuses on the underlying real estate and its operations",
    ],
  },
];

const PAGE_FAQ = [
  {
    question: "Do I have to buy a property myself?",
    answer:
      "No. Keystone REIT operates through a pooled investment structure. Investors participate according to the applicable terms of their selected plan, while the underlying real estate and property operations are professionally managed.",
  },
  { question: "How much is required to participate?", answer: "Investment opportunities start from $200." },
  {
    question: "What type of properties are involved?",
    answer: "Keystone REIT focuses on serviced apartments and short-term rental properties, including Airbnb-style apartments.",
  },
  {
    question: "How is income generated?",
    answer: "The properties are rented to guests on a daily or short-term basis. Guest payments generate rental income from the properties.",
  },
  {
    question: "How are investors paid?",
    answer: "Income generated from the properties is distributed to investors as dividends based on their investment amount and the applicable terms of their investment plan.",
  },
  {
    question: "What is the expected weekly ROI?",
    answer: "Available plans provide plan-dependent weekly ROI of 4–8%. The applicable rate, duration, and distribution structure depend on the specific plan selected.",
  },
  {
    question: "Does real estate participation involve risk?",
    answer: "Yes. All investments involve risk, and property performance can be affected by market conditions, occupancy, operating expenses, and other factors. Returns are not guaranteed.",
  },
  {
    question: "Are the properties insured?",
    answer: "Our underlying properties are insured against covered risks, providing an additional layer of protection for the assets.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        kicker="How It Works"
        title="Real estate, without the complexity"
        description={
          <>
            A simpler way to participate in professionally managed property. Instead of having to purchase,
            furnish, and manage an entire property independently, funds from investors are pooled and deployed
            toward selected serviced apartments and short-term rental properties.
          </>
        }
        ctas={[{ label: "Explore Investment Plans", href: "/investment-plans" }]}
      />

      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>So, How Does It Work?</SectionKicker>
        </div>
        <div className="mt-14">
          <HowItWorksSteps steps={STEPS} columns={3} />
        </div>
        <div className="mx-auto mt-10 max-w-xl">
          <ReturnsDisclosure className="text-center" />
        </div>
      </Section>

      <Section muted className="border-y text-center">
        <SectionKicker>The Keystone REIT Model</SectionKicker>
        <p className="mx-auto mt-4 max-w-3xl text-balance font-display text-lg font-medium text-foreground">
          Investor Participation → Funds Pooled Through the Mutual Fund → Property Acquisition & Furnishing →
          Serviced Apartments & Short-Term Rentals → Guest Accommodation → Rental Income → Investor Distributions
        </p>
        <p className="mt-4 text-sm text-muted-foreground">This is the foundation of the Keystone REIT model.</p>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <SectionKicker>Why Pooling Capital Matters</SectionKicker>
          <h2 className="mt-3 text-balance font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Real estate participation doesn&apos;t have to mean buying an entire property
          </h2>
          <div className="mx-auto mt-6 flex max-w-2xl flex-col gap-4 text-muted-foreground">
            <p>
              Purchasing a property independently can require significant capital. There are also costs associated
              with furnishing, maintenance, guest management, marketing, and day-to-day operations.
            </p>
            <p>
              A pooled structure allows participating investors to access a professionally managed real estate
              model without having to personally handle every part of the property business.
            </p>
          </div>
        </div>
      </Section>

      <Section muted className="border-y">
        <div className="mx-auto max-w-3xl text-center">
          <SectionKicker>What Makes This Different From Buying A Property Yourself?</SectionKicker>
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
          {DIFFERENCE.map((column) => (
            <div key={column.title} className="rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <h3 className="font-display text-base font-semibold text-foreground">{column.title}</h3>
              <ul className="mt-4 flex flex-col gap-2">
                {column.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-xl text-center font-medium text-foreground">
          Less complexity. More accessibility. A professionally managed approach to real estate participation.
        </p>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <InsuranceNotice />
        </div>
      </Section>

      <Section muted className="border-y">
        <div className="mx-auto max-w-3xl text-center">
          <SectionKicker>Your Role. Our Role.</SectionKicker>
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-3">
          {[
            { title: "Your Role", description: "Choose an available investment plan, review its terms, and participate according to the applicable conditions." },
            { title: "Our Role", description: "Keystone REIT focuses on the real estate and operational side of the model — from property acquisition and furnishing to property management and rental operations." },
            { title: "Together", description: "The objective is to create a structured pathway for participating in income-generating real estate." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md text-center">
              <h3 className="font-display text-base font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>Frequently Asked Questions</SectionKicker>
        </div>
        <div className="mx-auto mt-10 max-w-2xl">
          <PageFaq items={PAGE_FAQ} idPrefix="how-it-works" />
        </div>
      </Section>

      <ClosingCta
        title="Ready to participate? Your real estate journey can start from $200."
        description="You don't need to purchase an entire property. You don't need to manage guests. You don't need to furnish apartments. You don't need to handle the day-to-day operations."
        ctas={[
          { label: "View Investment Plans", href: "/investment-plans" },
          { label: "Get Started", href: "/signup" },
        ]}
      />
    </>
  );
}
