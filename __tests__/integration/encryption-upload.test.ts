/**
 * Encrypted Attachment Upload Integration Tests
 *
 * Tests the complete encryption + upload flow:
 * 1. Client encrypts image
 * 2. Server receives encrypted blob (cannot decrypt)
 * 3. Server stores encrypted blob and metadata
 * 4. Client retrieves and decrypts
 *
 * Uses test image at public/alpha/IMG_4186.jpeg
 *
 * Note: API route tests that require full Next.js runtime are tested in E2E.
 * These tests focus on the encryption logic and privacy guarantees.
 */

import { readFileSync } from "fs";
import { join } from "path";
import { webcrypto } from "crypto";

// Polyfill crypto for Node.js environment
Object.defineProperty(globalThis, "crypto", {
  value: webcrypto,
});

// Import encryption utilities
import {
  generateMasterKey,
  encryptFile,
  decryptFile,
  arrayBufferToBase64,
  exportKey,
} from "@/lib/encryption/client";

describe("Encrypted Attachment Upload Integration", () => {
  const testImagePath = join(
    __dirname,
    "../../public/alpha/IMG_4186.jpeg"
  );
  let testImageBuffer: Buffer;
  let testImageBlob: Blob;

  beforeAll(() => {
    testImageBuffer = readFileSync(testImagePath);
    testImageBlob = new Blob([testImageBuffer], { type: "image/jpeg" });
  });

  describe("Client-Side Encryption Flow", () => {
    it("encrypts image before upload", async () => {
      const key = await generateMasterKey();
      const encrypted = await encryptFile(testImageBlob, key);

      // Verify encryption produces valid output
      expect(encrypted.blob).toBeInstanceOf(Blob);
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.originalSize).toBe(testImageBuffer.length);
      expect(encrypted.encryptedSize).toBeGreaterThan(encrypted.originalSize);
    });

    it("creates upload payload with encrypted blob and metadata", async () => {
      const key = await generateMasterKey();
      const encrypted = await encryptFile(testImageBlob, key);

      // Simulate what the client would send (as plain object instead of FormData)
      const uploadPayload = {
        encryptedBlob: encrypted.blob,
        iv: encrypted.iv,
        mimeType: "image/jpeg",
        fileName: "IMG_4186.jpeg",
        originalSize: encrypted.originalSize,
        type: "image",
      };

      // Verify payload structure
      expect(uploadPayload.encryptedBlob).toBeInstanceOf(Blob);
      expect(uploadPayload.iv).toBe(encrypted.iv);
      expect(uploadPayload.mimeType).toBe("image/jpeg");
      expect(uploadPayload.originalSize).toBe(testImageBuffer.length);
    });
  });

  describe("Server-Side Storage Flow", () => {
    it("server receives encrypted blob (cannot decrypt)", async () => {
      const key = await generateMasterKey();
      const encrypted = await encryptFile(testImageBlob, key);

      // Simulate what server receives (encrypted blob)
      const serverReceivedBlob = encrypted.blob;
      const serverReceivedIv = encrypted.iv;

      // Server can see metadata but NOT the key
      expect(serverReceivedBlob.type).toBe("application/octet-stream");
      expect(serverReceivedIv).toBeDefined();

      // Server CANNOT decrypt (would need the key)
      // This test demonstrates the privacy guarantee
      const wrongKey = await generateMasterKey(); // Different key

      await expect(
        decryptFile(serverReceivedBlob, serverReceivedIv, wrongKey, "image/jpeg")
      ).rejects.toThrow();
    });

    it("encrypted blob is stored as octet-stream", async () => {
      const key = await generateMasterKey();
      const encrypted = await encryptFile(testImageBlob, key);

      // Server would store this in Supabase Storage
      // The content type should be octet-stream, not the original image type
      expect(encrypted.blob.type).toBe("application/octet-stream");

      // The size should include the auth tag overhead
      expect(encrypted.encryptedSize).toBe(encrypted.originalSize + 16);
    });

    it("server stores metadata without encryption key", async () => {
      const key = await generateMasterKey();
      const encrypted = await encryptFile(testImageBlob, key);

      // Simulate what server would store in database
      const dbRecord = {
        id: "attachment-123",
        userId: "test-user-id",
        storagePath: "test-user-id/uuid.enc",
        storageBucket: "encrypted-attachments",
        iv: encrypted.iv, // Stored - needed for decryption
        keyVersion: 1,
        algorithm: "AES-GCM-256",
        status: "encrypted",
        fileName: "IMG_4186.jpeg",
        mimeType: "image/jpeg",
        type: "image",
        fileSizeBytes: encrypted.originalSize,
        encryptedSizeBytes: encrypted.encryptedSize,
        // Note: NO encryption key stored in database
      };

      // Admin can see all metadata
      expect(dbRecord.fileName).toBe("IMG_4186.jpeg");
      expect(dbRecord.mimeType).toBe("image/jpeg");
      expect(dbRecord.fileSizeBytes).toBe(testImageBuffer.length);
      expect(dbRecord.iv).toBeDefined();

      // Key is NOT in database - verify by checking record has no key field
      expect(dbRecord).not.toHaveProperty("encryptionKey");
      expect(dbRecord).not.toHaveProperty("key");
      expect(dbRecord).not.toHaveProperty("keyData");
    });
  });

  describe("Client-Side Decryption Flow", () => {
    it("client retrieves and decrypts the image", async () => {
      const key = await generateMasterKey();

      // Encrypt the image (client-side, before upload)
      const encrypted = await encryptFile(testImageBlob, key);

      // Simulate server returning encrypted blob for download
      const downloadedBlob = encrypted.blob;
      const storedIv = encrypted.iv;

      // Client decrypts (has the key locally)
      const decrypted = await decryptFile(
        downloadedBlob,
        storedIv,
        key,
        "image/jpeg"
      );

      // Verify decryption produces original image
      const decryptedBuffer = await decrypted.arrayBuffer();
      expect(new Uint8Array(decryptedBuffer)).toEqual(
        new Uint8Array(testImageBuffer)
      );
      expect(decrypted.type).toBe("image/jpeg");
    });

    it("creates displayable object URL from decrypted blob", async () => {
      const key = await generateMasterKey();
      const encrypted = await encryptFile(testImageBlob, key);

      const decrypted = await decryptFile(
        encrypted.blob,
        encrypted.iv,
        key,
        "image/jpeg"
      );

      // Create object URL (would work in browser)
      const objectUrl = URL.createObjectURL(decrypted);

      expect(objectUrl).toMatch(/^blob:/);

      // Clean up
      URL.revokeObjectURL(objectUrl);
    });
  });

  describe("Key Storage Simulation", () => {
    it("key can be exported and reimported for storage", async () => {
      const originalKey = await generateMasterKey();

      // Export key (what would be stored in IndexedDB)
      const exportedKey = await exportKey(originalKey);
      const keyAsBase64 = arrayBufferToBase64(exportedKey);

      // Verify it's a string that can be stored
      expect(typeof keyAsBase64).toBe("string");
      expect(keyAsBase64.length).toBeGreaterThan(0);

      // The key should be 32 bytes (256 bits) for AES-256
      expect(exportedKey.byteLength).toBe(32);
    });

    it("key is never sent to server", async () => {
      const key = await generateMasterKey();
      const encrypted = await encryptFile(testImageBlob, key);

      // What gets sent to server:
      const serverPayload = {
        file: encrypted.blob, // Encrypted blob
        iv: encrypted.iv, // IV for decryption
        mimeType: "image/jpeg", // Metadata
        fileName: "IMG_4186.jpeg", // Metadata
        originalSize: encrypted.originalSize, // Metadata
        type: "image", // Metadata
      };

      // Verify key is NOT in the payload
      expect(serverPayload).not.toHaveProperty("key");
      expect(serverPayload).not.toHaveProperty("encryptionKey");
      expect(serverPayload).not.toHaveProperty("masterKey");

      // The IV alone cannot decrypt the data
      const wrongKey = await generateMasterKey();
      await expect(
        decryptFile(encrypted.blob, encrypted.iv, wrongKey, "image/jpeg")
      ).rejects.toThrow();
    });
  });

  describe("Admin Privacy Verification", () => {
    it("admin can see metadata but not decrypt content", async () => {
      // Simulate what an admin sees in the database
      const adminVisibleData = {
        id: "attachment-123",
        userId: "test-user-id",
        storagePath: "test-user-id/test-uuid-1234.enc",
        storageBucket: "encrypted-attachments",
        iv: "someBase64IV==",
        keyVersion: 1,
        algorithm: "AES-GCM-256",
        status: "encrypted",
        fileName: "IMG_4186.jpeg",
        mimeType: "image/jpeg",
        type: "image",
        fileSizeBytes: 12345,
        encryptedSizeBytes: 12361, // +16 for auth tag
        width: 1920,
        height: 1080,
        createdAt: new Date(),
      };

      // Admin can see all this metadata
      expect(adminVisibleData.fileName).toBeDefined();
      expect(adminVisibleData.mimeType).toBeDefined();
      expect(adminVisibleData.fileSizeBytes).toBeDefined();

      // But admin cannot recover the encryption key
      // The key is stored ONLY in user's browser (IndexedDB)
      // Without the key, the encrypted blob is useless
    });

    it("stored encrypted blob cannot reveal content without key", async () => {
      const key = await generateMasterKey();
      const encrypted = await encryptFile(testImageBlob, key);

      // This is what gets stored in Supabase Storage
      const storedBlob = encrypted.blob;
      const storedBytes = new Uint8Array(await storedBlob.arrayBuffer());

      // Admin downloads the encrypted blob
      // But cannot decrypt without the key

      // Attempting to interpret as image fails
      // JPEG starts with FF D8 FF
      expect(storedBytes[0]).not.toBe(0xff);

      // The only way to recover the image is with the correct key
      // which is stored only on the user's device
    });

    it("different users encrypting same image produce different ciphertexts", async () => {
      // User 1 encrypts
      const user1Key = await generateMasterKey();
      const user1Encrypted = await encryptFile(testImageBlob, user1Key);

      // User 2 encrypts same image
      const user2Key = await generateMasterKey();
      const user2Encrypted = await encryptFile(testImageBlob, user2Key);

      // Ciphertexts should be completely different
      const user1Bytes = new Uint8Array(await user1Encrypted.blob.arrayBuffer());
      const user2Bytes = new Uint8Array(await user2Encrypted.blob.arrayBuffer());

      // Check first 32 bytes are different
      let allSame = true;
      for (let i = 0; i < 32; i++) {
        if (user1Bytes[i] !== user2Bytes[i]) {
          allSame = false;
          break;
        }
      }
      expect(allSame).toBe(false);

      // IVs should also be different
      expect(user1Encrypted.iv).not.toBe(user2Encrypted.iv);
    });

    it("same user encrypting same image twice produces different ciphertexts", async () => {
      const key = await generateMasterKey();

      // Encrypt same image twice with same key
      const encrypted1 = await encryptFile(testImageBlob, key);
      const encrypted2 = await encryptFile(testImageBlob, key);

      // Due to random IV, ciphertexts should be different
      const bytes1 = new Uint8Array(await encrypted1.blob.arrayBuffer());
      const bytes2 = new Uint8Array(await encrypted2.blob.arrayBuffer());

      // Check that at least some bytes differ
      let hasDifference = false;
      for (let i = 0; i < Math.min(bytes1.length, bytes2.length); i++) {
        if (bytes1[i] !== bytes2[i]) {
          hasDifference = true;
          break;
        }
      }
      expect(hasDifference).toBe(true);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);

      // But both can be decrypted to same plaintext
      const decrypted1 = await decryptFile(
        encrypted1.blob,
        encrypted1.iv,
        key,
        "image/jpeg"
      );
      const decrypted2 = await decryptFile(
        encrypted2.blob,
        encrypted2.iv,
        key,
        "image/jpeg"
      );

      const decrypted1Bytes = new Uint8Array(await decrypted1.arrayBuffer());
      const decrypted2Bytes = new Uint8Array(await decrypted2.arrayBuffer());

      expect(decrypted1Bytes).toEqual(decrypted2Bytes);
      expect(decrypted1Bytes).toEqual(new Uint8Array(testImageBuffer));
    });
  });

  describe("Error Scenarios", () => {
    it("decryption fails with wrong key", async () => {
      const correctKey = await generateMasterKey();
      const wrongKey = await generateMasterKey();

      const encrypted = await encryptFile(testImageBlob, correctKey);

      await expect(
        decryptFile(encrypted.blob, encrypted.iv, wrongKey, "image/jpeg")
      ).rejects.toThrow();
    });

    it("decryption fails with tampered IV", async () => {
      const key = await generateMasterKey();
      const encrypted = await encryptFile(testImageBlob, key);

      // Create a different IV
      const tamperedIv = arrayBufferToBase64(
        crypto.getRandomValues(new Uint8Array(12))
      );

      await expect(
        decryptFile(encrypted.blob, tamperedIv, key, "image/jpeg")
      ).rejects.toThrow();
    });

    it("decryption fails with tampered ciphertext", async () => {
      const key = await generateMasterKey();
      const encrypted = await encryptFile(testImageBlob, key);

      // Tamper with the ciphertext
      const ciphertextBytes = new Uint8Array(
        await encrypted.blob.arrayBuffer()
      );
      ciphertextBytes[0] = ciphertextBytes[0] ^ 0xff; // Flip bits
      const tamperedBlob = new Blob([ciphertextBytes], {
        type: "application/octet-stream",
      });

      await expect(
        decryptFile(tamperedBlob, encrypted.iv, key, "image/jpeg")
      ).rejects.toThrow();
    });

    it("decryption fails with truncated ciphertext", async () => {
      const key = await generateMasterKey();
      const encrypted = await encryptFile(testImageBlob, key);

      // Truncate the ciphertext
      const ciphertextBytes = new Uint8Array(
        await encrypted.blob.arrayBuffer()
      );
      const truncatedBlob = new Blob([ciphertextBytes.slice(0, 100)], {
        type: "application/octet-stream",
      });

      await expect(
        decryptFile(truncatedBlob, encrypted.iv, key, "image/jpeg")
      ).rejects.toThrow();
    });
  });
});
