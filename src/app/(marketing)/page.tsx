import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  BanknoteIcon,
  EyeIcon,
  HammerIcon,
  HomeIcon,
  LayersIcon,
  SettingsIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Section, SectionKicker } from "@/components/marketing/section";
import { HeroEntrance } from "@/components/marketing/hero-entrance";
import { HowItWorksSteps } from "@/components/marketing/how-it-works-steps";
import { ClosingCta } from "@/components/marketing/closing-cta";
import { PageFaq } from "@/components/marketing/page-faq";
import { ReturnsDisclosure } from "@/components/marketing/returns-disclosure";
import { TrustStrip } from "@/components/marketing/trust-strip";
import { FramedImage } from "@/components/marketing/framed-image";
import { unsplashUrl, MARKETING_IMAGES } from "@/lib/marketing-images";

export const metadata: Metadata = {
  title: { absolute: "Keystone REIT — Real Estate. Made More Accessible." },
  description:
    "Build a stake in professionally managed real estate from $200. Keystone REIT provides an accessible way to participate in real estate through serviced apartments and short-term rental properties.",
};

const WHY_KEYSTONE = [
  {
    icon: WalletIcon,
    title: "Accessible Entry",
    description: "Real estate participation starts from just $200, making the opportunity more accessible.",
  },
  {
    icon: SettingsIcon,
    title: "Professionally Managed",
    description: "From property acquisition and furnishing to operations, the real estate process is professionally managed.",
  },
  {
    icon: TrendingUpIcon,
    title: "Income-Focused Properties",
    description: "Our focus is on serviced apartments and short-term rental properties designed to generate rental income.",
  },
  {
    icon: LayersIcon,
    title: "Diversified Participation",
    description:
      "Instead of putting capital toward a single property independently, pooled funds allow participation through a broader real estate strategy.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Asset Protection",
    description:
      "Our properties are insured against covered risks, providing an additional layer of protection for the underlying assets.",
  },
  {
    icon: EyeIcon,
    title: "Transparent Structure",
    description: "We believe investors should understand where their capital goes, how the model works, and how distributions are determined.",
  },
];

const OUR_MODEL = [
  { icon: HomeIcon, title: "Property Selection", description: "Identifying suitable real estate opportunities." },
  {
    icon: HammerIcon,
    title: "Furnishing & Preparation",
    description: "Preparing properties to meet the expectations of short-term guests.",
  },
  {
    icon: SettingsIcon,
    title: "Property Operations",
    description: "Managing the properties and their day-to-day rental activities.",
  },
  {
    icon: BanknoteIcon,
    title: "Income Distribution",
    description: "Distributing generated income to investors as dividends in accordance with the applicable investment terms.",
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    number: "01",
    title: "Funds Are Pooled",
    description: "Capital from investors is pooled through our mutual fund structure.",
  },
  {
    number: "02",
    title: "Real Estate Is Acquired",
    description: "The pooled capital is used to acquire and furnish carefully selected serviced apartments and short-term rental properties.",
  },
  {
    number: "03",
    title: "Properties Generate Rental Income",
    description: "The apartments are made available to guests on a daily or short-term basis, generating rental income.",
  },
  {
    number: "04",
    title: "Income Is Distributed",
    description: "Income generated from the properties is distributed to investors as dividends based on their investment amount and the applicable terms of the investment.",
  },
];

