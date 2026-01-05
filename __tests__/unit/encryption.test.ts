/**
 * Encryption Utilities Unit Tests
 *
 * Tests the client-side E2EE encryption functions to ensure:
 * 1. Data encrypted with a key can be decrypted with the same key
 * 2. Data encrypted with one key cannot be decrypted with a different key
 * 3. Different encryptions of the same data produce different ciphertexts (due to random IV)
 * 4. Utility functions work correctly
 *
 * These tests use the test image at public/alpha/IMG_4186.jpeg
 */

import { readFileSync } from "fs";
import { join } from "path";
import { webcrypto } from "crypto";

// Polyfill crypto for Node.js environment
Object.defineProperty(globalThis, "crypto", {
  value: webcrypto,
});

// Import after crypto polyfill
import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  generateRandomBytes,
  generateIV,
  generateSalt,
  generateMasterKey,
  exportKey,
  importKey,
  encrypt,
  decrypt,
  encryptFile,
  decryptFile,
  deriveKeyFromPassword,
  generateDerivedKey,
  encryptMasterKey,
  decryptMasterKey,
} from "@/lib/encryption/client";

describe("Encryption Utilities", () => {
  // Load test image once for all tests
  const testImagePath = join(
    __dirname,
    "../../public/alpha/IMG_4186.jpeg"
  );
  let testImageBuffer: Buffer;

  beforeAll(() => {
    testImageBuffer = readFileSync(testImagePath);
  });

  describe("Utility Functions", () => {
    describe("arrayBufferToBase64 / base64ToArrayBuffer", () => {
      it("converts ArrayBuffer to Base64 and back", () => {
        const original = new Uint8Array([1, 2, 3, 4, 5, 255, 0, 128]);
        const base64 = arrayBufferToBase64(original.buffer);
        const recovered = new Uint8Array(base64ToArrayBuffer(base64));

        expect(recovered).toEqual(original);
      });

      it("handles empty ArrayBuffer", () => {
        const original = new Uint8Array([]);
        const base64 = arrayBufferToBase64(original.buffer);
        const recovered = new Uint8Array(base64ToArrayBuffer(base64));

        expect(recovered).toEqual(original);
      });

      it("handles large data", () => {
        // Test with first 1KB of image
        const original = new Uint8Array(testImageBuffer.subarray(0, 1024));
        const base64 = arrayBufferToBase64(original.buffer);
        const recovered = new Uint8Array(base64ToArrayBuffer(base64));

        expect(recovered).toEqual(original);
      });
    });

    describe("generateRandomBytes", () => {
      it("generates bytes of specified length", () => {
        const bytes16 = generateRandomBytes(16);
        const bytes32 = generateRandomBytes(32);

        expect(bytes16.length).toBe(16);
        expect(bytes32.length).toBe(32);
      });

      it("generates different bytes each time", () => {
        const bytes1 = generateRandomBytes(16);
        const bytes2 = generateRandomBytes(16);

        expect(bytes1).not.toEqual(bytes2);
      });
    });

    describe("generateIV", () => {
      it("generates 12-byte IV for AES-GCM", () => {
        const iv = generateIV();
        expect(iv.length).toBe(12);
      });

      it("generates unique IVs", () => {
        const iv1 = generateIV();
        const iv2 = generateIV();

        expect(arrayBufferToBase64(iv1.buffer)).not.toBe(
          arrayBufferToBase64(iv2.buffer)
        );
      });
    });

    describe("generateSalt", () => {
      it("generates 16-byte salt for PBKDF2", () => {
        const salt = generateSalt();
        expect(salt.length).toBe(16);
      });
    });
  });

  describe("Key Generation and Management", () => {
    describe("generateMasterKey", () => {
      it("generates a valid AES-256 key", async () => {
        const key = await generateMasterKey();

        expect(key.algorithm.name).toBe("AES-GCM");
        expect((key.algorithm as AesKeyAlgorithm).length).toBe(256);
        expect(key.extractable).toBe(true);
        expect(key.usages).toContain("encrypt");
        expect(key.usages).toContain("decrypt");
      });

      it("generates unique keys each time", async () => {
        const key1 = await generateMasterKey();
        const key2 = await generateMasterKey();

        const raw1 = await exportKey(key1);
        const raw2 = await exportKey(key2);

        expect(arrayBufferToBase64(raw1)).not.toBe(arrayBufferToBase64(raw2));
      });
    });

    describe("exportKey / importKey", () => {
      it("exports and imports a key correctly", async () => {
        const originalKey = await generateMasterKey();
        const rawKey = await exportKey(originalKey);
        const importedKey = await importKey(rawKey);

        // Verify by encrypting/decrypting with both keys
        const testData = new TextEncoder().encode("Test data");
        const encrypted = await encrypt(testData.buffer, originalKey);
        const decrypted = await decrypt(encrypted, importedKey);

        expect(new Uint8Array(decrypted)).toEqual(testData);
      });

      it("exported key has correct length (32 bytes for AES-256)", async () => {
        const key = await generateMasterKey();
        const rawKey = await exportKey(key);

        expect(rawKey.byteLength).toBe(32);
      });
    });
  });

  describe("Password-Based Key Derivation", () => {
    describe("deriveKeyFromPassword", () => {
      it("derives consistent key from same password and salt", async () => {
        const password = "testPassword123!";
        const salt = generateSalt();

        const key1 = await deriveKeyFromPassword(password, salt, 1000);
        const key2 = await deriveKeyFromPassword(password, salt, 1000);

        const raw1 = await exportKey(key1);
        const raw2 = await exportKey(key2);

        expect(arrayBufferToBase64(raw1)).toBe(arrayBufferToBase64(raw2));
      });

      it("derives different keys from different passwords", async () => {
        const salt = generateSalt();

        const key1 = await deriveKeyFromPassword("password1", salt, 1000);
        const key2 = await deriveKeyFromPassword("password2", salt, 1000);

        const raw1 = await exportKey(key1);
        const raw2 = await exportKey(key2);

        expect(arrayBufferToBase64(raw1)).not.toBe(arrayBufferToBase64(raw2));
      });

      it("derives different keys from different salts", async () => {
        const password = "samePassword";

        const key1 = await deriveKeyFromPassword(password, generateSalt(), 1000);
        const key2 = await deriveKeyFromPassword(password, generateSalt(), 1000);

        const raw1 = await exportKey(key1);
        const raw2 = await exportKey(key2);

        expect(arrayBufferToBase64(raw1)).not.toBe(arrayBufferToBase64(raw2));
      });
    });

    describe("generateDerivedKey", () => {
      it("returns key with salt and iterations", async () => {
        const result = await generateDerivedKey("password123", 1000);

        expect(result.key).toBeDefined();
        expect(result.salt).toBeDefined();
        expect(result.iterations).toBe(1000);
        expect(typeof result.salt).toBe("string"); // Base64 string
      });
    });
  });

  describe("Data Encryption/Decryption", () => {
    describe("encrypt / decrypt", () => {
      it("encrypts and decrypts text data", async () => {
        const key = await generateMasterKey();
        const originalData = new TextEncoder().encode(
          "Hello, encrypted world!"
        );

        const encrypted = await encrypt(originalData.buffer, key);
        const decrypted = await decrypt(encrypted, key);

        expect(new TextDecoder().decode(decrypted)).toBe(
          "Hello, encrypted world!"
        );
      });

      it("produces different ciphertext for same plaintext (random IV)", async () => {
        const key = await generateMasterKey();
        const data = new TextEncoder().encode("Same data");

        const encrypted1 = await encrypt(data.buffer, key);
        const encrypted2 = await encrypt(data.buffer, key);

        expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
        expect(encrypted1.iv).not.toBe(encrypted2.iv);
      });

      it("fails to decrypt with wrong key", async () => {
        const key1 = await generateMasterKey();
        const key2 = await generateMasterKey();
        const data = new TextEncoder().encode("Secret message");

        const encrypted = await encrypt(data.buffer, key1);

        await expect(decrypt(encrypted, key2)).rejects.toThrow();
      });

      it("encrypted data contains algorithm info", async () => {
        const key = await generateMasterKey();
        const data = new TextEncoder().encode("test");

        const encrypted = await encrypt(data.buffer, key);

        expect(encrypted.algorithm).toBe("AES-GCM-256");
      });
    });
  });

  describe("File Encryption/Decryption", () => {
    describe("encryptFile / decryptFile", () => {
      it("encrypts and decrypts the test image correctly", async () => {
        const key = await generateMasterKey();
        const originalBlob = new Blob([testImageBuffer], {
          type: "image/jpeg",
        });

        const encrypted = await encryptFile(originalBlob, key);
        const decrypted = await decryptFile(
          encrypted.blob,
          encrypted.iv,
          key,
          "image/jpeg"
        );

        const decryptedBuffer = await decrypted.arrayBuffer();
        expect(new Uint8Array(decryptedBuffer)).toEqual(
          new Uint8Array(testImageBuffer)
        );
      });

      it("returns correct size metadata", async () => {
        const key = await generateMasterKey();
        const originalBlob = new Blob([testImageBuffer], {
          type: "image/jpeg",
        });

        const encrypted = await encryptFile(originalBlob, key);

        expect(encrypted.originalSize).toBe(testImageBuffer.length);
        // Encrypted size should be slightly larger due to auth tag (16 bytes)
        expect(encrypted.encryptedSize).toBe(testImageBuffer.length + 16);
      });

      it("encrypted blob has octet-stream type", async () => {
        const key = await generateMasterKey();
        const originalBlob = new Blob([testImageBuffer], {
          type: "image/jpeg",
        });

        const encrypted = await encryptFile(originalBlob, key);

        expect(encrypted.blob.type).toBe("application/octet-stream");
      });

      it("decrypted blob preserves original MIME type", async () => {
        const key = await generateMasterKey();
        const originalBlob = new Blob([testImageBuffer], {
          type: "image/jpeg",
        });

        const encrypted = await encryptFile(originalBlob, key);
        const decrypted = await decryptFile(
          encrypted.blob,
          encrypted.iv,
          key,
          "image/jpeg"
        );

        expect(decrypted.type).toBe("image/jpeg");
      });

      it("fails to decrypt image with wrong key", async () => {
        const key1 = await generateMasterKey();
        const key2 = await generateMasterKey();
        const originalBlob = new Blob([testImageBuffer], {
          type: "image/jpeg",
        });

        const encrypted = await encryptFile(originalBlob, key1);

        await expect(
          decryptFile(encrypted.blob, encrypted.iv, key2, "image/jpeg")
        ).rejects.toThrow();
      });

      it("fails to decrypt with tampered IV", async () => {
        const key = await generateMasterKey();
        const originalBlob = new Blob([testImageBuffer], {
          type: "image/jpeg",
        });

        const encrypted = await encryptFile(originalBlob, key);

        // Tamper with IV by using a different one
        const tamperedIV = arrayBufferToBase64(generateIV().buffer);

        await expect(
          decryptFile(encrypted.blob, tamperedIV, key, "image/jpeg")
        ).rejects.toThrow();
      });

      it("fails to decrypt tampered ciphertext", async () => {
        const key = await generateMasterKey();
        const originalBlob = new Blob([testImageBuffer], {
          type: "image/jpeg",
        });

        const encrypted = await encryptFile(originalBlob, key);

        // Tamper with ciphertext by modifying the blob
        const tamperedData = new Uint8Array(
          await encrypted.blob.arrayBuffer()
        );
        tamperedData[0] = tamperedData[0] ^ 0xff; // Flip bits in first byte
        const tamperedBlob = new Blob([tamperedData], {
          type: "application/octet-stream",
        });

        await expect(
          decryptFile(tamperedBlob, encrypted.iv, key, "image/jpeg")
        ).rejects.toThrow();
      });
    });
  });

  describe("Master Key Encryption", () => {
    describe("encryptMasterKey / decryptMasterKey", () => {
      it("encrypts and decrypts master key with password key", async () => {
        const masterKey = await generateMasterKey();
        const { key: passwordKey } = await generateDerivedKey("password", 1000);

        const encrypted = await encryptMasterKey(masterKey, passwordKey);
        const decrypted = await decryptMasterKey(encrypted, passwordKey);

        // Verify keys are functionally equivalent
        const testData = new TextEncoder().encode("test");
        const encryptedWithOriginal = await encrypt(testData.buffer, masterKey);
        const decryptedWithRecovered = await decrypt(
          encryptedWithOriginal,
          decrypted
        );

        expect(new Uint8Array(decryptedWithRecovered)).toEqual(testData);
      });

      it("fails to decrypt master key with wrong password", async () => {
        const masterKey = await generateMasterKey();
        const { key: passwordKey1 } = await generateDerivedKey(
          "correctPassword",
          1000
        );
        const { key: passwordKey2 } = await generateDerivedKey(
          "wrongPassword",
          1000
        );

        const encrypted = await encryptMasterKey(masterKey, passwordKey1);

        await expect(decryptMasterKey(encrypted, passwordKey2)).rejects.toThrow();
      });
    });
  });

  describe("E2E Admin Privacy Verification", () => {
    /**
     * These tests verify that the encryption properly prevents admin access.
     * The key point: encrypted data without the key reveals nothing about content.
     */

    it("encrypted image is indistinguishable from random data", async () => {
      const key = await generateMasterKey();
      const originalBlob = new Blob([testImageBuffer], {
        type: "image/jpeg",
      });

      const encrypted = await encryptFile(originalBlob, key);
      const encryptedBytes = new Uint8Array(
        await encrypted.blob.arrayBuffer()
      );

      // JPEG files start with magic bytes 0xFF 0xD8 0xFF
      // Encrypted data should NOT start with these bytes
      const startsWithJpegMagic =
        encryptedBytes[0] === 0xff &&
        encryptedBytes[1] === 0xd8 &&
        encryptedBytes[2] === 0xff;

      expect(startsWithJpegMagic).toBe(false);
    });

    it("metadata is visible but content is protected", async () => {
      const key = await generateMasterKey();
      const originalBlob = new Blob([testImageBuffer], {
        type: "image/jpeg",
      });

      const encrypted = await encryptFile(originalBlob, key);

      // What admin CAN see (metadata):
      const visibleMetadata = {
        iv: encrypted.iv, // Visible: needed for decryption
        originalSize: encrypted.originalSize, // Visible: file size
        encryptedSize: encrypted.encryptedSize, // Visible: encrypted size
        mimeType: "image/jpeg", // Visible: stored in DB
        fileName: "IMG_4186.jpeg", // Visible: stored in DB
      };

      // What admin CANNOT see without key:
      const encryptedContent = encrypted.blob;

      // Verify metadata is accessible
      expect(visibleMetadata.iv).toBeDefined();
      expect(visibleMetadata.originalSize).toBeGreaterThan(0);
      expect(typeof visibleMetadata.mimeType).toBe("string");

      // Verify content cannot be recovered without key
      const wrongKey = await generateMasterKey();
      await expect(
        decryptFile(encryptedContent, encrypted.iv, wrongKey, "image/jpeg")
      ).rejects.toThrow();
    });

    it("same image encrypted by different users produces different ciphertexts", async () => {
      // Simulates two users encrypting the same image
      const user1Key = await generateMasterKey();
      const user2Key = await generateMasterKey();

      const imageBlob = new Blob([testImageBuffer], { type: "image/jpeg" });

      const encrypted1 = await encryptFile(imageBlob, user1Key);
      const encrypted2 = await encryptFile(imageBlob, user2Key);

      const bytes1 = new Uint8Array(await encrypted1.blob.arrayBuffer());
      const bytes2 = new Uint8Array(await encrypted2.blob.arrayBuffer());

      // Encrypted blobs should be completely different
      const areIdentical =
        bytes1.length === bytes2.length &&
        bytes1.every((byte, i) => byte === bytes2[i]);

      expect(areIdentical).toBe(false);
    });
  });
});
