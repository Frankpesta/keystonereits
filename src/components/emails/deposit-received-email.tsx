import { Text } from "@react-email/components";
import { EmailLayout } from "./email-layout";

export function DepositReceivedEmail({
  firstName,
  amountUsd,
  method,
}: {
  firstName: string;
  amountUsd: number;
  method: "crypto" | "fiat";
}) {
  return (
    <EmailLayout previewText="We've received your deposit request" heading="Deposit received" greetingName={firstName}>
      <Text style={{ margin: 0 }}>
        We&apos;ve received your {method === "crypto" ? "crypto" : "fiat"} deposit request for{" "}
        <strong>${amountUsd.toLocaleString()}</strong>. It&apos;s pending manual verification —
        {method === "crypto"
          ? " this typically completes within minutes of your transaction confirming on-chain."
          : " our team will follow up on your support ticket with next steps."}
      </Text>
    </EmailLayout>
  );
}

export default function DepositReceivedEmailPreview() {
  return <DepositReceivedEmail firstName="Jordan" amountUsd={500} method="crypto" />;
}
