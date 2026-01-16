import type { EncryptionScope } from "@/app/db/schema/ai-conversations";

export interface ConversationListItem {
  id: string;
  type: string;
  groupId: string | null;
  encryption: {
    scope: string;
    keyVersion: number;
    algorithm: string;
    isEncrypted: boolean;
    wrappedKey?: string;
    wrappedKeyFingerprint?: string;
    wrapAlgorithm?: string;
  };
  encryptedTitle: string | null;
  titleIv: string | null;
  title: string | null;
  category: string | null;
  severity: string | null;
  isResolved: boolean;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
}

export interface ConversationDetail {
  id: string;
  userId: string;
  groupId: string | null;
  type: string;
  encryption: {
    scope: string;
    keyVersion: number;
    algorithm: string;
    isEncrypted: boolean;
    wrappedKey?: string;
    wrappedKeyFingerprint?: string;
    wrapAlgorithm?: string;
  };
  encryptedTitle: string | null;
  titleIv: string | null;
  encryptedSummary: string | null;
  summaryIv: string | null;
  title: string | null;
  summary: string | null;
  isResolved: boolean;
  category: string | null;
  severity: string | null;
  contractorType: string | null;
  estimatedCost: unknown;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostUsd: string | null;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
}

export interface MessageItem {
  id: string;
  role: string;
  encryption: {
    scope: string;
    keyVersion: number;
    algorithm: string;
    isEncrypted: boolean;
  };
  encryptedContent: string | null;
  contentIv: string | null;
  content: string;
  attachments: unknown;
  model: string | null;
  metadata: unknown;
  createdAt: string;
}

export interface CreateConversationInput {
  type?: string;
  groupId?: string;
  wrappedConversationKey: string;
  publicKeyFingerprint: string;
  wrapAlgorithm?: string;
  encryptedTitle?: string;
  titleIv?: string;
}

export interface EncryptMessageInput {
  conversationId: string;
  messageId: string;
  encryptedContent: string;
  contentIv: string;
  encryptionScope?: EncryptionScope;
  keyVersion?: number;
  algorithm?: string;
}

export interface EncryptConversationInput {
  conversationId: string;
  encryptedTitle?: string;
  titleIv?: string;
  encryptedSummary?: string;
  summaryIv?: string;
  encryptionScope?: EncryptionScope;
  keyVersion?: number;
  algorithm?: string;
}

export interface BatchEncryptMessagesInput {
  conversationId: string;
  messages: Array<{
    messageId: string;
    encryptedContent: string;
    contentIv: string;
  }>;
  encryptionScope?: EncryptionScope;
  keyVersion?: number;
  algorithm?: string;
}

