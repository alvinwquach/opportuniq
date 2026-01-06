// Re-export the Resend client and constants
export { resend, EMAIL_FROM, APP_URL } from "./client";

// Auth emails
export {
  sendWelcomeEmail,
  sendAbandonedOnboardingEmail,
  sendMagicLinkEmail,
} from "./auth";

// Group emails
export {
  sendGroupInvitationEmail,
  sendMemberApprovalEmail,
  sendGroupUpdatedEmail,
  sendGroupDeletedEmail,
  sendGroupRoleChangedEmail,
  sendGroupMemberRemovedEmail,
  sendInvitationSentConfirmationEmail,
  sendInvitationRoleUpdatedEmail,
} from "./groups";

// Invite emails
export {
  sendAlphaInviteEmail,
  sendBetaInviteEmail,
  sendJohatsuInviteEmail,
  sendWaitlistConfirmationEmail,
  sendReferralConvertedEmail,
} from "./invites";

// Notification emails
export {
  sendIssueCreatedEmail,
  sendDecisionReadyEmail,
  sendDecisionApprovedEmail,
  sendFeedbackRequestEmail,
} from "./notifications";

// Marketing emails
export {
  sendBetaLaunchWeekendEmail,
  sendWaitlistLaunchEmail,
  sendPublicLaunchEmail,
  sendReferralReminderEmail,
} from "./marketing";
