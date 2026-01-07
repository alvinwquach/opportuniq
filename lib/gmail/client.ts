/**
 * Gmail OAuth Client
 *
 * Handles OAuth flow and API calls for Gmail integration.
 * Only requests gmail.send scope - no access to read emails.
 */

import { google } from "googleapis";

// Gmail OAuth configuration
const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.send", // Send emails only
  "https://www.googleapis.com/auth/userinfo.email", // Get Gmail address
];

// Create OAuth2 client
export function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/gmail/callback`
  );
}

/**
 * Generate the OAuth authorization URL for Gmail
 */
export function getGmailAuthUrl(state?: string): string {
  const oauth2Client = createOAuth2Client();

  return oauth2Client.generateAuthUrl({
    access_type: "offline", // Get refresh token
    scope: GMAIL_SCOPES,
    prompt: "consent", // Force consent screen to get refresh token
    state: state || undefined,
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

/**
 * Refresh an expired access token
 */
export async function refreshAccessToken(refreshToken: string) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials;
}

/**
 * Get the Gmail address associated with the token
 */
export async function getGmailAddress(accessToken: string): Promise<string> {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });

  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const { data } = await oauth2.userinfo.get();

  if (!data.email) {
    throw new Error("Could not get email address from Google");
  }

  return data.email;
}

/**
 * Send an email via Gmail API
 */
export async function sendGmailMessage({
  accessToken,
  to,
  subject,
  body,
  replyTo,
}: {
  accessToken: string;
  to: string;
  subject: string;
  body: string;
  replyTo?: string;
}): Promise<{ messageId: string; threadId: string }> {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  // Build the email message in RFC 2822 format
  const emailLines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "MIME-Version: 1.0",
  ];

  if (replyTo) {
    emailLines.push(`Reply-To: ${replyTo}`);
  }

  emailLines.push("", body);

  const email = emailLines.join("\r\n");

  // Encode to base64url
  const encodedMessage = Buffer.from(email)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  // Send the email
  const response = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });

  if (!response.data.id || !response.data.threadId) {
    throw new Error("Failed to send email - no message ID returned");
  }

  return {
    messageId: response.data.id,
    threadId: response.data.threadId,
  };
}
