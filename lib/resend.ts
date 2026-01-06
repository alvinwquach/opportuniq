import { Resend } from "resend";
import { render } from "@react-email/render";
import WelcomeEmail from "@/emails/WelcomeEmail";
import AbandonedOnboardingEmail from "@/emails/AbandonedOnboardingEmail";
import MagicLinkEmail from "@/emails/MagicLinkEmail";
import GroupInvitationEmail from "@/emails/GroupInvitationEmail";
import MemberApprovalEmail from "@/emails/MemberApprovalEmail";
import AlphaInviteEmail from "@/emails/AlphaInviteEmail";
import BetaInviteEmail from "@/emails/BetaInviteEmail";
import ReferralConvertedEmail from "@/emails/ReferralConvertedEmail";
import WaitlistConfirmationEmail from "@/emails/WaitlistConfirmationEmail";
import IssueCreatedEmail from "@/emails/IssueCreatedEmail";
import DecisionReadyEmail from "@/emails/DecisionReadyEmail";
import DecisionApprovedEmail from "@/emails/DecisionApprovedEmail";
import JohatsuInviteEmail from "@/emails/JohatsuInviteEmail";
import BetaLaunchWeekendEmail from "@/emails/BetaLaunchWeekendEmail";
import WaitlistLaunchEmail from "@/emails/WaitlistLaunchEmail";
import PublicLaunchEmail from "@/emails/PublicLaunchEmail";
import FeedbackRequestEmail from "@/emails/FeedbackRequestEmail";
import ReferralReminderEmail from "@/emails/ReferralReminderEmail";
import GroupUpdatedEmail from "@/emails/GroupUpdatedEmail";
import GroupDeletedEmail from "@/emails/GroupDeletedEmail";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

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
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/dashboard`,
      })
    );

    const { data, error } = await resend.emails.send({
      // from: "OpportunIQ <onboarding@opportuniq.app>",
      from: "OpportunIQ <onboarding@resend.dev>",
      to: [email],
      replyTo: "support@opportuniq.app",
      subject: "Welcome to OpportunIQ! 🎉",
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send welcome email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending welcome email:", error);
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
        onboardingUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/onboarding`,
      })
    );

    const { data, error } = await resend.emails.send({
      // from: "OpportunIQ <onboarding@opportuniq.app>",
      from: "OpportunIQ <onboarding@resend.dev>",
      to: [email],
      replyTo: "support@opportuniq.app",
      subject: `${firstName}, you're almost there! Complete your OpportunIQ setup (30 seconds)`,
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send abandoned onboarding email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending abandoned onboarding email:", error);
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
      // from: "OpportunIQ <auth@opportuniq.app>",
      from: "OpportunIQ <onboarding@resend.dev>",
      to: [email],
      replyTo: "security@opportuniq.app",
      subject: "Your secure login link for OpportunIQ 🔐",
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send magic link email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending magic link email:", error);
    return { success: false, error };
  }
}

/**
 * Send group invitation email
 */
