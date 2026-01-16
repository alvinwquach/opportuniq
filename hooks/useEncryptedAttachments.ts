"use client";

/**
 * useEncryptedAttachments Hook
 *
 * Handles encryption, upload, and decryption of attachments AND text content.
 * All encryption/decryption happens client-side using WebCrypto API.
 *
 * ARCHITECTURE:
 * - Keys are stored server-side (encrypted at rest) for cross-device access
 * - Key is fetched once per session and cached in memory (CryptoKey object)
 * - File uploads go to API route (FormData not supported by server actions)
 * - Metadata fetching uses server actions
 *
 * ENCRYPTION ALGORITHM: AES-256-GCM
 * - 256-bit key (32 bytes)
 * - 96-bit IV (12 bytes) - unique per encryption
 * - Authenticated encryption (integrity + confidentiality)
 */

import { useState, useCallback, useRef } from "react";
import {
  encryptImageForUpload,
  decryptImageForDisplay,
  revokeImageUrl,
  encryptVideoForUpload,
  decryptVideoForPlayback,
  revokeVideoUrl,
  importKey,
  base64ToArrayBuffer,
  encryptText,
  decryptText,
  type EncryptedText,
} from "@/lib/encryption";
import {
  getEncryptionKey as getEncryptionKeyAction,
  getAttachmentMetadata,
  type AttachmentMetadata,
} from "@/app/actions/encryption";

// ============================================
// TYPES
// ============================================

interface UploadResult {
  attachmentId: string;
  storagePath: string;
  iv: string;
  mimeType: string;
  originalSize: number;
  encryptedSize: number;
}

interface VideoUploadResult extends UploadResult {
  durationSeconds?: number;
  width?: number;
  height?: number;
}

// ============================================
// MAIN HOOK
// ============================================

/**
 * Hook for encrypted attachment operations
 *
 * PSEUDOCODE (Hook Initialization):
 * 1. Initialize state: isUploading, uploadProgress, error
 * 2. Create ref to cache CryptoKey in memory
 * 3. Return functions for: upload, decrypt, cleanup, text encryption
 *
 * @param userId - Current user's ID (for storage path organization)
 * @param groupId - Optional group ID (for group-shared attachments)
 */
