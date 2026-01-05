/**
 * Client-Side Encryption Utilities
 *
 * End-to-end encryption for attachments using WebCrypto API.
 * All encryption/decryption happens in the browser - server never sees plaintext.
 *
 * ALGORITHM: AES-GCM-256
 * - 256-bit key (32 bytes)
 * - 96-bit IV (12 bytes) - random per file
 * - 128-bit authentication tag (included in ciphertext)
 *
 * KEY DERIVATION: PBKDF2
 * - SHA-256 hash function
 * - Configurable iterations (default 100,000)
 * - 128-bit salt (16 bytes) - random per user
 */

// ============================================
// CONSTANTS
// ============================================

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for AES-GCM
const SALT_LENGTH = 16; // 128 bits
const DEFAULT_ITERATIONS = 100000;

// ============================================
// TYPES
// ============================================

export interface EncryptedData {
  /** Base64-encoded ciphertext (includes auth tag) */
  ciphertext: string;
  /** Base64-encoded initialization vector */
  iv: string;
  /** Encryption algorithm used */
  algorithm: string;
}

export interface EncryptedBlob {
  /** Encrypted file as Blob */
  blob: Blob;
  /** Base64-encoded initialization vector */
  iv: string;
  /** Original file size in bytes */
  originalSize: number;
  /** Encrypted file size in bytes */
  encryptedSize: number;
}

export interface DerivedKeyResult {
  /** The derived CryptoKey */
  key: CryptoKey;
  /** Base64-encoded salt used */
  salt: string;
  /** Number of PBKDF2 iterations */
  iterations: number;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Convert ArrayBuffer to Base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 string to ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generate cryptographically random bytes
 */
export function generateRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Generate a random IV for AES-GCM (12 bytes)
 */
export function generateIV(): Uint8Array {
  return generateRandomBytes(IV_LENGTH);
}

/**
 * Generate a random salt for PBKDF2 (16 bytes)
 */
export function generateSalt(): Uint8Array {
  return generateRandomBytes(SALT_LENGTH);
}

// ============================================
// KEY GENERATION
// ============================================

/**
 * Generate a new random AES-256 master key
 * Used when creating a new group/household
 */
export async function generateMasterKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    true, // extractable (needed to encrypt/export)
    ["encrypt", "decrypt"]
  );
}

/**
 * Export a CryptoKey to raw bytes (for encryption with password)
 */
export async function exportKey(key: CryptoKey): Promise<ArrayBuffer> {
  return crypto.subtle.exportKey("raw", key);
}

/**
 * Import raw bytes as a CryptoKey
 */
export async function importKey(keyData: ArrayBuffer): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    keyData,
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ["encrypt", "decrypt"]
  );
}

// ============================================
// KEY DERIVATION (Password-Based)
// ============================================

/**
 * Derive an encryption key from a password using PBKDF2
 *
 * @param password - User's password (never sent to server)
 * @param salt - Random salt (stored in memberKeyShares)
 * @param iterations - PBKDF2 iterations (stored in memberKeyShares)
 */
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array,
  iterations: number = DEFAULT_ITERATIONS
): Promise<CryptoKey> {
  // Import password as key material
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  // Derive AES key from password
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt.buffer as ArrayBuffer,
      iterations,
      hash: "SHA-256",
    },
    passwordKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ["encrypt", "decrypt"]
  );
}

/**
 * Generate a new key derived from password with random salt
 * Used when setting up encryption for a new user
 */
export async function generateDerivedKey(
  password: string,
  iterations: number = DEFAULT_ITERATIONS
): Promise<DerivedKeyResult> {
  const salt = generateSalt();
  const key = await deriveKeyFromPassword(password, salt, iterations);

  return {
    key,
    salt: arrayBufferToBase64(salt.buffer as ArrayBuffer),
    iterations,
  };
}

// ============================================
// ENCRYPTION
// ============================================

/**
 * Encrypt data with AES-GCM
 *
 * @param data - Data to encrypt (ArrayBuffer)
 * @param key - AES-256 key
 * @returns Encrypted data with IV
 */
export async function encrypt(
  data: ArrayBuffer,
  key: CryptoKey
): Promise<EncryptedData> {
  const iv = generateIV();

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv: iv as Uint8Array<ArrayBuffer> },
    key,
    data
  );

  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
    algorithm: `${ALGORITHM}-${KEY_LENGTH}`,
  };
}

/**
 * Encrypt a file (Blob/File) for upload
 *
 * @param file - File to encrypt
 * @param key - AES-256 key (group master key)
 * @returns Encrypted blob with metadata
 */
export async function encryptFile(
  file: Blob,
  key: CryptoKey
): Promise<EncryptedBlob> {
  const iv = generateIV();
  const fileData = await file.arrayBuffer();

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv: iv as Uint8Array<ArrayBuffer> },
    key,
    fileData
  );

  return {
    blob: new Blob([ciphertext], { type: "application/octet-stream" }),
    iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
    originalSize: file.size,
    encryptedSize: ciphertext.byteLength,
  };
}

