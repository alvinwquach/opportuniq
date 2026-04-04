import { render } from "@react-email/render";
import WelcomeEmail from "@/emails/WelcomeEmail";
import AbandonedOnboardingEmail from "@/emails/AbandonedOnboardingEmail";
import MagicLinkEmail from "@/emails/MagicLinkEmail";
import { resend, EMAIL_FROM, APP_URL } from "./client";

/**
 * Send welcome email after user completes onboarding
 */
export async function sendWelcomeEmail({
  email,
  name,
  postalCode,
  searchRadius,
}: {
  email: string;
  name: string | null;
  postalCode: string;
  searchRadius: number;
}) {
  try {
    const emailHtml = await render(
      WelcomeEmail({
        name: name || "there",
        postalCode,
        searchRadius,
        dashboardUrl: `${APP_URL}/dashboard`,
      })
    );

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM.onboarding,
      to: [email],
      replyTo: "support@opportuniq.app",
      subject: "Welcome to OpportunIQ!",
      html: emailHtml,
    });

    if (error) {
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Send abandoned onboarding email 24 hours after signup
 */
export async function sendAbandonedOnboardingEmail({
  email,
  name,
}: {
  email: string;
  name: string | null;
}) {
  try {
    const firstName = name?.split(' ')[0] || "there";

    const emailHtml = await render(
      AbandonedOnboardingEmail({
        name: name || "there",
        onboardingUrl: `${APP_URL}/onboarding`,
      })
    );

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM.onboarding,
      to: [email],
      replyTo: "support@opportuniq.app",
      subject: `${firstName}, you're almost there! Complete your OpportunIQ setup (30 seconds)`,
      html: emailHtml,
    });

    if (error) {
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Send magic link email for passwordless login
 */
export async function sendMagicLinkEmail({
  email,
  magicLink,
  ipAddress,
  userAgent,
}: {
  email: string;
  magicLink: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    const emailHtml = await render(
      MagicLinkEmail({
        magicLink,
        ipAddress,
        userAgent,
      })
    );

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM.auth,
      to: [email],
      replyTo: "security@opportuniq.app",
      subject: "Your secure login link for OpportunIQ",
      html: emailHtml,
    });

    if (error) {
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}
