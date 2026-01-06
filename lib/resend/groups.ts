import { render } from "@react-email/render";
import GroupInvitationEmail from "@/emails/GroupInvitationEmail";
import MemberApprovalEmail from "@/emails/MemberApprovalEmail";
import GroupUpdatedEmail from "@/emails/GroupUpdatedEmail";
import GroupDeletedEmail from "@/emails/GroupDeletedEmail";
import GroupRoleChangedEmail from "@/emails/GroupRoleChangedEmail";
import GroupMemberRemovedEmail from "@/emails/GroupMemberRemovedEmail";
import InvitationSentConfirmationEmail from "@/emails/InvitationSentConfirmationEmail";
import InvitationRoleUpdatedEmail from "@/emails/InvitationRoleUpdatedEmail";
import InvitationRevokedEmail from "@/emails/InvitationRevokedEmail";
import InvitationRevokedConfirmationEmail from "@/emails/InvitationRevokedConfirmationEmail";
import { resend, EMAIL_FROM } from "./client";

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
      from: EMAIL_FROM.invites,
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
      from: EMAIL_FROM.notifications,
      to: [email],
      replyTo: "support@opportuniq.app",
      subject: `${firstName}, you've been approved to join "${groupName}"!`,
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
      from: EMAIL_FROM.notifications,
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
      from: EMAIL_FROM.notifications,
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

/**
 * Send role changed email when a member's role is updated
 */
export async function sendGroupRoleChangedEmail({
  email,
  memberName,
  groupName,
  changedBy,
  oldRole,
  newRole,
  groupUrl,
}: {
  email: string;
  memberName: string;
  groupName: string;
  changedBy: string;
  oldRole: string;
  newRole: string;
  groupUrl: string;
}) {
  try {
    const emailHtml = await render(
      GroupRoleChangedEmail({
        memberName,
        groupName,
        changedBy,
        oldRole,
        newRole,
        groupUrl,
      })
    );

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM.notifications,
      to: [email],
      replyTo: "support@opportuniq.app",
      subject: `Your role in "${groupName}" has been updated`,
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send role changed email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending role changed email:", error);
    return { success: false, error };
  }
}

/**
 * Send member removed email when a member is removed from a group
 */
export async function sendGroupMemberRemovedEmail({
  email,
  memberName,
  groupName,
  removedBy,
  dashboardUrl,
}: {
  email: string;
  memberName: string;
  groupName: string;
  removedBy: string;
  dashboardUrl: string;
}) {
  try {
    const emailHtml = await render(
      GroupMemberRemovedEmail({
        memberName,
        groupName,
        removedBy,
        dashboardUrl,
      })
    );

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM.notifications,
      to: [email],
      replyTo: "support@opportuniq.app",
      subject: `You've been removed from "${groupName}"`,
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send member removed email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending member removed email:", error);
    return { success: false, error };
  }
}

/**
 * Send confirmation email to the inviter after sending an invitation
 * NOTE: This is for development/testing purposes. Comment out in production.
 */
export async function sendInvitationSentConfirmationEmail({
  email,
  inviterName,
  inviteeEmail,
  groupName,
  role,
  groupUrl,
  message,
}: {
  email: string;
  inviterName: string;
  inviteeEmail: string;
  groupName: string;
  role: string;
  groupUrl: string;
  message?: string;
}) {
  try {
    const emailHtml = await render(
      InvitationSentConfirmationEmail({
        inviterName,
        inviteeEmail,
        groupName,
        role,
        groupUrl,
        message,
      })
    );

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM.notifications,
      to: [email],
      replyTo: "support@opportuniq.app",
      subject: `Invitation sent to ${inviteeEmail} for "${groupName}"`,
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send invitation confirmation email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending invitation confirmation email:", error);
    return { success: false, error };
  }
}

/**
 * Send invitation role updated email when a pending invitation's role is changed
 */
export async function sendInvitationRoleUpdatedEmail({
  email,
  groupName,
  changedBy,
  oldRole,
  newRole,
  inviteUrl,
}: {
  email: string;
  groupName: string;
  changedBy: string;
  oldRole: string;
  newRole: string;
  inviteUrl: string;
}) {
  try {
    const emailHtml = await render(
      InvitationRoleUpdatedEmail({
        groupName,
        changedBy,
        oldRole,
        newRole,
        inviteUrl,
      })
    );

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM.notifications,
      to: [email],
      replyTo: "support@opportuniq.app",
      subject: `Your invitation role for "${groupName}" has been updated`,
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send invitation role updated email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending invitation role updated email:", error);
    return { success: false, error };
  }
}

/**
 * Send invitation revoked email to the invitee
 */
export async function sendInvitationRevokedEmail({
  email,
  groupName,
  revokedBy,
}: {
  email: string;
  groupName: string;
  revokedBy: string;
}) {
  try {
    const emailHtml = await render(
      InvitationRevokedEmail({
        groupName,
        revokedBy,
      })
    );

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM.notifications,
      to: [email],
      replyTo: "support@opportuniq.app",
      subject: `Your invitation to join "${groupName}" has been revoked`,
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send invitation revoked email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending invitation revoked email:", error);
    return { success: false, error };
  }
}

/**
 * Send confirmation email to the person who revoked an invitation
 */
export async function sendInvitationRevokedConfirmationEmail({
  email,
  revokerName,
  inviteeEmail,
  groupName,
  groupUrl,
}: {
  email: string;
  revokerName: string;
  inviteeEmail: string;
  groupName: string;
  groupUrl: string;
}) {
  try {
    const emailHtml = await render(
      InvitationRevokedConfirmationEmail({
        revokerName,
        inviteeEmail,
        groupName,
        groupUrl,
      })
    );

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM.notifications,
      to: [email],
      replyTo: "support@opportuniq.app",
      subject: `Invitation to ${inviteeEmail} for "${groupName}" has been revoked`,
      html: emailHtml,
    });

    if (error) {
      console.error("Failed to send invitation revoked confirmation email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending invitation revoked confirmation email:", error);
    return { success: false, error };
  }
}
