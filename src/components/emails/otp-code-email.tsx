import { Text } from "@react-email/components";
import { EmailLayout, EMAIL_COLORS } from "./email-layout";

export type OtpPurpose = "signup_verify" | "login_2fa" | "password_reset" | "admin_password_reset";

const COPY: Record<OtpPurpose, { heading: string; intro: string }> = {
  signup_verify: {
    heading: "Verify your email",
    intro: "Enter this code to finish creating your Keystone REIT account.",
  },
  login_2fa: {
    heading: "Your sign-in code",
    intro: "Enter this code to complete signing in to Keystone REIT.",
  },
  password_reset: {
    heading: "Reset your password",
    intro: "Enter this code to reset your Keystone REIT password.",
  },
  admin_password_reset: {
    heading: "Reset your admin password",
    intro: "Enter this code to reset your Keystone REIT admin password.",
  },
};

export function OtpCodeEmail({
  code,
  purpose,
  expiresInMinutes,
  firstName,
}: {
  code: string;
  purpose: OtpPurpose;
  expiresInMinutes: number;
  firstName?: string;
}) {
  const { heading, intro } = COPY[purpose];
  return (
    <EmailLayout previewText={`Your Keystone REIT code is ${code}`} heading={heading} greetingName={firstName}>
      <Text style={{ margin: "0 0 16px" }}>{intro}</Text>
      <Text
        style={{
          fontFamily: "monospace",
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: 8,
          textAlign: "center",
          backgroundColor: EMAIL_COLORS.muted,
          borderRadius: 8,
          padding: "16px 0",
          margin: "0 0 16px",
          color: EMAIL_COLORS.foreground,
        }}
      >
        {code}
      </Text>
      <Text style={{ margin: 0, color: EMAIL_COLORS.mutedForeground, fontSize: 13 }}>
        This code expires in {expiresInMinutes} minutes. If you didn&apos;t request this, you can safely ignore this
        email.
      </Text>
    </EmailLayout>
  );
}

/** Sample props for the react-email preview server (`npx react-email dev`). */
export default function OtpCodeEmailPreview() {
  return <OtpCodeEmail code="482913" purpose="login_2fa" expiresInMinutes={10} firstName="Jordan" />;
}
