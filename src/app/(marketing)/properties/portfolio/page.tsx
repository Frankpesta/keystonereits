import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { Section, SectionKicker } from "@/components/marketing/section";
import { PropertyCard, type PropertyCardData } from "@/components/marketing/property-card";
import { InsuranceNotice } from "@/components/marketing/insurance-notice";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { PORTFOLIO_PROPERTY_IMAGES } from "@/lib/marketing-images";

export const metadata: Metadata = {
  title: "Property Portfolio",
  description:
    "Explore the ten serviced apartments and short-term rental properties behind the Keystone REIT model, from Miami to Cape Town.",
};

const STRATEGY_PHASES = [
  { title: "Property Selection", description: "Identify properties supporting strong rental demand and long-term commercial potential." },
  { title: "Acquisition & Preparation", description: "Acquire and furnish to create comfortable, attractive spaces." },
  { title: "Professional Management", description: "Maintain quality, support guest satisfaction, optimize operations." },
  { title: "Income Generation", description: "Available to guests daily/short-term, generating rental income." },
];

const ATTRACTIVENESS_FACTORS = [
  { title: "Location", description: "Accessibility, surrounding infrastructure, neighborhood appeal, and proximity to key destinations." },
  { title: "Demand", description: "The potential for consistent demand from short-term and serviced-apartment guests." },
  { title: "Property Quality", description: "The condition, layout, functionality, and overall suitability of the property." },
  { title: "Guest Experience", description: "Features, furnishings, amenities, and presentation that can make a property attractive to guests." },
  { title: "Rental Potential", description: "The property's potential to generate sustainable rental income under the right operating conditions." },
  { title: "Long-Term Value", description: "The broader potential of the property and its surrounding market." },
];

const PROPERTIES: PropertyCardData[] = [
  {
    location: "Miami, Florida, USA",
    title: "Modern Serviced Apartment",
    type: "Serviced Apartment",
    use: "Short-Term Accommodation",
    description: "A professionally furnished apartment positioned in one of the world's most recognized destinations for leisure, business, and short-term accommodation.",
    highlights: ["Modern interior", "Fully furnished", "Guest-ready accommodation", "Short-term rental focused", "Professionally managed"],
    status: "Active",
    image: PORTFOLIO_PROPERTY_IMAGES["Miami, Florida, USA"],
  },
  {
    location: "Dallas, Texas, USA",
    title: "Contemporary Urban Apartment",
    type: "Serviced Apartment",
    use: "Short-Term Accommodation",
    description: "A contemporary residential property designed to provide comfortable short-term accommodation in a major U.S. metropolitan market.",
    highlights: ["Contemporary design", "Fully furnished", "Comfortable living spaces", "Strategic urban location", "Professionally managed"],
    status: "Active",
    image: PORTFOLIO_PROPERTY_IMAGES["Dallas, Texas, USA"],
  },
  {
    location: "London, United Kingdom",
    title: "Premium City Apartment",
    type: "Serviced Apartment",
    use: "Short-Term Accommodation",
    description: "A professionally prepared apartment in one of Europe's most established global cities, serving business and leisure travelers seeking quality short-term accommodation.",
    highlights: ["Premium furnished interior", "City-focused accommodation", "Guest-ready", "Short-term rental potential", "Professionally managed"],
    status: "Active",
    image: PORTFOLIO_PROPERTY_IMAGES["London, United Kingdom"],
  },
  {
    location: "Manchester, United Kingdom",
    title: "Modern City Living",
    type: "Serviced Apartment",
    use: "Short-Term Accommodation",
    description: "A modern serviced apartment positioned within a dynamic UK city with a strong mix of business, leisure, and residential demand.",
    highlights: ["Modern furnishings", "Comfortable accommodation", "Convenient location", "Guest-focused setup", "Professionally managed"],
    status: "Under Management",
    image: PORTFOLIO_PROPERTY_IMAGES["Manchester, United Kingdom"],
  },
  {
    location: "Toronto, Ontario, Canada",
    title: "Premium Urban Retreat",
    type: "Serviced Apartment",
    use: "Short-Term Accommodation",
    description: "A contemporary apartment offering a comfortable base for guests visiting one of Canada's leading business and cultural destinations.",
    highlights: ["Contemporary interiors", "Fully furnished", "Short-term accommodation", "Guest-ready", "Professionally managed"],
    status: "Active",
    image: PORTFOLIO_PROPERTY_IMAGES["Toronto, Ontario, Canada"],
  },
  {
    location: "Dubai, United Arab Emirates",
    title: "Luxury Serviced Apartment",
    type: "Serviced Apartment",
    use: "Short-Term Accommodation",
    description: "A premium serviced apartment designed around the expectations of guests visiting one of the world's leading destinations for tourism, business, and luxury accommodation.",
    highlights: ["Premium interior", "Modern furnishings", "Guest-focused design", "Short-term rental focused", "Professionally managed"],
    status: "Active",
    image: PORTFOLIO_PROPERTY_IMAGES["Dubai, United Arab Emirates"],
  },
  {
    location: "Abu Dhabi, United Arab Emirates",
    title: "Executive Serviced Apartment",
    type: "Serviced Apartment",
    use: "Short-Term Accommodation",
    description: "A professionally furnished apartment designed to provide a comfortable and convenient accommodation experience for business and leisure guests.",
    highlights: ["Executive-style accommodation", "Fully furnished", "Modern living spaces", "Guest-ready", "Professionally managed"],
    status: "Under Management",
    image: PORTFOLIO_PROPERTY_IMAGES["Abu Dhabi, United Arab Emirates"],
  },
  {
    location: "Paris, France",
    title: "Elegant City Apartment",
    type: "Serviced Apartment",
    use: "Short-Term Accommodation",
    description: "A thoughtfully furnished apartment designed to combine comfort and functionality for guests experiencing one of Europe's most visited cities.",
    highlights: ["Elegant interior", "Fully furnished", "Short-term accommodation", "Guest-focused setup", "Professionally managed"],
    status: "Active",
    image: PORTFOLIO_PROPERTY_IMAGES["Paris, France"],
  },
  {
    location: "Lisbon, Portugal",
    title: "Contemporary City Retreat",
    type: "Serviced Apartment",
    use: "Short-Term Accommodation",
    description: "A contemporary serviced apartment positioned for guests seeking comfortable short-term accommodation in a major European destination.",
    highlights: ["Modern design", "Fully furnished", "Comfortable living environment", "Guest-ready", "Professionally managed"],
    status: "Coming Soon",
    image: PORTFOLIO_PROPERTY_IMAGES["Lisbon, Portugal"],
  },
  {
    location: "Cape Town, South Africa",
    title: "Premium Serviced Apartment",
    type: "Serviced Apartment",
    use: "Short-Term Accommodation",
    description: "A professionally furnished property designed to provide quality short-term accommodation in one of Africa's most prominent tourism and business destinations.",
    highlights: ["Premium furnishings", "Modern accommodation", "Short-term rental focused", "Guest-ready", "Professionally managed"],
    status: "Coming Soon",
    image: PORTFOLIO_PROPERTY_IMAGES["Cape Town, South Africa"],
  },
];

