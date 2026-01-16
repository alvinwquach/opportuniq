/**
 * INCOME STREAM ACTIONS
 *
 * Server actions for managing user income streams with E2E encryption.
 *
 * ENCRYPTION MODEL:
 * - Client encrypts sensitive fields (source, amount, description) before sending
 * - Server stores encrypted ciphertext + IV, never sees plaintext
 * - Client decrypts after fetching using user's encryptionKey
 *
 * WHAT'S ENCRYPTED: source, amount, description
 * WHAT'S PLAINTEXT: frequency, isActive, dates (needed for calculations)
 */

// Types
export type {
  EncryptedIncomeInput,
  IncomeStreamResponse,
  IncomeFrequency,
} from "./types";
export { FREQUENCY_TO_MONTHLY, ANNUAL_HOURS } from "./types";

// Actions
export { getIncomeData } from "./getIncomeData";
export { addIncomeStream, addIncomeStreamPlaintext } from "./addIncomeStream";
export { updateIncomeStream } from "./updateIncomeStream";
export { deleteIncomeStream } from "./deleteIncomeStream";
export { encryptIncomeStream } from "./encryptIncomeStream";
