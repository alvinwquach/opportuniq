"use client";

/**
 * EncryptedImage Component
 *
 * Displays an encrypted image by fetching and decrypting it client-side.
 * Shows a loading state while decrypting.
 */

import { useState, useEffect } from "react";
import Image from "next/image";
import { IoLockClosed, IoImageOutline } from "react-icons/io5";

interface EncryptedImageProps {
  /** Attachment ID for encrypted images */
  attachmentId?: string;
  /** Direct URL for non-encrypted images (base64 or regular URL) */
  url?: string;
  /** MIME type of the image */
  mimeType: string;
  /** Alt text for the image */
  alt?: string;
  /** Decrypt function from useEncryptedAttachments */
  onDecrypt?: (attachmentId: string) => Promise<string | null>;
  /** Cached decrypted URL */
  cachedUrl?: string;
  /** CSS class for the container */
  className?: string;
}

export function EncryptedImage({
  attachmentId,
  url,
  mimeType,
  alt = "Uploaded image",
  onDecrypt,
  cachedUrl,
  className = "",
}: EncryptedImageProps) {
  const [decryptedUrl, setDecryptedUrl] = useState<string | null>(cachedUrl || null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if this is an encrypted image
  const isEncrypted = !!attachmentId && !url?.startsWith("data:");

  useEffect(() => {
    // If we have a direct URL (base64 or regular), use it
    if (url && !isEncrypted) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDecryptedUrl(url);
      return;
    }

    // If we have a cached URL, use it
    if (cachedUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDecryptedUrl(cachedUrl);
      return;
    }

    // If encrypted and we have a decrypt function, decrypt it
    if (isEncrypted && attachmentId && onDecrypt && !decryptedUrl) {
      setIsDecrypting(true);
      setError(null);

      onDecrypt(attachmentId)
        .then((decrypted) => {
          if (decrypted) {
            setDecryptedUrl(decrypted);
          } else {
            setError("Failed to decrypt image");
          }
        })
        .catch((err) => {
          console.error("[EncryptedImage] Decryption error:", err);
          setError("Decryption failed");
        })
        .finally(() => {
          setIsDecrypting(false);
        });
    }
  }, [attachmentId, url, isEncrypted, onDecrypt, cachedUrl, decryptedUrl]);

  // Loading state while decrypting
  if (isDecrypting) {
    return (
      <div className={`flex items-center justify-center bg-[#2a2a2a] rounded-lg p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-pulse flex items-center justify-center mb-2">
            <IoLockClosed className="w-6 h-6 text-[#5eead4]" />
          </div>
          <p className="text-xs text-[#888888]">Decrypting...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex items-center justify-center bg-[#2a2a2a] rounded-lg p-8 ${className}`}>
        <div className="text-center">
          <IoImageOutline className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  // No URL available
  if (!decryptedUrl) {
    return (
      <div className={`flex items-center justify-center bg-[#2a2a2a] rounded-lg p-8 ${className}`}>
        <div className="text-center">
          <IoLockClosed className="w-6 h-6 text-[#888888] mx-auto mb-2" />
          <p className="text-xs text-[#888888]">Encrypted image</p>
        </div>
      </div>
    );
  }

  // Display decrypted image
  return (
    <div className={`relative ${className}`}>
      <Image
        src={decryptedUrl}
        alt={alt}
        width={400}
        height={300}
        className="max-w-full rounded-lg mb-2 w-auto h-auto"
        unoptimized
      />
      {/* Encrypted indicator */}
      {isEncrypted && (
        <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5" title="End-to-end encrypted">
          <IoLockClosed className="w-3 h-3 text-[#5eead4]" />
        </div>
      )}
    </div>
  );
}
