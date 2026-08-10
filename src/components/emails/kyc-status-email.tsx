import { Button, Text } from "@react-email/components";
import { EmailLayout, EMAIL_COLORS } from "./email-layout";
import { getAppUrl } from "./app-url";

export type KycStatus = "approved" | "rejected" | "info_required";

const COPY: Record<KycStatus, { heading: string; intro: string }> = {
  approved: {
    heading: "Identity verified",
    intro: "Your identity verification was approved. You now have full access to deposits, investments, and withdrawals.",
  },
  rejected: {
    heading: "Verification rejected",
    intro: "Your identity verification application was rejected.",
  },
  info_required: {
    heading: "More information needed",
    intro: "We need a bit more information to complete your identity verification.",
  },
};

export function KycStatusEmail({ firstName, status, note }: { firstName: string; status: KycStatus; note?: string }) {
  const { heading, intro } = COPY[status];
  return (
    <EmailLayout previewText={heading} heading={heading}>
      <Text style={{ margin: "0 0 8px" }}>Hi {firstName},</Text>
      <Text style={{ margin: "0 0 16px" }}>{intro}</Text>
      {note && (
        <Text
          style={{
            margin: "0 0 16px",
            padding: 12,
            borderRadius: 6,
            backgroundColor: EMAIL_COLORS.muted,
            color: EMAIL_COLORS.foreground,
            fontSize: 13,
          }}
        >
          {note}
        </Text>
      )}
      <Button
        href={`${getAppUrl()}/dashboard/kyc`}
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
        {status === "approved" ? "Go to your dashboard" : "Review your application"}
      </Button>
    </EmailLayout>
  );
}

export default function KycStatusEmailPreview() {
  return <KycStatusEmail firstName="Jordan" status="info_required" note="Please upload a clearer photo of your ID." />;
}
