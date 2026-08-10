import type { Metadata } from "next";
import { BookOpenIcon, BuildingIcon, GraduationCapIcon, HomeIcon, SettingsIcon, UsersIcon } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { Section, SectionKicker } from "@/components/marketing/section";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { FramedImage } from "@/components/marketing/framed-image";
import { unsplashUrl, MARKETING_IMAGES } from "@/lib/marketing-images";

export const metadata: Metadata = {
  title: "Real Estate Insights",
  description: "Learn how real estate works, how properties generate income, and the key factors that influence property value and rental demand.",
};

const TOPICS = [
  { icon: HomeIcon, title: "Real Estate Basics", description: "Learn how real estate works, how properties can generate income, and the key factors that influence property value and rental demand." },
  { icon: BuildingIcon, title: "Serviced Apartments", description: "Discover how serviced apartments work, why they are increasingly used for short-term accommodation, and how professionally managed properties can generate rental income." },
  { icon: BookOpenIcon, title: "Short-Term Rentals", description: "Learn about the short-term rental market, guest accommodation, occupancy, rental demand, and the factors that influence property performance." },
  { icon: UsersIcon, title: "Real Estate Participation", description: "Real estate participation doesn't always require purchasing an entire property. Learn how pooled capital and professionally managed real estate structures can provide alternative ways to participate in the property market." },
  { icon: SettingsIcon, title: "Property Management", description: "A property is only part of the equation. Effective management plays an important role in maintaining the property, attracting guests, managing operations, and supporting rental performance." },
  { icon: GraduationCapIcon, title: "Investment Education", description: "Understand important investment concepts, including risk, diversification, investment terms, distributions, and the importance of making informed decisions." },
];

const ATTRACTIVE_FACTORS = [
  { title: "Location", description: "can influence demand, accessibility, rental rates, and the type of guests a property attracts." },
  { title: "Property Quality", description: "well-presented, properly furnished, and professionally maintained properties can provide a better experience for guests." },
  { title: "Demand", description: "understanding who needs accommodation and why they choose a particular location is an important part of evaluating a property opportunity." },
  { title: "Management", description: "strong property management helps coordinate operations, maintenance, guest experience, and day-to-day activities." },
  { title: "Operating Costs", description: "revenue is only one side of the equation; expenses associated with maintaining and operating a property also need to be considered." },
];

export default function RealEstateInsightsPage() {
  return (
    <>
      <PageHero
        kicker="Resources"
        title="Understand real estate. Make more informed decisions."
        description={
          <>
            Knowledge is the foundation of every smart investment decision. At Keystone REIT, we believe investors
            should have access to clear, practical information that helps them understand real estate, rental
            properties, investment structures, and the opportunities within the property market.
          </>
        }
      />

      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>Explore The World Of Real Estate</SectionKicker>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map((topic) => (
            <div key={topic.title} className="flex flex-col gap-3 rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-primary-foreground shadow-sm">
                <topic.icon className="size-5" />
              </div>
              <h3 className="font-display text-base font-semibold text-foreground">{topic.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{topic.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section muted className="border-y">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionKicker>Why Real Estate Matters</SectionKicker>
            <h2 className="mt-3 text-balance font-display text-3xl font-semibold text-foreground sm:text-4xl">
              Real assets. Real economic activity. Real opportunity.
            </h2>
            <div className="mt-6 flex flex-col gap-4 text-muted-foreground">
              <p>
                Real estate plays an important role in economies around the world. People need places to live,
                work, stay, and conduct business.
              </p>
              <p>
                For investors, real estate can provide exposure to an asset class that can generate income through
                rental activity while also having underlying property value. However, every investment comes with
                risks.
              </p>
            </div>
          </div>
          <FramedImage
            src={unsplashUrl(MARKETING_IMAGES.insightsDesk.base, { w: 1000, h: 1250 })}
            alt={MARKETING_IMAGES.insightsDesk.alt}
          />
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <SectionKicker>Understanding Income-Generating Property</SectionKicker>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            How does a property generate income?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl font-display text-lg font-medium text-foreground">
            Property → Guests/Tenants → Rental Activity → Revenue
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            For serviced apartments and short-term rentals, properties can be made available to guests on a daily
            or short-term basis. At Keystone REIT, our model focuses on acquiring, furnishing, and professionally
            managing these properties.
          </p>
        </div>
      </Section>

      <Section muted className="border-y">
        <div className="mx-auto max-w-3xl text-center">
          <SectionKicker>What Makes A Property Attractive?</SectionKicker>
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
          {ATTRACTIVE_FACTORS.map((factor) => (
            <div key={factor.title} className="rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <h3 className="font-display text-base font-semibold text-foreground">{factor.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{factor.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <SectionKicker>Understanding Risk</SectionKicker>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Every investment deserves a closer look.
          </h2>
          <div className="mx-auto mt-6 flex max-w-2xl flex-col gap-4 text-muted-foreground">
            <p>
              Real estate can offer opportunities, but it is not risk-free. Property performance can be affected by
              factors such as occupancy levels, operating expenses, market conditions, location, maintenance costs,
              and changes in demand.
            </p>
            <p>
              Keystone REIT encourages investors to review the applicable investment information, terms, duration,
              distribution structure, and associated risks before making a decision.
            </p>
          </div>
        </div>
      </Section>

      <ClosingCta
        title="Ready to explore real estate? Start with knowledge. Move with confidence."
        description="Discover a more accessible way to participate in professionally managed real estate. Start from $200 with Keystone REIT."
        ctas={[{ label: "Get Started", href: "/signup" }]}
      />
    </>
  );
}
