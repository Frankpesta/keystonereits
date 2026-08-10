import { Button, Text } from "@react-email/components";
import { EmailLayout, EMAIL_COLORS } from "./email-layout";
import { getAppUrl } from "./app-url";

export function DepositCreditedEmail({ firstName, amountUsd }: { firstName: string; amountUsd: number }) {
  return (
    <EmailLayout previewText="Your deposit has been credited" heading="Deposit credited">
      <Text style={{ margin: "0 0 8px" }}>Hi {firstName},</Text>
      <Text style={{ margin: "0 0 16px" }}>
        Your deposit of <strong>${amountUsd.toLocaleString()}</strong> has been verified and credited to your
        available balance.
      </Text>
      <Button
        href={`${getAppUrl()}/dashboard/invest`}
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
        Browse investment plans
      </Button>
    </EmailLayout>
  );
}

export default function DepositCreditedEmailPreview() {
  return <DepositCreditedEmail firstName="Jordan" amountUsd={500} />;
}
