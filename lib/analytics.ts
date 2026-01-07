"use client";

import amplitude from "@/amplitude";

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
  amplitude.track("Issue Created", props);
}

export function trackIssueViewed(props: {
  issueId: string;
  groupId: string;
  status: string;
}) {
  amplitude.track("Issue Viewed", props);
}

export function trackIssueStatusChanged(props: {
  issueId: string;
  groupId: string;
  fromStatus: string;
  toStatus: string;
}) {
  amplitude.track("Issue Status Changed", props);
}

// ============================================
// DECISION FLOW EVENTS
// ============================================

export function trackDecisionOptionsViewed(props: {
  issueId: string;
  groupId: string;
  optionCount: number;
}) {
  amplitude.track("Decision Options Viewed", props);
}

export function trackDecisionMade(props: {
  issueId: string;
  groupId: string;
  optionType: "diy" | "hire" | "defer" | "ignore";
  estimatedCost?: number;
  estimatedTime?: number;
}) {
  amplitude.track("Decision Made", props);
}

export function trackDecisionVoteCast(props: {
  issueId: string;
  groupId: string;
  optionId: string;
  voteType: "approve" | "reject";
}) {
  amplitude.track("Decision Vote Cast", props);
}

export function trackOutcomeRecorded(props: {
  issueId: string;
  groupId: string;
  success: boolean;
  actualCost?: number;
  costDelta?: number;
}) {
  amplitude.track("Outcome Recorded", props);
}

// ============================================
// GROUP MANAGEMENT EVENTS
// ============================================

export function trackGroupCreated(props: {
  groupId: string;
  hasZipCode: boolean;
}) {
  amplitude.track("Group Created", props);
}

export function trackGroupViewed(props: {
  groupId: string;
  memberCount: number;
}) {
  amplitude.track("Group Viewed", props);
}

export function trackMemberInvited(props: {
  groupId: string;
  inviteMethod: "email" | "link";
}) {
  amplitude.track("Member Invited", props);
}

export function trackMemberJoined(props: {
  groupId: string;
  joinMethod: "invite" | "link";
}) {
  amplitude.track("Member Joined", props);
}

export function trackGroupSettingsUpdated(props: {
  groupId: string;
  settingsChanged: string[];
}) {
  amplitude.track("Group Settings Updated", props);
}

export function trackGroupDeleted(props: {
  groupId: string;
  memberCount: number;
}) {
  amplitude.track("Group Deleted", props);
}

export function trackMemberRoleChanged(props: {
  groupId: string;
  memberId: string;
  oldRole: string;
  newRole: string;
}) {
  amplitude.track("Member Role Changed", props);
}

export function trackMemberRemoved(props: {
  groupId: string;
  memberId: string;
}) {
  amplitude.track("Member Removed", props);
}

export function trackMemberApproved(props: {
  groupId: string;
  memberId: string;
}) {
  amplitude.track("Member Approved", props);
}

export function trackMemberRejected(props: {
  groupId: string;
  memberId: string;
}) {
  amplitude.track("Member Rejected", props);
}

export function trackInvitationRoleChanged(props: {
  groupId: string;
  invitationId: string;
  oldRole: string;
  newRole: string;
}) {
  amplitude.track("Invitation Role Changed", props);
}

export function trackInvitationResent(props: {
  groupId: string;
  invitationId: string;
}) {
  amplitude.track("Invitation Resent", props);
}

export function trackInvitationExtended(props: {
  groupId: string;
  invitationId: string;
  newExpiresAt: string;
}) {
  amplitude.track("Invitation Extended", props);
}

export function trackInvitationRevoked(props: {
  groupId: string;
  invitationId: string;
}) {
  amplitude.track("Invitation Revoked", props);
}

export function trackBulkMembersInvited(props: {
  groupId: string;
  totalCount: number;
  successCount: number;
  failedCount: number;
}) {
  amplitude.track("Bulk Members Invited", props);
}

// ============================================
// INCOME & BUDGET EVENTS
// ============================================

export function trackIncomeAdded(props: {
  frequency: string;
  hasDescription: boolean;
}) {
  amplitude.track("Income Added", props);
}

export function trackIncomeUpdated(props: {
  streamId: string;
  fieldsChanged: string[];
}) {
  amplitude.track("Income Updated", props);
}

export function trackIncomeDeleted(props: {
  streamId: string;
}) {
  amplitude.track("Income Deleted", props);
}

export function trackBudgetCategoryAdded(props: {
  category: string;
  monthlyLimit: number;
}) {
  amplitude.track("Budget Category Added", props);
}

export function trackExpenseAdded(props: {
  category: string;
  amount: number;
  isGroupExpense: boolean;
  groupId?: string;
}) {
  amplitude.track("Expense Added", props);
}

// ============================================
// CALENDAR EVENTS
// ============================================

export function trackCalendarViewed(props: {
  view: "week" | "month" | "full";
  eventCount: number;
}) {
  amplitude.track("Calendar Viewed", props);
}

