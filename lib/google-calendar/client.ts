/**
 * Google Calendar OAuth Client
 *
 * Handles OAuth flow and API calls for Google Calendar integration.
 * Requests calendar event management scopes only.
 */

import { google } from "googleapis";

// Google Calendar OAuth configuration
const CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events", // Manage calendar events
  "https://www.googleapis.com/auth/userinfo.email", // Get email address
];

// Create OAuth2 client
export function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/google-calendar/callback`
  );
}

/**
 * Generate the OAuth authorization URL for Google Calendar
 */
export function getGoogleCalendarAuthUrl(state?: string): string {
  const oauth2Client = createOAuth2Client();

  return oauth2Client.generateAuthUrl({
    access_type: "offline", // Get refresh token
    scope: CALENDAR_SCOPES,
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
 * Get the email address associated with the token
 */
export async function getGoogleEmail(accessToken: string): Promise<string> {
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
 * Create a calendar event
 */
export async function createCalendarEvent({
  accessToken,
  summary,
  description,
  startDateTime,
  endDateTime,
  location,
  attendees,
}: {
  accessToken: string;
  summary: string;
  description?: string;
  startDateTime: Date;
  endDateTime: Date;
  location?: string;
  attendees?: string[];
}): Promise<{ eventId: string; htmlLink: string }> {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const event = {
    summary,
    description,
    location,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    attendees: attendees?.map((email) => ({ email })),
    reminders: {
      useDefault: true,
    },
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: event,
    sendUpdates: attendees?.length ? "all" : "none",
  });

  if (!response.data.id || !response.data.htmlLink) {
    throw new Error("Failed to create calendar event - no event ID returned");
  }

  return {
    eventId: response.data.id,
    htmlLink: response.data.htmlLink,
  };
}

/**
 * Update a calendar event
 */
export async function updateCalendarEvent({
  accessToken,
  eventId,
  summary,
  description,
  startDateTime,
  endDateTime,
  location,
}: {
  accessToken: string;
  eventId: string;
  summary?: string;
  description?: string;
  startDateTime?: Date;
  endDateTime?: Date;
  location?: string;
}): Promise<{ eventId: string; htmlLink: string }> {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const event: Record<string, unknown> = {};

  if (summary) event.summary = summary;
  if (description) event.description = description;
  if (location) event.location = location;
  if (startDateTime) {
    event.start = {
      dateTime: startDateTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }
  if (endDateTime) {
    event.end = {
      dateTime: endDateTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  const response = await calendar.events.patch({
    calendarId: "primary",
    eventId,
    requestBody: event,
  });

  if (!response.data.id || !response.data.htmlLink) {
    throw new Error("Failed to update calendar event");
  }

  return {
    eventId: response.data.id,
    htmlLink: response.data.htmlLink,
  };
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent({
  accessToken,
  eventId,
}: {
  accessToken: string;
  eventId: string;
}): Promise<void> {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  await calendar.events.delete({
    calendarId: "primary",
    eventId,
  });
}
