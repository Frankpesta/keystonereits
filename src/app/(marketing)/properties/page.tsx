import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { PageHero } from "@/components/marketing/page-hero";
import { Section, SectionKicker } from "@/components/marketing/section";
import { HowItWorksSteps, type Step } from "@/components/marketing/how-it-works-steps";
import { InsuranceNotice } from "@/components/marketing/insurance-notice";
import { PageFaq } from "@/components/marketing/page-faq";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { Button } from "@/components/ui/button";
import { unsplashUrl, MARKETING_IMAGES } from "@/lib/marketing-images";

export const metadata: Metadata = {
  title: "Our Properties",
  description:
    "Keystone REIT acquires and furnishes carefully selected serviced apartments and short-term rental properties, preparing them for professional operation and guest accommodation.",
};

const PROPERTY_STRATEGY = [
  { title: "Serviced Apartments", description: "Comfortable, professionally prepared apartments designed for guests seeking quality accommodation for short and extended stays." },
  { title: "Short-Term Rental Properties", description: "Properties operated for daily and short-term bookings, creating opportunities for recurring rental activity." },
  { title: "Strategic Property Selection", description: "We consider factors such as location, property quality, guest demand, operating potential, and overall suitability before properties are incorporated into our portfolio." },
  { title: "Professional Preparation", description: "Selected properties are furnished and prepared to provide a quality guest experience and support efficient operations." },
];

const HOW_PROPERTIES_WORK: Step[] = [
  { number: "01", title: "Acquisition", description: "Suitable properties are identified and acquired through the Keystone REIT structure." },
  { number: "02", title: "Furnishing & Preparation", description: "Properties are furnished and prepared for short-term accommodation." },
  { number: "03", title: "Guest Bookings", description: "The properties are made available to guests on a daily or short-term basis." },
  { number: "04", title: "Property Management", description: "The properties are professionally managed to support smooth day-to-day operations." },
  { number: "05", title: "Rental Income", description: "Guest bookings generate rental income from the properties." },
  { number: "06", title: "Investor Distributions", description: "Income generated from the properties is distributed to investors as dividends according to their investment amount and applicable investment terms." },
];

const SELECTION_FACTORS = [
  { title: "Location", description: "Accessibility and suitability for the intended accommodation market." },
  { title: "Guest Demand", description: "The potential demand for quality short-term accommodation in the area." },
  { title: "Property Quality", description: "The condition, functionality, and suitability of the property." },
  { title: "Operating Potential", description: "The property's potential to function effectively as a serviced apartment or short-term rental." },
  { title: "Income Potential", description: "The potential for the property to generate rental income under the intended operating model." },
];

const PAGE_FAQ = [
  { question: "What types of properties does Keystone REIT acquire?", answer: "Our focus is on serviced apartments and short-term rental properties, including Airbnb-style apartments." },
  {
    question: "Where are your properties located?",
    answer: "Our property portfolio is built around locations selected based on suitability, demand, operating potential, and our overall property strategy. Specific property locations and details can be displayed on this page as properties are added to the portfolio.",
  },
  { question: "Are the properties furnished?", answer: "Yes. Properties acquired for our short-term accommodation model are furnished and prepared for guest use." },
  { question: "Who manages the properties?", answer: "Keystone REIT professionally manages the property and operational process." },
  {
    question: "How do the properties generate income?",
    answer: "The properties are rented to guests on a daily or short-term basis. Guest bookings generate rental income, which forms part of the income distributed to investors according to the applicable investment terms.",
  },
  { question: "Are the properties insured?", answer: "Our underlying properties are insured against covered risks, providing an additional layer of protection for the assets." },
];

export default function PropertiesPage() {
  return (
    <>
      <PageHero
        kicker="Properties"
        title="Real estate you can participate in."
        description="At Keystone REIT, our investment model is built around real property. We acquire and furnish carefully selected serviced apartments and short-term rental properties, preparing them for professional operation and guest accommodation."
        ctas={[{ label: "Get Started", href: "/signup" }]}
      />

      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>Property-Focused. Income-Driven.</SectionKicker>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Our approach to real estate
          </h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {PROPERTY_STRATEGY.map((item) => (
            <div key={item.title} className="rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <h3 className="font-display text-base font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section muted className="border-y">
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>From Property To Rental Income</SectionKicker>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">How our properties work</h2>
        </div>
        <div className="mt-14">
          <HowItWorksSteps steps={HOW_PROPERTIES_WORK} columns={3} />
        </div>
        <p className="mt-14 text-center font-medium text-foreground">The goal is simple: put suitable properties to productive use.</p>
      </Section>

      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>Featured Properties</SectionKicker>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="relative aspect-4/3">
              <Image
                src={unsplashUrl(MARKETING_IMAGES.featuredPropertyLiving.base, { w: 900, h: 675 })}
                alt={MARKETING_IMAGES.featuredPropertyLiving.alt}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <p className="text-xs font-medium text-muted-foreground">
                Property Status: Operational · Property Type: Serviced Apartment · Use: Short-Term Accommodation
              </p>
              <h3 className="mt-2 font-display text-lg font-semibold text-foreground">Featured Property — Serviced Apartment</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                A professionally furnished apartment prepared for short-term guest accommodation and managed as part
                of the Keystone REIT property portfolio.
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/properties/portfolio">View Property</Link>
              </Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="relative aspect-4/3">
              <Image
                src={unsplashUrl(MARKETING_IMAGES.featuredPropertyBalcony.base, { w: 900, h: 675 })}
                alt={MARKETING_IMAGES.featuredPropertyBalcony.alt}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <p className="text-xs font-medium text-muted-foreground">
                Property Status: Operational · Property Type: Short-Term Rental · Use: Guest Accommodation
              </p>
              <h3 className="mt-2 font-display text-lg font-semibold text-foreground">Featured Property — Short-Term Rental Apartment</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                A quality accommodation property operated to serve guests seeking comfortable and flexible
                short-term stays.
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/properties/portfolio">View Property</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <Section muted className="border-y">
        <div className="mx-auto max-w-3xl text-center">
          <SectionKicker>Why Property Matters</SectionKicker>
          <h2 className="mt-3 text-balance font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Your participation is connected to real estate.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
            Keystone REIT is not built around an abstract concept. Our model is centered on tangible property that
            can be acquired, furnished, operated, and rented to guests.
          </p>
          <p className="mx-auto mt-6 max-w-3xl text-balance font-display text-lg font-medium text-foreground">
            Pooled Capital → Property Acquisition → Furnishing & Preparation → Guest Accommodation → Rental Activity
            → Income Generation
          </p>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <SectionKicker>Property Selection</SectionKicker>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">We look beyond the four walls.</h2>
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SELECTION_FACTORS.map((factor) => (
            <div key={factor.title} className="rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <h3 className="font-display text-base font-semibold text-foreground">{factor.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{factor.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section muted className="border-y">
        <div className="mx-auto max-w-3xl">
          <InsuranceNotice />
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>Frequently Asked Questions</SectionKicker>
        </div>
        <div className="mx-auto mt-10 max-w-2xl">
          <PageFaq items={PAGE_FAQ} idPrefix="properties" />
        </div>
      </Section>

      <ClosingCta
        title="Real estate is at the heart of what we do."
        description="From carefully selected properties to professional management and guest accommodation, Keystone REIT is focused on putting real estate to productive use. Participation starts from $200."
        ctas={[
          { label: "View Investment Plans", href: "/investment-plans" },
          { label: "Get Started", href: "/signup" },
        ]}
      />
    </>
  );
}
