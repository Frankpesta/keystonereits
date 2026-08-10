"use node";

import { v } from "convex/values";
import { render } from "@react-email/render";
import { Resend } from "resend";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { ActionCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { ReactElement } from "react";

import { OtpCodeEmail } from "../src/components/emails/otp-code-email";
import { WelcomeEmail } from "../src/components/emails/welcome-email";
import { KycStatusEmail } from "../src/components/emails/kyc-status-email";
import { DepositReceivedEmail } from "../src/components/emails/deposit-received-email";
import { DepositCreditedEmail } from "../src/components/emails/deposit-credited-email";
import { InvestmentCreatedEmail } from "../src/components/emails/investment-created-email";
import { InvestmentCompletedEmail } from "../src/components/emails/investment-completed-email";
import { WithdrawalStatusEmail } from "../src/components/emails/withdrawal-status-email";
import { SupportTicketReplyEmail, supportTicketReplyUrl } from "../src/components/emails/support-ticket-reply-email";
import { AdminBroadcastEmail } from "../src/components/emails/admin-broadcast-email";
import { SecurityAlertEmail } from "../src/components/emails/security-alert-email";

/**
 * Every "event → email" internal action below renders its react-email
 * template and calls this. Without RESEND_API_KEY set (see
 * `npx convex env set RESEND_API_KEY ...`) it falls back to the same
 * console-log dev stub Phase 3 shipped with, so local dev/tests never need a
 * real key — but still writes a real `emailLog` row either way, matching the
 * Phase 7 spec's "regardless of success/failure" requirement.
 */
async function sendEmail(
  ctx: ActionCtx,
  args: { to: string; subject: string; react: ReactElement; userId?: Id<"users">; campaignId?: string }
) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Plain text (not the HTML) so OTP codes and other content stay
    // grep-able via `npx convex logs` for manual QA, same as the Phase 3
    // stub this replaces.
    const text = await render(args.react, { plainText: true });
    console.log(`[DEV EMAIL STUB] To: ${args.to} | Subject: ${args.subject}\n${text}`);
    await ctx.runMutation(internal.emails.logEmail, {
      recipientEmail: args.to,
      recipientUserId: args.userId,
      subject: args.subject,
      campaignId: args.campaignId,
      status: "sent",
    });
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const from = process.env.RESEND_FROM_ADDRESS ?? "Keystone REIT <onboarding@resend.dev>";
    const html = await render(args.react);
    const result = await resend.emails.send({ from, to: args.to, subject: args.subject, html });
    if (result.error) throw new Error(result.error.message);
    await ctx.runMutation(internal.emails.logEmail, {
      recipientEmail: args.to,
      recipientUserId: args.userId,
      subject: args.subject,
      campaignId: args.campaignId,
      status: "sent",
    });
  } catch (err) {
    console.error(`[EMAIL SEND FAILED] To: ${args.to} | Subject: ${args.subject}`, err);
    await ctx.runMutation(internal.emails.logEmail, {
      recipientEmail: args.to,
      recipientUserId: args.userId,
      subject: args.subject,
      campaignId: args.campaignId,
      status: "failed",
    });
  }
}

const OTP_PURPOSE = v.union(
  v.literal("signup_verify"),
  v.literal("login_2fa"),
  v.literal("password_reset"),
  v.literal("admin_password_reset")
);

export const sendOtpEmail = internalAction({
  args: { to: v.string(), code: v.string(), purpose: OTP_PURPOSE, expiresInMinutes: v.number(), userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    await sendEmail(ctx, {
      to: args.to,
      subject: "Your Keystone REIT verification code",
      react: <OtpCodeEmail code={args.code} purpose={args.purpose} expiresInMinutes={args.expiresInMinutes} />,
      userId: args.userId,
    });
  },
});

export const sendWelcomeEmail = internalAction({
  args: { to: v.string(), firstName: v.string(), userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    await sendEmail(ctx, {
      to: args.to,
      subject: "Welcome to Keystone REIT",
      react: <WelcomeEmail firstName={args.firstName} />,
      userId: args.userId,
    });
  },
});

const KYC_STATUS = v.union(v.literal("approved"), v.literal("rejected"), v.literal("info_required"));

export const sendKycStatusEmail = internalAction({
  args: { to: v.string(), firstName: v.string(), status: KYC_STATUS, note: v.optional(v.string()), userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const subjects = { approved: "You're verified!", rejected: "KYC application rejected", info_required: "More information needed" };
    await sendEmail(ctx, {
      to: args.to,
      subject: subjects[args.status],
      react: <KycStatusEmail firstName={args.firstName} status={args.status} note={args.note} />,
      userId: args.userId,
    });
  },
});

