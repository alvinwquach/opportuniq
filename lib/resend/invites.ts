import { render } from "@react-email/render";
import AlphaInviteEmail from "@/emails/AlphaInviteEmail";
import BetaInviteEmail from "@/emails/BetaInviteEmail";
import JohatsuInviteEmail from "@/emails/JohatsuInviteEmail";
import WaitlistConfirmationEmail from "@/emails/WaitlistConfirmationEmail";
import ReferralConvertedEmail from "@/emails/ReferralConvertedEmail";
import { resend, EMAIL_FROM, APP_URL } from "./client";

/**
 * Send alpha invite email when admin invites a user
 */
export async function sendAlphaInviteEmail({
  email,
  inviteUrl,
  expiresIn,
}: {
  email: string;
  inviteUrl: string;
  expiresIn?: string;
}) {
  try {
    const emailHtml = await render(
      AlphaInviteEmail({
        inviteUrl,
        expiresIn,
      })
    );

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM.invites,
      to: [email],
      replyTo: ["alvinwquach@gmail.com", "binarydecisions1111@gmail.com"],
      subject: "Kevin and Alvin invite you to join OpportunIQ Alpha",
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
 * Send beta invite email when an alpha member refers someone
 */
export async function sendBetaInviteEmail({
  email,
  inviteUrl,
  referrerName,
  expiresIn,
}: {
  email: string;
  inviteUrl: string;
  referrerName?: string;
  expiresIn?: string;
}) {
  try {
    const emailHtml = await render(
      BetaInviteEmail({
        inviteUrl,
        referrerName,
        expiresIn,
      })
    );

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM.invites,
      to: [email],
      replyTo: ["alvinwquach@gmail.com", "binarydecisions1111@gmail.com"],
      subject: "Kevin and Alvin invite you to join OpportunIQ Beta",
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
 * Send Johatsu invite email - most exclusive tier (10 founding members only)
 */
export async function sendJohatsuInviteEmail({
  email,
  inviteUrl,
  expiresIn,
}: {
  email: string;
  inviteUrl: string;
  expiresIn?: string;
}) {
  try {
    const emailHtml = await render(
      JohatsuInviteEmail({
        inviteUrl,
        expiresIn,
      })
    );

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM.invites,
      to: [email],
      replyTo: ["alvinwquach@gmail.com", "binarydecisions1111@gmail.com"],
      subject: "You've been selected for Johatsu - OpportunIQ's founding circle",
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
 * Send waitlist confirmation email when someone signs up for the waitlist
 */
export async function sendWaitlistConfirmationEmail({
  email,
  name,
  position,
  referralCode,
}: {
  email: string;
  name?: string;
  position?: number;
  referralCode?: string;
}) {
  try {
    const referralUrl = referralCode
      ? `${APP_URL}?ref=${referralCode}`
      : undefined;

    const emailHtml = await render(
      WaitlistConfirmationEmail({
        name,
        position,
        referralCode,
        referralUrl,
      })
    );

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM.hello,
      to: [email],
      replyTo: "support@opportuniq.app",
      subject: "You're on the OpportunIQ waitlist!",
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
 * Send referral converted email when someone joins using a referral code
 */
export async function sendReferralConvertedEmail({
  email,
  referrerName,
  refereeName,
  referralCount,
}: {
  email: string;
  referrerName: string;
  refereeName: string;
  referralCount: number;
}) {
  try {
    const emailHtml = await render(
      ReferralConvertedEmail({
        referrerName,
        refereeName,
        referralCount,
        dashboardUrl: `${APP_URL}/dashboard`,
      })
    );

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM.notifications,
      to: [email],
      replyTo: "support@opportuniq.app",
      subject: `${refereeName} joined using your referral!`,
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
