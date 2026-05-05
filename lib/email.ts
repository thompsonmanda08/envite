interface EmailRecipient {
  email: string;
  name: string;
}

interface EmailContent {
  type: "text/plain" | "text/html";
  value: string;
}

interface SendEmailOptions {
  to: EmailRecipient[];
  subject: string;
  content: EmailContent[];
  from?: EmailRecipient;
  replyTo?: EmailRecipient;
}

const DEFAULT_FROM = {
  email: process.env.SENDGRID_FROM_EMAIL || "hello@e-nvite.com",
  name: process.env.SENDGRID_FROM_NAME || "e-nvite",
};

const APP_NAME = "e-nvite";

export async function sendEmail({
  to,
  subject,
  content,
  from = DEFAULT_FROM,
  replyTo = DEFAULT_FROM,
}: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.SENDGRID_API_KEY;

  if (!apiKey) {
    return { success: false, error: "SendGrid API key not configured" };
  }

  const payload = {
    personalizations: [{ to, subject }],
    content,
    from,
    reply_to: replyTo,
  };

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return { success: false, error: `SendGrid API error: ${errorData}` };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: `Network error: ${error}` };
  }
}

export async function sendWelcomeEmail(
  email: string,
  name: string,
): Promise<{ success: boolean; error?: string }> {
  const { renderToString } = await import("react-dom/server");
  const { WelcomeEmail } = await import("../src/components/email-templates");

  const emailHtml = renderToString(WelcomeEmail({ name }));

  return sendEmail({
    to: [{ email, name }],
    subject: `Welcome to ${APP_NAME}`,
    content: [{ type: "text/html", value: emailHtml }],
  });
}

export async function sendInvitationEmail({
  guestEmail,
  guestName,
  eventName,
  hostName,
  eventDate,
  inviteUrl,
}: {
  guestEmail: string;
  guestName: string;
  eventName: string;
  hostName: string;
  eventDate: string;
  inviteUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  const { renderToString } = await import("react-dom/server");
  const { InvitationEmail } = await import("../src/components/email-templates");

  const emailHtml = renderToString(
    InvitationEmail({ guestName, eventName, hostName, eventDate, inviteUrl }),
  );

  return sendEmail({
    to: [{ email: guestEmail, name: guestName }],
    subject: `${hostName} invited you to ${eventName}`,
    content: [{ type: "text/html", value: emailHtml }],
  });
}

export async function sendPasswordReset({
  email,
  name,
  resetToken,
  expiresIn = "15 minutes",
}: {
  name: string;
  email: string;
  resetToken: string;
  expiresIn?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!process.env.PASSWORD_RESET_URL) {
    throw new Error("PASSWORD_RESET_URL environment variable is not set");
  }

  const resetUrl = `${process.env.PASSWORD_RESET_URL}/reset-password?token=${resetToken}`;

  const { renderToString } = await import("react-dom/server");
  const { PasswordResetEmail } = await import(
    "../src/components/email-templates"
  );

  const emailHtml = renderToString(
    PasswordResetEmail({ name, resetUrl, expiresIn }),
  );

  return sendEmail({
    to: [{ email, name }],
    subject: `${APP_NAME}: Password reset request`,
    content: [{ type: "text/html", value: emailHtml }],
  });
}
