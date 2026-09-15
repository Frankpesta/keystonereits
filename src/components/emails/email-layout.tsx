import { Body, Container, Head, Heading, Hr, Html, Img, Link, Preview, Section, Text } from "@react-email/components";
import type { ReactNode } from "react";
import { getAppUrl } from "./app-url";

/**
 * Hex values are the exact HSL brand tokens from src/app/globals.css,
 * converted to hex — email clients can't read CSS custom properties, so
 * every color here is a literal, and every style is inline (no Tailwind
 * class parsing pitfalls across clients). No dark-mode variants: this
 * project has no dark theme, and email clients that force dark mode should
 * still get the same light card, not an inverted one — see EMAIL_COLORS.
 */
export const EMAIL_COLORS = {
  primary: "#63422c",
  primaryForeground: "#faf8f5",
  background: "#faf8f5",
  foreground: "#2b221d",
  muted: "#f2f0ed",
  mutedForeground: "#70645c",
  border: "#e5e0dc",
  success: "#2d7648",
  warning: "#cf8b17",
  destructive: "#bd2828",
} as const;

const SANS_FONT = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif';
const SERIF_FONT = 'Georgia,"Times New Roman",serif';

export function EmailLayout({
  previewText,
  heading,
  greetingName,
  children,
  isBroadcast = false,
}: {
  previewText: string;
  heading: string;
  /** Renders a "Hi {greetingName}," line under the heading. Omit for emails with no known recipient name. */
  greetingName?: string;
  children: ReactNode;
  isBroadcast?: boolean;
}) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body
        style={{
          backgroundColor: EMAIL_COLORS.background,
          fontFamily: SANS_FONT,
          margin: 0,
          padding: "32px 16px",
          colorScheme: "light",
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 8,
            overflow: "hidden",
            maxWidth: 480,
            border: `1px solid ${EMAIL_COLORS.border}`,
          }}
        >
          <Section
            style={{
              backgroundColor: "#ffffff",
              padding: "24px 32px",
              borderBottom: `1px solid ${EMAIL_COLORS.border}`,
            }}
          >
            <Img src={`${getAppUrl()}/logo.png`} alt="Keystone REIT" width={132} height={100} />
          </Section>
          <Section style={{ padding: "32px" }}>
            <Heading
              as="h1"
              style={{ fontFamily: SERIF_FONT, fontSize: 20, color: EMAIL_COLORS.foreground, margin: "0 0 16px" }}
            >
              {heading}
            </Heading>
            <div style={{ fontSize: 14, lineHeight: "22px", color: EMAIL_COLORS.foreground }}>
              {greetingName && <Text style={{ margin: "0 0 8px" }}>Hi {greetingName},</Text>}
              {children}
            </div>
          </Section>
          <Hr style={{ borderColor: EMAIL_COLORS.border, margin: 0 }} />
          <Section style={{ padding: "24px 32px" }}>
            <Text style={{ fontSize: 12, color: EMAIL_COLORS.mutedForeground, margin: "0 0 8px" }}>
              Keystone REIT — Real estate participation, made more accessible.
            </Text>
            {isBroadcast && (
              <Text style={{ fontSize: 12, color: EMAIL_COLORS.mutedForeground, margin: 0 }}>
                You&apos;re receiving this because you have an account with Keystone REIT.{" "}
                <Link href="mailto:support@keystonereits.com" style={{ color: EMAIL_COLORS.primary }}>
                  Contact support
                </Link>{" "}
                with any questions.
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
