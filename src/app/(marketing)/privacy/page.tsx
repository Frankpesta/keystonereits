import type { Metadata } from "next";
import { Section } from "@/components/marketing/section";
import { CompanyInfo } from "@/components/marketing/company-info";

// NOTE: No legal copy has been authored yet — this is a structural
// placeholder, not a real Privacy Policy. Do not invent legal text.
export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <Section>
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-semibold text-foreground">Privacy Policy</h1>
        <p className="mt-4 text-muted-foreground">
          This page will contain Keystone REIT&apos;s full Privacy Policy, describing what personal information is
          collected, how it is used, and how it is protected. Authored legal content is still pending — this
          section is a structural placeholder.
        </p>
        <div className="mt-10 border-t pt-6">
          <CompanyInfo className="text-sm text-muted-foreground" />
        </div>
      </div>
    </Section>
  );
}
