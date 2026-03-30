"use client";

import posthog from "@/lib/posthog/client";

// ============================================
// ISSUE MANAGEMENT EVENTS
// ============================================

export function trackIssueCreated(props: {
  issueId: string;
  groupId: string;
  hasPhoto: boolean;
  hasDescription: boolean;
  inputMethod: "photo" | "voice" | "video" | "upload" | "manual";
}) {
  posthog.capture("Issue Created", props);
}

export function trackIssueViewed(props: {
  issueId: string;
  groupId: string;
  status: string;
}) {
  posthog.capture("Issue Viewed", props);
}

export function trackIssueStatusChanged(props: {
  issueId: string;
  groupId: string;
  fromStatus: string;
  toStatus: string;
}) {
  posthog.capture("Issue Status Changed", props);
}

// ============================================
// DECISION FLOW EVENTS
// ============================================

export function trackDecisionOptionsViewed(props: {
  issueId: string;
  groupId: string;
  optionCount: number;
}) {
  posthog.capture("Decision Options Viewed", props);
}

export function trackDecisionMade(props: {
  issueId: string;
  groupId: string;
  optionType: "diy" | "hire" | "defer" | "ignore";
  estimatedCost?: number;
  estimatedTime?: number;
}) {
  posthog.capture("Decision Made", props);
}

export function trackDecisionVoteCast(props: {
  issueId: string;
  groupId: string;
  optionId: string;
  voteType: "approve" | "reject";
}) {
  posthog.capture("Decision Vote Cast", props);
}

export function trackOutcomeRecorded(props: {
  issueId: string;
  groupId: string;
  success: boolean;
  actualCost?: number;
  costDelta?: number;
}) {
  posthog.capture("Outcome Recorded", props);
}

// ============================================
// GROUP MANAGEMENT EVENTS
// ============================================

export function trackGroupCreated(props: {
  groupId: string;
  hasZipCode: boolean;
}) {
  posthog.capture("Group Created", props);
}

export function trackGroupViewed(props: {
  groupId: string;
  memberCount: number;
}) {
  posthog.capture("Group Viewed", props);
}

export function trackMemberInvited(props: {
  groupId: string;
  inviteMethod: "email" | "link";
}) {
  posthog.capture("Member Invited", props);
}

export function trackMemberJoined(props: {
  groupId: string;
  joinMethod: "invite" | "link";
}) {
  posthog.capture("Member Joined", props);
}

export function trackGroupSettingsUpdated(props: {
  groupId: string;
  settingsChanged: string[];
}) {
  posthog.capture("Group Settings Updated", props);
}

export function trackGroupDeleted(props: {
  groupId: string;
  memberCount: number;
}) {
  posthog.capture("Group Deleted", props);
}

export function trackMemberRoleChanged(props: {
  groupId: string;
  memberId: string;
  oldRole: string;
  newRole: string;
}) {
  posthog.capture("Member Role Changed", props);
}

export function trackMemberRemoved(props: {
  groupId: string;
  memberId: string;
}) {
  posthog.capture("Member Removed", props);
}

export function trackMemberApproved(props: {
  groupId: string;
  memberId: string;
}) {
  posthog.capture("Member Approved", props);
}

export function trackMemberRejected(props: {
  groupId: string;
  memberId: string;
}) {
  posthog.capture("Member Rejected", props);
}

export function trackInvitationRoleChanged(props: {
  groupId: string;
  invitationId: string;
  oldRole: string;
  newRole: string;
}) {
  posthog.capture("Invitation Role Changed", props);
}

export function trackInvitationResent(props: {
  groupId: string;
  invitationId: string;
}) {
  posthog.capture("Invitation Resent", props);
}

export function trackInvitationExtended(props: {
  groupId: string;
  invitationId: string;
  newExpiresAt: string;
}) {
  posthog.capture("Invitation Extended", props);
}

export function trackInvitationRevoked(props: {
  groupId: string;
  invitationId: string;
}) {
  posthog.capture("Invitation Revoked", props);
}

export function trackBulkMembersInvited(props: {
  groupId: string;
  totalCount: number;
  successCount: number;
  failedCount: number;
}) {
  posthog.capture("Bulk Members Invited", props);
}

