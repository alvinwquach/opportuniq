/**
 * Encryption Module
 *
 * Client-side encryption utilities for OpportunIQ.
 * All encryption happens in the browser - server never sees plaintext.
 *
 * Uses AES-256-GCM for content encryption with symmetric keys.
 */

// ============================================
// KEY MANAGEMENT
// ============================================

export {
  generateMasterKey,
  generateDerivedKey,
  deriveKeyFromPassword,
  exportKey,
  importKey,
  encryptMasterKey,
  decryptMasterKey,
} from "./client";

// ============================================
// CONTENT ENCRYPTION (AES-256-GCM)
// ============================================

export {
  // AES-256-GCM encryption
  encrypt,
  decrypt,
  encryptFile,
  decryptFile,

  // Text encryption
  encryptText,
  decryptText,
  encryptTextFields,
  decryptTextFields,

  // Image encryption
  encryptImageForUpload,
  decryptImageForDisplay,
  revokeImageUrl,

  // Video encryption
  encryptVideoForUpload,
  decryptVideoForPlayback,
  revokeVideoUrl,

  // Utilities
  generateIV,
  generateSalt,
  generateRandomBytes,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  base64ToUint8Array,
  uint8ArrayToBase64,
} from "./client";

// ============================================
// TYPES
// ============================================

export type {
  EncryptedData,
  EncryptedBlob,
  EncryptedText,
  DerivedKeyResult,
} from "./client";
