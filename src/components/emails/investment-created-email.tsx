import { Button, Text } from "@react-email/components";
import { EmailLayout, EMAIL_COLORS } from "./email-layout";
import { getAppUrl } from "./app-url";

export function InvestmentCreatedEmail({
  firstName,
  planName,
  amountUsd,
  maturityDate,
}: {
  firstName: string;
  planName: string;
  amountUsd: number;
  maturityDate: string;
}) {
  return (
    <EmailLayout previewText={`Your investment in ${planName} is active`} heading="Investment confirmed" greetingName={firstName}>
      <Text style={{ margin: "0 0 16px" }}>
        Your investment of <strong>${amountUsd.toLocaleString()}</strong> in the <strong>{planName}</strong> plan is
        now active and earning weekly returns. It matures on <strong>{maturityDate}</strong>.
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

export default function InvestmentCreatedEmailPreview() {
  return <InvestmentCreatedEmail firstName="Jordan" planName="Growth" amountUsd={10_000} maturityDate="Aug 10, 2027" />;
}
