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
  email: process.env.SENDGRID_FROM_EMAIL || "natasha@xclsv.shop",
  name: process.env.SENDGRID_FROM_NAME || "Natasha from Xclsv",
};

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
    personalizations: [
      {
        to,
        subject,
      },
    ],
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

// Helper function for common email templates
export async function sendWelcomeEmail(
  sellerEmail: string,
  sellerName: string,
  shopName: string
): Promise<{ success: boolean; error?: string }> {
  const { renderToString } = await import("react-dom/server");
  const { WelcomeEmail } = await import("../src/components/email-templates");

  const emailHtml = renderToString(WelcomeEmail({ sellerName, shopName }));

  return sendEmail({
    to: [{ email: sellerEmail, name: sellerName }],
    subject: "Natasha from Xclsv: Your new Online Store await",
    content: [
      {
        type: "text/html",
        value: emailHtml,
      },
    ],
  });
}

export async function sendOrderConfirmation(
  customerEmail: string,
  customerName: string,
  orderId: string,
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>,
  totalAmount: number,
  currency: string = "USD",
  shippingAddress: string
): Promise<{ success: boolean; error?: string }> {
  const { renderToString } = await import("react-dom/server");
  const { OrderConfirmationEmail } = await import(
    "../src/components/email-templates"
  );

  const emailHtml = renderToString(
    OrderConfirmationEmail({
      customerName,
      orderId,
      items,
      totalAmount,
      currency,
      orderDate: new Date().toLocaleDateString(),
      shippingAddress,
    })
  );

  return sendEmail({
    to: [{ email: customerEmail, name: customerName }],
    subject: `Natasha from Xclsv: Order Confirmation #${orderId}`,
    content: [
      {
        type: "text/html",
        value: emailHtml,
      },
    ],
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
    console.error("PASSWORD_RESET_URL environment variable is not set");
    throw new Error("PASSWORD_RESET_URL environment variable is not set");
  }

  const resetUrl = `${process.env.PASSWORD_RESET_URL}/reset-password?token=${resetToken}`;

  const { renderToString } = await import("react-dom/server");
  const { PasswordResetEmail } = await import(
    "../src/components/email-templates"
  );

  const emailHtml = renderToString(
    PasswordResetEmail({
      name,
      resetUrl,
      expiresIn,
    })
  );

  return sendEmail({
    to: [{ email, name }],
    subject: "Natasha from Xclsv: Password Reset Request",
    content: [
      {
        type: "text/html",
        value: emailHtml,
      },
    ],
  });
}