export const sendDepositReceivedEmail = internalAction({
  args: { to: v.string(), firstName: v.string(), amountUsd: v.number(), method: v.union(v.literal("crypto"), v.literal("fiat")), userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    await sendEmail(ctx, {
      to: args.to,
      subject: "Deposit received",
      react: <DepositReceivedEmail firstName={args.firstName} amountUsd={args.amountUsd} method={args.method} />,
      userId: args.userId,
    });
  },
});

export const sendDepositCreditedEmail = internalAction({
  args: { to: v.string(), firstName: v.string(), amountUsd: v.number(), userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    await sendEmail(ctx, {
      to: args.to,
      subject: "Deposit credited",
      react: <DepositCreditedEmail firstName={args.firstName} amountUsd={args.amountUsd} />,
      userId: args.userId,
    });
  },
});

export const sendInvestmentCreatedEmail = internalAction({
  args: { to: v.string(), firstName: v.string(), planName: v.string(), amountUsd: v.number(), maturityDate: v.string(), userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    await sendEmail(ctx, {
      to: args.to,
      subject: "Investment confirmed",
      react: (
        <InvestmentCreatedEmail
          firstName={args.firstName}
          planName={args.planName}
          amountUsd={args.amountUsd}
          maturityDate={args.maturityDate}
        />
      ),
      userId: args.userId,
    });
  },
});

export const sendInvestmentCompletedEmail = internalAction({
  args: { to: v.string(), firstName: v.string(), planName: v.string(), amountUsd: v.number(), accruedProfit: v.number(), userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    await sendEmail(ctx, {
      to: args.to,
      subject: "Investment matured",
      react: (
        <InvestmentCompletedEmail
          firstName={args.firstName}
          planName={args.planName}
          amountUsd={args.amountUsd}
          accruedProfit={args.accruedProfit}
        />
      ),
      userId: args.userId,
    });
  },
});

const WITHDRAWAL_STATUS = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("processing"),
  v.literal("completed"),
  v.literal("rejected"),
  v.literal("failed")
);

export const sendWithdrawalStatusEmail = internalAction({
  args: { to: v.string(), firstName: v.string(), amountUsd: v.number(), status: WITHDRAWAL_STATUS, reason: v.optional(v.string()), userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const subjects = {
      pending: "Withdrawal requested",
      approved: "Withdrawal approved",
      processing: "Withdrawal processing",
      completed: "Withdrawal completed",
      rejected: "Withdrawal rejected",
      failed: "Withdrawal failed",
    };
    await sendEmail(ctx, {
      to: args.to,
      subject: subjects[args.status],
      react: <WithdrawalStatusEmail firstName={args.firstName} amountUsd={args.amountUsd} status={args.status} reason={args.reason} />,
      userId: args.userId,
    });
  },
});

export const sendSupportTicketReplyEmail = internalAction({
  args: {
    to: v.string(),
    recipientName: v.string(),
    ticketSubject: v.string(),
    messageBody: v.string(),
    ticketId: v.string(),
    isAdminRecipient: v.boolean(),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    await sendEmail(ctx, {
      to: args.to,
      subject: `New reply: ${args.ticketSubject}`,
      react: (
        <SupportTicketReplyEmail
          recipientName={args.recipientName}
          ticketSubject={args.ticketSubject}
          messageBody={args.messageBody}
          replyUrl={supportTicketReplyUrl(args.ticketId, args.isAdminRecipient)}
        />
      ),
      userId: args.userId,
    });
  },
});

export const sendAdminBroadcastEmail = internalAction({
  args: { to: v.string(), subject: v.string(), body: v.string(), userId: v.optional(v.id("users")), campaignId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await sendEmail(ctx, {
      to: args.to,
      subject: args.subject,
      react: <AdminBroadcastEmail subject={args.subject} body={args.body} />,
      userId: args.userId,
      campaignId: args.campaignId,
    });
  },
});

const SECURITY_EVENT = v.union(v.literal("new_login"), v.literal("password_changed"));

export const sendSecurityAlertEmail = internalAction({
  args: { to: v.string(), firstName: v.string(), eventType: SECURITY_EVENT, when: v.string(), userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const subjects = { new_login: "New sign-in to your account", password_changed: "Your password was changed" };
    await sendEmail(ctx, {
      to: args.to,
      subject: subjects[args.eventType],
      react: <SecurityAlertEmail firstName={args.firstName} eventType={args.eventType} when={args.when} />,
      userId: args.userId,
    });
  },
});