export default function PropertyPortfolioPage() {
  return (
    <>
      <PageHero
        kicker="Portfolio"
        title="Real estate with purpose."
        description="Explore the properties behind the Keystone REIT model. Keystone REIT focuses on acquiring, furnishing, and professionally managing serviced apartments and short-term rental properties designed to generate rental income."
        ctas={[{ label: "View Investment Plans", href: "/investment-plans" }]}
      />

      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>Our Property Strategy</SectionKicker>
          <h2 className="mt-3 text-balance font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Selected for income potential. Managed for performance.
          </h2>
          <p className="mt-5 text-muted-foreground">
            Our property strategy is centered around real estate that can serve the growing demand for quality,
            flexible accommodation.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STRATEGY_PHASES.map((phase) => (
            <div key={phase.title} className="rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <h3 className="font-display text-base font-semibold text-foreground">{phase.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{phase.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section muted className="border-y">
        <div className="mx-auto max-w-3xl text-center">
          <SectionKicker>What Makes A Property Attractive?</SectionKicker>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">We look beyond the four walls.</h2>
        </div>
        <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ATTRACTIVENESS_FACTORS.map((factor) => (
            <div key={factor.title} className="rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <h3 className="font-display text-base font-semibold text-foreground">{factor.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{factor.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>Portfolio Transparency</SectionKicker>
          <h2 className="mt-3 text-balance font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Know what stands behind the model.
          </h2>
          <p className="mt-5 text-muted-foreground">
            We believe confidence starts with transparency. As Keystone REIT grows, our property portfolio provides
            greater visibility into the real estate assets supporting our business model.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROPERTIES.map((property) => (
            <PropertyCard key={property.location} property={property} />
          ))}
        </div>
      </Section>

      <Section muted className="border-y text-center">
        <div className="mx-auto max-w-2xl">
          <SectionKicker>A Growing Global Portfolio</SectionKicker>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Property. Location. Opportunity.
          </h2>
          <p className="mt-5 text-muted-foreground">
            Our portfolio reflects Keystone REIT&apos;s focus on professionally managed serviced apartments and
            short-term rental properties across selected markets. From North America and Europe to the Middle East
            and Africa, we continue to focus on real estate opportunities where quality accommodation and guest
            demand can support our operating model.
          </p>
          <p className="mt-4 text-sm font-medium text-foreground">
            More properties. More opportunities. One professional approach.
          </p>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <InsuranceNotice />
        </div>
      </Section>

      <ClosingCta
        title="Real Estate. Made More Accessible."
        description="Keystone REIT — Registration No. 11793537. Investment opportunities starting from $200. Weekly ROI: 4–8%, depending on the selected investment plan."
        ctas={[{ label: "Get Started", href: "/signup" }]}
      />
    </>
  );
}