// ============================================
// INCOME & BUDGET EVENTS
// ============================================

export function trackIncomeAdded(props: {
  frequency: string;
  hasDescription: boolean;
}) {
  posthog.capture("Income Added", props);
}

export function trackIncomeUpdated(props: {
  streamId: string;
  fieldsChanged: string[];
}) {
  posthog.capture("Income Updated", props);
}

export function trackIncomeDeleted(props: {
  streamId: string;
}) {
  posthog.capture("Income Deleted", props);
}

export function trackBudgetCategoryAdded(props: {
  category: string;
  monthlyLimit: number;
}) {
  posthog.capture("Budget Category Added", props);
}

export function trackExpenseAdded(props: {
  category: string;
  amount: number;
  isGroupExpense: boolean;
  groupId?: string;
}) {
  posthog.capture("Expense Added", props);
}

// ============================================
// CALENDAR EVENTS
// ============================================

export function trackCalendarViewed(props: {
  view: "week" | "month" | "full";
  eventCount: number;
}) {
  posthog.capture("Calendar Viewed", props);
}

export function trackEventScheduled(props: {
  eventType: "diy" | "contractor" | "reminder";
  issueId?: string;
  groupId?: string;
}) {
  posthog.capture("Event Scheduled", props);
}

export function trackEventRescheduled(props: {
  eventId: string;
  eventType: string;
}) {
  posthog.capture("Event Rescheduled", props);
}

// ============================================
// FEATURE DISCOVERY EVENTS
// ============================================

export function trackFeatureDiscovered(props: {
  feature: string;
  source: "sidebar" | "dashboard" | "search" | "onboarding" | "tooltip";
}) {
  posthog.capture("Feature Discovered", props);
}

export function trackSearchUsed(props: {
  query: string;
  resultCount: number;
  selectedResult?: string;
}) {
  posthog.capture("Search Used", props);
}

export function trackGuideStarted(props: {
  guideId: string;
  guideTitle: string;
}) {
  posthog.capture("Guide Started", props);
}

export function trackGuideCompleted(props: {
  guideId: string;
  guideTitle: string;
  completionTime?: number;
}) {
  posthog.capture("Guide Completed", props);
}

export function trackHelpAccessed(props: {
  source: "header" | "sidebar" | "user_menu" | "contextual";
  topic?: string;
}) {
  posthog.capture("Help Accessed", props);
}

// ============================================
// NAVIGATION EVENTS
// ============================================

export function trackQuickActionUsed(props: {
  action: string;
  source: "sidebar" | "dashboard" | "command_palette";
}) {
  posthog.capture("Quick Action Used", props);
}

// ============================================
// ONBOARDING EVENTS
// ============================================

export function trackOnboardingStarted(props?: { hasCustomRedirect?: boolean }) {
  posthog.capture("Onboarding Started", props);
}

export function trackOnboardingStepCompleted(props: {
  step: number;
  stepName: string;
}) {
  posthog.capture("Onboarding Step Completed", props);
}

export function trackOnboardingCompleted(props: {
  totalTime?: number;
  skippedSteps?: string[];
  country?: string;
  searchRadius?: number;
  riskTolerance?: string;
  primaryUseCase?: string;
}) {
  posthog.capture("Onboarding Completed", props);
}

export function trackOnboardingError(props: { error: string }) {
  posthog.capture("Onboarding Error", props);
}

// ============================================
// ENGAGEMENT EVENTS
// ============================================

export function trackNotificationClicked(props: {
  notificationType: string;
  notificationId: string;
}) {
  posthog.capture("Notification Clicked", props);
}

export function trackReportIssueModalOpened(props: {
  source: "sidebar" | "dashboard" | "quick_action" | "empty_state" | "topbar";
}) {
  posthog.capture("Report Issue Modal Opened", props);
}

export function trackInputMethodSelected(props: {
  method: "photo" | "voice" | "video" | "upload";
}) {
  posthog.capture("Input Method Selected", props);
}

// ============================================
// AI DIAGNOSIS EVENTS
// ============================================