export function trackEventScheduled(props: {
  eventType: "diy" | "contractor" | "reminder";
  issueId?: string;
  groupId?: string;
}) {
  amplitude.track("Event Scheduled", props);
}

export function trackEventRescheduled(props: {
  eventId: string;
  eventType: string;
}) {
  amplitude.track("Event Rescheduled", props);
}

// ============================================
// FEATURE DISCOVERY EVENTS
// ============================================

export function trackFeatureDiscovered(props: {
  feature: string;
  source: "sidebar" | "dashboard" | "search" | "onboarding" | "tooltip";
}) {
  amplitude.track("Feature Discovered", props);
}

export function trackSearchUsed(props: {
  query: string;
  resultCount: number;
  selectedResult?: string;
}) {
  amplitude.track("Search Used", props);
}

export function trackGuideStarted(props: {
  guideId: string;
  guideTitle: string;
}) {
  amplitude.track("Guide Started", props);
}

export function trackGuideCompleted(props: {
  guideId: string;
  guideTitle: string;
  completionTime?: number;
}) {
  amplitude.track("Guide Completed", props);
}

export function trackHelpAccessed(props: {
  source: "header" | "sidebar" | "user_menu" | "contextual";
  topic?: string;
}) {
  amplitude.track("Help Accessed", props);
}

// ============================================
// NAVIGATION EVENTS
// ============================================

export function trackPageViewed(props: {
  pageName: string;
  pageType: "dashboard" | "issue" | "group" | "settings" | "admin" | "other";
}) {
  amplitude.track("Page Viewed", props);
}

export function trackQuickActionUsed(props: {
  action: string;
  source: "sidebar" | "dashboard" | "command_palette";
}) {
  amplitude.track("Quick Action Used", props);
}

// ============================================
// ONBOARDING EVENTS
// ============================================

export function trackOnboardingStarted() {
  amplitude.track("Onboarding Started");
}

export function trackOnboardingStepCompleted(props: {
  step: number;
  stepName: string;
}) {
  amplitude.track("Onboarding Step Completed", props);
}

export function trackOnboardingCompleted(props: {
  totalTime?: number;
  skippedSteps?: string[];
}) {
  amplitude.track("Onboarding Completed", props);
}

// ============================================
// ENGAGEMENT EVENTS
// ============================================

export function trackNotificationClicked(props: {
  notificationType: string;
  notificationId: string;
}) {
  amplitude.track("Notification Clicked", props);
}

export function trackReportIssueModalOpened(props: {
  source: "sidebar" | "dashboard" | "quick_action" | "empty_state";
}) {
  amplitude.track("Report Issue Modal Opened", props);
}

export function trackInputMethodSelected(props: {
  method: "photo" | "voice" | "video" | "upload";
}) {
  amplitude.track("Input Method Selected", props);
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
  amplitude.track("Diagnosis Started", props);
}

export function trackPhotoUploaded(props: {
  conversationId?: string | null;
  photoCount: number;
  uploadMethod: "click" | "drag_drop";
  fileSizeBytes?: number;
}) {
  amplitude.track("Photo Uploaded", props);
}

export function trackDiagnosisCompleted(props: {
  conversationId: string;
  messageCount: number;
  category?: string | null;
  severity?: string | null;
  hadPhotos: boolean;
  toolsUsed: string[];
}) {
  amplitude.track("Diagnosis Completed", props);
}

export function trackDiagnosisToolCalled(props: {
  conversationId?: string | null;
  toolName: string;
  category?: string | null;
}) {
  amplitude.track("Diagnosis Tool Called", props);
}

export function trackContractorClicked(props: {
  conversationId?: string | null;
  contractorName: string;
  contractorRating?: number;
  source: "google" | "yelp" | "other";
  category?: string | null;
}) {
  amplitude.track("Contractor Clicked", props);
}

export function trackFollowUpSent(props: {
  conversationId: string;
  messageLength: number;
  hasPhoto?: boolean;
  hasVoice?: boolean;
  detectedLanguage?: string | null;
}) {
  amplitude.track("Follow Up Sent", props);
}

export function trackDIYGuideClicked(props: {
  conversationId?: string | null;
  guideTitle: string;
  guideSource: string; // e.g., "r/DIY", "Reddit", "DIY Stack Exchange", etc.
  url: string;
  category?: string | null;
}) {
  amplitude.track("DIY Guide Clicked", props);
}

export function trackProductClicked(props: {
  conversationId?: string | null;
  productName: string;
  productPrice?: number;
  retailer: string;
  category?: string | null;
}) {
  amplitude.track("Product Clicked", props);
}

export function trackDiagnosisConversationViewed(props: {
  conversationId: string;
  messageCount: number;
  category?: string | null;
  severity?: string | null;
}) {
  amplitude.track("Diagnosis Conversation Viewed", props);
}

export function trackDiagnosisSuggestionClicked(props: {
  suggestion: string;
}) {
  amplitude.track("Diagnosis Suggestion Clicked", props);
}

