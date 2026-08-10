import { Button, Link, Text } from "@react-email/components";
import { EmailLayout, EMAIL_COLORS } from "./email-layout";
import { getAppUrl } from "./app-url";

const STEPS = [
  {
    title: "Verify your identity",
    description: "A quick KYC check unlocks deposits, investments, and withdrawals on your account.",
  },
  {
    title: "Fund your account",
    description: "Deposit from $200 using crypto or fiat — funds are available to invest right away.",
  },
  {
    title: "Choose an investment plan",
    description: "Pick a plan that fits your goals and start earning plan-dependent weekly returns.",
  },
];

export function WelcomeEmail({ firstName }: { firstName: string }) {
  return (
    <EmailLayout previewText="Your Keystone REIT account is ready — here's how to get started" heading={`Welcome, ${firstName}`}>
      <Text style={{ margin: "0 0 8px" }}>Hi {firstName},</Text>
      <Text style={{ margin: "0 0 16px" }}>
        Your Keystone REIT account is verified and ready. You&apos;re now part of a professionally managed way to
        participate in real estate — through serviced apartments and short-term rental properties — without the
        capital, time, or expertise it takes to buy and manage a property yourself.
      </Text>
      <Text style={{ margin: "0 0 20px" }}>Here&apos;s how to get started:</Text>

      <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ margin: "0 0 24px" }}>
        <tbody>
          {STEPS.map((step, i) => (
            <tr key={step.title}>
              <td style={{ paddingBottom: i === STEPS.length - 1 ? 0 : 16, verticalAlign: "top" }}>
                <table role="presentation" cellPadding={0} cellSpacing={0}>
                  <tbody>
                    <tr>
                      <td
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          backgroundColor: EMAIL_COLORS.muted,
                          color: EMAIL_COLORS.primary,
                          fontSize: 13,
                          fontWeight: 700,
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        {i + 1}
                      </td>
                      <td style={{ width: 12 }} />
                      <td>
                        <Text style={{ margin: 0, fontWeight: 600, color: EMAIL_COLORS.foreground, fontSize: 14 }}>
                          {step.title}
                        </Text>
                        <Text style={{ margin: "2px 0 0", fontSize: 13, color: EMAIL_COLORS.mutedForeground }}>
                          {step.description}
                        </Text>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Button
        href={`${getAppUrl()}/dashboard`}
        style={{
          backgroundColor: EMAIL_COLORS.primary,
          color: EMAIL_COLORS.primaryForeground,
          borderRadius: 6,
          padding: "12px 24px",
          fontSize: 14,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Go to your dashboard
      </Button>

      <Text style={{ margin: "20px 0 0", fontSize: 13, color: EMAIL_COLORS.mutedForeground }}>
        Questions before you get started?{" "}
        <Link href="mailto:support@keystonereits.com" style={{ color: EMAIL_COLORS.primary }}>
          Contact our support team
        </Link>{" "}
        — we&apos;re happy to help.
      </Text>
    </EmailLayout>
  );
}

export default function WelcomeEmailPreview() {
  return <WelcomeEmail firstName="Jordan" />;
}