export function trackDiagnosisStarted(props: {
  conversationId?: string | null;
  hasPhoto: boolean;
  hasVoice: boolean;
  isNewConversation: boolean;
  detectedLanguage?: string | null;
}) {
  posthog.capture("Diagnosis Started", props);
}

export function trackPhotoUploaded(props: {
  conversationId?: string | null;
  photoCount: number;
  uploadMethod: "click" | "drag_drop";
  fileSizeBytes?: number;
}) {
  posthog.capture("Photo Uploaded", props);
}

export function trackDiagnosisCompleted(props: {
  conversationId: string;
  messageCount: number;
  category?: string | null;
  severity?: string | null;
  hadPhotos: boolean;
  toolsUsed: string[];
}) {
  posthog.capture("Diagnosis Completed", props);
}

export function trackDiagnosisToolCalled(props: {
  conversationId?: string | null;
  toolName: string;
  category?: string | null;
}) {
  posthog.capture("Diagnosis Tool Called", props);
}

export function trackContractorClicked(props: {
  conversationId?: string | null;
  contractorName: string;
  contractorRating?: number;
  source: "google" | "yelp" | "other";
  category?: string | null;
}) {
  posthog.capture("Contractor Clicked", props);
}

export function trackFollowUpSent(props: {
  conversationId: string;
  messageLength: number;
  hasPhoto?: boolean;
  hasVoice?: boolean;
  detectedLanguage?: string | null;
}) {
  posthog.capture("Follow Up Sent", props);
}

export function trackDIYGuideClicked(props: {
  conversationId?: string | null;
  guideTitle: string;
  guideSource: string;
  url: string;
  category?: string | null;
}) {
  posthog.capture("DIY Guide Clicked", props);
}

export function trackProductClicked(props: {
  conversationId?: string | null;
  productName: string;
  productPrice?: number;
  retailer: string;
  category?: string | null;
}) {
  posthog.capture("Product Clicked", props);
}

export function trackDiagnosisConversationViewed(props: {
  conversationId: string;
  messageCount: number;
  category?: string | null;
  severity?: string | null;
}) {
  posthog.capture("Diagnosis Conversation Viewed", props);
}

export function trackDiagnosisSuggestionClicked(props: {
  suggestion: string;
}) {
  posthog.capture("Diagnosis Suggestion Clicked", props);
}

// ============================================
// VOICE INPUT EVENTS
// ============================================

export function trackVoiceRecordingStarted(props: {
  conversationId?: string | null;
  source: "initial_form" | "follow_up";
}) {
  posthog.capture("Voice Recording Started", props);
}

export function trackVoiceRecordingCompleted(props: {
  conversationId?: string | null;
  source: "initial_form" | "follow_up";
  durationSeconds: number;
  detectedLanguage: string;
  transcriptionLength: number;
}) {
  posthog.capture("Voice Recording Completed", props);
}

export function trackVoiceRecordingCancelled(props: {
  conversationId?: string | null;
  source: "initial_form" | "follow_up";
  durationSeconds: number;
}) {
  posthog.capture("Voice Recording Cancelled", props);
}

export function trackVoiceRecordingFailed(props: {
  conversationId?: string | null;
  source: "initial_form" | "follow_up";
  errorType: "permission_denied" | "transcription_failed" | "no_audio" | "timeout" | "unknown";
  errorMessage?: string;
}) {
  posthog.capture("Voice Recording Failed", props);
}

export function trackTTSPlaybackStarted(props: {
  conversationId?: string | null;
  messageId: string;
  language: string;
  textLength: number;
}) {
  posthog.capture("TTS Playback Started", props);
}

export function trackTTSPlaybackCompleted(props: {
  conversationId?: string | null;
  messageId: string;
  language: string;
  durationSeconds?: number;
}) {
  posthog.capture("TTS Playback Completed", props);
}

export function trackTTSPlaybackStopped(props: {
  conversationId?: string | null;
  messageId: string;
  playedPercentage?: number;
}) {
  posthog.capture("TTS Playback Stopped", props);
}

// ============================================
// TRANSLATION EVENTS
// ============================================

