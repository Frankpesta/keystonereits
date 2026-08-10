import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { Section } from "@/components/marketing/section";
import { PageFaq, type FaqItem } from "@/components/marketing/page-faq";
import { ClosingCta } from "@/components/marketing/closing-cta";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Everything you need to know about Keystone REIT — our real estate participation model, investment plans, properties, and how the process works.",
};

const CATEGORIES: { title: string; items: FaqItem[] }[] = [
  {
    title: "About Keystone REIT",
    items: [
      {
        question: "What is Keystone REIT?",
        answer:
          "Keystone REIT provides an accessible way for investors to participate in professionally managed real estate through a mutual fund structure. Funds are pooled and used to acquire and furnish serviced apartments and short-term rental properties, including Airbnb-style apartments. These properties are then operated and rented to guests to generate rental income. The income generated from the properties is distributed to investors as dividends based on their investment amount and the applicable terms of the investment.",
      },
      {
        question: "What does Keystone REIT actually do?",
        answer:
          "Keystone REIT focuses on acquiring, furnishing, and professionally managing serviced apartments and short-term rental properties. Our role is to manage the real estate and its operations while providing investors with a structured way to participate in the underlying real estate activity.",
      },
      {
        question: "Is Keystone REIT a real estate company or an investment platform?",
        answer:
          "Keystone REIT combines real estate operations with an investment participation model. The underlying activity is centered around real properties, particularly serviced apartments and short-term rental accommodation, while the mutual fund structure provides a way for investors to participate without having to personally acquire or manage an entire property.",
      },
    ],
  },
  {
    title: "How It Works",
    items: [
      {
        question: "How does Keystone REIT work?",
        answer:
          "The process is designed to be straightforward: (1) Funds are pooled through our mutual fund structure. (2) The capital is used to acquire and prepare suitable serviced apartments and short-term rental properties. (3) The apartments are made available to guests on a daily or short-term basis. (4) Guest bookings generate rental income from the properties. (5) Generated income is distributed to investors as dividends according to their investment amount and the applicable terms of their selected plan.",
      },
      {
        question: "Do I need to buy an entire property?",
        answer:
          "No. Keystone REIT is designed to provide a more accessible way to participate in real estate without requiring an individual to purchase an entire property. Investment opportunities start from $200.",
      },
      {
        question: "Do I have to find or manage a property myself?",
        answer:
          "No. Keystone REIT handles the professional management of the properties and the associated investment process. This includes property acquisition, furnishing, preparation, and day-to-day rental operations.",
      },
      {
        question: "How is the rental income generated?",
        answer:
          "Our serviced apartments and short-term rental properties are made available to guests on a daily or short-term basis. Guest bookings generate rental income, which forms part of the income distributed to investors according to the applicable investment terms.",
      },
    ],
  },
  {
    title: "Investment Plans",
    items: [
      {
        question: "How much do I need to start?",
        answer: "Investment opportunities with Keystone REIT start from $200. The minimum amount may vary depending on the available investment plan.",
      },
      {
        question: "What is the weekly ROI?",
        answer:
          "The stated weekly ROI ranges from 4–8% depending on the selected investment plan. The applicable rate, duration, distribution structure, and other conditions depend on the specific plan selected. Returns are not guaranteed and are subject to the applicable investment terms and risks.",
      },
      {
        question: "Are the returns guaranteed?",
        answer:
          "No. Investment returns are not guaranteed. The applicable return or distribution depends on the selected investment plan and its terms, as well as the performance of the underlying investment activities. Investors should review the relevant investment information and terms before participating.",
      },
      {
        question: "How are dividends calculated?",
        answer:
          "Dividends are determined based on the investor's investment amount and the applicable terms of the selected investment plan. The specific calculation and distribution schedule will be provided as part of the relevant investment plan information.",
      },
      {
        question: "How often are distributions made?",
        answer: "Distribution frequency depends on the specific investment plan selected. Please review the terms of your chosen plan for the applicable distribution schedule.",
      },
      {
        question: "Can I choose which property my funds are invested in?",
        answer:
          "Investment allocation depends on the structure and terms of the applicable investment plan. Where individual property selection is not offered, funds may be allocated across qualifying properties within the Keystone REIT portfolio.",
      },
      {
        question: "Can I increase my investment later?",
        answer: "This depends on the terms and availability of the selected investment plan. Please contact our support team for information about adding to an existing participation.",
      },
    ],
  },
  {
    title: "Properties",
    items: [
      {
        question: "What types of properties does Keystone REIT acquire?",
        answer: "Our focus is on serviced apartments and short-term rental properties, including Airbnb-style apartments. We seek properties that can be professionally prepared and operated as quality short-term accommodation.",
      },
      {
        question: "Where are Keystone REIT properties located?",
        answer:
          "Property locations may vary as the portfolio develops. Details of properties currently available within the Keystone REIT portfolio will be provided through the relevant property or investment information.",
      },
      {
        question: "How are properties selected?",
        answer:
          "Properties are selected based on factors relevant to their suitability for short-term accommodation and their potential to generate rental income. This may include location, property quality, guest demand, operating considerations, and other factors relevant to the property's performance.",
      },
      {
        question: "Who manages the properties?",
        answer: "Keystone REIT and its appointed property management and operational partners oversee the management of the properties. This includes preparing the properties for guests and managing the day-to-day rental activities.",
      },
      {
        question: "Are the properties insured?",
        answer: "Yes. Our underlying properties are insured against covered risks, providing an additional layer of protection for the assets supporting the business. Insurance coverage is subject to the applicable policy terms, conditions, exclusions, and limits.",
      },
    ],
  },
  {
    title: "Security & Trust",
    items: [
      {
        question: "How can I verify Keystone REIT?",
        answer: "Keystone REIT's registration number is 11793537. Additional company and investment information is available throughout our website.",
      },
      {
        question: "Is my money directly used to buy a property?",
        answer:
          "Funds are pooled through the mutual fund structure and deployed according to the applicable investment structure and terms. The capital is used toward the acquisition, furnishing, and operation of qualifying real estate assets.",
      },
      {
        question: "What happens if a property is not occupied?",
        answer:
          "Short-term rental performance can vary depending on factors such as demand, seasonality, location, pricing, and operating conditions. Property operations are professionally managed with the objective of maintaining occupancy and generating rental income. Investment returns are therefore not guaranteed.",
      },
      {
        question: "What risks should I consider?",
        answer:
          "As with any investment, participation in real estate involves risk. Property values, occupancy levels, rental demand, operating costs, market conditions, and other factors can affect performance. Investors should carefully review all applicable investment information and terms and consider whether the investment is suitable for them before participating.",
      },
    ],
  },
  {
    title: "Getting Started",
    items: [
      {
        question: "How do I get started with Keystone REIT?",
        answer:
          "(1) Explore the available investment plans. (2) Select the plan that suits your objectives. (3) Review the applicable terms and information. (4) Complete the registration process. (5) Follow the instructions to participate.",
      },
      {
        question: "What information do I need to register?",
        answer:
          "The registration process may require personal and identification information necessary to create and maintain your account and comply with applicable requirements. The exact information required will be shown during registration.",
      },
      {
        question: "Can I invest from outside my country?",
        answer:
          "Availability may depend on applicable laws, regulations, eligibility requirements, and the terms of the relevant investment plan. Please contact Keystone REIT before participating if you are unsure whether you are eligible.",
      },
      {
        question: "How can I contact Keystone REIT?",
        answer: "For questions that aren't answered on this page, please contact our support team through the Contact Us page.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHero
        kicker="FAQ"
        title="Everything you need to know about Keystone REIT"
        description="Whether you're discovering Keystone REIT for the first time or you're ready to get started, we've answered some of the most common questions about our real estate participation model, investment plans, properties, and how the process works."
      />

      <Section>
        <div className="mx-auto flex max-w-3xl flex-col gap-14">
          {CATEGORIES.map((category) => (
            <div key={category.title}>
              <h2 className="font-display text-2xl font-semibold text-foreground">{category.title}</h2>
              <div className="mt-4">
                <PageFaq items={category.items} idPrefix={category.title} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <ClosingCta
        title="Still have questions?"
        description="We're here to help. If you have a question about Keystone REIT, our investment plans, properties, or how the model works, our team is available to provide further information. Your real estate journey starts with understanding the opportunity."
        ctas={[
          { label: "Get Started", href: "/signup" },
          { label: "Contact Us", href: "/contact" },
        ]}
      />
    </>
  );
}
