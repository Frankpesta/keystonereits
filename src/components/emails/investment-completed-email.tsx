import { Button, Text } from "@react-email/components";
import { EmailLayout, EMAIL_COLORS } from "./email-layout";
import { getAppUrl } from "./app-url";

export function InvestmentCompletedEmail({
  firstName,
  planName,
  amountUsd,
  accruedProfit,
}: {
  firstName: string;
  planName: string;
  amountUsd: number;
  accruedProfit: number;
}) {
  return (
    <EmailLayout previewText={`Your ${planName} investment has matured`} heading="Investment matured" greetingName={firstName}>
      <Text style={{ margin: "0 0 16px" }}>
        Your <strong>{planName}</strong> investment has reached maturity. Your principal of{" "}
        <strong>${amountUsd.toLocaleString()}</strong> has been returned to your available balance, and your total
        profit of <strong>${accruedProfit.toLocaleString()}</strong> remains in your profit balance.
      </Text>
      <Button
        href={`${getAppUrl()}/dashboard/investments`}
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
        View your investments
      </Button>
    </EmailLayout>
  );
}

export default function InvestmentCompletedEmailPreview() {
  return <InvestmentCompletedEmail firstName="Jordan" planName="Growth" amountUsd={10_000} accruedProfit={1_825} />;
}
