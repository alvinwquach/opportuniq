"use client";

/**
 * Hook for managing the user's encryption key.
 * Key is fetched once from server and cached in memory for the session.
 */

import { useCallback, useRef } from "react";
import { importKey, base64ToArrayBuffer } from "@/lib/encryption";
import { getEncryptionKey as getEncryptionKeyAction } from "@/app/actions/encryption";

export function useEncryptionKey() {
  // Cache key in memory - avoids refetching on every encrypt/decrypt
  const cachedKeyRef = useRef<CryptoKey | null>(null);

  const getEncryptionKey = useCallback(async (): Promise<CryptoKey> => {
    // Return cached key if we already have it
    if (cachedKeyRef.current) {
      return cachedKeyRef.current;
    }

    // Fetch key from server (stored encrypted at rest)
    const result = await getEncryptionKeyAction();

    if ("error" in result) {
      throw new Error(result.error);
    }

    // Convert base64 string to CryptoKey object for WebCrypto API
    const keyData = base64ToArrayBuffer(result.key);
    const cryptoKey = await importKey(keyData);

    // Cache for future operations in this session
    cachedKeyRef.current = cryptoKey;

    return cryptoKey;
  }, []);

  return { getEncryptionKey };
}
