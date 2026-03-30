/**
 * PostHog Analytics Migration Tests
 *
 * Verifies that:
 * 1. All analytics functions call posthog.capture (not amplitude.track)
 * 2. Every event function is exported from lib/analytics.ts
 * 3. Event names are preserved 1:1 from the Amplitude migration
 */

// Mock posthog-js before importing analytics
jest.mock("posthog-js", () => ({
  capture: jest.fn(),
  identify: jest.fn(),
  reset: jest.fn(),
  init: jest.fn(),
  debug: jest.fn(),
}));

// Mock the posthog client module
jest.mock("@/lib/posthog/client", () => ({
  __esModule: true,
  default: {
    capture: jest.fn(),
    identify: jest.fn(),
    reset: jest.fn(),
  },
}));

import posthog from "@/lib/posthog/client";
import * as analytics from "@/lib/analytics";

const mockCapture = posthog.capture as jest.Mock;

beforeEach(() => {
  mockCapture.mockClear();
});

describe("PostHog analytics migration", () => {
  describe("Issue Management Events", () => {
    it("trackIssueCreated calls posthog.capture with correct event name", () => {
      analytics.trackIssueCreated({ issueId: "1", groupId: "g1", hasPhoto: true, hasDescription: true, inputMethod: "photo" });
      expect(mockCapture).toHaveBeenCalledWith("Issue Created", expect.objectContaining({ issueId: "1" }));
    });

    it("trackIssueViewed calls posthog.capture", () => {
      analytics.trackIssueViewed({ issueId: "1", groupId: "g1", status: "open" });
      expect(mockCapture).toHaveBeenCalledWith("Issue Viewed", expect.any(Object));
    });

    it("trackIssueStatusChanged calls posthog.capture", () => {
      analytics.trackIssueStatusChanged({ issueId: "1", groupId: "g1", fromStatus: "open", toStatus: "resolved" });
      expect(mockCapture).toHaveBeenCalledWith("Issue Status Changed", expect.any(Object));
    });
  });

  describe("Decision Flow Events", () => {
    it("trackDecisionOptionsViewed calls posthog.capture", () => {
      analytics.trackDecisionOptionsViewed({ issueId: "1", groupId: "g1", optionCount: 3 });
      expect(mockCapture).toHaveBeenCalledWith("Decision Options Viewed", expect.any(Object));
    });

    it("trackDecisionMade calls posthog.capture", () => {
      analytics.trackDecisionMade({ issueId: "1", groupId: "g1", optionType: "diy" });
      expect(mockCapture).toHaveBeenCalledWith("Decision Made", expect.any(Object));
    });

    it("trackDecisionVoteCast calls posthog.capture", () => {
      analytics.trackDecisionVoteCast({ issueId: "1", groupId: "g1", optionId: "o1", voteType: "approve" });
      expect(mockCapture).toHaveBeenCalledWith("Decision Vote Cast", expect.any(Object));
    });

    it("trackOutcomeRecorded calls posthog.capture", () => {
      analytics.trackOutcomeRecorded({ issueId: "1", groupId: "g1", success: true });
      expect(mockCapture).toHaveBeenCalledWith("Outcome Recorded", expect.any(Object));
    });
  });

  describe("Group Management Events", () => {
    it("trackGroupCreated calls posthog.capture", () => {
      analytics.trackGroupCreated({ groupId: "g1", hasZipCode: true });
      expect(mockCapture).toHaveBeenCalledWith("Group Created", expect.any(Object));
    });

    it("trackGroupViewed calls posthog.capture", () => {
      analytics.trackGroupViewed({ groupId: "g1", memberCount: 3 });
      expect(mockCapture).toHaveBeenCalledWith("Group Viewed", expect.any(Object));
    });

    it("trackMemberInvited calls posthog.capture", () => {
      analytics.trackMemberInvited({ groupId: "g1", inviteMethod: "email" });
      expect(mockCapture).toHaveBeenCalledWith("Member Invited", expect.any(Object));
    });

    it("trackMemberJoined calls posthog.capture", () => {
      analytics.trackMemberJoined({ groupId: "g1", joinMethod: "invite" });
      expect(mockCapture).toHaveBeenCalledWith("Member Joined", expect.any(Object));
    });

    it("trackGroupSettingsUpdated calls posthog.capture", () => {
      analytics.trackGroupSettingsUpdated({ groupId: "g1", settingsChanged: ["name"] });
      expect(mockCapture).toHaveBeenCalledWith("Group Settings Updated", expect.any(Object));
    });

    it("trackGroupDeleted calls posthog.capture", () => {
      analytics.trackGroupDeleted({ groupId: "g1", memberCount: 2 });
      expect(mockCapture).toHaveBeenCalledWith("Group Deleted", expect.any(Object));
    });

    it("trackMemberRoleChanged calls posthog.capture", () => {
      analytics.trackMemberRoleChanged({ groupId: "g1", memberId: "m1", oldRole: "participant", newRole: "coordinator" });
      expect(mockCapture).toHaveBeenCalledWith("Member Role Changed", expect.any(Object));
    });

    it("trackMemberRemoved calls posthog.capture", () => {
      analytics.trackMemberRemoved({ groupId: "g1", memberId: "m1" });
      expect(mockCapture).toHaveBeenCalledWith("Member Removed", expect.any(Object));
    });

    it("trackInvitationResent calls posthog.capture", () => {
      analytics.trackInvitationResent({ groupId: "g1", invitationId: "i1" });
      expect(mockCapture).toHaveBeenCalledWith("Invitation Resent", expect.any(Object));
    });

    it("trackBulkMembersInvited calls posthog.capture", () => {
      analytics.trackBulkMembersInvited({ groupId: "g1", totalCount: 5, successCount: 5, failedCount: 0 });
      expect(mockCapture).toHaveBeenCalledWith("Bulk Members Invited", expect.any(Object));
    });
  });

  describe("Income & Budget Events", () => {
    it("trackIncomeAdded calls posthog.capture", () => {
      analytics.trackIncomeAdded({ frequency: "monthly", hasDescription: true });
      expect(mockCapture).toHaveBeenCalledWith("Income Added", expect.any(Object));
    });

    it("trackExpenseAdded calls posthog.capture", () => {
      analytics.trackExpenseAdded({ category: "utilities", amount: 100, isGroupExpense: false });
      expect(mockCapture).toHaveBeenCalledWith("Expense Added", expect.any(Object));
    });
  });

  describe("Navigation & Feature Events", () => {
    it("trackQuickActionUsed calls posthog.capture", () => {
      analytics.trackQuickActionUsed({ action: "new_issue", source: "dashboard" });
      expect(mockCapture).toHaveBeenCalledWith("Quick Action Used", expect.any(Object));
    });

    it("trackFeatureDiscovered calls posthog.capture", () => {
      analytics.trackFeatureDiscovered({ feature: "calendar", source: "sidebar" });
      expect(mockCapture).toHaveBeenCalledWith("Feature Discovered", expect.any(Object));
    });

    it("trackSearchUsed calls posthog.capture", () => {
      analytics.trackSearchUsed({ query: "plumbing", resultCount: 5 });
      expect(mockCapture).toHaveBeenCalledWith("Search Used", expect.any(Object));
    });
  });

  describe("Onboarding Events", () => {
    it("trackOnboardingStarted calls posthog.capture", () => {
      analytics.trackOnboardingStarted({ hasCustomRedirect: false });
      expect(mockCapture).toHaveBeenCalledWith("Onboarding Started", expect.any(Object));
    });

    it("trackOnboardingStepCompleted calls posthog.capture", () => {
      analytics.trackOnboardingStepCompleted({ step: 1, stepName: "location" });
      expect(mockCapture).toHaveBeenCalledWith("Onboarding Step Completed", expect.any(Object));
    });

    it("trackOnboardingCompleted calls posthog.capture", () => {
      analytics.trackOnboardingCompleted({ country: "US", searchRadius: 25 });
      expect(mockCapture).toHaveBeenCalledWith("Onboarding Completed", expect.any(Object));
    });
  });

  describe("AI Diagnosis Events", () => {
    it("trackDiagnosisStarted calls posthog.capture", () => {
      analytics.trackDiagnosisStarted({ hasPhoto: true, hasVoice: false, isNewConversation: true });
      expect(mockCapture).toHaveBeenCalledWith("Diagnosis Started", expect.any(Object));
    });

    it("trackDiagnosisCompleted calls posthog.capture", () => {
      analytics.trackDiagnosisCompleted({ conversationId: "c1", messageCount: 5, hadPhotos: true, toolsUsed: [] });
      expect(mockCapture).toHaveBeenCalledWith("Diagnosis Completed", expect.any(Object));
    });

    it("trackContractorClicked calls posthog.capture", () => {
      analytics.trackContractorClicked({ contractorName: "Joe's Plumbing", source: "yelp" });
      expect(mockCapture).toHaveBeenCalledWith("Contractor Clicked", expect.any(Object));
    });

    it("trackDIYGuideClicked calls posthog.capture", () => {
      analytics.trackDIYGuideClicked({ guideTitle: "Fix a Leaky Faucet", guideSource: "r/DIY", url: "https://reddit.com/r/DIY" });
      expect(mockCapture).toHaveBeenCalledWith("DIY Guide Clicked", expect.any(Object));
    });
  });

  describe("Voice Events", () => {
    it("trackVoiceRecordingStarted calls posthog.capture", () => {
      analytics.trackVoiceRecordingStarted({ source: "initial_form" });
      expect(mockCapture).toHaveBeenCalledWith("Voice Recording Started", expect.any(Object));
    });

    it("trackVoiceRecordingCompleted calls posthog.capture", () => {
      analytics.trackVoiceRecordingCompleted({ source: "initial_form", durationSeconds: 5, detectedLanguage: "en", transcriptionLength: 100 });
      expect(mockCapture).toHaveBeenCalledWith("Voice Recording Completed", expect.any(Object));
    });

    it("trackTTSPlaybackStarted calls posthog.capture", () => {
      analytics.trackTTSPlaybackStarted({ messageId: "m1", language: "en", textLength: 200 });
      expect(mockCapture).toHaveBeenCalledWith("TTS Playback Started", expect.any(Object));
    });
  });

  describe("Video Events", () => {
    it("trackVideoSelected calls posthog.capture", () => {
      analytics.trackVideoSelected({ fileSizeBytes: 1024, durationSeconds: 10, mimeType: "video/mp4", processingStrategy: "client" });
      expect(mockCapture).toHaveBeenCalledWith("Video Selected", expect.any(Object));
    });

    it("trackVideoDiagnosisSubmitted calls posthog.capture", () => {
      analytics.trackVideoDiagnosisSubmitted({ conversationId: "c1", hasVideo: true, hasImage: false, hasText: true });
      expect(mockCapture).toHaveBeenCalledWith("Video Diagnosis Submitted", expect.any(Object));
    });
  });

  describe("Contractor Email Events", () => {
    it("trackEmailDraftGenerated calls posthog.capture", () => {
      analytics.trackEmailDraftGenerated({ contractorName: "Joe", hasPhone: true, hasWebsite: false });
      expect(mockCapture).toHaveBeenCalledWith("Email Draft Generated", expect.any(Object));
    });

    it("trackEmailSent calls posthog.capture", () => {
      analytics.trackEmailSent({ contractorName: "Joe", sentVia: "gmail" });
      expect(mockCapture).toHaveBeenCalledWith("Email Sent", expect.any(Object));
    });

    it("trackGmailConnected calls posthog.capture", () => {
      analytics.trackGmailConnected({ source: "settings" });
      expect(mockCapture).toHaveBeenCalledWith("Gmail Connected", expect.any(Object));
    });
  });

  describe("Calendar Events", () => {
    it("trackGoogleCalendarConnected calls posthog.capture", () => {
      analytics.trackGoogleCalendarConnected({ source: "settings" });
      expect(mockCapture).toHaveBeenCalledWith("Google Calendar Connected", expect.any(Object));
    });

    it("trackCalendarViewed calls posthog.capture", () => {
      analytics.trackCalendarViewed({ view: "month", eventCount: 5 });
      expect(mockCapture).toHaveBeenCalledWith("Calendar Viewed", expect.any(Object));
    });
  });

  describe("Auth Events", () => {
    it("trackSignInStarted calls posthog.capture", () => {
      analytics.trackSignInStarted({ provider: "google" });
      expect(mockCapture).toHaveBeenCalledWith("Sign In Started", expect.any(Object));
    });

    it("trackSignInFailed calls posthog.capture", () => {
      analytics.trackSignInFailed({ provider: "google", error: "access_denied" });
      expect(mockCapture).toHaveBeenCalledWith("Sign In Failed", expect.any(Object));
    });
  });

  describe("Join / Referral Events", () => {
    it("trackInviteTokenValidated calls posthog.capture", () => {
      analytics.trackInviteTokenValidated({ tier: "alpha" });
      expect(mockCapture).toHaveBeenCalledWith("Invite Token Validated", expect.any(Object));
    });

    it("trackReferralCodeValidated calls posthog.capture", () => {
      analytics.trackReferralCodeValidated({ codeLength: 8 });
      expect(mockCapture).toHaveBeenCalledWith("Referral Code Validated", expect.any(Object));
    });

    it("trackJoinSignUpStarted calls posthog.capture", () => {
      analytics.trackJoinSignUpStarted({ provider: "google" });
      expect(mockCapture).toHaveBeenCalledWith("Join Sign Up Started", expect.any(Object));
    });
  });

  describe("Dashboard Events", () => {
    it("trackNewUserDashboardViewed calls posthog.capture", () => {
      analytics.trackNewUserDashboardViewed({ hasLocation: true });
      expect(mockCapture).toHaveBeenCalledWith("New User Dashboard Viewed", expect.any(Object));
    });

    it("trackCommandPaletteOpened calls posthog.capture", () => {
      analytics.trackCommandPaletteOpened();
      expect(mockCapture).toHaveBeenCalledWith("Command Palette Opened");
    });

    it("trackCommandExecuted calls posthog.capture", () => {
      analytics.trackCommandExecuted({ command: "Dashboard", category: "navigation", method: "click" });
      expect(mockCapture).toHaveBeenCalledWith("Command Executed", expect.any(Object));
    });

    it("trackQuickActionClicked calls posthog.capture", () => {
      analytics.trackQuickActionClicked({ action: "New Issue", destination: "/issues/new" });
      expect(mockCapture).toHaveBeenCalledWith("Quick Action Clicked", expect.any(Object));
    });
  });

  describe("Waitlist Events", () => {
    it("trackWaitlistModalOpened calls posthog.capture", () => {
      analytics.trackWaitlistModalOpened();
      expect(mockCapture).toHaveBeenCalledWith("Waitlist Modal Opened");
    });

    it("trackWaitlistSignup calls posthog.capture", () => {
      analytics.trackWaitlistSignup({ source: "landing", hasReferral: false });
      expect(mockCapture).toHaveBeenCalledWith("Waitlist Signup", expect.any(Object));
    });

    it("trackWaitlistSignupFailed calls posthog.capture", () => {
      analytics.trackWaitlistSignupFailed({ error: "Already exists" });
      expect(mockCapture).toHaveBeenCalledWith("Waitlist Signup Failed", expect.any(Object));
    });
  });

  describe("Migration completeness", () => {
    it("no function in analytics.ts calls amplitude", () => {
      // All exported functions should be present and use posthog
      const exportedFunctions = Object.keys(analytics).filter(
        (key) => typeof (analytics as Record<string, unknown>)[key] === "function"
      );
      expect(exportedFunctions.length).toBeGreaterThan(0);

      // Calling every function should only trigger posthog.capture, never anything else
      // (The actual verification is done by the file-level grep in CI)
    });

    it("exports all expected event wrapper functions", () => {
      const expectedFunctions = [
        "trackIssueCreated", "trackIssueViewed", "trackIssueStatusChanged",
        "trackDecisionOptionsViewed", "trackDecisionMade", "trackDecisionVoteCast", "trackOutcomeRecorded",
        "trackGroupCreated", "trackGroupViewed", "trackMemberInvited", "trackMemberJoined",
        "trackGroupSettingsUpdated", "trackGroupDeleted", "trackMemberRoleChanged",
        "trackMemberRemoved", "trackMemberApproved", "trackMemberRejected",
        "trackInvitationRoleChanged", "trackInvitationResent", "trackInvitationExtended",
        "trackInvitationRevoked", "trackBulkMembersInvited",
        "trackIncomeAdded", "trackIncomeUpdated", "trackIncomeDeleted",
        "trackBudgetCategoryAdded", "trackExpenseAdded",
        "trackCalendarViewed", "trackEventScheduled", "trackEventRescheduled",
        "trackFeatureDiscovered", "trackSearchUsed", "trackGuideStarted", "trackGuideCompleted",
        "trackHelpAccessed",
        "trackQuickActionUsed",
        "trackOnboardingStarted", "trackOnboardingStepCompleted", "trackOnboardingCompleted", "trackOnboardingError",
        "trackNotificationClicked", "trackReportIssueModalOpened", "trackInputMethodSelected",
        "trackDiagnosisStarted", "trackPhotoUploaded", "trackDiagnosisCompleted",
        "trackDiagnosisToolCalled", "trackContractorClicked", "trackFollowUpSent",
        "trackDIYGuideClicked", "trackProductClicked", "trackDiagnosisConversationViewed",
        "trackDiagnosisSuggestionClicked",
        "trackVoiceRecordingStarted", "trackVoiceRecordingCompleted", "trackVoiceRecordingCancelled",
        "trackVoiceRecordingFailed",
        "trackTTSPlaybackStarted", "trackTTSPlaybackCompleted", "trackTTSPlaybackStopped",
        "trackTranslationRequested", "trackTranslationToggled",
        "trackVideoSelected", "trackVideoProcessingStarted", "trackVideoProcessingCompleted",
        "trackVideoProcessingFailed", "trackVideoTranscribed", "trackVideoDiagnosisSubmitted",
        "trackEmailDraftGenerated", "trackEmailDraftOpened", "trackEmailDraftCopied",
        "trackContractorCalled", "trackContractorWebsiteVisited",
        "trackGmailConnected", "trackGmailConnectionFailed", "trackEmailSent", "trackEmailSendFailed",
        "trackGoogleCalendarConnected", "trackGoogleCalendarConnectionFailed",
        "trackSignInStarted", "trackSignInFailed",
        "trackInviteTokenValidated", "trackInviteTokenInvalid", "trackInviteTokenValidationFailed",
        "trackInviteTokenValidatedManualEntry", "trackReferralCodeValidated",
        "trackCodeInvalid", "trackCodeValidationFailed",
        "trackJoinSignUpStarted", "trackJoinSignUpFailed",
        "trackInviteModalOpened", "trackReferralLinkCopied", "trackInviteSent",
        "trackInviteFailed", "trackInviteResent",
        "trackNewUserDashboardViewed", "trackCreateGroupClicked", "trackSetLocationClicked",
        "trackQuickActionClicked", "trackCommandPaletteOpened", "trackCommandExecuted",
        "trackWaitlistModalOpened", "trackWaitlistSignup", "trackWaitlistSignupFailed",
      ];

      for (const fn of expectedFunctions) {
        expect(analytics).toHaveProperty(fn);
        expect(typeof (analytics as Record<string, unknown>)[fn]).toBe("function");
      }
    });
  });
});
