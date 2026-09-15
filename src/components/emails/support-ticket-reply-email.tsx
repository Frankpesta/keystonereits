import { Button, Text } from "@react-email/components";
import { EmailLayout, EMAIL_COLORS } from "./email-layout";
import { getAppUrl } from "./app-url";

export function SupportTicketReplyEmail({
  recipientName,
  ticketSubject,
  messageBody,
  replyUrl,
}: {
  recipientName: string;
  ticketSubject: string;
  messageBody: string;
  replyUrl: string;
}) {
  return (
    <EmailLayout previewText={`New reply on: ${ticketSubject}`} heading="New reply on your ticket" greetingName={recipientName}>
      <Text style={{ margin: "0 0 16px" }}>
        There&apos;s a new reply on your support ticket <strong>&ldquo;{ticketSubject}&rdquo;</strong>:
      </Text>
      <Text
        style={{
          margin: "0 0 16px",
          padding: 12,
          borderRadius: 6,
          backgroundColor: EMAIL_COLORS.muted,
          color: EMAIL_COLORS.foreground,
          fontSize: 13,
          whiteSpace: "pre-wrap",
        }}
      >
        {messageBody}
      </Text>
      <Button
        href={replyUrl}
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
        View ticket
      </Button>
    </EmailLayout>
  );
}

export function supportTicketReplyUrl(ticketId: string, isAdminRecipient: boolean): string {
  return `${getAppUrl()}/${isAdminRecipient ? "admin/support" : "dashboard/support"}/${ticketId}`;
}

export default function SupportTicketReplyEmailPreview() {
  return (
    <SupportTicketReplyEmail
      recipientName="Jordan"
      ticketSubject="Question about withdrawal timing"
      messageBody="Thanks for reaching out — TRC20 withdrawals typically complete within a few hours."
      replyUrl={supportTicketReplyUrl("sample-ticket-id", false)}
    />
  );
}
