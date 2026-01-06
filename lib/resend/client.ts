import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Common email sender addresses
export const EMAIL_FROM = {
  onboarding: "OpportunIQ <onboarding@opportuniq.app>",
  notifications: "OpportunIQ <notifications@opportuniq.app>",
  invites: "OpportunIQ <invites@opportuniq.app>",
  hello: "OpportunIQ <hello@opportuniq.app>",
  auth: "OpportunIQ <auth@opportuniq.app>",
} as const;

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app";
