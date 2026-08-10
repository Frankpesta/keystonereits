import type { Metadata } from "next";

import { PageHero } from "@/components/marketing/page-hero";
import { Section, SectionKicker } from "@/components/marketing/section";
import { HowItWorksSteps, type Step } from "@/components/marketing/how-it-works-steps";
import { CompanyInfo } from "@/components/marketing/company-info";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { FramedImage } from "@/components/marketing/framed-image";
import { unsplashUrl, MARKETING_IMAGES } from "@/lib/marketing-images";

export const metadata: Metadata = {
  title: "Trust & Protection",
  description:
    "At Keystone REIT, we understand that choosing an investment platform requires confidence in the structure, the people managing it, and the underlying assets.",
};

const STRUCTURED_APPROACH: Step[] = [
  { number: "01", title: "Capital Is Pooled", description: "Funds are pooled through our mutual fund structure." },
  {
    number: "02",
    title: "Real Estate Is Acquired",
    description: "Capital is deployed toward suitable serviced apartments and short-term rental properties.",
  },
  {
    number: "03",
    title: "Properties Are Prepared",
    description: "Properties are furnished and prepared for guest accommodation.",
  },
  {
    number: "04",
    title: "Properties Are Operated",
    description: "The properties are professionally managed and made available to guests.",
  },
  {
    number: "05",
    title: "Income Is Generated",
    description: "Guest bookings generate rental income from the properties.",
  },
  {
    number: "06",
    title: "Distributions Are Made",
    description: "Income generated from the properties is distributed to investors as dividends in accordance with the applicable investment terms.",
  },
];

const PRINCIPLES = [
  { title: "Accessible Entry", description: "Investment opportunities starting from $200." },
  { title: "Tangible Assets", description: "A model centered around serviced apartments and short-term rental properties." },
  { title: "Professional Management", description: "Property operations and the investment process are professionally managed." },
  { title: "Asset Protection", description: "Underlying properties are insured against covered risks." },
  { title: "Clear Communication", description: "We aim to provide investors with relevant information about our model and applicable investment terms." },
];

export default function TrustAndProtectionPage() {
  return (
    <>
      <PageHero
        kicker="Trust & Protection"
        title="Built on trust. Structured for responsible real estate participation."
        description="At Keystone REIT, we understand that choosing an investment platform requires more than seeing an attractive opportunity. It requires confidence in the structure, the people managing it, the underlying assets, and the processes behind it."
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionKicker>Real Estate At The Core</SectionKicker>
            <div className="mt-4 flex flex-col gap-4 text-muted-foreground">
              <p>Keystone REIT&apos;s model is centered around tangible real estate.</p>
              <p>
                Through our mutual fund structure, funds from investors are pooled and professionally deployed
                toward the acquisition and furnishing of serviced apartments and short-term rental properties.
              </p>
              <p>
                These properties are then operated as accommodation for guests, creating rental income that forms
                the basis for investor distributions in accordance with the applicable investment terms.
              </p>
              <p className="font-display text-base font-medium text-foreground">
                Investor Funds → Real Estate → Property Operations → Rental Income → Investor Distributions
              </p>
            </div>
          </div>
          <FramedImage
            src={unsplashUrl(MARKETING_IMAGES.trustBuilding.base, { w: 1000, h: 1250 })}
            alt={MARKETING_IMAGES.trustBuilding.alt}
          />
        </div>
      </Section>

      <Section muted className="border-y">
        <div className="mx-auto max-w-3xl text-center">
          <SectionKicker>Professional Property Management</SectionKicker>
          <h2 className="mt-3 text-balance font-display text-3xl font-semibold text-foreground sm:text-4xl">
            We handle the complexity behind the opportunity.
          </h2>
          <div className="mx-auto mt-6 flex max-w-2xl flex-col gap-4 text-muted-foreground">
            <p>Real estate can require significant time, expertise, and operational attention.</p>
            <p>
              From property selection and furnishing to guest accommodation and day-to-day management, Keystone
              REIT oversees the property process so investors do not have to manage the operational demands
              themselves.
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <SectionKicker>Insurance For Underlying Assets</SectionKicker>
          <h2 className="mt-3 text-balance font-display text-3xl font-semibold text-foreground sm:text-4xl">
            An additional layer of protection.
          </h2>
          <div className="mx-auto mt-6 flex max-w-2xl flex-col gap-4 text-muted-foreground">
            <p>Our underlying properties are insured against covered risks.</p>
            <p>
              Insurance provides an additional layer of protection for the assets supporting our real estate
              operations, subject to the applicable insurance policy terms, conditions, exclusions, and limits.
            </p>
          </div>
        </div>
      </Section>

      <Section muted className="border-y">
        <div className="mx-auto max-w-3xl text-center">
          <SectionKicker>Transparency Matters</SectionKicker>
          <h2 className="mt-3 text-balance font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Know what you are participating in.
          </h2>
          <div className="mx-auto mt-6 flex max-w-2xl flex-col gap-4 text-muted-foreground">
            <p>We believe confidence comes from understanding.</p>
            <p>
              Before participating, investors should have access to clear information about the investment
              structure, applicable terms, investment plans, distribution arrangements, and relevant conditions.
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>A Structured Approach</SectionKicker>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            From capital to property operations
          </h2>
        </div>
        <div className="mt-14">
          <HowItWorksSteps steps={STRUCTURED_APPROACH} columns={3} />
        </div>
      </Section>

      <Section muted className="border-y">
        <div className="mx-auto max-w-3xl text-center">
          <SectionKicker>Responsible Real Estate Participation</SectionKicker>
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
          {PRINCIPLES.map((principle) => (
            <div key={principle.title} className="rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <h3 className="font-display text-base font-semibold text-foreground">{principle.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{principle.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="text-center">
        <SectionKicker>Our Commitment</SectionKicker>
        <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
          Professionalism. Responsibility. Transparency.
        </h2>
        <div className="mx-auto mt-6 flex max-w-2xl flex-col gap-4 text-muted-foreground">
          <p>We are committed to building Keystone REIT around responsible management and long-term credibility.</p>
          <p>
            Our objective is not simply to provide access to real estate. It is to create a structured platform
            through which people can participate in real estate while the underlying property operations are
            professionally managed.
          </p>
        </div>
        <CompanyInfo className="mt-6 text-sm text-muted-foreground" />
        <p className="mt-4 font-display text-lg font-medium text-foreground">Real Estate. Made More Accessible.</p>
      </Section>

      <ClosingCta
        title="Real Estate. Made More Accessible."
        ctas={[
          { label: "View Investment Plans", href: "/investment-plans" },
          { label: "How It Works", href: "/how-it-works" },
        ]}
      />
    </>
  );
}
