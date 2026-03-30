/**
 * Advanced encryption tests
 * Covers: message encryption/decryption, conversation keys, group key sharing,
 *         key rotation, missing key handling
 *
 * NOTE: lib/encryption/client.ts uses the Web Crypto API (SubtleCrypto).
 * jsdom provides a partial crypto implementation but may lack subtle.
 * We inject webcrypto.subtle when needed.
 */

// ---- Setup Web Crypto in jsdom environment --------------------------------

import { webcrypto } from "crypto";

// jsdom's crypto object exists but may lack .subtle
// Inject the real Node webcrypto.subtle into the jsdom crypto object
beforeAll(() => {
  if (!globalThis.crypto?.subtle) {
    Object.defineProperty(globalThis, "crypto", {
      value: webcrypto,
      writable: true,
      configurable: true,
    });
  }
});

// ---- Tests ---------------------------------------------------------------

describe("encrypted message storage", () => {
  it("encrypts message content before storing in DB", async () => {
    const {
      encryptText,
      generateMasterKey,
      exportKey,
    } = await import("@/lib/encryption/client");

    const key = await generateMasterKey();
    const { ciphertext, iv } = await encryptText("Hello, this is a secret message", key);

    // Ciphertext should not be plaintext
    expect(ciphertext).not.toContain("Hello");
    expect(ciphertext).toBeTruthy();
    expect(iv).toBeTruthy();
  });

  it("decrypts message content when reading from DB", async () => {
    const { encryptText, decryptText, generateMasterKey } = await import(
      "@/lib/encryption/client"
    );

    const key = await generateMasterKey();
    const plaintext = "This is the original message content";
    const encrypted = await encryptText(plaintext, key);
    const decrypted = await decryptText(encrypted, key);

    expect(decrypted).toBe(plaintext);
  });

  it("uses different IV for each encryption", async () => {
    const { encryptText, generateMasterKey } = await import("@/lib/encryption/client");

    const key = await generateMasterKey();
    const msg = "Same message";
    const enc1 = await encryptText(msg, key);
    const enc2 = await encryptText(msg, key);

    // Same plaintext should produce different IVs (random IV per encryption)
    expect(enc1.iv).not.toBe(enc2.iv);
    // But different ciphertexts due to different IVs
    expect(enc1.ciphertext).not.toBe(enc2.ciphertext);
  });

  it("handles missing conversation key gracefully", async () => {
    const { decryptText, importKey, base64ToArrayBuffer } = await import(
      "@/lib/encryption/client"
    );

    // Try to decrypt with a wrong key — should throw
    const wrongKeyData = crypto.getRandomValues(new Uint8Array(32));
    const wrongKey = await importKey(wrongKeyData.buffer);
    const { encryptText, generateMasterKey } = await import("@/lib/encryption/client");

    const realKey = await generateMasterKey();
    const encrypted = await encryptText("Secret content", realKey);

    // Decrypting with wrong key should fail
    await expect(decryptText(encrypted, wrongKey)).rejects.toThrow();
  });
});

describe("group key sharing", () => {
  it("shares conversation key with group members (exportKey / importKey round-trip)", async () => {
    const { generateMasterKey, exportKey, importKey } = await import(
      "@/lib/encryption/client"
    );

    // Creator generates key
    const originalKey = await generateMasterKey();

    // Export for sharing with member
    const exportedKeyData = await exportKey(originalKey);

    // Member imports the key
    const importedKey = await importKey(exportedKeyData);

    // Both keys should encrypt/decrypt the same data
    const { encryptText, decryptText } = await import("@/lib/encryption/client");
    const msg = "Shared group message";
    const encrypted = await encryptText(msg, originalKey);
    const decrypted = await decryptText(encrypted, importedKey);

    expect(decrypted).toBe(msg);
  });

  it("group member can decrypt messages with shared key", async () => {
    const { generateMasterKey, exportKey, importKey, encryptText, decryptText } =
      await import("@/lib/encryption/client");

    const groupKey = await generateMasterKey();

    // Message encrypted with group key
    const groupMessage = "Important group decision update";
    const encrypted = await encryptText(groupMessage, groupKey);

    // Export key, simulate sharing with member
    const keyData = await exportKey(groupKey);
    const memberKey = await importKey(keyData);

    // Member can decrypt
    const decrypted = await decryptText(encrypted, memberKey);
    expect(decrypted).toBe(groupMessage);
  });

  it("key rotation generates new key and re-encrypts", async () => {
    const { generateMasterKey, encryptText, decryptText, exportKey, importKey } =
      await import("@/lib/encryption/client");

    // Old key
    const oldKey = await generateMasterKey();
    const msg = "Message with old key";
    const oldEncrypted = await encryptText(msg, oldKey);

    // Key rotation: new key
    const newKey = await generateMasterKey();
    const newKeyData = await exportKey(newKey);

    // Re-encrypt with new key
    const decryptedMsg = await decryptText(oldEncrypted, oldKey);
    const newEncrypted = await encryptText(decryptedMsg, newKey);

    // Verify decryption with new key works
    const importedNewKey = await importKey(newKeyData);
    const reDecrypted = await decryptText(newEncrypted, importedNewKey);
    expect(reDecrypted).toBe(msg);

    // Old ciphertext cannot be decrypted with new key
    await expect(decryptText(oldEncrypted, newKey)).rejects.toThrow();
  });

  it("removed member cannot decrypt new messages (key rotation prevents access)", async () => {
    const { generateMasterKey, encryptText, decryptText } = await import(
      "@/lib/encryption/client"
    );

    // Old key that removed member has
    const oldKey = await generateMasterKey();

    // After removal: group uses new key for new messages
    const newKey = await generateMasterKey();
    const newMessage = "New message after member removal";
    const newEncrypted = await encryptText(newMessage, newKey);

    // Removed member tries to decrypt with old key — should fail
    await expect(decryptText(newEncrypted, oldKey)).rejects.toThrow();
  });

  it("encryptText produces base64-encoded ciphertext and iv", async () => {
    const { generateMasterKey, encryptText } = await import("@/lib/encryption/client");

    const key = await generateMasterKey();
    const result = await encryptText("Test message", key);

    // Both should be base64 strings
    expect(() => atob(result.ciphertext)).not.toThrow();
    expect(() => atob(result.iv)).not.toThrow();
  });

  it("generateMasterKey produces a CryptoKey with correct algorithm", async () => {
    const { generateMasterKey } = await import("@/lib/encryption/client");

    const key = await generateMasterKey();
    expect(key.type).toBe("secret");
    expect(key.algorithm.name).toBe("AES-GCM");
    expect(key.extractable).toBe(true);
  });

  it("encryptTextFields and decryptTextFields are symmetric", async () => {
    const { generateMasterKey, encryptTextFields, decryptTextFields } = await import(
      "@/lib/encryption/client"
    );

    const key = await generateMasterKey();
    const fields = { title: "Leaky Faucet", description: "Under kitchen sink" };

    const encrypted = await encryptTextFields(fields, key);
    const decrypted = await decryptTextFields(encrypted, key);

    expect(decrypted.title).toBe(fields.title);
    expect(decrypted.description).toBe(fields.description);
  });
});
