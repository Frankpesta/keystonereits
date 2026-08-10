import type { Metadata } from "next";
import { MailIcon } from "lucide-react";
import { Section } from "@/components/marketing/section";
import { CompanyInfo } from "@/components/marketing/company-info";
import { ContactForm } from "./contact-form";

// NOTE: No marketing copy was supplied for this page (see
// docs/09-marketing-site-copy.md §15) — framing text below is intentionally
// minimal/functional rather than invented brand voice. Flag for real copy.
export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the Keystone REIT team.",
};

export default function ContactPage() {
  return (
    <Section>
      <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-primary-foreground shadow-sm">
            <MailIcon className="size-5" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-semibold text-foreground">Get in Touch</h1>
          <p className="mt-3 text-muted-foreground">
            Have a question about Keystone REIT, our investment plans, or how the model works? Send us a message and
            our team will get back to you.
          </p>
          <div className="mt-8 border-t pt-6">
            <CompanyInfo className="text-sm text-muted-foreground" />
          </div>
        </div>
        <ContactForm />
      </div>
    </Section>
  );
}
