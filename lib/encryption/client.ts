/**
 * Client-Side Encryption Utilities
 *
 * End-to-end encryption for attachments AND text content using WebCrypto API.
 * All encryption/decryption happens in the browser - server never sees plaintext.
 *
 * ENCRYPTION:
 * - Algorithm: AES-256-GCM
 * - 256-bit key (32 bytes)
 * - 96-bit IV (12 bytes) - random per encryption
 * - 128-bit authentication tag (included in ciphertext)
 *
 * KEY MANAGEMENT:
 * - Symmetric key stored server-side (encrypted at rest)
 * - Key fetched once per session and cached client-side
 */

// ============================================
// CONSTANTS
// ============================================

const AES_ALGORITHM = "AES-GCM";
const AES_KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for AES-GCM
const SALT_LENGTH = 16; // 128 bits

// PBKDF2 iterations for key derivation
const DEFAULT_PBKDF2_ITERATIONS = 210000;

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

export interface EncryptedText {
  /** Base64-encoded ciphertext */
  ciphertext: string;
  /** Base64-encoded IV */
  iv: string;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Convert ArrayBuffer to Base64 string
 *
 * PSEUDOCODE:
 * 1. Wrap the ArrayBuffer in a Uint8Array to access individual bytes
 * 2. Loop through each byte and convert to a character (0-255 -> ASCII char)
 * 3. Build a binary string from all characters
 * 4. Use btoa() to encode the binary string as Base64
 * 5. Return the Base64 string
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
 *
 * PSEUDOCODE:
 * 1. Use atob() to decode Base64 string to binary string
 * 2. Create a new Uint8Array with length matching the binary string
 * 3. Loop through each character and get its char code (0-255)
 * 4. Store each char code in the Uint8Array
 * 5. Return the underlying ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer.slice(0);
}

/**
 * Convert Base64 string to Uint8Array
 *
 * PSEUDOCODE:
 * 1. Convert Base64 to ArrayBuffer using base64ToArrayBuffer()
 * 2. Wrap the ArrayBuffer in a Uint8Array
 * 3. Return the Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  return new Uint8Array(base64ToArrayBuffer(base64));
}

/**
 * Convert Uint8Array to Base64 string
 *
 * PSEUDOCODE:
 * 1. Get the underlying ArrayBuffer from the Uint8Array
 * 2. Pass it to arrayBufferToBase64() for conversion
 * 3. Return the Base64 string
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  return arrayBufferToBase64(bytes.buffer.slice(0));
}

/**
 * Generate cryptographically random bytes
 *
 * PSEUDOCODE:
 * 1. Create a new Uint8Array of the requested length
 * 2. Fill it with cryptographically secure random values using Web Crypto API
 * 3. Return the filled array
 */
export function generateRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Generate a random IV for AES-GCM (12 bytes)
 *
 * PSEUDOCODE:
 * 1. Call generateRandomBytes with IV_LENGTH (12 bytes)
 * 2. Return the random bytes as the IV
 *
 * NOTE: IV (Initialization Vector) must be unique for each encryption
 *       with the same key. Using random bytes ensures uniqueness.
 */
export function generateIV(): Uint8Array {
  return generateRandomBytes(IV_LENGTH);
}

/**
 * Generate a random salt (16 bytes)
 *
 * PSEUDOCODE:
 * 1. Call generateRandomBytes with SALT_LENGTH (16 bytes)
 * 2. Return the random bytes as the salt
 *
 * NOTE: Salt is used in password-based key derivation to prevent
 *       rainbow table attacks. Each user should have a unique salt.
 */
export function generateSalt(): Uint8Array {
  return generateRandomBytes(SALT_LENGTH);
}

// ============================================
// KEY GENERATION
// ============================================

/**
 * Generate a new random AES-256 master key
 *
 * PSEUDOCODE:
 * 1. Call Web Crypto API's generateKey() method
 * 2. Specify AES-GCM algorithm with 256-bit key length
 * 3. Make the key extractable (so we can export it for storage)
 * 4. Allow the key to be used for both encrypt and decrypt operations
 * 5. Return the generated CryptoKey object
 */
export async function generateMasterKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    {
      name: AES_ALGORITHM,
      length: AES_KEY_LENGTH,
    },
    true, // extractable
    ["encrypt", "decrypt"]
  );
}

/**
 * Export a CryptoKey to raw bytes
 *
 * PSEUDOCODE:
 * 1. Call Web Crypto API's exportKey() method with "raw" format
 * 2. This extracts the key material as an ArrayBuffer
 * 3. Return the raw key bytes (32 bytes for AES-256)
 *
 * NOTE: Only works if the key was created with extractable=true
 */