export async function sendGroupInvitationEmail({
  email,
  inviterName,
  groupName,
  inviteUrl,
  role,
  message,
}: {
  email: string;
  inviterName: string;
  groupName: string;
  inviteUrl: string;
  role?: string;
  message?: string;
}) {
  try {
    const emailHtml = await render(
      GroupInvitationEmail({
        inviterName,
        groupName,
        inviteUrl,
        role,
        message,
      })
    );

    const { data, error } = await resend.emails.send({
      // from: "OpportunIQ <invites@opportuniq.app>",
      from: "OpportunIQ <onboarding@resend.dev>",
      to: [email],
      replyTo: "support@opportuniq.app",
      subject: `${inviterName} invited you to join "${groupName}" on OpportunIQ`,
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send group invitation email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending group invitation email:", error);
    return { success: false, error };
  }
}

/**
 * Send member approval email when user is approved to join a group
 */
export async function sendMemberApprovalEmail({
  email,
  memberName,
  groupName,
  groupUrl,
}: {
  email: string;
  memberName: string;
  groupName: string;
  groupUrl: string;
}) {
  try {
    const firstName = memberName?.split(' ')[0] || "there";

    const emailHtml = await render(
      MemberApprovalEmail({
        memberName,
        groupName,
        groupUrl,
        approvalDate: new Date().toISOString(),
      })
    );

    const { data, error } = await resend.emails.send({
      // from: "OpportunIQ <notifications@opportuniq.app>",
      from: "OpportunIQ <onboarding@resend.dev>",
      to: [email],
      replyTo: "support@opportuniq.app",
      subject: `${firstName}, you've been approved to join "${groupName}"! 🎉`,
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send member approval email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending member approval email:", error);
    return { success: false, error };
  }
}

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
      // from: "OpportunIQ <invites@opportuniq.app>",
      from: "OpportunIQ <onboarding@resend.dev>",
      to: [email],
      replyTo: ["alvinwquach@gmail.com", "binarydecisions1111@gmail.com"],
      subject: "Kevin and Alvin invite you to join OpportunIQ Alpha",
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send alpha invite email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending alpha invite email:", error);
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
      // from: "OpportunIQ <invites@opportuniq.app>",
      from: "OpportunIQ <onboarding@resend.dev>",
      to: [email],
      replyTo: ["alvinwquach@gmail.com", "binarydecisions1111@gmail.com"],
      subject: "Kevin and Alvin invite you to join OpportunIQ Beta",
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send beta invite email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending beta invite email:", error);
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
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/dashboard`,
      })
    );

    const { data, error } = await resend.emails.send({
      // from: "OpportunIQ <notifications@opportuniq.app>",
      from: "OpportunIQ <onboarding@resend.dev>",
      to: [email],
      replyTo: "support@opportuniq.app",
      subject: `🎉 ${refereeName} joined using your referral!`,
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send referral converted email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending referral converted email:", error);
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
      ? `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}?ref=${referralCode}`
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
      // from: "OpportunIQ <waitlist@opportuniq.app>",
      from: "OpportunIQ <onboarding@resend.dev>",
      to: [email],
      replyTo: "support@opportuniq.app",
      subject: "You're on the OpportunIQ waitlist! 🎯",
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send waitlist confirmation email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending waitlist confirmation email:", error);
    return { success: false, error };
  }
}

/**
 * Send issue created email when a new issue is reported in a group
 */
export async function sendIssueCreatedEmail({
  email,
  memberName,
  issueTitle,
  issueDescription,
  groupName,
  issueUrl,
  createdBy,
  category,
}: {
  email: string;
  memberName: string;
  issueTitle: string;
  issueDescription?: string;
  groupName: string;
  issueUrl: string;
  createdBy: string;
  category?: string;
}) {
  try {
    const emailHtml = await render(
      IssueCreatedEmail({
        memberName,
        issueTitle,
        issueDescription,
        groupName,
        issueUrl,
        createdBy,
        category,
      })
    );

    const { data, error } = await resend.emails.send({
      // from: "OpportunIQ <notifications@opportuniq.app>",
      from: "OpportunIQ <onboarding@resend.dev>",
      to: [email],
      replyTo: "support@opportuniq.app",
      subject: `New issue in ${groupName}: ${issueTitle}`,
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send issue created email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending issue created email:", error);
    return { success: false, error };
  }
}

/**
 * Send decision ready email when a decision is ready for voting
 */
export async function sendDecisionReadyEmail({
  email,
  memberName,
  issueTitle,
  groupName,
  decisionUrl,
  options,
  votingDeadline,
}: {
  email: string;
  memberName: string;
  issueTitle: string;
  groupName: string;
  decisionUrl: string;
  options: Array<{ title: string; votes?: number }>;
  votingDeadline?: string;
}) {
  try {
    const emailHtml = await render(
      DecisionReadyEmail({
        memberName,
        issueTitle,
        groupName,
        decisionUrl,
        options,
        votingDeadline,
      })
    );

    const { data, error } = await resend.emails.send({
      // from: "OpportunIQ <notifications@opportuniq.app>",
      from: "OpportunIQ <onboarding@resend.dev>",
      to: [email],
      replyTo: "support@opportuniq.app",
      subject: `Vote needed: ${issueTitle}`,
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send decision ready email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending decision ready email:", error);
    return { success: false, error };
  }
}

/**
 * Send decision approved email when a group decision is finalized
 */
export async function sendDecisionApprovedEmail({
  email,
  memberName,
  issueTitle,
  approvedOption,
  groupName,
  decisionUrl,
  totalVotes,
  winningPercentage,
  nextSteps,
}: {
  email: string;
  memberName: string;
  issueTitle: string;
  approvedOption: string;
  groupName: string;
  decisionUrl: string;
  totalVotes: number;
  winningPercentage: number;
  nextSteps?: string[];
}) {
  try {
    const emailHtml = await render(
      DecisionApprovedEmail({
        memberName,
        issueTitle,
        approvedOption,
        groupName,
        decisionUrl,
        totalVotes,
        winningPercentage,
        nextSteps,
      })
    );

    const { data, error } = await resend.emails.send({
      // from: "OpportunIQ <notifications@opportuniq.app>",
      from: "OpportunIQ <onboarding@resend.dev>",
      to: [email],
      replyTo: "support@opportuniq.app",
      subject: `Decision made: ${approvedOption}`,
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send decision approved email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending decision approved email:", error);
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
      from: "OpportunIQ <invites@opportuniq.app>",
      to: [email],
      replyTo: ["alvinwquach@gmail.com", "binarydecisions1111@gmail.com"],
      subject: "You've been selected for Johatsu - OpportunIQ's founding circle",
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send Johatsu invite email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending Johatsu invite email:", error);
    return { success: false, error };
  }
}

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
      from: "OpportunIQ <hello@opportuniq.app>",
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
      from: "OpportunIQ <hello@opportuniq.app>",
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
      from: "OpportunIQ <hello@opportuniq.app>",
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
 * Send feedback request email - asks users for their feedback
 */
export async function sendFeedbackRequestEmail({
  email,
  name,
  feedbackUrl,
  dashboardUrl,
}: {
  email: string;
  name?: string;
  feedbackUrl?: string;
  dashboardUrl?: string;
}) {
  try {
    const emailHtml = await render(
      FeedbackRequestEmail({
        name,
        feedbackUrl,
        dashboardUrl,
      })
    );

    const { data, error } = await resend.emails.send({
      from: "OpportunIQ <hello@opportuniq.app>",
      to: [email],
      replyTo: "feedback@opportuniq.app",
      subject: "Quick question - how are we doing?",
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send feedback request email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending feedback request email:", error);
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
      from: "OpportunIQ <hello@opportuniq.app>",
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

/**
 * Send group updated email when group settings are changed
 */
export async function sendGroupUpdatedEmail({
  email,
  memberName,
  groupName,
  updatedBy,
  changes,
  groupUrl,
}: {
  email: string;
  memberName: string;
  groupName: string;
  updatedBy: string;
  changes: string[];
  groupUrl: string;
}) {
  try {
    const emailHtml = await render(
      GroupUpdatedEmail({
        memberName,
        groupName,
        updatedBy,
        changes,
        groupUrl,
      })
    );

    const { data, error } = await resend.emails.send({
      from: "OpportunIQ <onboarding@resend.dev>",
      to: [email],
      replyTo: "support@opportuniq.app",
      subject: `"${groupName}" settings were updated`,
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send group updated email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending group updated email:", error);
    return { success: false, error };
  }
}

/**
 * Send group deleted email when a group is removed
 */
export async function sendGroupDeletedEmail({
  email,
  memberName,
  groupName,
  deletedBy,
  dashboardUrl,
}: {
  email: string;
  memberName: string;
  groupName: string;
  deletedBy: string;
  dashboardUrl: string;
}) {
  try {
    const emailHtml = await render(
      GroupDeletedEmail({
        memberName,
        groupName,
        deletedBy,
        dashboardUrl,
      })
    );

    const { data, error } = await resend.emails.send({
      from: "OpportunIQ <onboarding@resend.dev>",
      to: [email],
      replyTo: "support@opportuniq.app",
      subject: `The group "${groupName}" has been deleted`,
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send group deleted email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending group deleted email:", error);
    return { success: false, error };
  }
}
