import { Text } from "@react-email/components";
import { EmailLayout } from "./email-layout";

export function AdminBroadcastEmail({ subject, body }: { subject: string; body: string }) {
  return (
    <EmailLayout previewText={subject} heading={subject} isBroadcast>
      <Text style={{ margin: 0, whiteSpace: "pre-wrap" }}>{body}</Text>
    </EmailLayout>
  );
}

export default function AdminBroadcastEmailPreview() {
  return (
    <AdminBroadcastEmail
      subject="New property added to the Growth plan"
      body="We've just added a new serviced-apartment property to the portfolio backing the Growth plan. No action needed on your end — just wanted to keep you in the loop."
    />
  );
}