export async function exportKey(key: CryptoKey): Promise<ArrayBuffer> {
  return crypto.subtle.exportKey("raw", key);
}

/**
 * Import raw bytes as an AES CryptoKey
 *
 * PSEUDOCODE:
 * 1. Call Web Crypto API's importKey() method
 * 2. Specify "raw" format (we're importing raw key bytes)
 * 3. Pass the key data (ArrayBuffer of 32 bytes)
 * 4. Specify AES-GCM algorithm with 256-bit key length
 * 5. Make it extractable and usable for encrypt/decrypt
 * 6. Return the imported CryptoKey object
 */
export async function importKey(keyData: ArrayBuffer): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    keyData,
    { name: AES_ALGORITHM, length: AES_KEY_LENGTH },
    true,
    ["encrypt", "decrypt"]
  );
}

// ============================================
// KEY DERIVATION (PBKDF2)
// ============================================

/**
 * Derive an encryption key from a password using PBKDF2
 *
 * PSEUDOCODE:
 * 1. Convert password string to bytes using TextEncoder
 * 2. Import password bytes as a "PBKDF2" key (for key derivation)
 * 3. Use deriveKey() to run PBKDF2 algorithm:
 *    a. Mix password with salt (prevents rainbow table attacks)
 *    b. Run many iterations (makes brute force slow)
 *    c. Use SHA-256 hash function
 * 4. Output is an AES-256 key derived from the password
 * 5. Return the derived CryptoKey
 *
 * NOTE: Same password + same salt + same iterations = same key
 *       This allows us to re-derive the key later for decryption
 */
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array,
  iterations: number = DEFAULT_PBKDF2_ITERATIONS
): Promise<CryptoKey> {
  // Step 1-2: Import password as a key derivation key
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  // Step 3-5: Derive the AES key from the password
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt.buffer.slice(0),
      iterations,
      hash: "SHA-256",
    },
    passwordKey,
    { name: AES_ALGORITHM, length: AES_KEY_LENGTH },
    true,
    ["encrypt", "decrypt"]
  );
}

/**
 * Generate a new key derived from password with random salt
 *
 * PSEUDOCODE:
 * 1. Generate a random salt (16 bytes)
 * 2. Derive a key from the password using the salt
 * 3. Return an object containing:
 *    - The derived key (CryptoKey)
 *    - The salt as Base64 (must be stored to re-derive key later)
 *    - The iteration count (must be stored for consistency)
 */
export async function generateDerivedKey(
  password: string,
  iterations: number = DEFAULT_PBKDF2_ITERATIONS
): Promise<DerivedKeyResult> {
  const salt = generateSalt();
  const key = await deriveKeyFromPassword(password, salt, iterations);

  return {
    key,
    salt: arrayBufferToBase64(salt.buffer.slice(0)),
    iterations,
  };
}

// ============================================
// CONTENT ENCRYPTION (AES-256-GCM)
// ============================================

/**
 * Encrypt data with AES-GCM
 *
 * PSEUDOCODE:
 * 1. Generate a random IV (12 bytes) - must be unique per encryption
 * 2. Call Web Crypto API's encrypt() method:
 *    a. Use AES-GCM algorithm with the IV
 *    b. Use the provided encryption key
 *    c. Encrypt the plaintext data
 * 3. Result is ciphertext with authentication tag appended (16 bytes)
 * 4. Convert ciphertext and IV to Base64 for easy storage/transmission
 * 5. Return object with ciphertext, IV, and algorithm identifier
 *
 * NOTE: The IV must be stored alongside ciphertext for decryption
 *       The auth tag ensures data wasn't tampered with
 */
export async function encrypt(
  data: ArrayBuffer,
  key: CryptoKey
): Promise<EncryptedData> {
  const iv = generateIV();

  const ciphertext = await crypto.subtle.encrypt(
    { name: AES_ALGORITHM, iv: new Uint8Array(iv) },
    key,
    data
  );

  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv.buffer.slice(0)),
    algorithm: `${AES_ALGORITHM}-${AES_KEY_LENGTH}`,
  };
}

/**
 * Decrypt data with AES-GCM
 *
 * PSEUDOCODE:
 * 1. Convert Base64 ciphertext back to ArrayBuffer
 * 2. Convert Base64 IV back to ArrayBuffer
 * 3. Call Web Crypto API's decrypt() method:
 *    a. Use AES-GCM algorithm with the original IV
 *    b. Use the same key that was used for encryption
 *    c. Pass the ciphertext (includes auth tag)
 * 4. Web Crypto verifies auth tag - throws error if tampered
 * 5. Return the decrypted plaintext as ArrayBuffer
 *
 * NOTE: Will throw an error if:
 *       - Wrong key is used
 *       - IV doesn't match
 *       - Ciphertext was modified (auth tag check fails)
 */
