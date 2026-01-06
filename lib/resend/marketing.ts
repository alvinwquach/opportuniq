import { render } from "@react-email/render";
import BetaLaunchWeekendEmail from "@/emails/BetaLaunchWeekendEmail";
import WaitlistLaunchEmail from "@/emails/WaitlistLaunchEmail";
import PublicLaunchEmail from "@/emails/PublicLaunchEmail";
import ReferralReminderEmail from "@/emails/ReferralReminderEmail";
import { resend, EMAIL_FROM } from "./client";

/**
 * Send beta launch weekend email - announces live Q&A with founders
 */
export async function sendBetaLaunchWeekendEmail({
  email,
  name,
  dashboardUrl,
}: {
  email: string;
  name?: string;
  dashboardUrl?: string;
}) {
  try {
    const emailHtml = await render(
      BetaLaunchWeekendEmail({
        name,
        dashboardUrl,
      })
    );

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM.hello,
      to: [email],
      replyTo: "support@opportuniq.app",
      subject: "You're in! Live Q&A with the founders this weekend",
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send beta launch weekend email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending beta launch weekend email:", error);
    return { success: false, error };
  }
}

/**
 * Send waitlist launch email - notifies waitlist users that they can now join
 */
export async function sendWaitlistLaunchEmail({
  email,
  name,
  signupUrl,
  position,
}: {
  email: string;
  name?: string;
  signupUrl?: string;
  position?: number;
}) {
  try {
    const emailHtml = await render(
      WaitlistLaunchEmail({
        name,
        signupUrl,
        position,
      })
    );

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM.hello,
      to: [email],
      replyTo: "support@opportuniq.app",
      subject: "The wait is over - your spot is ready!",
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send waitlist launch email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending waitlist launch email:", error);
    return { success: false, error };
  }
}

/**
 * Send public launch email - announces that OpportunIQ is now public
 */
export async function sendPublicLaunchEmail({
  email,
  name,
  dashboardUrl,
  referralCode,
}: {
  email: string;
  name?: string;
  dashboardUrl?: string;
  referralCode?: string;
}) {
  try {
    const emailHtml = await render(
      PublicLaunchEmail({
        name,
        dashboardUrl,
        referralCode,
      })
    );

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM.hello,
      to: [email],
      replyTo: "support@opportuniq.app",
      subject: "We made it - OpportunIQ is now public!",
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send public launch email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending public launch email:", error);
    return { success: false, error };
  }
}

/**
 * Send referral reminder email - reminds users to invite friends
 */
export async function sendReferralReminderEmail({
  email,
  name,
  referralCode,
  referralCount,
  dashboardUrl,
}: {
  email: string;
  name?: string;
  referralCode: string;
  referralCount?: number;
  dashboardUrl?: string;
}) {
  try {
    const emailHtml = await render(
      ReferralReminderEmail({
        name,
        referralCode,
        referralCount,
        dashboardUrl,
      })
    );

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM.hello,
      to: [email],
      replyTo: "support@opportuniq.app",
      subject: "Know someone who'd love OpportunIQ?",
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send referral reminder email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending referral reminder email:", error);
    return { success: false, error };
  }
}
