import { NextRequest, NextResponse } from "next/server";
import {
  sendWelcomeEmail,
  sendAbandonedOnboardingEmail,
  sendMagicLinkEmail,
  sendGroupInvitationEmail,
  sendMemberApprovalEmail,
  sendAlphaInviteEmail,
  sendBetaInviteEmail,
  sendReferralConvertedEmail,
  sendWaitlistConfirmationEmail,
  sendIssueCreatedEmail,
  sendDecisionReadyEmail,
  sendDecisionApprovedEmail,
  sendJohatsuInviteEmail,
  sendBetaLaunchWeekendEmail,
  sendWaitlistLaunchEmail,
  sendPublicLaunchEmail,
  sendFeedbackRequestEmail,
  sendReferralReminderEmail,
} from "@/lib/resend";

async function sendTestEmail(type: string) {
  const email = "alvinwquach@gmail.com";
  let result;

  switch (type) {
    case "welcome":
      result = await sendWelcomeEmail({
        email,
        name: "Alvin Quach",
        postalCode: "94102",
        searchRadius: 25,
      });
      break;

    case "abandoned":
      result = await sendAbandonedOnboardingEmail({
        email,
        name: "Alvin Quach",
      });
      break;

    case "magic":
      result = await sendMagicLinkEmail({
        email,
        magicLink: `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/auth/callback?token=test_magic_link_token_12345`,
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      });
      break;

    case "group-invitation":
      result = await sendGroupInvitationEmail({
        email,
        inviterName: "Alvin Quach",
        groupName: "Home Maintenance Crew",
        inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/invite/test-invite-123`,
        role: "Member",
        message: "Hey! Join our group to help manage household decisions together.",
      });
      break;

    case "member-approval":
      result = await sendMemberApprovalEmail({
        email,
        memberName: "Alvin Quach",
        groupName: "Home Maintenance Crew",
        groupUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/groups/123`,
      });
      break;

    case "alpha-invite":
      result = await sendAlphaInviteEmail({
        email,
        inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/join?token=alpha_test_token_12345`,
        expiresIn: "7 days",
      });
      break;

    case "beta-invite":
      result = await sendBetaInviteEmail({
        email,
        inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/join?token=beta_test_token_12345`,
        referrerName: "Alvin Quach",
        expiresIn: "7 days",
      });
      break;

    case "referral-converted":
      result = await sendReferralConvertedEmail({
        email,
        referrerName: "Alvin Quach",
        refereeName: "Alvin Quach",
        referralCount: 3,
      });
      break;

    case "waitlist":
      result = await sendWaitlistConfirmationEmail({
        email,
        name: "Alvin Quach",
        position: 42,
        referralCode: "johatsu2026",
      });
      break;

    case "issue-created":
      result = await sendIssueCreatedEmail({
        email,
        memberName: "Alvin Quach",
        issueTitle: "Kitchen faucet is leaking",
        issueDescription: "The kitchen faucet has been dripping constantly for the past week. Water is pooling under the sink.",
        groupName: "Home Maintenance Crew",
        issueUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/groups/123/issues/456`,
        createdBy: "Alvin Quach",
        category: "Plumbing",
      });
      break;

    case "decision-ready":
      result = await sendDecisionReadyEmail({
        email,
        memberName: "Alvin Quach",
        issueTitle: "Kitchen faucet repair options",
        groupName: "Home Maintenance Crew",
        decisionUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/groups/123/decisions/789`,
        options: [
          { title: "Replace with standard faucet ($150)", votes: 2 },
          { title: "Repair existing faucet ($75)", votes: 1 },
          { title: "Upgrade to touchless faucet ($350)", votes: 0 },
        ],
        votingDeadline: "3 days",
      });
      break;

    case "decision-approved":
      result = await sendDecisionApprovedEmail({
        email,
        memberName: "Alvin Quach",
        issueTitle: "Kitchen faucet repair options",
        approvedOption: "Replace with standard faucet ($150)",
        groupName: "Home Maintenance Crew",
        decisionUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/groups/123/decisions/789`,
        totalVotes: 5,
        winningPercentage: 60,
        nextSteps: [
          "Research recommended plumbers in your area",
          "Get quotes from 2-3 providers",
          "Schedule the repair at a convenient time",
        ],
      });
      break;

    case "johatsu-invite":
      result = await sendJohatsuInviteEmail({
        email,
        inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/join?token=johatsu_test_token_12345`,
        expiresIn: "7 days",
      });
      break;

    case "beta-launch-weekend":
      result = await sendBetaLaunchWeekendEmail({
        email,
        name: "Alvin",
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/dashboard`,
      });
      break;

    case "waitlist-launch":
      result = await sendWaitlistLaunchEmail({
        email,
        name: "Alvin",
        signupUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/join`,
        position: 42,
      });
      break;

    case "public-launch":
      result = await sendPublicLaunchEmail({
        email,
        name: "Alvin",
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/dashboard`,
        referralCode: "alvin2026",
      });
      break;

    case "feedback-request":
      result = await sendFeedbackRequestEmail({
        email,
        name: "Alvin",
        feedbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/feedback`,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/dashboard`,
      });
      break;

    case "referral-reminder":
      result = await sendReferralReminderEmail({
        email,
        name: "Alvin",
        referralCode: "alvin2026",
        referralCount: 3,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/dashboard`,
      });
      break;

    default:
      return {
        success: false,
        error: `Invalid email type. Available types: welcome, abandoned, magic, group-invitation, member-approval, alpha-invite, beta-invite, johatsu-invite, beta-launch-weekend, waitlist-launch, public-launch, feedback-request, referral-reminder, referral-converted, waitlist, issue-created, decision-ready, decision-approved`,
      };
  }

  return result;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "welcome";

    const result = await sendTestEmail(type);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `${type} email sent successfully to alvinwquach@gmail.com`,
        data: result.data,
      });
    } else {
      return NextResponse.json(
        { error: "Failed to send email", details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in test-email route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    const result = await sendTestEmail(type || "welcome");

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `${type} email sent successfully to alvinwquach@gmail.com`,
        data: result.data,
      });
    } else {
      return NextResponse.json(
        { error: "Failed to send email", details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in test-email route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
