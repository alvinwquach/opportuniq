import { resend, EMAIL_FROM, APP_URL } from "./client";

interface SendRfqEmailParams {
  recipientName: string;
  recipientEmail: string;
  issueTitle: string;
  issueDiagnosis: string;
  senderName: string;
  senderEmail?: string;
  senderPhone?: string;
  senderCity?: string;
  issueId: string;
}

/**
 * Send a Request for Quote email to a professional
 *
 * Returns the Resend email ID for tracking, or null if failed
 */
export async function sendRfqEmail({
  recipientName,
  recipientEmail,
  issueTitle,
  issueDiagnosis,
  senderName,
  senderEmail,
  senderPhone,
  senderCity,
  issueId,
}: SendRfqEmailParams): Promise<{ id: string; subject: string; bodyText: string } | null> {
  const subject = `Quote Request - ${issueTitle}`;

  const bodyText = `Hi ${recipientName.split(" ")[0]},

I'm reaching out to request a quote for: ${issueTitle.toLowerCase()}

Issue Details:
${issueDiagnosis}

${senderCity ? `Location: ${senderCity}` : ""}

Please let me know your availability and estimated cost. I'm comparing quotes from a few professionals and would appreciate a response within 24-48 hours if possible.

Thank you,
${senderName}
${senderPhone ? `Phone: ${senderPhone}` : ""}
${senderEmail ? `Email: ${senderEmail}` : ""}

---
This quote request was sent via OpportunIQ
${APP_URL}`;

  const bodyHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quote Request</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Quote Request</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">${issueTitle}</p>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="margin: 0 0 20px 0;">Hi ${recipientName.split(" ")[0]},</p>

    <p style="margin: 0 0 20px 0;">I'm reaching out to request a quote for: <strong>${issueTitle.toLowerCase()}</strong></p>

    <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
      <h3 style="margin: 0 0 12px 0; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Issue Details</h3>
      <p style="margin: 0; color: #4b5563;">${issueDiagnosis}</p>
    </div>

    ${senderCity ? `<p style="margin: 0 0 20px 0;"><strong>Location:</strong> ${senderCity}</p>` : ""}

    <p style="margin: 0 0 20px 0;">Please let me know your availability and estimated cost. I'm comparing quotes from a few professionals and would appreciate a response within 24-48 hours if possible.</p>

    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">
      <p style="margin: 0 0 8px 0;"><strong>Thank you,</strong></p>
      <p style="margin: 0 0 4px 0;">${senderName}</p>
      ${senderPhone ? `<p style="margin: 0 0 4px 0; color: #6b7280;">Phone: ${senderPhone}</p>` : ""}
      ${senderEmail ? `<p style="margin: 0; color: #6b7280;">Email: ${senderEmail}</p>` : ""}
    </div>
  </div>

  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 0;">This quote request was sent via <a href="${APP_URL}" style="color: #10b981; text-decoration: none;">OpportunIQ</a></p>
  </div>
</body>
</html>`;

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM.notifications,
      to: recipientEmail,
      replyTo: senderEmail,
      subject,
      text: bodyText,
      html: bodyHtml,
      tags: [
        { name: "type", value: "rfq" },
        { name: "issue_id", value: issueId },
      ],
    });

    if (error) {
      console.error("Failed to send RFQ email:", error);
      return null;
    }

    return {
      id: data?.id ?? "",
      subject,
      bodyText,
    };
  } catch (error) {
    console.error("Error sending RFQ email:", error);
    return null;
  }
}

/**
 * Send multiple RFQ emails in batch
 *
 * Returns array of results with success/failure for each
 */
export async function sendBatchRfqEmails(
  emails: SendRfqEmailParams[]
): Promise<Array<{ recipientEmail: string; success: boolean; resendId?: string; error?: string }>> {
  const results = await Promise.all(
    emails.map(async (emailParams) => {
      const result = await sendRfqEmail(emailParams);
      if (result) {
        return {
          recipientEmail: emailParams.recipientEmail,
          success: true,
          resendId: result.id,
        };
      } else {
        return {
          recipientEmail: emailParams.recipientEmail,
          success: false,
          error: "Failed to send email",
        };
      }
    })
  );

  return results;
}
