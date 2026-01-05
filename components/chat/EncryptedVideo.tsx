"use client";


import { useState, useEffect } from "react";
import { IoLockClosed, IoVideocamOutline, IoPlay } from "react-icons/io5";

interface EncryptedVideoProps {
  /** Attachment ID for encrypted videos */
  attachmentId?: string;
  /** Direct URL for non-encrypted videos */
  url?: string;
  /** MIME type of the video */
  mimeType: string;
  /** Decrypt function from useEncryptedAttachments */
  onDecrypt?: (attachmentId: string) => Promise<string | null>;
  /** Cached decrypted URL */
  cachedUrl?: string;
  /** CSS class for the container */
  className?: string;
}

export function EncryptedVideo({
  attachmentId,
  url,
  mimeType,
  onDecrypt,
  cachedUrl,
  className = "",
}: EncryptedVideoProps) {
  const [decryptedUrl, setDecryptedUrl] = useState<string | null>(cachedUrl || null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if this is an encrypted video
  const isEncrypted = !!attachmentId && !url?.startsWith("data:");

  useEffect(() => {
    // If we have a direct URL, use it
    if (url && !isEncrypted) {
      setDecryptedUrl(url);
      return;
    }

    // If we have a cached URL, use it
    if (cachedUrl) {
      setDecryptedUrl(cachedUrl);
      return;
    }

    // If encrypted and we have a decrypt function, decrypt it
    if (isEncrypted && attachmentId && onDecrypt && !decryptedUrl) {
      setIsDecrypting(true);
      setError(null);

      console.log("[EncryptedVideo] Starting decryption for:", attachmentId);

      onDecrypt(attachmentId)
        .then((decrypted) => {
          if (decrypted) {
            console.log("[EncryptedVideo] Decryption successful");
            setDecryptedUrl(decrypted);
          } else {
            console.error("[EncryptedVideo] Decryption returned null");
            setError("Failed to decrypt video");
          }
        })
        .catch((err) => {
          console.error("[EncryptedVideo] Decryption error:", err);
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
          <p className="text-xs text-[#888888]">Decrypting video...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex items-center justify-center bg-[#2a2a2a] rounded-lg p-8 ${className}`}>
        <div className="text-center">
          <IoVideocamOutline className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  // No URL available - show placeholder
  if (!decryptedUrl) {
    return (
      <div className={`flex items-center justify-center bg-[#2a2a2a] rounded-lg p-8 ${className}`}>
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-2">
            <IoVideocamOutline className="w-12 h-12 text-[#888888]" />
            <IoLockClosed className="w-4 h-4 text-[#5eead4] absolute -bottom-1 -right-1" />
          </div>
          <p className="text-xs text-[#888888]">Encrypted video</p>
        </div>
      </div>
    );
  }

  // Display decrypted video
  return (
    <div className={`relative ${className}`}>
      <video
        src={decryptedUrl}
        controls
        playsInline
        className="max-w-full rounded-lg mb-2 w-auto h-auto max-h-[300px]"
        style={{ maxWidth: "400px" }}
      >
        <source src={decryptedUrl} type={mimeType || "video/mp4"} />
        Your browser does not support the video tag.
      </video>
      {isEncrypted && (
        <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5" title="End-to-end encrypted">
          <IoLockClosed className="w-3 h-3 text-[#5eead4]" />
        </div>
      )}
    </div>
  );
}
