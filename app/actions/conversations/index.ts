/**
 * Conversation Actions - Barrel Export
 *
 * PSEUDOCODE:
 * 1. Re-export all types from types.ts
 * 2. Re-export all actions from each module
 * 3. Provide single import point for consumers
 *
 * USAGE:
 * ```typescript
 * import {
 *   getConversations,
 *   createConversation,
 *   ConversationListItem
 * } from "@/app/actions/conversations";
 * ```
 *
 * STRUCTURE:
 * - types.ts: TypeScript interfaces (no server code)
 * - queries.ts: Read operations (getConversations, getConversation)
 * - mutations.ts: Write operations (create, delete)
 * - encryption.ts: Encryption operations (encrypt message/metadata, batch)
 * - migration.ts: Migration logic (v1 → v2, can be deprecated later)
 */

// ============================================
// TYPES (no "use server" needed)
// ============================================

export type {
  ConversationListItem,
  ConversationDetail,
  MessageItem,
  CreateConversationInput,
  EncryptMessageInput,
  EncryptConversationInput,
  BatchEncryptMessagesInput,
} from "./types";

// ============================================
// QUERY ACTIONS (read operations)
// ============================================

export { getConversations, getConversation } from "./queries";

// ============================================
// MUTATION ACTIONS (write operations)
// ============================================

export { createConversation, deleteConversation } from "./mutations";

// ============================================
// ENCRYPTION ACTIONS
// ============================================

export {
  encryptMessage,
  encryptConversationMetadata,
  batchEncryptMessages,
} from "./encryption";

