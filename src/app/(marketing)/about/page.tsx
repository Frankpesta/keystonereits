import type { Metadata } from "next";
import { EyeIcon, HomeIcon, SettingsIcon, ShieldCheckIcon, TrendingUpIcon, WalletIcon } from "lucide-react";

import { PageHero } from "@/components/marketing/page-hero";
import { Section, SectionKicker } from "@/components/marketing/section";
import { HowItWorksSteps, type Step } from "@/components/marketing/how-it-works-steps";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { FramedImage } from "@/components/marketing/framed-image";
import { unsplashUrl, MARKETING_IMAGES } from "@/lib/marketing-images";

export const metadata: Metadata = {
  title: "About Keystone REIT",
  description:
    "Keystone REIT was created around a simple idea: real estate should be more accessible. Learn how our mutual fund structure works.",
};

const WHAT_WE_DO: Step[] = [
  { number: "01", title: "Pooling Capital", description: "Funds from investors are pooled through our mutual fund structure." },
  {
    number: "02",
    title: "Acquiring Properties",
    description: "The capital is deployed toward acquiring suitable serviced apartments and short-term rental properties.",
  },
  {
    number: "03",
    title: "Preparing The Properties",
    description: "Selected properties are furnished and prepared to provide quality accommodation for short-term guests.",
  },
  {
    number: "04",
    title: "Managing The Properties",
    description: "The properties are professionally managed and made available to guests on a daily or short-term basis.",
  },
  {
    number: "05",
    title: "Generating Rental Income",
    description: "Guest bookings generate rental income from the properties.",
  },
  {
    number: "06",
    title: "Distributing Income",
    description:
      "Income generated from the properties is distributed to investors as dividends based on their investment amount and the applicable terms of the investment.",
  },
];

