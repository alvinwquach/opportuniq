/**
 * Referral Code Utilities
 *
 * Generates and validates referral codes for the alpha/beta access system.
 */

import { customAlphabet } from "nanoid";

// Create a custom alphabet without confusing characters (0/O, 1/I/l)
const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const nanoid = customAlphabet(alphabet, 8);

/**
 * Generate a unique referral code
 * Format: 8 characters, uppercase alphanumeric (no confusing chars)
 * Example: "A3BK7M2X"
 */
export function generateReferralCode(): string {
  return nanoid();
}

/**
 * Generate a unique alpha invite token
 * Longer for security since these are admin-generated
 */
export function generateAlphaToken(): string {
  return customAlphabet(alphabet, 16)();
}

/**
 * Normalize a referral code for comparison
 * Removes spaces, converts to uppercase
 */
export function normalizeReferralCode(code: string): string {
  return code.replace(/\s/g, "").toUpperCase();
}

/**
 * Validate referral code format
 * Must be 8 alphanumeric characters
 */
export function isValidReferralCodeFormat(code: string): boolean {
  const normalized = normalizeReferralCode(code);
  return /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$/.test(normalized);
}
