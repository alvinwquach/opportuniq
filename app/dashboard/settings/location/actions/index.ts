/**
 * Location Actions
 *
 * Server actions for managing user location settings.
 */

export { updateLocationEncrypted } from "./updateLocationEncrypted";
export { updateLocationPlaintext } from "./updateLocationPlaintext";
export type {
  EncryptedLocationInput,
  PlaintextLocationData,
  LocationUpdateResult,
} from "./types";
