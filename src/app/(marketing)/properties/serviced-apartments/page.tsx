import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { Section, SectionKicker } from "@/components/marketing/section";
import { InsuranceNotice } from "@/components/marketing/insurance-notice";
import { ReturnsDisclosure } from "@/components/marketing/returns-disclosure";
import { PageFaq } from "@/components/marketing/page-faq";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { FramedImage } from "@/components/marketing/framed-image";
import { unsplashUrl, MARKETING_IMAGES } from "@/lib/marketing-images";

export const metadata: Metadata = {
  title: "Serviced Apartments",
  description:
    "Professionally managed serviced apartments designed for modern short-term living, forming an important part of the Keystone REIT property portfolio.",
};

const MODEL_STEPS = [
  { title: "Property Selection", description: "We identify suitable property opportunities based on factors such as location, accessibility, demand, property quality, and income-generating potential." },
  { title: "Furnishing & Preparation", description: "Selected properties are furnished and prepared to provide guests with a comfortable, practical, and welcoming environment." },
  { title: "Professional Operations", description: "Our properties are professionally managed, with attention given to bookings, guest experience, property maintenance, and day-to-day operations." },
  { title: "Rental Activity", description: "The completed apartments are made available to guests for daily and short-term stays, creating rental activity from the underlying real estate." },
];

const MODERN_LIVING = [
  { title: "Comfortable Living Spaces", description: "Thoughtfully arranged spaces designed for relaxation and convenience." },
  { title: "Modern Furnishings", description: "Practical and attractive furnishings that create a welcoming environment." },
  { title: "Convenient Locations", description: "Properties selected with accessibility and guest demand in mind." },
  { title: "Short-Term Flexibility", description: "Accommodation suitable for guests looking for alternatives to traditional hotels." },
  { title: "Professional Management", description: "Properties maintained and managed with a focus on quality and consistency." },
];

const SELECTION_FACTORS = [
  { title: "Location", description: "Accessibility, surrounding amenities, neighbourhood characteristics, and proximity to areas that attract guests." },
  { title: "Property Quality", description: "The condition, layout, functionality, and suitability of the property for serviced accommodation." },
  { title: "Market Demand", description: "The potential demand for short-term accommodation within the property's market." },
  { title: "Operating Potential", description: "The property's suitability for efficient management, guest turnover, maintenance, and ongoing operations." },
  { title: "Income Potential", description: "The potential for the property to generate rental activity based on relevant market conditions." },
];

const PAGE_FAQ = [
  { question: "What are Keystone REIT's serviced apartments?", answer: "They are furnished residential properties operated as short-term accommodation for guests. These properties form part of Keystone REIT's real estate portfolio." },
  { question: "How are the apartments used?", answer: "The apartments are made available to guests on a daily or short-term basis, creating rental activity from the underlying properties." },
  { question: "Does Keystone REIT manage the properties?", answer: "Yes. Keystone REIT professionally manages the property and operational process associated with the serviced apartments." },
  { question: "How are the properties selected?", answer: "We consider factors including location, accessibility, property quality, market demand, operational suitability, and income-generating potential." },
  { question: "Are the properties insured?", answer: "Our properties are insured against covered risks, providing an additional layer of protection for the underlying assets." },
  {
    question: "Can I invest in a specific apartment?",
    answer: "Participation is structured through Keystone REIT's investment model rather than requiring investors to individually purchase or manage a specific apartment. Please review the applicable investment plan and terms for details.",
  },
];

export default function ServicedApartmentsPage() {
  return (
    <>
      <PageHero
        kicker="Serviced Apartments"
        title="Quality spaces. Real property. Income-generating potential."
        description="Professionally managed serviced apartments designed for modern short-term living. Keystone REIT focuses on acquiring, furnishing, and professionally managing serviced apartments that provide comfortable, high-quality accommodation for guests."
        ctas={[{ label: "Explore Our Properties", href: "/properties" }]}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <FramedImage
            src={unsplashUrl(MARKETING_IMAGES.servicedApartmentHero.base, { w: 1000, h: 1250 })}
            alt={MARKETING_IMAGES.servicedApartmentHero.alt}
          />
          <div>
            <SectionKicker>Our Serviced Apartment Model</SectionKicker>
            <h2 className="mt-3 text-balance font-display text-3xl font-semibold text-foreground sm:text-4xl">
              From property acquisition to guest experience
            </h2>
            <p className="mt-5 text-muted-foreground">
              At Keystone REIT, we manage the process with a clear focus on creating functional and attractive
              accommodation that meets the needs of today&apos;s short-term guests.
            </p>
            <ul className="mt-6 flex flex-col gap-4">
              {MODEL_STEPS.map((step) => (
                <li key={step.title}>
                  <p className="font-medium text-foreground">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section muted className="border-y">
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>Designed For Modern Living</SectionKicker>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            More than an apartment. A complete stay.
          </h2>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MODERN_LIVING.map((item) => (
            <div key={item.title} className="rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <h3 className="font-display text-base font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <SectionKicker>Why Serviced Apartments?</SectionKicker>
          <h2 className="mt-3 text-balance font-display text-3xl font-semibold text-foreground sm:text-4xl">
            A property model built around demand.
          </h2>
          <div className="mx-auto mt-6 flex max-w-2xl flex-col gap-4 text-muted-foreground">
            <p>
              Serviced apartments combine the comfort and privacy of an apartment with the convenience associated
              with short-term accommodation.
            </p>
            <p>
              For guests, they offer an alternative to traditional hotel stays. For property operators, they
              provide an opportunity to generate rental income through short-term occupancy.
            </p>
          </div>
          <p className="mx-auto mt-6 max-w-xl font-display text-lg font-medium text-foreground">
            We focus on properties with purpose.
          </p>
        </div>
      </Section>

      <Section muted className="border-y">
        <div className="mx-auto max-w-3xl text-center">
          <SectionKicker>Our Property Selection Approach</SectionKicker>
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

      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <SectionKicker>Built Around Real Property</SectionKicker>
          <h2 className="mt-3 text-balance font-display text-3xl font-semibold text-foreground sm:text-4xl">
            The real estate behind the model
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
            Capital is deployed toward acquiring and furnishing suitable properties, which are then operated as
            short-term accommodation.
          </p>
          <p className="mx-auto mt-6 max-w-3xl text-balance font-display text-lg font-medium text-foreground">
            Capital → Property Acquisition → Furnishing → Guest Accommodation → Rental Activity → Investor
            Distributions
          </p>
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
          <PageFaq items={PAGE_FAQ} idPrefix="serviced-apartments" />
        </div>
        <div className="mx-auto mt-8 max-w-xl">
          <ReturnsDisclosure className="text-center" />
        </div>
      </Section>

      <ClosingCta
        title="Real Estate. Made More Accessible."
        description="Behind every Keystone REIT opportunity is a real property strategy built around professionally managed serviced apartments and short-term rental accommodation. Start your real estate participation journey from $200."
        ctas={[
          { label: "Explore Investment Plans", href: "/investment-plans" },
          { label: "Get Started", href: "/signup" },
        ]}
      />
    </>
  );
}
