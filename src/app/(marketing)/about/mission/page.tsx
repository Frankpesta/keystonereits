import type { Metadata } from "next";
import { CheckCircle2Icon } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { Section, SectionKicker } from "@/components/marketing/section";
import { ClosingCta } from "@/components/marketing/closing-cta";

export const metadata: Metadata = {
  title: "Our Mission",
  description:
    "Our mission is to make real estate participation more accessible by creating a professionally managed platform with a starting point of $200.",
};

const DRIVERS = [
  {
    title: "Accessibility",
    description:
      "We believe the opportunity to participate in real estate should be available beyond traditional property ownership. With investment opportunities starting from $200, we are working to lower the barrier to entry while maintaining a professionally managed investment structure.",
  },
  {
    title: "Professional Management",
    description:
      "Real estate requires more than capital. It requires property selection, furnishing, operations, guest management, maintenance, and ongoing oversight. Our approach is to professionally manage these processes so investors can participate without having to manage the properties themselves.",
  },
  {
    title: "Income-Generating Real Estate",
    description:
      "Our focus is on properties that can generate income through short-term accommodation. By acquiring and furnishing serviced apartments and short-term rental properties, we aim to create a real estate model built around active property operations and rental activity.",
  },
  {
    title: "Responsible Asset Management",
    description:
      "We understand that participation in an investment comes with trust and responsibility. We are committed to managing the underlying real estate with care and maintaining structures designed to support responsible asset management. Our properties are insured against covered risks, providing an additional layer of protection for the underlying assets.",
  },
  {
    title: "Transparency",
    description:
      "We believe people should understand what they are participating in. From how our model works to how investment plans are structured and how distributions are determined, we aim to communicate clearly and provide information investors need to make informed decisions.",
  },
];

export default function MissionPage() {
  return (
    <>
      <PageHero
        kicker="Our Mission"
        title="Making real estate participation more accessible"
        description="At Keystone REIT, we believe participation in real estate should not be limited to people with the capital to purchase an entire property."
      />

      <Section>
        <div className="mx-auto max-w-3xl">
          <p className="text-lg leading-relaxed text-muted-foreground">
            Our mission is to make real estate participation more accessible by creating a professionally managed
            platform through which individuals can participate in income-generating real estate with a starting
            point of $200.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Through our mutual fund structure, funds from investors are pooled and deployed toward the acquisition
            and furnishing of serviced apartments and short-term rental properties. These properties are
            professionally managed and operated to generate rental income, with income distributed to investors as
            dividends in accordance with their investment amount and applicable investment terms.
          </p>
        </div>
      </Section>

      <Section muted className="border-y">
        <div className="mx-auto max-w-3xl text-center">
          <SectionKicker>Our Vision</SectionKicker>
          <h2 className="mt-3 text-balance font-display text-3xl font-semibold text-foreground sm:text-4xl">
            A future where more people have a place in real estate
          </h2>
          <div className="mx-auto mt-6 flex max-w-2xl flex-col gap-4 text-muted-foreground">
            <p>
              Real estate has long been one of the world&apos;s most established asset classes, yet direct property
              ownership can require substantial capital, expertise, and ongoing management.
            </p>
            <p>
              We envision a future where more individuals can participate in the opportunities created by real
              estate without having to personally purchase, furnish, or manage an entire property.
            </p>
            <p>
              Keystone REIT is working toward making that vision a reality through accessibility, professional
              management, and a structured approach to real estate participation.
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <SectionKicker>What Drives Us</SectionKicker>
          <div className="mt-8 flex flex-col gap-8">
            {DRIVERS.map((driver) => (
              <div key={driver.title} className="flex gap-4">
                <CheckCircle2Icon className="mt-1 size-5 shrink-0 text-primary" />
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{driver.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{driver.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section muted className="border-y">
        <div className="mx-auto max-w-3xl text-center">
          <SectionKicker>Our Approach</SectionKicker>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            From capital to real estate
          </h2>
          <div className="mx-auto mt-6 flex max-w-2xl flex-col gap-4 text-muted-foreground">
            <p>Our model is built around a simple principle: bringing capital and real estate opportunities together.</p>
            <p>
              Funds from investors are pooled through our mutual fund structure and deployed toward real estate
              assets. Properties are acquired, furnished, and professionally managed before being made available to
              guests.
            </p>
            <p>
              The resulting rental activity generates income, which is distributed to investors as dividends
              according to their investment amount and applicable investment terms.
            </p>
          </div>
          <p className="mx-auto mt-6 max-w-2xl font-display text-lg font-medium text-foreground">
            Pool → Acquire → Furnish → Operate → Generate Income → Distribute
          </p>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <SectionKicker>Our Commitment</SectionKicker>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Building for the long term
          </h2>
          <div className="mx-auto mt-6 flex max-w-2xl flex-col gap-4 text-muted-foreground">
            <p>Keystone REIT is not simply about providing access to property.</p>
            <p>
              We are building a platform centered around professionalism, accessibility, responsible management,
              and long-term value creation.
            </p>
            <p>
              Every property, every investment plan, and every operational decision contributes to our broader
              mission of creating a more accessible pathway into real estate participation.
            </p>
            <p className="font-medium text-foreground">
              We believe real estate should not only be something people see around them. It should be something
              more people can participate in.
            </p>
          </div>
        </div>
      </Section>

      <ClosingCta
        title="Your place in real estate can start here."
        description="We are committed to building Keystone REIT with a clear sense of purpose: to make real estate participation more accessible while professionally managing the properties and investment process on behalf of our investors."
        ctas={[
          { label: "Get Started", href: "/signup" },
          { label: "Explore Investment Plans", href: "/investment-plans" },
        ]}
      />
    </>
  );
}