export function useEncryptedAttachments(userId: string, groupId?: string | null) {
  // State for upload progress tracking
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Cache the CryptoKey in memory for the session
  // This avoids refetching the key for every operation
  const cachedKeyRef = useRef<CryptoKey | null>(null);

  // ============================================
  // KEY MANAGEMENT
  // ============================================

  /**
   * Get encryption key from server (cached in memory for session)
   *
   * PSEUDOCODE:
   * 1. Check if key is already cached in ref
   * 2. If cached, return immediately (skip network request)
   * 3. If not cached, call server action to fetch key
   * 4. Check for errors in response
   * 5. Convert base64 key to ArrayBuffer
   * 6. Import ArrayBuffer as CryptoKey (usable with WebCrypto)
   * 7. Cache the CryptoKey in ref for future use
   * 8. Return the CryptoKey
   *
   * NOTE: Key is stored server-side for cross-device access
   * NOTE: CryptoKey object cannot be serialized - must be recreated per session
   */
  const getEncryptionKey = useCallback(async (): Promise<CryptoKey> => {
    // Step 1-2: Return cached key if available
    if (cachedKeyRef.current) {
      return cachedKeyRef.current;
    }

    // Step 3: Fetch key from server using server action
    const result = await getEncryptionKeyAction();

    // Step 4: Check for errors
    if ("error" in result) {
      throw new Error(result.error);
    }

    // Step 5: Convert base64 key to ArrayBuffer
    const keyData = base64ToArrayBuffer(result.key);

    // Step 6: Import as CryptoKey (makes it usable with WebCrypto API)
    const cryptoKey = await importKey(keyData);

    // Step 7: Cache for future use in this session
    cachedKeyRef.current = cryptoKey;

    console.log("[Encryption] Fetched and cached encryption key from server");

    // Step 8: Return the CryptoKey
    return cryptoKey;
  }, []);

  // ============================================
  // IMAGE UPLOAD
  // ============================================

  /**
   * Encrypt and upload an image file
   *
   * PSEUDOCODE:
   * 1. Set uploading state, reset progress and error
   * 2. Get encryption key (from cache or server)
   * 3. Encrypt the file using AES-GCM (generates unique IV)
   * 4. Create FormData with encrypted blob and metadata
   * 5. Get image dimensions for metadata
   * 6. POST to upload API endpoint
   * 7. Handle response (success or error)
   * 8. Reset uploading state
   * 9. Return upload result with attachment ID
   *
   * NOTE: Uses API route (not server action) because FormData with
   *       large files doesn't work well with server actions
   */
  const uploadEncryptedImage = useCallback(
    async (file: File): Promise<UploadResult> => {
      // Step 1: Initialize upload state
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      try {
        // Step 2: Get encryption key (10% progress)
        setUploadProgress(10);
        const key = await getEncryptionKey();

        // Step 3: Encrypt the file (30% progress)
        // This generates a unique IV and encrypts with AES-GCM
        setUploadProgress(30);
        const encrypted = await encryptImageForUpload(file, key);

        // Step 4: Create FormData for upload
        const formData = new FormData();
        formData.append("file", encrypted.encryptedBlob);
        formData.append("iv", encrypted.iv);
        formData.append("mimeType", encrypted.mimeType);
        formData.append("fileName", encrypted.fileName);
        formData.append("originalSize", encrypted.originalSize.toString());
        formData.append("type", "image");

        // Add group ID if this is a group-shared attachment
        if (groupId) {
          formData.append("groupId", groupId);
        }

        // Step 5: Get image dimensions for metadata
        const dimensions = await getImageDimensions(file);
        if (dimensions) {
          formData.append("width", dimensions.width.toString());
          formData.append("height", dimensions.height.toString());
        }

        // Step 6: Upload to server (50% progress)
        setUploadProgress(50);
        const response = await fetch("/api/attachments/upload", {
          method: "POST",
          body: formData,
        });

        setUploadProgress(90);

        // Step 7: Handle response
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const data = await response.json();
        setUploadProgress(100);

        // Step 9: Return upload result
        return data.attachment as UploadResult;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Upload failed";
        setError(errorMessage);
        throw err;
      } finally {
        // Step 8: Reset uploading state
        setIsUploading(false);
      }
    },
    [getEncryptionKey, groupId]
  );

  // ============================================
  // VIDEO UPLOAD
  // ============================================

  /**
   * Encrypt and upload a video file
   *
   * PSEUDOCODE:
   * 1. Set uploading state, reset progress and error
   * 2. Get encryption key (from cache or server)
   * 3. Encrypt the video blob using AES-GCM
   * 4. Create FormData with encrypted blob and metadata
   * 5. Add video-specific metadata (duration, dimensions)
   * 6. POST to upload API endpoint
   * 7. Handle response (success or error)
   * 8. Reset uploading state
   * 9. Return upload result with attachment ID
   *
   * NOTE: Video encryption may take longer due to larger file sizes
   */
  const uploadEncryptedVideo = useCallback(
    async (
      videoBlob: Blob,
      metadata: {
        durationSeconds?: number;
        width?: number;
        height?: number;
        mimeType?: string;
        fileName?: string;
      }
    ): Promise<VideoUploadResult> => {
      // Step 1: Initialize upload state
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      try {
        // Step 2: Get encryption key (10% progress)
        setUploadProgress(10);
        const key = await getEncryptionKey();

        // Step 3: Encrypt the video (30% progress)
        setUploadProgress(30);
        const encrypted = await encryptVideoForUpload(videoBlob, key, {
          mimeType: metadata.mimeType,
          fileName: metadata.fileName,
        });

        // Step 4: Create FormData for upload
        const formData = new FormData();
        formData.append("file", encrypted.encryptedBlob);
        formData.append("iv", encrypted.iv);
        formData.append("mimeType", encrypted.mimeType);
        formData.append("fileName", encrypted.fileName);
        formData.append("originalSize", encrypted.originalSize.toString());
        formData.append("type", "video");

        // Add group ID if this is a group-shared attachment
        if (groupId) {
          formData.append("groupId", groupId);
        }

        // Step 5: Add video-specific metadata
        if (metadata.durationSeconds !== undefined) {
          formData.append("durationSeconds", metadata.durationSeconds.toString());
        }
        if (metadata.width !== undefined) {
          formData.append("width", metadata.width.toString());
        }
        if (metadata.height !== undefined) {
          formData.append("height", metadata.height.toString());
        }

        // Step 6: Upload to server (50% progress)
        setUploadProgress(50);
        const response = await fetch("/api/attachments/upload", {
          method: "POST",
          body: formData,
        });

        setUploadProgress(90);

        // Step 7: Handle response
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const data = await response.json();
        setUploadProgress(100);

        // Step 9: Return upload result
        return data.attachment as VideoUploadResult;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Upload failed";
        setError(errorMessage);
        throw err;
      } finally {
        // Step 8: Reset uploading state
        setIsUploading(false);
      }
    },
    [getEncryptionKey, groupId]
  );

  // ============================================
  // IMAGE DECRYPTION
  // ============================================

  /**
   * Decrypt and display an attachment (image)
   * Returns an object URL that can be used in <img src>
   *
   * PSEUDOCODE:
   * 1. Reset error state
   * 2. Call server action to get attachment metadata (IV, mimeType, downloadUrl)
   * 3. Download encrypted blob from Supabase Storage (signed URL)
   * 4. Get decryption key (from cache or server)
   * 5. Decrypt the blob using AES-GCM with IV from metadata
   * 6. Create object URL from decrypted blob
   * 7. Return object URL for use in <img src>
   *
   * NOTE: Caller must call cleanupDecryptedUrl() when done to prevent memory leaks
   * NOTE: Object URLs consume memory until revoked
   */
  const decryptAttachment = useCallback(
    async (attachmentId: string): Promise<string> => {
      // Step 1: Reset error state
      setError(null);

      try {
        // Step 2: Get attachment metadata using server action
        const result = await getAttachmentMetadata(attachmentId);

        if ("error" in result) {
          throw new Error(result.error);
        }

        const { attachment } = result;

        // Step 3: Download encrypted blob from storage
        const blobResponse = await fetch(attachment.downloadUrl);
        if (!blobResponse.ok) {
          throw new Error("Failed to download attachment");
        }

        const encryptedBlob = await blobResponse.blob();

        // Step 4: Get decryption key
        const key = await getEncryptionKey();

        // Step 5-6: Decrypt and create object URL
        const decryptedUrl = await decryptImageForDisplay(
          encryptedBlob,
          attachment.iv,
          attachment.mimeType,
          key
        );

        // Step 7: Return object URL
        return decryptedUrl;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Decryption failed";
        setError(errorMessage);
        throw err;
      }
    },
    [getEncryptionKey]
  );

  // ============================================
  // VIDEO DECRYPTION
  // ============================================

  /**
   * Decrypt a video attachment
   * Returns an object URL that can be used in <video src>
   *
   * PSEUDOCODE:
   * 1. Reset error state
   * 2. Call server action to get attachment metadata
   * 3. Download encrypted blob from Supabase Storage
   * 4. Get decryption key
   * 5. Decrypt the blob using AES-GCM
   * 6. Create object URL from decrypted blob
   * 7. Return object URL for use in <video src>
   *
   * NOTE: Same as image decryption but uses video-specific decoder
   * NOTE: Caller must call cleanupVideoUrl() when done
   */
  const decryptVideo = useCallback(
    async (attachmentId: string): Promise<string> => {
      // Step 1: Reset error state
      setError(null);

      try {
        // Step 2: Get attachment metadata using server action
        const result = await getAttachmentMetadata(attachmentId);

        if ("error" in result) {
          throw new Error(result.error);
        }

        const { attachment } = result;

        // Step 3: Download encrypted blob from storage
        const blobResponse = await fetch(attachment.downloadUrl);
        if (!blobResponse.ok) {
          throw new Error("Failed to download attachment");
        }

        const encryptedBlob = await blobResponse.blob();

        // Step 4: Get decryption key
        const key = await getEncryptionKey();

        // Step 5-6: Decrypt and create object URL
        const decryptedUrl = await decryptVideoForPlayback(
          encryptedBlob,
          attachment.iv,
          attachment.mimeType,
          key
        );

        // Step 7: Return object URL
        return decryptedUrl;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Decryption failed";
        setError(errorMessage);
        throw err;
      }
    },
    [getEncryptionKey]
  );

  // ============================================
  // CLEANUP FUNCTIONS
  // ============================================

  /**
   * Clean up decrypted image URL
   *
   * PSEUDOCODE:
   * 1. Call URL.revokeObjectURL to free memory
   *
   * WHY NEEDED: Object URLs consume memory until explicitly revoked
   * WHEN TO CALL: When image is no longer displayed (unmount, navigation)
   */
  const cleanupDecryptedUrl = useCallback((url: string) => {
    revokeImageUrl(url);
  }, []);

  /**
   * Clean up decrypted video URL
   *
   * PSEUDOCODE:
   * 1. Call URL.revokeObjectURL to free memory
   *
   * NOTE: Same as image cleanup, separated for semantic clarity
   */
  const cleanupVideoUrl = useCallback((url: string) => {
    revokeVideoUrl(url);
  }, []);

  // ============================================
  // TEXT ENCRYPTION
  // ============================================

  /**
   * Encrypt text content (for messages, titles, etc.)
   * Returns encrypted ciphertext and IV for storage
   *
   * PSEUDOCODE:
   * 1. Reset error state
   * 2. Get encryption key (from cache or server)
   * 3. Call encryptText (generates IV, encrypts with AES-GCM)
   * 4. Return { ciphertext: base64, iv: base64 }
   *
   * USE CASE: Encrypting chat messages before sending to server
   * NOTE: Store both ciphertext AND iv - both needed for decryption
   */
  const encryptMessage = useCallback(
    async (text: string): Promise<EncryptedText> => {
      // Step 1: Reset error state
      setError(null);

      try {
        // Step 2: Get encryption key
        const key = await getEncryptionKey();

        // Step 3-4: Encrypt and return
        return await encryptText(text, key);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Encryption failed";
        setError(errorMessage);
        throw err;
      }
    },
    [getEncryptionKey]
  );

  /**
   * Decrypt text content
   * Returns plaintext string
   *
   * PSEUDOCODE:
   * 1. Reset error state
   * 2. Get decryption key (from cache or server)
   * 3. Call decryptText with ciphertext and IV
   * 4. Return plaintext string
   *
   * USE CASE: Decrypting chat messages for display
   */
  const decryptMessage = useCallback(
    async (encryptedContent: string, iv: string): Promise<string> => {
      // Step 1: Reset error state
      setError(null);

      try {
        // Step 2: Get decryption key
        const key = await getEncryptionKey();

        // Step 3-4: Decrypt and return
        return await decryptText({ ciphertext: encryptedContent, iv }, key);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Decryption failed";
        setError(errorMessage);
        throw err;
      }
    },
    [getEncryptionKey]
  );

  /**
   * Batch decrypt multiple messages
   * Useful for decrypting conversation history efficiently
   *
   * PSEUDOCODE:
   * 1. Reset error state
   * 2. Create empty Map to store results (messageId -> plaintext)
   * 3. Get decryption key ONCE (shared for all messages)
   * 4. For each message:
   *    a. If encrypted (has encryptedContent AND contentIv):
   *       - Decrypt using key and IV
   *       - Store plaintext in Map
   *    b. If not encrypted (legacy message):
   *       - Store content directly in Map
   * 5. Return Map of decrypted messages
   *
   * NOTE: Gets key once, then decrypts all messages (efficient)
   * NOTE: Handles legacy unencrypted messages gracefully
   */
  const decryptMessages = useCallback(
    async (
      messages: Array<{ id: string; encryptedContent: string | null; contentIv: string | null; content: string }>
    ): Promise<Map<string, string>> => {
      // Step 1: Reset error state
      setError(null);

      // Step 2: Create result Map
      const result = new Map<string, string>();

      try {
        // Step 3: Get decryption key ONCE for all messages
        const key = await getEncryptionKey();

        // Step 4: Iterate through messages
        for (const msg of messages) {
          if (msg.encryptedContent && msg.contentIv) {
            // Step 4a: Decrypt encrypted content
            const plaintext = await decryptText(
              { ciphertext: msg.encryptedContent, iv: msg.contentIv },
              key
            );
            result.set(msg.id, plaintext);
          } else {
            // Step 4b: Use plaintext content (legacy/unencrypted message)
            result.set(msg.id, msg.content);
          }
        }

        // Step 5: Return Map
        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Batch decryption failed";
        setError(errorMessage);
        throw err;
      }
    },
    [getEncryptionKey]
  );

  /**
   * Get the raw encryption key for external use (e.g., streaming API calls)
   * Returns base64-encoded key
   *
   * PSEUDOCODE:
   * 1. Call server action to get key
   * 2. Check for errors
   * 3. Return base64-encoded key string
   *
   * USE CASE: Passing key to streaming endpoints that need to encrypt responses
   * NOTE: Returns base64 string, NOT CryptoKey object
   */
  const getEncryptionKeyBase64 = useCallback(async (): Promise<string> => {
    // Step 1: Fetch key using server action
    const result = await getEncryptionKeyAction();

    // Step 2: Check for errors
    if ("error" in result) {
      throw new Error(result.error);
    }

    // Step 3: Return base64 key
    return result.key;
  }, []);

  // ============================================
  // RETURN HOOK API
  // ============================================

  return {
    // Attachment encryption
    uploadEncryptedImage,
    uploadEncryptedVideo,
    decryptAttachment,
    decryptVideo,
    cleanupDecryptedUrl,
    cleanupVideoUrl,
    // Text encryption
    encryptMessage,
    decryptMessage,
    decryptMessages,
    getEncryptionKey,
    getEncryptionKeyBase64,
    // State
    isUploading,
    uploadProgress,
    error,
  };
}

// Re-export EncryptedText type for consumers
export type { EncryptedText };

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Helper to get image dimensions from a File
 *
 * PSEUDOCODE:
 * 1. Check if file is an image (mimeType starts with "image/")
 * 2. If not image, return null
 * 3. Create temporary object URL from file
 * 4. Create Image element and set src to object URL
 * 5. Wait for image to load
 * 6. Extract naturalWidth and naturalHeight
 * 7. Revoke object URL to free memory
 * 8. Return dimensions object
 *
 * NOTE: Uses Image element to get actual pixel dimensions
 * NOTE: Handles errors gracefully (returns null)
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    // Step 1: Check if file is an image
    if (!file.type.startsWith("image/")) {
      resolve(null);
      return;
    }

    // Step 3: Create temporary object URL
    const img = new Image();
    const url = URL.createObjectURL(file);

    // Step 4-6: Load image and extract dimensions
    img.onload = () => {
      URL.revokeObjectURL(url); // Step 7: Clean up
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };

    // Handle errors
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.src = url;
  });
}
