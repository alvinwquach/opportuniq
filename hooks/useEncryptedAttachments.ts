"use client";

/**
 * useEncryptedAttachments Hook
 *
 * Handles encryption, upload, and decryption of attachments.
 * All encryption/decryption happens client-side using WebCrypto.
 *
 * Keys are stored server-side (encrypted at rest) for cross-device access.
 * Key is fetched once per session and cached in memory.
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
} from "@/lib/encryption";

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

interface AttachmentMetadata {
  id: string;
  iv: string;
  mimeType: string;
  fileName: string | null;
  originalSize: number;
  keyVersion: number;
  downloadUrl: string;
}

export function useEncryptedAttachments(userId: string, groupId?: string | null) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Cache the CryptoKey in memory for the session
  const cachedKeyRef = useRef<CryptoKey | null>(null);

  /**
   * Get encryption key from server (cached in memory for session)
   * Key is stored server-side for cross-device access
   */
  const getEncryptionKey = useCallback(async (): Promise<CryptoKey> => {
    // Return cached key if available
    if (cachedKeyRef.current) {
      return cachedKeyRef.current;
    }

    // Fetch key from server
    const response = await fetch("/api/encryption/key");

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch encryption key");
    }

    const { key: base64Key } = await response.json();

    // Import the key for use with WebCrypto
    const keyData = base64ToArrayBuffer(base64Key);
    const cryptoKey = await importKey(keyData);

    // Cache for future use in this session
    cachedKeyRef.current = cryptoKey;

    console.log("[Encryption] Fetched and cached encryption key from server");

    return cryptoKey;
  }, []);

  /**
   * Encrypt and upload an image file
   */
  const uploadEncryptedImage = useCallback(
    async (file: File): Promise<UploadResult> => {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      try {
        // Get encryption key
        setUploadProgress(10);
        const key = await getEncryptionKey();

        // Encrypt the file
        setUploadProgress(30);
        const encrypted = await encryptImageForUpload(file, key);

        // Create form data for upload
        const formData = new FormData();
        formData.append("file", encrypted.encryptedBlob);
        formData.append("iv", encrypted.iv);
        formData.append("mimeType", encrypted.mimeType);
        formData.append("fileName", encrypted.fileName);
        formData.append("originalSize", encrypted.originalSize.toString());
        formData.append("type", "image");

        if (groupId) {
          formData.append("groupId", groupId);
        }

        // Get image dimensions
        const dimensions = await getImageDimensions(file);
        if (dimensions) {
          formData.append("width", dimensions.width.toString());
          formData.append("height", dimensions.height.toString());
        }

        // Upload to server
        setUploadProgress(50);
        const response = await fetch("/api/attachments/upload", {
          method: "POST",
          body: formData,
        });

        setUploadProgress(90);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const data = await response.json();
        setUploadProgress(100);

        return data.attachment as UploadResult;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Upload failed";
        setError(errorMessage);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [getEncryptionKey, groupId]
  );

  /**
   * Encrypt and upload a video file
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
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      try {
        // Get encryption key
        setUploadProgress(10);
        const key = await getEncryptionKey();

        // Encrypt the video
        setUploadProgress(30);
        const encrypted = await encryptVideoForUpload(videoBlob, key, {
          mimeType: metadata.mimeType,
          fileName: metadata.fileName,
        });

        // Create form data for upload
        const formData = new FormData();
        formData.append("file", encrypted.encryptedBlob);
        formData.append("iv", encrypted.iv);
        formData.append("mimeType", encrypted.mimeType);
        formData.append("fileName", encrypted.fileName);
        formData.append("originalSize", encrypted.originalSize.toString());
        formData.append("type", "video");

        if (groupId) {
          formData.append("groupId", groupId);
        }

        // Add video-specific metadata
        if (metadata.durationSeconds !== undefined) {
          formData.append("durationSeconds", metadata.durationSeconds.toString());
        }
        if (metadata.width !== undefined) {
          formData.append("width", metadata.width.toString());
        }
        if (metadata.height !== undefined) {
          formData.append("height", metadata.height.toString());
        }

        // Upload to server
        setUploadProgress(50);
        const response = await fetch("/api/attachments/upload", {
          method: "POST",
          body: formData,
        });

        setUploadProgress(90);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const data = await response.json();
        setUploadProgress(100);

        return data.attachment as VideoUploadResult;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Upload failed";
        setError(errorMessage);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [getEncryptionKey, groupId]
  );

  /**
   * Decrypt and display an attachment
   * Returns an object URL that can be used in <img src>
   */
  const decryptAttachment = useCallback(
    async (attachmentId: string): Promise<string> => {
      setError(null);

      try {
        // Get attachment metadata and download URL
        const response = await fetch(`/api/attachments/upload?id=${attachmentId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to get attachment");
        }

        const { attachment } = (await response.json()) as { attachment: AttachmentMetadata };

        // Download encrypted blob
        const blobResponse = await fetch(attachment.downloadUrl);
        if (!blobResponse.ok) {
          throw new Error("Failed to download attachment");
        }

        const encryptedBlob = await blobResponse.blob();

        // Get decryption key
        const key = await getEncryptionKey();

        // Decrypt and create object URL
        const decryptedUrl = await decryptImageForDisplay(
          encryptedBlob,
          attachment.iv,
          attachment.mimeType,
          key
        );

        return decryptedUrl;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Decryption failed";
        setError(errorMessage);
        throw err;
      }
    },
    [getEncryptionKey]
  );

  /**
   * Decrypt a video attachment
   * Returns an object URL that can be used in <video src>
   */
  const decryptVideo = useCallback(
    async (attachmentId: string): Promise<string> => {
      setError(null);

      try {
        // Get attachment metadata and download URL
        const response = await fetch(`/api/attachments/upload?id=${attachmentId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to get attachment");
        }

        const { attachment } = (await response.json()) as { attachment: AttachmentMetadata };

        // Download encrypted blob
        const blobResponse = await fetch(attachment.downloadUrl);
        if (!blobResponse.ok) {
          throw new Error("Failed to download attachment");
        }

        const encryptedBlob = await blobResponse.blob();

        // Get decryption key
        const key = await getEncryptionKey();

        // Decrypt and create object URL
        const decryptedUrl = await decryptVideoForPlayback(
          encryptedBlob,
          attachment.iv,
          attachment.mimeType,
          key
        );

        return decryptedUrl;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Decryption failed";
        setError(errorMessage);
        throw err;
      }
    },
    [getEncryptionKey]
  );

  /**
   * Clean up decrypted image URL
   */
  const cleanupDecryptedUrl = useCallback((url: string) => {
    revokeImageUrl(url);
  }, []);

  /**
   * Clean up decrypted video URL
   */
  const cleanupVideoUrl = useCallback((url: string) => {
    revokeVideoUrl(url);
  }, []);

  return {
    uploadEncryptedImage,
    uploadEncryptedVideo,
    decryptAttachment,
    decryptVideo,
    cleanupDecryptedUrl,
    cleanupVideoUrl,
    isUploading,
    uploadProgress,
    error,
  };
}

/**
 * Helper to get image dimensions
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve(null);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.src = url;
  });
}
