/**
 * Encryption Module
 *
 * Client-side E2EE utilities for OpportunIQ.
 * All encryption happens in the browser - server never sees plaintext.
 *
 * Keys are stored server-side (encrypted at rest) for cross-device access.
 * See /api/encryption/key for key management.
 */

// Core encryption functions
export {
  // Key generation
  generateMasterKey,
  generateDerivedKey,
  deriveKeyFromPassword,
  exportKey,
  importKey,

  // Encryption
  encrypt,
  encryptFile,
  encryptMasterKey,
  encryptImageForUpload,
  encryptVideoForUpload,

  // Decryption
  decrypt,
  decryptFile,
  decryptMasterKey,
  decryptImageForDisplay,
  revokeImageUrl,
  decryptVideoForPlayback,
  revokeVideoUrl,

  // Utilities
  generateIV,
  generateSalt,
  generateRandomBytes,
  arrayBufferToBase64,
  base64ToArrayBuffer,

  // Types
  type EncryptedData,
  type EncryptedBlob,
  type DerivedKeyResult,
} from "./client";
