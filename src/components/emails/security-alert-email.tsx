import { Text } from "@react-email/components";
import { EmailLayout, EMAIL_COLORS } from "./email-layout";

export type SecurityEventType = "new_login" | "password_changed";

const COPY: Record<SecurityEventType, { heading: string; body: string }> = {
  new_login: {
    heading: "New sign-in to your account",
    body: "We noticed a new sign-in to your Keystone REIT account.",
  },
  password_changed: {
    heading: "Your password was changed",
    body: "Your Keystone REIT password was just changed.",
  },
};

export function SecurityAlertEmail({ firstName, eventType, when }: { firstName: string; eventType: SecurityEventType; when: string }) {
  const { heading, body } = COPY[eventType];
  return (
    <EmailLayout previewText={heading} heading={heading} greetingName={firstName}>
      <Text style={{ margin: "0 0 16px" }}>
        {body} ({when})
      </Text>
      <Text style={{ margin: 0, color: EMAIL_COLORS.mutedForeground, fontSize: 13 }}>
        If this wasn&apos;t you, reset your password immediately and contact support.
      </Text>
    </EmailLayout>
  );
}

export default function SecurityAlertEmailPreview() {
  return <SecurityAlertEmail firstName="Jordan" eventType="new_login" when="Aug 10, 2026, 2:14 PM UTC" />;
}
