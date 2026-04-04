import { render } from "@react-email/render";
import IssueCreatedEmail from "@/emails/IssueCreatedEmail";
import DecisionReadyEmail from "@/emails/DecisionReadyEmail";
import DecisionApprovedEmail from "@/emails/DecisionApprovedEmail";
import FeedbackRequestEmail from "@/emails/FeedbackRequestEmail";
import { resend, EMAIL_FROM } from "./client";

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
      from: EMAIL_FROM.notifications,
      to: [email],
      replyTo: "support@opportuniq.app",
      subject: `New issue in ${groupName}: ${issueTitle}`,
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
      from: EMAIL_FROM.notifications,
      to: [email],
      replyTo: "support@opportuniq.app",
      subject: `Vote needed: ${issueTitle}`,
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
      from: EMAIL_FROM.notifications,
      to: [email],
      replyTo: "support@opportuniq.app",
      subject: `Decision made: ${approvedOption}`,
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
      from: EMAIL_FROM.hello,
      to: [email],
      replyTo: "feedback@opportuniq.app",
      subject: "Quick question - how are we doing?",
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