const WHY_KEYSTONE = [
  {
    icon: WalletIcon,
    title: "Accessible",
    description: "Investment opportunities start from $200, opening the door to real estate participation without requiring the purchase of an entire property.",
  },
  {
    icon: SettingsIcon,
    title: "Professionally Managed",
    description: "Our approach covers the property lifecycle—from acquisition and furnishing to rental operations and management.",
  },
  {
    icon: HomeIcon,
    title: "Real Property",
    description: "Our model is centered around tangible real estate, particularly serviced apartments and short-term rental properties.",
  },
  {
    icon: TrendingUpIcon,
    title: "Income-Focused",
    description: "Properties are operated as short-term accommodation, creating opportunities for rental income through guest bookings.",
  },
  {
    icon: EyeIcon,
    title: "Structured",
    description: "Our mutual fund structure provides an organized framework for pooling capital and participating in real estate opportunities.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Protection",
    description: "Our underlying properties are insured against covered risks, providing an additional layer of protection for the assets supporting the business.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        kicker="About Keystone REIT"
        title="Making real estate participation more accessible"
        description={
          <>
            Keystone REIT was created around a simple idea: real estate should be more accessible. Traditionally,
            participating in real estate has required significant capital, extensive property knowledge, and the
            time and expertise needed to manage properties effectively.
          </>
        }
        ctas={[{ label: "View Investment Plans", href: "/investment-plans" }]}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionKicker>Who We Are</SectionKicker>
            <h2 className="mt-3 text-balance font-display text-3xl font-semibold text-foreground sm:text-4xl">
              A real estate participation platform built around real property
            </h2>
            <div className="mt-6 flex flex-col gap-4 text-muted-foreground">
              <p>
                Keystone REIT is focused on creating a structured and accessible way for individuals to participate
                in the real estate market.
              </p>
              <p>
                Our model centers on serviced apartments and short-term rental properties, including Airbnb-style
                apartments, where professionally managed properties can generate rental income through guest stays.
              </p>
              <p>
                From property acquisition and furnishing to day-to-day operations, the process is professionally
                managed so that investors can participate without taking on the responsibilities of directly
                managing the properties.
              </p>
            </div>
          </div>
          <FramedImage
            src={unsplashUrl(MARKETING_IMAGES.aboutLobby.base, { w: 1000, h: 1250 })}
            alt={MARKETING_IMAGES.aboutLobby.alt}
          />
        </div>
      </Section>

      <Section muted className="border-y">
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>What We Do</SectionKicker>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            From capital to real estate
          </h2>
        </div>
        <div className="mt-14">
          <HowItWorksSteps steps={WHAT_WE_DO} columns={3} />
        </div>
        <p className="mt-14 text-center font-display text-lg font-medium text-foreground">
          A simple concept. Professionally managed.
        </p>
      </Section>

      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>Why Keystone REIT?</SectionKicker>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_KEYSTONE.map((item) => (
            <div key={item.title} className="flex flex-col gap-3 rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-primary-foreground shadow-sm">
                <item.icon className="size-5" />
              </div>
              <h3 className="font-display text-base font-semibold text-foreground">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section muted className="border-y">
        <div className="mx-auto max-w-3xl text-center">
          <SectionKicker>Our Approach to Real Estate</SectionKicker>
          <h2 className="mt-3 text-balance font-display text-3xl font-semibold text-foreground sm:text-4xl">
            We believe the best opportunities begin with the right foundation
          </h2>
          <div className="mx-auto mt-6 flex max-w-2xl flex-col gap-4 text-muted-foreground">
            <p>Real estate is more than bricks, walls, and locations.</p>
            <p>
              The value of a property can be influenced by how well it is selected, furnished, positioned,
              marketed, and managed.
            </p>
            <p>That&apos;s why our approach goes beyond simply acquiring property.</p>
            <p>
              We focus on creating attractive accommodation, managing operations professionally, and positioning
              properties to serve the needs of short-term guests.
            </p>
          </div>
          <p className="mt-6 font-display text-lg font-medium text-foreground">
            Property + Management + Demand = A Stronger Real Estate Model
          </p>
        </div>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          <SectionKicker>Built on Trust</SectionKicker>
          <h2 className="mt-3 text-balance font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Professionalism matters
          </h2>
          <div className="mt-6 flex flex-col gap-4 text-muted-foreground">
            <p>
              We understand that participating in an investment requires confidence in the platform managing it.
            </p>
            <p>
              That&apos;s why Keystone REIT is committed to operating with professionalism, transparency, and
              responsible asset management.
            </p>
            <p>We aim to ensure that investors can clearly understand:</p>
          </div>
          <ul className="mt-4 flex flex-col gap-2 text-muted-foreground">
            {[
              "How the Keystone REIT model works",
              "Where pooled capital is deployed",
              "How properties generate rental income",
              "How distributions are determined",
              "The applicable terms of each investment plan",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-muted-foreground">
            Our underlying properties are insured against covered risks, providing an additional layer of
            protection for the assets supporting the business.
          </p>
        </div>
      </Section>

      <Section muted className="border-y text-center">
        <div className="mx-auto max-w-2xl">
          <SectionKicker>Our Commitment</SectionKicker>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Real Estate. Made More Accessible.
          </h2>
          <div className="mx-auto mt-6 flex max-w-xl flex-col gap-4 text-muted-foreground">
            <p>Keystone REIT is committed to building a real estate participation platform designed for today&apos;s investor.</p>
            <p>We believe participation shouldn&apos;t have to begin with owning an entire building.</p>
            <p>
              It can begin with understanding the opportunity, choosing an appropriate plan, and taking that first
              step.
            </p>
          </div>
        </div>
      </Section>

      <div className="border-t bg-card">
        <div className="mx-auto max-w-3xl px-4 py-10 text-center sm:px-6 lg:px-8">
          <p className="font-display text-sm font-semibold text-foreground">KEYSTONE REIT</p>
          <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm text-muted-foreground sm:grid-cols-2">
            <div>
              <dt className="inline font-medium text-foreground">Registration Number: </dt>
              <dd className="inline">11793537</dd>
            </div>
            <div>
              <dt className="inline font-medium text-foreground">Starting Investment: </dt>
              <dd className="inline">$200</dd>
            </div>
            <div>
              <dt className="inline font-medium text-foreground">Business Focus: </dt>
              <dd className="inline">Real Estate Participation & Property Management</dd>
            </div>
            <div>
              <dt className="inline font-medium text-foreground">Plan-Dependent Weekly ROI: </dt>
              <dd className="inline">4–8%</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="inline font-medium text-foreground">Property Focus: </dt>
              <dd className="inline">Serviced Apartments & Short-Term Rental Properties</dd>
            </div>
          </dl>
        </div>
      </div>

      <ClosingCta
        title="Ready to participate? Your real estate journey starts here."
        description="Explore our investment plans and discover a more accessible way to participate in professionally managed real estate. Start from $200."
        ctas={[
          { label: "View Investment Plans", href: "/investment-plans" },
          { label: "Get Started", href: "/signup" },
        ]}
      />
    </>
  );
}