export async function decrypt(
  encryptedData: EncryptedData,
  key: CryptoKey
): Promise<ArrayBuffer> {
  const ciphertext = base64ToArrayBuffer(encryptedData.ciphertext);
  const iv = base64ToArrayBuffer(encryptedData.iv);

  return crypto.subtle.decrypt(
    { name: AES_ALGORITHM, iv },
    key,
    ciphertext
  );
}

/**
 * Encrypt a file (Blob/File) for upload
 *
 * PSEUDOCODE:
 * 1. Generate a random IV for this file
 * 2. Read the file contents as an ArrayBuffer
 * 3. Encrypt the file data using AES-GCM with the IV and key
 * 4. Create a new Blob from the ciphertext with generic type
 * 5. Return object containing:
 *    - Encrypted blob (ready for upload)
 *    - IV as Base64 (store in database)
 *    - Original size (metadata)
 *    - Encrypted size (original + 16 byte auth tag)
 */
export async function encryptFile(
  file: Blob,
  key: CryptoKey
): Promise<EncryptedBlob> {
  const iv = generateIV();
  const fileData = await file.arrayBuffer();

  const ciphertext = await crypto.subtle.encrypt(
    { name: AES_ALGORITHM, iv: new Uint8Array(iv) },
    key,
    fileData
  );

  return {
    blob: new Blob([ciphertext], { type: "application/octet-stream" }),
    iv: arrayBufferToBase64(iv.buffer.slice(0)),
    originalSize: file.size,
    encryptedSize: ciphertext.byteLength,
  };
}

/**
 * Decrypt a file blob
 *
 * PSEUDOCODE:
 * 1. Read the encrypted blob as an ArrayBuffer
 * 2. Convert the Base64 IV back to ArrayBuffer
 * 3. Decrypt using AES-GCM with the IV and key
 * 4. Create a new Blob with the decrypted data
 * 5. Set the correct MIME type on the decrypted blob
 * 6. Return the decrypted blob (ready for display/download)
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
    { name: AES_ALGORITHM, iv: ivBuffer },
    key,
    ciphertext
  );

  return new Blob([plaintext], { type: mimeType });
}

/**
 * Encrypt a master key with a password-derived key
 *
 * PSEUDOCODE:
 * 1. Export the master key to raw bytes
 * 2. Encrypt those bytes using the password-derived key
 * 3. Return the encrypted key data
 *
 * USE CASE: Protecting the master key when storing it
 */
export async function encryptMasterKey(
  masterKey: CryptoKey,
  passwordKey: CryptoKey
): Promise<EncryptedData> {
  const rawKey = await exportKey(masterKey);
  return encrypt(rawKey, passwordKey);
}

/**
 * Decrypt a master key using password-derived key
 *
 * PSEUDOCODE:
 * 1. Decrypt the encrypted key data using password-derived key
 * 2. Import the decrypted bytes as a CryptoKey
 * 3. Return the recovered master key
 *
 * USE CASE: Recovering the master key from storage
 */
export async function decryptMasterKey(
  encryptedKey: EncryptedData,
  passwordKey: CryptoKey
): Promise<CryptoKey> {
  const rawKey = await decrypt(encryptedKey, passwordKey);
  return importKey(rawKey);
}

// ============================================
// TEXT ENCRYPTION
// ============================================

/**
 * Encrypt text content (for chat messages, titles, etc.)
 *
 * PSEUDOCODE:
 * 1. Generate a random IV for this text
 * 2. Convert text string to bytes using TextEncoder (UTF-8)
 * 3. Encrypt the bytes using AES-GCM
 * 4. Convert ciphertext and IV to Base64 strings
 * 5. Return object with Base64 ciphertext and IV
 */
export async function encryptText(
  text: string,
  key: CryptoKey
): Promise<EncryptedText> {
  const iv = generateIV();
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  const ciphertext = await crypto.subtle.encrypt(
    { name: AES_ALGORITHM, iv: new Uint8Array(iv) },
    key,
    data
  );

  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv.buffer.slice(0)),
  };
}

/**
 * Decrypt text content
 *
 * PSEUDOCODE:
 * 1. Convert Base64 ciphertext to ArrayBuffer
 * 2. Convert Base64 IV to ArrayBuffer
 * 3. Decrypt using AES-GCM
 * 4. Convert decrypted bytes back to string using TextDecoder (UTF-8)
 * 5. Return the original text string
 */
