export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

export function getEmailFromAddress(): string {
  return process.env.EMAIL_FROM ?? "Salon AI <onboarding@resend.dev>";
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ success: boolean; error?: string; demoMode: boolean }> {
  if (!isEmailConfigured()) {
    console.log("[Email Demo Mode]", {
      to: options.to,
      subject: options.subject,
      text: options.text ?? stripHtml(options.html),
    });
    return { success: true, demoMode: true };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getEmailFromAddress(),
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[Email Resend Error]", err);
      return { success: false, error: err, demoMode: false };
    }

    return { success: true, demoMode: false };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[Email Error]", msg);
    return { success: false, error: msg, demoMode: false };
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function buildPasswordResetEmail(options: {
  recipientName: string;
  salonName: string;
  resetUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `Reset your ${options.salonName} password`;
  const text = `Hi ${options.recipientName},\n\nWe received a request to reset your password for ${options.salonName} on Salon AI.\n\nReset your password: ${options.resetUrl}\n\nThis link expires in 1 hour. If you did not request this, you can ignore this email.\n\n— Salon AI`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; color: #1c1917;">
      <p style="font-size: 16px;">Hi ${escapeHtml(options.recipientName)},</p>
      <p style="font-size: 15px; line-height: 1.6; color: #57534e;">
        We received a request to reset your password for <strong>${escapeHtml(options.salonName)}</strong> on Salon AI.
      </p>
      <p style="margin: 28px 0;">
        <a href="${options.resetUrl}" style="display: inline-block; background: linear-gradient(90deg, #6d28d9, #8b5cf6); color: #fff; text-decoration: none; font-weight: 600; padding: 12px 24px; border-radius: 12px;">
          Reset password
        </a>
      </p>
      <p style="font-size: 13px; line-height: 1.6; color: #78716c;">
        This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.
      </p>
      <p style="font-size: 12px; color: #a8a29e; margin-top: 32px;">— Salon AI</p>
    </div>
  `.trim();

  return { subject, html, text };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
