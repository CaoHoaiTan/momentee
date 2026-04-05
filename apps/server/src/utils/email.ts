import { Resend } from 'resend';
import { env } from '../config/env.js';

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  if (!resendClient) {
    resendClient = new Resend(env.RESEND_API_KEY);
  }
  return resendClient;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const resend = getResend();

  if (!resend) {
    // Dev mode: log email content
    console.log(`[DEV EMAIL] To: ${options.to}`);
    console.log(`[DEV EMAIL] Subject: ${options.subject}`);
    console.log(`[DEV EMAIL] Body preview: ${options.html.slice(0, 200)}...`);
    return true;
  }

  try {
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return true;
  } catch (err) {
    console.error('Failed to send email:', err);
    return false;
  }
}

export function verificationEmailHtml(verifyUrl: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #111; font-size: 24px; margin: 0;">Verify your email</h1>
        <p style="color: #666; font-size: 14px; margin-top: 8px;">Click the button below to verify your Momentee account.</p>
      </div>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${verifyUrl}" style="display: inline-block; background: #FF6B6B; color: white; padding: 14px 32px; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 16px;">
          Verify Email
        </a>
      </div>
      <p style="color: #999; font-size: 12px; text-align: center;">
        If you didn't create an account, you can safely ignore this email.<br/>
        This link expires in 24 hours.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #bbb; font-size: 11px; text-align: center;">Momentee — Every couple has a story.</p>
    </div>
  `;
}

export function passwordResetEmailHtml(resetUrl: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #111; font-size: 24px; margin: 0;">Reset your password</h1>
        <p style="color: #666; font-size: 14px; margin-top: 8px;">Click the button below to set a new password.</p>
      </div>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: #FF6B6B; color: white; padding: 14px 32px; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 16px;">
          Reset Password
        </a>
      </div>
      <p style="color: #999; font-size: 12px; text-align: center;">
        If you didn't request a password reset, you can safely ignore this email.<br/>
        This link expires in 1 hour.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #bbb; font-size: 11px; text-align: center;">Momentee — Every couple has a story.</p>
    </div>
  `;
}
