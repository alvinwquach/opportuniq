/**
 * Sentry Webhook Handler
 *
 * Receives Sentry alert webhooks and sends formatted email alerts via Resend.
 * Configure this URL in the Sentry dashboard under Settings > Integrations > WebHooks.
 *
 * Supported issue actions: created, resolved, assigned
 */

import { NextResponse } from "next/server";
import { resend, EMAIL_FROM } from "@/lib/resend/client";

const ADMIN_EMAIL = "alvinwquach@gmail.com";

interface SentryIssue {
  id: string;
  title: string;
  culprit?: string;
  shortId?: string;
  permalink?: string;
  level?: "fatal" | "error" | "warning" | "info" | "debug";
  status?: string;
  firstSeen?: string;
  lastSeen?: string;
  count?: number;
  userCount?: number;
  project?: {
    name: string;
    slug: string;
  };
}

interface SentryWebhookPayload {
  action: "created" | "resolved" | "assigned" | string;
  data: {
    issue?: SentryIssue;
  };
  installation?: {
    uuid: string;
  };
}

function buildAlertEmailHtml(action: string, issue: SentryIssue): string {
  const levelColor: Record<string, string> = {
    fatal: "#d63031",
    error: "#e17055",
    warning: "#fdcb6e",
    info: "#74b9ff",
    debug: "#b2bec3",
  };
  const color = levelColor[issue.level ?? "error"] ?? "#e17055";
  const level = (issue.level ?? "error").toUpperCase();
  const actionLabel = action === "created" ? "New Issue" : action === "resolved" ? "Resolved" : "Updated";

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="background: ${color}; color: white; padding: 12px 20px; border-radius: 6px 6px 0 0;">
        <strong>${actionLabel}: [${level}]</strong>
      </div>
      <div style="border: 1px solid #dfe6e9; border-top: none; padding: 20px; border-radius: 0 0 6px 6px;">
        <h2 style="margin: 0 0 8px; font-size: 18px; color: #2d3436;">${issue.title}</h2>
        ${issue.culprit ? `<p style="margin: 0 0 16px; color: #636e72; font-size: 13px; font-family: monospace;">${issue.culprit}</p>` : ""}
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #2d3436;">
          ${issue.project ? `<tr><td style="padding: 4px 0; color: #636e72; width: 120px;">Project</td><td>${issue.project.name}</td></tr>` : ""}
          ${issue.shortId ? `<tr><td style="padding: 4px 0; color: #636e72;">Issue ID</td><td>${issue.shortId}</td></tr>` : ""}
          ${issue.level ? `<tr><td style="padding: 4px 0; color: #636e72;">Level</td><td>${issue.level}</td></tr>` : ""}
          ${issue.status ? `<tr><td style="padding: 4px 0; color: #636e72;">Status</td><td>${issue.status}</td></tr>` : ""}
          ${issue.count != null ? `<tr><td style="padding: 4px 0; color: #636e72;">Occurrences</td><td>${issue.count.toLocaleString()}</td></tr>` : ""}
          ${issue.userCount != null ? `<tr><td style="padding: 4px 0; color: #636e72;">Users affected</td><td>${issue.userCount.toLocaleString()}</td></tr>` : ""}
          ${issue.firstSeen ? `<tr><td style="padding: 4px 0; color: #636e72;">First seen</td><td>${new Date(issue.firstSeen).toLocaleString()}</td></tr>` : ""}
          ${issue.lastSeen ? `<tr><td style="padding: 4px 0; color: #636e72;">Last seen</td><td>${new Date(issue.lastSeen).toLocaleString()}</td></tr>` : ""}
        </table>
        ${issue.permalink ? `<div style="margin-top: 20px;"><a href="${issue.permalink}" style="background: #0984e3; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-size: 14px;">View in Sentry →</a></div>` : ""}
      </div>
    </div>
  `;
}

export async function POST(req: Request) {
  try {
    const payload: SentryWebhookPayload = await req.json();
    const { action, data } = payload;

    const issue = data?.issue;
    if (!issue) {
      return NextResponse.json({ ok: true, skipped: "no issue in payload" });
    }

    // Only alert on created and critical-level resolved issues
    const shouldAlert =
      action === "created" ||
      (action === "resolved" && (issue.level === "fatal" || issue.level === "error"));

    if (!shouldAlert) {
      return NextResponse.json({ ok: true, skipped: `action "${action}" not alertable` });
    }

    const actionLabel = action === "created" ? "New Sentry Issue" : "Sentry Issue Resolved";
    const subject = `[${(issue.level ?? "error").toUpperCase()}] ${actionLabel}: ${issue.title}`;

    await resend.emails.send({
      from: EMAIL_FROM.notifications,
      to: ADMIN_EMAIL,
      subject,
      html: buildAlertEmailHtml(action, issue),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Sentry Webhook] Error processing payload:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
