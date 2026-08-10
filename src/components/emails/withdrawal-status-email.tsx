import { Text } from "@react-email/components";
import { EmailLayout, EMAIL_COLORS } from "./email-layout";

export type WithdrawalEmailStatus = "pending" | "approved" | "processing" | "completed" | "rejected" | "failed";

const COPY: Record<WithdrawalEmailStatus, { heading: string; intro: (amount: string) => string }> = {
  pending: {
    heading: "Withdrawal requested",
    intro: (amount) => `We've received your withdrawal request for ${amount}. It's now pending review.`,
  },
  approved: {
    heading: "Withdrawal approved",
    intro: (amount) => `Your withdrawal request for ${amount} has been approved and is queued for processing.`,
  },
  processing: {
    heading: "Withdrawal processing",
    intro: (amount) => `Your withdrawal of ${amount} is now processing.`,
  },
  completed: {
    heading: "Withdrawal completed",
    intro: (amount) => `Your withdrawal of ${amount} has been sent to your provided wallet address.`,
  },
  rejected: {
    heading: "Withdrawal rejected",
    intro: (amount) => `Your withdrawal request for ${amount} was rejected.`,
  },
  failed: {
    heading: "Withdrawal failed",
    intro: (amount) => `Your withdrawal of ${amount} could not be completed.`,
  },
};

export function WithdrawalStatusEmail({
  firstName,
  amountUsd,
  status,
  reason,
}: {
  firstName: string;
  amountUsd: number;
  status: WithdrawalEmailStatus;
  reason?: string;
}) {
  const amount = `$${amountUsd.toLocaleString()}`;
  const { heading, intro } = COPY[status];
  return (
    <EmailLayout previewText={heading} heading={heading}>
      <Text style={{ margin: "0 0 8px" }}>Hi {firstName},</Text>
      <Text style={{ margin: reason ? "0 0 16px" : 0 }}>{intro(amount)}</Text>
      {reason && (
        <Text
          style={{
            margin: 0,
            padding: 12,
            borderRadius: 6,
            backgroundColor: EMAIL_COLORS.muted,
            color: EMAIL_COLORS.foreground,
            fontSize: 13,
          }}
        >
          {reason}
        </Text>
      )}
    </EmailLayout>
  );
}

export default function WithdrawalStatusEmailPreview() {
  return <WithdrawalStatusEmail firstName="Jordan" amountUsd={750} status="completed" />;
}