export async function decryptText(
  encryptedText: EncryptedText,
  key: CryptoKey
): Promise<string> {
  const ciphertext = base64ToArrayBuffer(encryptedText.ciphertext);
  const iv = base64ToArrayBuffer(encryptedText.iv);

  const plaintext = await crypto.subtle.decrypt(
    { name: AES_ALGORITHM, iv },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(plaintext);
}

/**
 * Batch encrypt multiple text fields
 *
 * PSEUDOCODE:
 * 1. Create an empty result object
 * 2. Loop through each field in the input object:
 *    a. If the field value is not null/undefined, encrypt it
 *    b. If the field value is null/undefined, set result to null
 * 3. Return object with same keys but encrypted values
 *
 * USE CASE: Encrypting multiple fields at once (title, summary, etc.)
 */
export async function encryptTextFields<T extends Record<string, string | null | undefined>>(
  fields: T,
  key: CryptoKey
): Promise<Record<keyof T, EncryptedText | null>> {
  const result = {} as Record<keyof T, EncryptedText | null>;

  for (const [fieldName, value] of Object.entries(fields)) {
    if (value) {
      result[fieldName as keyof T] = await encryptText(value, key);
    } else {
      result[fieldName as keyof T] = null;
    }
  }

  return result;
}

/**
 * Batch decrypt multiple text fields
 *
 * PSEUDOCODE:
 * 1. Create an empty result object
 * 2. Loop through each field in the input object:
 *    a. If the field has encrypted data, decrypt it
 *    b. If the field is null, set result to null
 * 3. Return object with same keys but decrypted string values
 */
export async function decryptTextFields<T extends Record<string, EncryptedText | null>>(
  fields: T,
  key: CryptoKey
): Promise<Record<keyof T, string | null>> {
  const result = {} as Record<keyof T, string | null>;

  for (const [fieldName, encryptedValue] of Object.entries(fields)) {
    if (encryptedValue) {
      result[fieldName as keyof T] = await decryptText(encryptedValue, key);
    } else {
      result[fieldName as keyof T] = null;
    }
  }

  return result;
}

// ============================================
// HIGH-LEVEL API FOR CHAT ATTACHMENTS
// ============================================

/**
 * Encrypt an image file for chat upload
 *
 * PSEUDOCODE:
 * 1. Call encryptFile() to encrypt the image data
 * 2. Return enriched object with:
 *    - Encrypted blob (for upload to storage)
 *    - IV (for database storage)
 *    - Size metadata (original and encrypted)
 *    - Original MIME type (for later decryption)
 *    - Original filename (for display)
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
 *
 * PSEUDOCODE:
 * 1. Decrypt the blob using decryptFile()
 * 2. Create an Object URL from the decrypted blob
 * 3. Return the URL (can be used in <img src="...">)
 *
 * NOTE: Remember to call revokeImageUrl() when done to free memory
 */
export async function decryptImageForDisplay(
  encryptedBlob: Blob,
  iv: string,
  mimeType: string,
  masterKey: CryptoKey
): Promise<string> {
  const decryptedBlob = await decryptFile(encryptedBlob, iv, masterKey, mimeType);
  return URL.createObjectURL(decryptedBlob);
}

/**
 * Clean up object URL when done displaying
 *
 * PSEUDOCODE:
 * 1. Call URL.revokeObjectURL() to release the blob memory
 *
 * NOTE: Always call this when the image is no longer needed
 *       to prevent memory leaks
 */
export function revokeImageUrl(url: string): void {
  URL.revokeObjectURL(url);
}

// ============================================
// VIDEO ENCRYPTION
// ============================================

/**
 * Encrypt a video file for chat upload
 *
 * PSEUDOCODE:
 * 1. Call encryptFile() to encrypt the video data
 * 2. Return enriched object with:
 *    - Encrypted blob (for upload)
 *    - IV (for database)
 *    - Size metadata
 *    - MIME type (from metadata or default to video/mp4)
 *    - Filename (from metadata or default)
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
 *
 * PSEUDOCODE:
 * 1. Decrypt the blob using decryptFile()
 * 2. Create an Object URL from the decrypted blob
 * 3. Return the URL (can be used in <video src="...">)
 *
 * NOTE: Remember to call revokeVideoUrl() when done to free memory
 */
export async function decryptVideoForPlayback(
  encryptedBlob: Blob,
  iv: string,
  mimeType: string,
  masterKey: CryptoKey
): Promise<string> {
  const decryptedBlob = await decryptFile(encryptedBlob, iv, masterKey, mimeType);
  return URL.createObjectURL(decryptedBlob);
}

/**
 * Clean up video object URL when done
 *
 * PSEUDOCODE:
 * 1. Call URL.revokeObjectURL() to release the blob memory
 */
export function revokeVideoUrl(url: string): void {
  URL.revokeObjectURL(url);
}
