/**
 * Calendar Reminder Tool
 *
 * Schedule a reminder for a deferred repair or maintenance task.
 * Uses the user's connected Google Calendar (if linked in Settings > Integrations).
 */

import * as Sentry from "@sentry/nextjs";
import { tool } from "ai";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/app/db/client";
import { googleCalendarTokens } from "@/app/db/schema";
import { createCalendarEvent, refreshAccessToken } from "@/lib/google-calendar";
import { trackCalendarReminderCreated } from "@/lib/analytics-server";
import type { ToolContext } from "./types";

export function createCalendarReminderTool(ctx: ToolContext) {
  return tool({
    description:
      "Schedule a reminder for a deferred repair or maintenance task. Use this when the user decides to address an issue later, or when you recommend periodic maintenance.",
    inputSchema: z.object({
      title: z
        .string()
        .describe(
          "Reminder title (e.g., 'Check ceiling crack', 'Schedule HVAC maintenance')"
        ),
      description: z
        .string()
        .optional()
        .describe("Details about what to do"),
      daysFromNow: z
        .number()
        .describe("How many days from now to set the reminder"),
      issueCategory: z
        .string()
        .optional()
        .describe("Category of the issue"),
    }),
    execute: async ({ title, description, daysFromNow, issueCategory }) => {
      if (!ctx.userId) {
        return {
          error: "User not authenticated",
          suggestion: "Please sign in to use calendar reminders",
        };
      }

      // Look up Google Calendar tokens for this user
      const tokens = await db
        .select()
        .from(googleCalendarTokens)
        .where(eq(googleCalendarTokens.userId, ctx.userId))
        .limit(1);

      const token = tokens[0];
      if (!token || !token.isActive) {
        return {
          error: "Google Calendar not connected",
          suggestion:
            "Connect Google Calendar in Settings > Integrations to schedule reminders",
        };
      }

      let accessToken = token.accessToken;

      // Refresh access token if expired
      if (new Date() > token.expiresAt) {
        try {
          const newCreds = await refreshAccessToken(token.refreshToken);
          accessToken = newCreds.access_token!;
        } catch (refreshError) {
          Sentry.captureException(refreshError, {
            extra: { tool: "scheduleReminder", userId: ctx.userId },
          });
          return {
            error: "Google Calendar token expired and could not be refreshed",
            suggestion:
              "Reconnect Google Calendar in Settings > Integrations",
          };
        }
      }

      // Build reminder datetime (9 AM on the target date)
      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + daysFromNow);
      reminderDate.setHours(9, 0, 0, 0);

      const endDate = new Date(reminderDate);
      endDate.setHours(10, 0, 0, 0); // 1-hour block

      const fullDescription = [
        description,
        issueCategory ? `Category: ${issueCategory}` : null,
        "Created by OpportunIQ",
      ]
        .filter(Boolean)
        .join("\n\n");

      try {
        const { eventId, htmlLink } = await createCalendarEvent({
          accessToken,
          summary: title,
          description: fullDescription || undefined,
          startDateTime: reminderDate,
          endDateTime: endDate,
        });

        trackCalendarReminderCreated({
          conversationId: ctx.conversationId,
          issueCategory,
          daysOut: daysFromNow,
        });

        const eventDate = reminderDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });


        return {
          success: true,
          eventId,
          eventUrl: htmlLink,
          eventDate,
          title,
        };
      } catch (error) {
        Sentry.captureException(error, {
          extra: {
            tool: "scheduleReminder",
            userId: ctx.userId,
            title,
            daysFromNow,
          },
        });
        return {
          error: "Failed to create calendar event",
          suggestion:
            "Try again or add the reminder manually to your calendar",
        };
      }
    },
  });
}