const FAQ_TEASER = [
  {
    question: "What is Keystone REIT?",
    answer:
      "Keystone REIT provides an accessible way for investors to participate in real estate through a professionally managed mutual fund structure focused on serviced apartments and short-term rental properties.",
  },
  {
    question: "How much do I need to start?",
    answer: "Investment opportunities start from $200.",
  },
  {
    question: "How does the model work?",
    answer:
      "Funds from investors are pooled through our mutual fund and used to acquire and furnish serviced apartments and short-term rental properties. The properties are then rented to guests, generating rental income. Income generated is distributed to investors as dividends according to their investment amount and applicable investment terms.",
  },
  {
    question: "What is the weekly ROI?",
    answer:
      "Weekly ROI ranges from 4–8% depending on the selected investment plan. The applicable rate, duration, and distribution terms depend on the specific plan selected.",
  },
  {
    question: "Are the properties insured?",
    answer: "Yes. Our properties are insured against covered risks, providing an additional layer of protection for the underlying assets.",
  },
  {
    question: "Do I have to manage the property myself?",
    answer: "No. Keystone REIT professionally manages the property and investment process, including the operational side of the properties.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero — full-bleed image background */}
      <section className="relative flex min-h-[calc(100vh-4.5rem)] items-center overflow-hidden bg-primary">
        <Image
          src={unsplashUrl(MARKETING_IMAGES.heroBuilding.base, { w: 2400 })}
          alt={MARKETING_IMAGES.heroBuilding.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-primary/30" />
        <HeroEntrance className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <p className="inline-flex items-center gap-3 text-xs font-semibold tracking-[0.25em] text-primary-foreground/70 uppercase">
            <span className="h-px w-8 bg-primary-foreground/40" aria-hidden />
            Real Estate. Made More Accessible.
            <span className="h-px w-8 bg-primary-foreground/40" aria-hidden />
          </p>
          <h1 className="mt-6 text-balance font-display text-5xl font-semibold tracking-tight text-primary-foreground sm:text-6xl lg:text-7xl">
            Build a stake in professionally managed real estate{" "}
            <span className="text-accent italic">from $200</span>.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-primary-foreground/85">
            Keystone REIT provides an accessible way to participate in real estate through professionally managed
            serviced apartments and short-term rental properties.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              asChild
            >
              <Link href="/how-it-works">See How It Works</Link>
            </Button>
          </div>
          <p className="mt-8 text-xs text-primary-foreground/60">Keystone REIT — Registration No. 11793537</p>
        </HeroEntrance>
      </section>

      {/* Trust strip — immediate credibility markers right below the fold */}
      <div className="border-b bg-card">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <TrustStrip
            items={[
              { value: "$200", label: "Minimum to Start" },
              { value: "4–8%", label: "Plan-Dependent Weekly ROI" },
              { value: "Insured", label: "Underlying Properties" },
            ]}
          />
        </div>
      </div>

      {/* Section 2 — The Opportunity */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionKicker>The Opportunity</SectionKicker>
            <h2 className="mt-3 text-balance font-display text-3xl font-semibold text-foreground sm:text-4xl">
              Real estate has always been valuable. Now, it&apos;s more accessible.
            </h2>
            <div className="mt-6 flex flex-col gap-4 text-muted-foreground">
              <p>
                Owning or participating in income-generating property has traditionally required significant
                capital, property management, and time.
              </p>
              <p>Keystone REIT changes the way people can participate.</p>
              <p>
                Through our mutual fund structure, funds from investors are pooled and professionally deployed
                toward acquiring and furnishing serviced apartments and short-term rental properties, including
                Airbnb-style apartments.
              </p>
              <p>
                These properties are operated and rented to guests, creating rental income that is distributed to
                investors as dividends according to their investment amount and applicable investment terms.
              </p>
              <p className="font-medium text-foreground">
                You don&apos;t have to buy an entire property to participate in real estate.
              </p>
            </div>
            <Button className="mt-8" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
          <FramedImage
            src={unsplashUrl(MARKETING_IMAGES.ctaInterior.base, { w: 1000, h: 1250 })}
            alt={MARKETING_IMAGES.ctaInterior.alt}
          />
        </div>
      </Section>

      {/* Section 3 — How Keystone REIT Works */}
      <Section muted className="border-y">
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>How Keystone REIT Works</SectionKicker>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Simple. Structured. Professional.
          </h2>
        </div>
        <div className="mt-14">
          <HowItWorksSteps steps={HOW_IT_WORKS_STEPS} columns={4} />
        </div>
        <div className="mt-14 text-center">
          <p className="font-display text-lg font-medium text-foreground">Real estate participation, simplified.</p>
          <Button variant="outline" className="mt-6" asChild>
            <Link href="/how-it-works">See How It Works</Link>
          </Button>
        </div>
      </Section>

      {/* Section 4 — Why Keystone REIT? */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>Why Keystone REIT?</SectionKicker>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            More than real estate. A simpler way to participate.
          </h2>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Section 5 — Why Real Estate? */}
      <section className="relative overflow-hidden bg-primary">
        <Image
          src={unsplashUrl(MARKETING_IMAGES.trustBuilding.base, { w: 2000 })}
          alt={MARKETING_IMAGES.trustBuilding.alt}
          fill
          sizes="100vw"
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-primary/30" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <h2 className="text-balance font-display text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl">
            Don&apos;t just watch property values grow. Participate in the real estate economy.
          </h2>
          <div className="mx-auto mt-6 flex max-w-xl flex-col gap-4 text-primary-foreground/85">
            <p>Real estate is one of the world&apos;s most established asset classes.</p>
            <p>
              From residential apartments to short-term accommodation, property can create value through both the
              underlying asset and the income generated from its use.
            </p>
            <p>Keystone REIT focuses on turning this concept into a more accessible participation model.</p>
            <p className="font-medium text-primary-foreground">
              Your path to real estate participation doesn&apos;t have to begin with buying an entire building. It
              can begin with $200.
            </p>
          </div>
          <Button size="lg" variant="secondary" className="mt-8" asChild>
            <Link href="/signup">Start Your Journey</Link>
          </Button>
        </div>
      </section>

      {/* Section 6 — Our Model */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>Our Model</SectionKicker>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Turning property into an income-generating business
          </h2>
          <p className="mt-5 text-muted-foreground">
            Keystone REIT focuses on serviced apartments and short-term rental properties where demand for quality
            accommodation creates opportunities for rental income. We manage the process behind the scenes:
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {OUR_MODEL.map((item) => (
            <div key={item.title} className="flex flex-col gap-3 rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-primary-foreground shadow-sm">
                <item.icon className="size-5" />
              </div>
              <h3 className="font-display text-base font-semibold text-foreground">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center font-medium text-foreground">
          We handle the property operations. You participate in the opportunity.
        </p>
      </Section>

      {/* Section 7 — Investment Plans teaser */}
      <Section muted className="border-y">
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>Investment Plans</SectionKicker>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Choose a plan that fits your goals
          </h2>
          <p className="mt-5 text-muted-foreground">
            Keystone REIT offers investment plans designed to provide different participation options.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 font-display text-lg font-semibold text-foreground">
            <span>Starting from $200</span>
            <span aria-hidden className="text-border">
              |
            </span>
            <span>Weekly ROI: 4–8%</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Each plan has its own applicable terms, duration, and distribution structure.
          </p>
          <ReturnsDisclosure className="mt-3" />
          <Button className="mt-8" asChild>
            <Link href="/investment-plans">View Investment Plans</Link>
          </Button>
        </div>
      </Section>

      {/* Section 8 — Built Around Real Property */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <FramedImage
            className="order-2 lg:order-1"
            src={unsplashUrl(MARKETING_IMAGES.processKitchen.base, { w: 1000, h: 1250 })}
            alt={MARKETING_IMAGES.processKitchen.alt}
          />
          <div className="order-1 lg:order-2">
            <SectionKicker>Built Around Real Property</SectionKicker>
            <h2 className="mt-3 text-balance font-display text-3xl font-semibold text-foreground sm:text-4xl">
              Your participation is connected to real estate.
            </h2>
            <div className="mt-6 flex flex-col gap-4 text-muted-foreground">
              <p>Keystone REIT&apos;s model is centered around tangible property.</p>
              <p>
                Capital is deployed toward acquiring and furnishing serviced apartments and short-term rental
                properties that can be operated as income-generating accommodation.
              </p>
              <p className="font-display text-base font-medium text-foreground">
                Capital → Real Estate → Rental Activity → Income → Investor Distributions
              </p>
              <p>It&apos;s a straightforward approach to participating in the real estate market.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Section 9 — Trust & Protection teaser */}
      <Section muted className="border-y">
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>Trust & Protection</SectionKicker>
          <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Built with responsibility in mind.
          </h2>
          <div className="mx-auto mt-6 flex max-w-xl flex-col gap-4 text-muted-foreground">
            <p>We understand that participating in an investment requires trust.</p>
            <p>
              That&apos;s why Keystone REIT is built around a clear structure, professionally managed properties,
              and an emphasis on responsible asset management.
            </p>
            <p>
              Our underlying properties are insured against covered risks, providing additional protection for the
              assets supporting the business.
            </p>
            <p className="text-sm">Keystone REIT — Registration No. 11793537</p>
          </div>
          <Button variant="outline" className="mt-8" asChild>
            <Link href="/about/trust-and-protection">Learn About Trust & Protection</Link>
          </Button>
        </div>
      </Section>

      {/* Section 10 — Who Is Keystone REIT For? */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <SectionKicker>Who Is Keystone REIT For?</SectionKicker>
          <h2 className="mt-3 text-balance font-display text-3xl font-semibold text-foreground sm:text-4xl">
            Real estate participation for people who want more options.
          </h2>
          <div className="mt-6 flex flex-col gap-4 text-muted-foreground">
            <p>
              Keystone REIT is designed for individuals who want to participate in real estate without having to
              personally source properties, furnish apartments, manage guests, or handle day-to-day property
              operations.
            </p>
            <p>
              Whether you&apos;re taking your first step into real estate or looking for another way to participate
              in the property market, Keystone REIT provides a structured approach to real estate participation.
            </p>
            <p className="font-medium text-foreground">
              You don&apos;t need to own the whole property to have a place in real estate.
            </p>
          </div>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/signup">Get Started From $200</Link>
          </Button>
        </div>
      </Section>

      {/* Section 11 — FAQ teaser */}
      <Section muted className="border-y">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <SectionKicker>FAQ</SectionKicker>
            <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
              Common questions
            </h2>
          </div>
          <div className="mt-12">
            <PageFaq items={FAQ_TEASER} idPrefix="home-faq" />
          </div>
          <div className="mt-10 text-center">
            <Button variant="outline" asChild>
              <Link href="/investment-plans">View Investment Plans</Link>
            </Button>
          </div>
        </div>
      </Section>

      {/* Section 12 — Final CTA */}
      <ClosingCta
        title="Your real estate journey can start today."
        description={
          <>
            You don&apos;t need millions to participate in real estate. You don&apos;t need to search for
            properties. You don&apos;t need to furnish apartments. You don&apos;t need to manage guests.
            <br />
            <br />
            Keystone REIT brings the real estate opportunity and professional management together in one accessible
            platform. Start from $200.
          </>
        }
        ctas={[
          { label: "Start Investing Now", href: "/signup" },
          { label: "Learn More About Keystone REIT", href: "/about" },
        ]}
      />
    </>
  );
}
