"use client";

/**
 * COMMENT ENCRYPTION HOOK
 *
 * Provides client-side encryption/decryption for issue comments.
 *
 * NOTE: This hook only has one encrypted field (content), so the data-driven
 * field mapping approach used in other hooks would add overhead without benefit.
 * A simple direct approach is cleaner here.
 */

import { useState, useCallback } from "react";
import { encryptText, decryptText } from "@/lib/encryption";
import { useEncryptionKey } from "@/hooks/encrypted-financials/useEncryptionKey";
import type {
  EncryptedCommentInput,
  DecryptedComment,
  RawComment,
} from "./types";

export function useCommentEncryption() {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getEncryptionKey } = useEncryptionKey();

  /**
   * Encrypt comment content before sending to server
   */
  const encryptCommentData = useCallback(
    async (content: string): Promise<EncryptedCommentInput> => {
      setIsEncrypting(true);
      setError(null);

      try {
        const key = await getEncryptionKey();
        const encrypted = await encryptText(content, key);

        return {
          encryptedContent: encrypted.ciphertext,
          contentIv: encrypted.iv,
          keyVersion: 1,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Encryption failed";
        setError(message);
        throw err;
      } finally {
        setIsEncrypting(false);
      }
    },
    [getEncryptionKey]
  );

  /**
   * Decrypt comment for display
   */
  const decryptComment = useCallback(
    async (comment: RawComment): Promise<DecryptedComment> => {
      setIsDecrypting(true);
      setError(null);

      try {
        const key = await getEncryptionKey();

        if (comment.isEncrypted && comment.encryptedContent && comment.contentIv) {
          const content = await decryptText(
            { ciphertext: comment.encryptedContent, iv: comment.contentIv },
            key
          );

          return {
            id: comment.id,
            issueId: comment.issueId,
            userId: comment.userId,
            content,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
          };
        } else {
          return {
            id: comment.id,
            issueId: comment.issueId,
            userId: comment.userId,
            content: comment.content || "",
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
          };
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Decryption failed";
        setError(message);
        throw err;
      } finally {
        setIsDecrypting(false);
      }
    },
    [getEncryptionKey]
  );

  /**
   * Decrypt multiple comments
   */
  const decryptComments = useCallback(
    async (comments: RawComment[]): Promise<DecryptedComment[]> => {
      setIsDecrypting(true);
      setError(null);

      try {
        const key = await getEncryptionKey();
        const decrypted: DecryptedComment[] = [];

        for (const comment of comments) {
          if (comment.isEncrypted && comment.encryptedContent && comment.contentIv) {
            const content = await decryptText(
              { ciphertext: comment.encryptedContent, iv: comment.contentIv },
              key
            );

            decrypted.push({
              id: comment.id,
              issueId: comment.issueId,
              userId: comment.userId,
              content,
              createdAt: comment.createdAt,
              updatedAt: comment.updatedAt,
            });
          } else {
            decrypted.push({
              id: comment.id,
              issueId: comment.issueId,
              userId: comment.userId,
              content: comment.content || "",
              createdAt: comment.createdAt,
              updatedAt: comment.updatedAt,
            });
          }
        }

        return decrypted;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Decryption failed";
        setError(message);
        throw err;
      } finally {
        setIsDecrypting(false);
      }
    },
    [getEncryptionKey]
  );

  return {
    encryptCommentData,
    decryptComment,
    decryptComments,
    isEncrypting,
    isDecrypting,
    error,
  };
}