export function trackTranslationRequested(props: {
  conversationId?: string | null;
  messageId: string;
  fromLanguage: string;
  toLanguage: string;
  textLength: number;
}) {
  posthog.capture("Translation Requested", props);
}

export function trackTranslationToggled(props: {
  conversationId?: string | null;
  messageId: string;
  showingTranslation: boolean;
}) {
  posthog.capture("Translation Toggled", props);
}

export function trackVideoSelected(props: {
  conversationId?: string | null;
  fileSizeBytes: number;
  durationSeconds: number;
  mimeType: string;
  processingStrategy: "client" | "server";
}) {
  posthog.capture("Video Selected", props);
}

export function trackVideoProcessingStarted(props: {
  conversationId?: string | null;
  stage: string;
  processingStrategy: "client" | "server";
}) {
  posthog.capture("Video Processing Started", props);
}

export function trackVideoProcessingCompleted(props: {
  conversationId?: string | null;
  durationSeconds: number;
  frameCount: number;
  hasAudio: boolean;
  fileSizeBytes: number;
  compressedSizeBytes: number;
  processingStrategy: "client" | "server";
  processingTimeMs: number;
  confidenceScore: number;
}) {
  posthog.capture("Video Processing Completed", props);
}

export function trackVideoProcessingFailed(props: {
  conversationId?: string | null;
  stage: string;
  reason: string;
  processingStrategy: "client" | "server";
}) {
  posthog.capture("Video Processing Failed", props);
}

export function trackVideoTranscribed(props: {
  conversationId?: string | null;
  transcriptLength: number;
  detectedLanguage: string;
  audioDurationSeconds: number;
}) {
  posthog.capture("Video Transcribed", props);
}

export function trackVideoDiagnosisSubmitted(props: {
  conversationId: string;
  hasVideo: boolean;
  hasImage: boolean;
  hasText: boolean;
  videoFrameCount?: number;
  hasAudioTranscript?: boolean;
  videoDurationSeconds?: number;
  confidenceScore?: number;
}) {
  posthog.capture("Video Diagnosis Submitted", props);
}

// ============================================
// CONTRACTOR EMAIL EVENTS
// ============================================

export function trackEmailDraftGenerated(props: {
  conversationId?: string | null;
  contractorName: string;
  hasPhone: boolean;
  hasWebsite: boolean;
  issueCategory?: string | null;
}) {
  posthog.capture("Email Draft Generated", props);
}

export function trackEmailDraftOpened(props: {
  conversationId?: string | null;
  contractorName: string;
}) {
  posthog.capture("Email Draft Opened", props);
}

export function trackEmailDraftCopied(props: {
  conversationId?: string | null;
  contractorName: string;
}) {
  posthog.capture("Email Draft Copied", props);
}

export function trackContractorCalled(props: {
  conversationId?: string | null;
  contractorName: string;
  source: "email_draft" | "search_result";
}) {
  posthog.capture("Contractor Called", props);
}

export function trackContractorWebsiteVisited(props: {
  conversationId?: string | null;
  contractorName: string;
  source: "email_draft" | "search_result";
}) {
  posthog.capture("Contractor Website Visited", props);
}

export function trackGmailConnected(props: {
  conversationId?: string | null;
  source: "email_draft" | "settings";
}) {
  posthog.capture("Gmail Connected", props);
}

export function trackGmailConnectionFailed(props: {
  conversationId?: string | null;
  errorCode: string;
  source: "email_draft" | "settings";
}) {
  posthog.capture("Gmail Connection Failed", props);
}

export function trackEmailSent(props: {
  conversationId?: string | null;
  contractorName: string;
  sentVia: "gmail";
}) {
  posthog.capture("Email Sent", props);
}

export function trackEmailSendFailed(props: {
  conversationId?: string | null;
  contractorName: string;
  errorCode: string;
}) {
  posthog.capture("Email Send Failed", props);
}

// ============================================
// GOOGLE CALENDAR EVENTS
// ============================================

export function trackGoogleCalendarConnected(props: {
  source: "settings";
}) {
  posthog.capture("Google Calendar Connected", props);
}