/**
 * Encrypt a master key with a password-derived key
 * Used to store encrypted master key in memberKeyShares
 */
export async function encryptMasterKey(
  masterKey: CryptoKey,
  passwordKey: CryptoKey
): Promise<EncryptedData> {
  const rawKey = await exportKey(masterKey);
  return encrypt(rawKey, passwordKey);
}

// ============================================
// DECRYPTION
// ============================================

/**
 * Decrypt data with AES-GCM
 *
 * @param encryptedData - Encrypted data with IV
 * @param key - AES-256 key
 * @returns Decrypted data as ArrayBuffer
 */
export async function decrypt(
  encryptedData: EncryptedData,
  key: CryptoKey
): Promise<ArrayBuffer> {
  const ciphertext = base64ToArrayBuffer(encryptedData.ciphertext);
  const iv = base64ToArrayBuffer(encryptedData.iv);

  return crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext
  );
}

/**
 * Decrypt a file blob
 *
 * @param encryptedBlob - Encrypted file blob
 * @param iv - Base64-encoded IV
 * @param key - AES-256 key
 * @param mimeType - Original MIME type for the decrypted blob
 * @returns Decrypted file as Blob
 */
export async function decryptFile(
  encryptedBlob: Blob,
  iv: string,
  key: CryptoKey,
  mimeType: string = "application/octet-stream"
): Promise<Blob> {
  const ciphertext = await encryptedBlob.arrayBuffer();
  const ivBuffer = base64ToArrayBuffer(iv);

  const plaintext = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: ivBuffer },
    key,
    ciphertext
  );

  return new Blob([plaintext], { type: mimeType });
}

/**
 * Decrypt a master key using password-derived key
 */
export async function decryptMasterKey(
  encryptedKey: EncryptedData,
  passwordKey: CryptoKey
): Promise<CryptoKey> {
  const rawKey = await decrypt(encryptedKey, passwordKey);
  return importKey(rawKey);
}

// ============================================
// HIGH-LEVEL API FOR CHAT ATTACHMENTS
// ============================================

/**
 * Encrypt an image file for chat upload
 * Returns encrypted blob ready for Supabase Storage upload
 */
export async function encryptImageForUpload(
  imageFile: File,
  masterKey: CryptoKey
): Promise<{
  encryptedBlob: Blob;
  iv: string;
  originalSize: number;
  encryptedSize: number;
  mimeType: string;
  fileName: string;
}> {
  const result = await encryptFile(imageFile, masterKey);

  return {
    encryptedBlob: result.blob,
    iv: result.iv,
    originalSize: result.originalSize,
    encryptedSize: result.encryptedSize,
    mimeType: imageFile.type,
    fileName: imageFile.name,
  };
}

/**
 * Decrypt an image from Supabase Storage for display
 */
export async function decryptImageForDisplay(
  encryptedBlob: Blob,
  iv: string,
  mimeType: string,
  masterKey: CryptoKey
): Promise<string> {
  const decryptedBlob = await decryptFile(encryptedBlob, iv, masterKey, mimeType);

  // Create object URL for display
  return URL.createObjectURL(decryptedBlob);
}

/**
 * Clean up object URL when done displaying
 */
export function revokeImageUrl(url: string): void {
  URL.revokeObjectURL(url);
}

// ============================================
// VIDEO ENCRYPTION
// ============================================

/**
 * Encrypt a video file for chat upload
 * Returns encrypted blob ready for Supabase Storage upload
 */
export async function encryptVideoForUpload(
  videoBlob: Blob,
  masterKey: CryptoKey,
  metadata?: {
    mimeType?: string;
    fileName?: string;
  }
): Promise<{
  encryptedBlob: Blob;
  iv: string;
  originalSize: number;
  encryptedSize: number;
  mimeType: string;
  fileName: string;
}> {
  const result = await encryptFile(videoBlob, masterKey);

  return {
    encryptedBlob: result.blob,
    iv: result.iv,
    originalSize: result.originalSize,
    encryptedSize: result.encryptedSize,
    mimeType: metadata?.mimeType || "video/mp4",
    fileName: metadata?.fileName || "video.mp4",
  };
}

/**
 * Decrypt a video from Supabase Storage for playback
 */
export async function decryptVideoForPlayback(
  encryptedBlob: Blob,
  iv: string,
  mimeType: string,
  masterKey: CryptoKey
): Promise<string> {
  const decryptedBlob = await decryptFile(encryptedBlob, iv, masterKey, mimeType);

  // Create object URL for playback
  return URL.createObjectURL(decryptedBlob);
}

/**
 * Clean up video object URL when done
 */
export function revokeVideoUrl(url: string): void {
  URL.revokeObjectURL(url);
}