// ============================================
// VOICE INPUT EVENTS
// ============================================

export function trackVoiceRecordingStarted(props: {
  conversationId?: string | null;
  source: "initial_form" | "follow_up";
}) {
  amplitude.track("Voice Recording Started", props);
}

export function trackVoiceRecordingCompleted(props: {
  conversationId?: string | null;
  source: "initial_form" | "follow_up";
  durationSeconds: number;
  detectedLanguage: string;
  transcriptionLength: number;
}) {
  amplitude.track("Voice Recording Completed", props);
}

export function trackVoiceRecordingCancelled(props: {
  conversationId?: string | null;
  source: "initial_form" | "follow_up";
  durationSeconds: number;
}) {
  amplitude.track("Voice Recording Cancelled", props);
}

export function trackVoiceRecordingFailed(props: {
  conversationId?: string | null;
  source: "initial_form" | "follow_up";
  errorType: "permission_denied" | "transcription_failed" | "no_audio" | "timeout" | "unknown";
  errorMessage?: string;
}) {
  amplitude.track("Voice Recording Failed", props);
}
export function trackTTSPlaybackStarted(props: {
  conversationId?: string | null;
  messageId: string;
  language: string;
  textLength: number;
}) {
  amplitude.track("TTS Playback Started", props);
}

export function trackTTSPlaybackCompleted(props: {
  conversationId?: string | null;
  messageId: string;
  language: string;
  durationSeconds?: number;
}) {
  amplitude.track("TTS Playback Completed", props);
}

export function trackTTSPlaybackStopped(props: {
  conversationId?: string | null;
  messageId: string;
  playedPercentage?: number;
}) {
  amplitude.track("TTS Playback Stopped", props);
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
  amplitude.track("Translation Requested", props);
}

export function trackTranslationToggled(props: {
  conversationId?: string | null;
  messageId: string;
  showingTranslation: boolean;
}) {
  amplitude.track("Translation Toggled", props);
}

export function trackVideoSelected(props: {
  conversationId?: string | null;
  fileSizeBytes: number;
  durationSeconds: number;
  mimeType: string;
  processingStrategy: "client" | "server";
}) {
  amplitude.track("Video Selected", props);
}

export function trackVideoProcessingStarted(props: {
  conversationId?: string | null;
  stage: string;
  processingStrategy: "client" | "server";
}) {
  amplitude.track("Video Processing Started", props);
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
  amplitude.track("Video Processing Completed", props);
}

export function trackVideoProcessingFailed(props: {
  conversationId?: string | null;
  stage: string;
  reason: string;
  processingStrategy: "client" | "server";
}) {
  amplitude.track("Video Processing Failed", props);
}

export function trackVideoTranscribed(props: {
  conversationId?: string | null;
  transcriptLength: number;
  detectedLanguage: string;
  audioDurationSeconds: number;
}) {
  amplitude.track("Video Transcribed", props);
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
  amplitude.track("Video Diagnosis Submitted", props);
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
  amplitude.track("Email Draft Generated", props);
}

export function trackEmailDraftOpened(props: {
  conversationId?: string | null;
  contractorName: string;
}) {
  amplitude.track("Email Draft Opened", props);
}

export function trackEmailDraftCopied(props: {
  conversationId?: string | null;
  contractorName: string;
}) {
  amplitude.track("Email Draft Copied", props);
}

export function trackContractorCalled(props: {
  conversationId?: string | null;
  contractorName: string;
  source: "email_draft" | "search_result";
}) {
  amplitude.track("Contractor Called", props);
}

export function trackContractorWebsiteVisited(props: {
  conversationId?: string | null;
  contractorName: string;
  source: "email_draft" | "search_result";
}) {
  amplitude.track("Contractor Website Visited", props);
}

export function trackGmailConnected(props: {
  conversationId?: string | null;
  source: "email_draft" | "settings";
}) {
  amplitude.track("Gmail Connected", props);
}

export function trackGmailConnectionFailed(props: {
  conversationId?: string | null;
  errorCode: string;
  source: "email_draft" | "settings";
}) {
  amplitude.track("Gmail Connection Failed", props);
}

export function trackEmailSent(props: {
  conversationId?: string | null;
  contractorName: string;
  sentVia: "gmail";
}) {
  amplitude.track("Email Sent", props);
}

export function trackEmailSendFailed(props: {
  conversationId?: string | null;
  contractorName: string;
  errorCode: string;
}) {
  amplitude.track("Email Send Failed", props);
}

// ============================================
// GOOGLE CALENDAR EVENTS
// ============================================

export function trackGoogleCalendarConnected(props: {
  source: "settings";
}) {
  amplitude.track("Google Calendar Connected", props);
}

export function trackGoogleCalendarConnectionFailed(props: {
  errorCode: string;
  source: "settings";
}) {
  amplitude.track("Google Calendar Connection Failed", props);
}