export function trackGoogleCalendarConnectionFailed(props: {
  errorCode: string;
  source: "settings";
}) {
  posthog.capture("Google Calendar Connection Failed", props);
}

// ============================================
// AUTH EVENTS
// ============================================

export function trackSignInStarted(props: {
  provider: string;
  hasInviteToken?: boolean;
  hasGroupInvite?: boolean;
}) {
  posthog.capture("Sign In Started", props);
}

export function trackSignInFailed(props: {
  provider: string;
  error: string;
}) {
  posthog.capture("Sign In Failed", props);
}

// ============================================
// JOIN / REFERRAL EVENTS
// ============================================

export function trackInviteTokenValidated(props: {
  hasInviteEmail?: boolean;
  tier?: string;
}) {
  posthog.capture("Invite Token Validated", props);
}

export function trackInviteTokenInvalid(props: { error: string }) {
  posthog.capture("Invite Token Invalid", props);
}

export function trackInviteTokenValidationFailed(props: { error: string }) {
  posthog.capture("Invite Token Validation Failed", props);
}

export function trackInviteTokenValidatedManualEntry(props: { tier?: string }) {
  posthog.capture("Invite Token Validated (Manual Entry)", props);
}

export function trackReferralCodeValidated(props: { codeLength: number }) {
  posthog.capture("Referral Code Validated", props);
}

export function trackCodeInvalid(props: { error: string; codeLength: number }) {
  posthog.capture("Code Invalid", props);
}

export function trackCodeValidationFailed(props: { error: string }) {
  posthog.capture("Code Validation Failed", props);
}

export function trackJoinSignUpStarted(props: {
  provider: string;
  hasInviteToken?: boolean;
  hasReferralCode?: boolean;
}) {
  posthog.capture("Join Sign Up Started", props);
}

export function trackJoinSignUpFailed(props: {
  provider: string;
  error: string;
}) {
  posthog.capture("Join Sign Up Failed", props);
}

// ============================================
// INVITE MODAL EVENTS
// ============================================

export function trackInviteModalOpened(props: { hasExistingInvites: boolean }) {
  posthog.capture("Invite Modal Opened", props);
}

export function trackReferralLinkCopied(props: {
  referralCode?: string | null;
  accessTier?: string | null;
  source: string;
}) {
  posthog.capture("Referral Link Copied", props);
}

export function trackInviteSent(props: {
  inviteTier?: string;
  senderTier?: string | null;
  source: string;
}) {
  posthog.capture("Invite Sent", props);
}

export function trackInviteFailed(props: {
  error?: string;
  senderTier?: string | null;
  source: string;
}) {
  posthog.capture("Invite Failed", props);
}

export function trackInviteResent(props: { inviteTier?: string; source: string }) {
  posthog.capture("Invite Resent", props);
}

// ============================================
// DASHBOARD EVENTS
// ============================================

export function trackNewUserDashboardViewed(props: { hasLocation: boolean }) {
  posthog.capture("New User Dashboard Viewed", props);
}

export function trackCreateGroupClicked(props: { source: string }) {
  posthog.capture("Create Group Clicked", props);
}

export function trackSetLocationClicked(props: { source: string }) {
  posthog.capture("Set Location Clicked", props);
}

export function trackQuickActionClicked(props: {
  action: string;
  destination: string;
}) {
  posthog.capture("Quick Action Clicked", props);
}

export function trackCommandPaletteOpened() {
  posthog.capture("Command Palette Opened");
}

export function trackCommandExecuted(props: {
  command: string;
  category: string;
  searchQuery?: string;
  method: "keyboard" | "click";
}) {
  posthog.capture("Command Executed", props);
}

// ============================================
// WAITLIST EVENTS
// ============================================

export function trackWaitlistModalOpened() {
  posthog.capture("Waitlist Modal Opened");
}

export function trackWaitlistSignup(props: {
  source: string;
  hasReferral: boolean;
}) {
  posthog.capture("Waitlist Signup", props);
}

export function trackWaitlistSignupFailed(props: { error?: string }) {
  posthog.capture("Waitlist Signup Failed", props);
}
