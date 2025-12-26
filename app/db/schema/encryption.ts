// ============================================================================
// ENCRYPTION SCHEMA - End-to-End Encryption for Household Media (PRIVATE)
// ============================================================================
//
// PURPOSE:
// Protects sensitive household repair photos and videos with end-to-end encryption.
// Media is encrypted on the client before upload, ensuring even the server cannot
// access plaintext content. Only household members with the shared encryption key
// can decrypt media. Critical for privacy when sharing photos of your home interior,
// damaged items, or repair work in progress.
//
// ARCHITECTURE OVERVIEW:
// ┌─────────────────────────────────────────────────────────────────┐
// │  E2E ENCRYPTION WORKFLOW                                        │
// ├─────────────────────────────────────────────────────────────────┤
// │  HOUSEHOLD CREATION:                                            │
// │  1. First owner creates household                               │
// │  2. Client generates random master key (256-bit AES)            │
// │  3. Client encrypts master key with owner's password            │
// │  4. Encrypted master key stored in householdKeys table          │
// │  5. Same encrypted key stored in memberKeyShares for owner      │
// │                                                                 │
// │  UPLOADING ENCRYPTED MEDIA:                                     │
// │  1. User captures photo of leaky pipe                           │
// │  2. Client fetches encrypted master key from server             │
// │  3. Client decrypts master key using user's password            │
// │  4. Client encrypts photo with master key (AES-GCM-256)         │
// │  5. Encrypted blob uploaded to server/storage                   │
// │  6. Server stores blob but cannot decrypt it                    │
// │                                                                 │
// │  VIEWING ENCRYPTED MEDIA:                                       │
// │  1. User opens issue to view repair photos                      │
// │  2. Client fetches encrypted photo blob                         │
// │  3. Client fetches member's encrypted key share                 │
// │  4. Client decrypts master key with user's password             │
// │  5. Client decrypts photo blob with master key                  │
// │  6. Decrypted image displayed in browser (never sent to server) │
// │                                                                 │
// │  ADDING NEW HOUSEHOLD MEMBER:                                   │
// │  1. Existing member invites new member                          │
// │  2. Existing member's client decrypts master key                │
// │  3. Client re-encrypts master key with new member's password    │
// │  4. New memberKeyShare row created for new member               │
// │  5. New member can now decrypt all household media              │
// │                                                                 │
// │  KEY ROTATION (if compromised):                                 │
// │  1. Generate new master key                                     │
// │  2. Re-encrypt all media with new key (background job)          │
// │  3. Re-encrypt key shares for all active members                │
// │  4. Update householdKeys.keyVersion to track rotation           │
// └─────────────────────────────────────────────────────────────────┘
//
// SECURITY MODEL (CRITICAL):
// ┌─────────────────────────────────────────────────────────────────┐
// │  ⚠️  ZERO-KNOWLEDGE ENCRYPTION - SERVER CANNOT DECRYPT MEDIA    │
// ├─────────────────────────────────────────────────────────────────┤
// │  • Master key: NEVER stored in plaintext on server              │
// │  • User passwords: NEVER sent to server (used client-side only) │
// │  • Media blobs: Encrypted before upload, opaque to server       │
// │  • Key derivation: PBKDF2 with 100k+ iterations + unique salt   │
// │                                                                 │
// │  THREAT MODEL:                                                  │
// │  ✅ PROTECTS AGAINST:                                           │
// │    • Database breach (attacker gets encrypted keys only)        │
// │    • Rogue admin (cannot decrypt media without password)        │
// │    • Man-in-the-middle (HTTPS + encrypted payload)              │
// │    • Cloud storage leak (blobs are encrypted)                   │
// │                                                                 │
// │  ❌ DOES NOT PROTECT AGAINST:                                   │
// │    • Compromised user password (attacker can decrypt)           │
// │    • Malicious household member (they have legitimate access)   │
// │    • Client-side XSS (attacker steals key from memory)          │
// │    • Lost master key (data becomes unrecoverable)               │
// │                                                                 │
// │  TRADEOFFS:                                                     │
// │  • 🔒 Privacy: Maximum protection from server/admin             │
// │  • ⚠️ Recovery: No password reset (lost password = lost data)   │
// │  • 🐌 Performance: Client-side crypto adds latency              │
// │  • 🔧 Complexity: Key management is harder than plaintext       │
// └─────────────────────────────────────────────────────────────────┘
//
// RELATIONSHIPS:
// • householdKeys → households (cascade delete - remove keys when household deleted)
// • memberKeyShares → households (cascade delete)
// • memberKeyShares → householdMembers (cascade delete - revoke access when member removed)
// • Integration: issues.photos/videos contain encrypted blob URLs
//
// COMMON OPERATIONS:
//
// 1. Generate Household Master Key (Client-Side):
//    // This runs in the browser, NOT on the server
//    async function generateMasterKey(userPassword: string) {
//      // Generate random 256-bit master key
//      const masterKey = crypto.getRandomValues(new Uint8Array(32));
//
//      // Derive encryption key from user's password
//      const salt = crypto.getRandomValues(new Uint8Array(16));
//      const passwordKey = await deriveKey(userPassword, salt, 100000);
//
//      // Encrypt master key with password-derived key
//      const encryptedMasterKey = await encrypt(masterKey, passwordKey);
//
//      // Store encrypted key on server (server never sees plaintext)
//      await db.insert(householdKeys).values({
//        householdId,
//        encryptedMasterKey: base64Encode(encryptedMasterKey),
//        keyVersion: 1,
//        algorithm: "AES-GCM-256",
//      });
//
//      // Store member's key share
//      await db.insert(memberKeyShares).values({
//        householdId,
//        memberId,
//        encryptedKey: base64Encode(encryptedMasterKey),
//        salt: base64Encode(salt),
//        iterations: 100000,
//      });
//    }
//
// 2. Encrypt and Upload Photo (Client-Side):
//    async function uploadEncryptedPhoto(photoFile: File, issueId: string, userPassword: string) {
//      // Fetch member's encrypted key share
//      const keyShare = await db.query.memberKeyShares.findFirst({
//        where: and(
//          eq(memberKeyShares.householdId, householdId),
//          eq(memberKeyShares.memberId, memberId)
//        ),
//      });
//
//      // Decrypt master key using user's password
//      const passwordKey = await deriveKey(
//        userPassword,
//        base64Decode(keyShare.salt),
//        keyShare.iterations
//      );
//      const masterKey = await decrypt(
//        base64Decode(keyShare.encryptedKey),
//        passwordKey
//      );
//
//      // Read photo file as ArrayBuffer
//      const photoData = await photoFile.arrayBuffer();
//
//      // Encrypt photo with master key
//      const encryptedPhoto = await encryptWithKey(photoData, masterKey);
//
//      // Upload encrypted blob to storage (Supabase Storage, S3, etc.)
//      const photoUrl = await uploadToStorage(encryptedPhoto, `issues/${issueId}/photo-${Date.now()}.enc`);
//
//      // Store reference in database (URL points to encrypted blob)
//      await db.update(issues)
//        .set({
//          photos: sql`array_append(photos, ${photoUrl})`
//        })
//        .where(eq(issues.id, issueId));
//    }
//
// 3. Add New Member to Household (Re-encrypt Key Share):
//    async function shareKeyWithNewMember(
//      existingMemberPassword: string,
//      newMemberId: string,
//      newMemberPassword: string
//    ) {
//      // Existing member decrypts master key
//      const existingKeyShare = await db.query.memberKeyShares.findFirst({
//        where: and(
//          eq(memberKeyShares.householdId, householdId),
//          eq(memberKeyShares.memberId, existingMemberId)
//        ),
//      });
//
//      const existingPasswordKey = await deriveKey(
//        existingMemberPassword,
//        base64Decode(existingKeyShare.salt),
//        existingKeyShare.iterations
//      );
//      const masterKey = await decrypt(
//        base64Decode(existingKeyShare.encryptedKey),
//        existingPasswordKey
//      );
//
//      // Re-encrypt master key with new member's password
//      const newSalt = crypto.getRandomValues(new Uint8Array(16));
//      const newPasswordKey = await deriveKey(newMemberPassword, newSalt, 100000);
//      const newEncryptedKey = await encrypt(masterKey, newPasswordKey);
//
//      // Store new member's key share
//      await db.insert(memberKeyShares).values({
//        householdId,
//        memberId: newMemberId,
//        encryptedKey: base64Encode(newEncryptedKey),
//        salt: base64Encode(newSalt),
//        iterations: 100000,
//      });
//    }
//
// 4. Rotate Household Key (if compromised):
//    async function rotateHouseholdKey(adminPassword: string) {
//      // Decrypt old master key
//      const oldKeyShare = await db.query.memberKeyShares.findFirst({
//        where: and(
//          eq(memberKeyShares.householdId, householdId),
//          eq(memberKeyShares.memberId, adminMemberId)
//        ),
//      });
//      const oldPasswordKey = await deriveKey(adminPassword, base64Decode(oldKeyShare.salt), oldKeyShare.iterations);
//      const oldMasterKey = await decrypt(base64Decode(oldKeyShare.encryptedKey), oldPasswordKey);
//
//      // Generate new master key
//      const newMasterKey = crypto.getRandomValues(new Uint8Array(32));
//
//      // Re-encrypt all media with new key (background job)
//      const allMedia = await db.query.issues.findMany({
//        where: eq(issues.householdId, householdId),
//        columns: { id: true, photos: true, videos: true },
//      });
//
//      for (const issue of allMedia) {
//        for (const photoUrl of issue.photos || []) {
//          const encryptedBlob = await fetchFromStorage(photoUrl);
//          const decryptedBlob = await decryptWithKey(encryptedBlob, oldMasterKey);
//          const reEncryptedBlob = await encryptWithKey(decryptedBlob, newMasterKey);
//          await uploadToStorage(reEncryptedBlob, photoUrl); // Overwrite
//        }
//      }
//
//      // Update householdKeys with new encrypted master key
//      const newEncryptedMasterKey = await encrypt(newMasterKey, oldPasswordKey);
//      await db.update(householdKeys)
//        .set({
//          encryptedMasterKey: base64Encode(newEncryptedMasterKey),
//          keyVersion: sql`key_version + 1`,
//          updatedAt: new Date(),
//        })
//        .where(eq(householdKeys.householdId, householdId));
//
//      // Re-encrypt key shares for all active members
//      const allMembers = await db.query.memberKeyShares.findMany({
//        where: eq(memberKeyShares.householdId, householdId),
//      });
//
//      for (const member of allMembers) {
//        // This requires each member's password (complex in practice)
//        // Alternative: Use admin's key to re-encrypt for all members
//        const memberPasswordKey = await deriveKey(
//          memberPassword, // Need to prompt each member
//          base64Decode(member.salt),
//          member.iterations
//        );
//        const newEncryptedKey = await encrypt(newMasterKey, memberPasswordKey);
//
//        await db.update(memberKeyShares)
//          .set({ encryptedKey: base64Encode(newEncryptedKey) })
//          .where(eq(memberKeyShares.id, member.id));
//      }
//    }
//
// BEST PRACTICES:
// • Use WebCrypto API for cryptographic operations (never roll your own crypto)
// • Generate unique salt for each member (prevents rainbow table attacks)
// • Use high iteration count for PBKDF2 (100k minimum, adjust for client performance)
// • Never log or expose plaintext keys (even in dev mode)
// • Implement key rotation policy (rotate annually or after suspected breach)
// • Use secure random number generator (crypto.getRandomValues, NOT Math.random)
// • Clear sensitive data from memory after use (overwrite variables)
// • Use authenticated encryption (AES-GCM includes authentication)
// • Validate key version before decryption (prevent rollback attacks)
// • Implement key escrow/recovery for enterprise customers (optional)
//
// COMMON PITFALLS:
// • Using user's Supabase auth password for encryption (couples auth to encryption)
//   → Better: Use separate encryption password or derive from auth password
// • Storing salt as the same value for all members (weakens key derivation)
//   → Better: Unique salt per member in memberKeyShares.salt
// • Not implementing key rotation (compromised key affects all past media)
//   → Better: Build rotation workflow from day one
// • Hardcoding iteration count (can't increase as hardware gets faster)
//   → Better: Store iterations in memberKeyShares.iterations
// • Forgetting to delete key shares when member removed (access not revoked)
//   → Better: Cascade delete handles this automatically
// • Not handling key rotation for offline members (they lose access)
//   → Better: Track last key version each member has, force re-sync
// • Using weak passwords (short password = easy brute force)
//   → Better: Enforce password strength requirements (12+ chars, mixed case)
// • Not backing up master key (lost password = lost all household data)
//   → Better: Implement optional key escrow or recovery mechanism
//
// RECOMMENDED IMPROVEMENTS:
// • Add keyBackup table for optional encrypted backups (escrow)
// • Support hardware security modules (HSM) for enterprise
// • Implement key rotation automation (scheduled or triggered)
// • Add audit log for key access (who decrypted what, when)
// • Support multiple encryption algorithms (future-proof for post-quantum)
// • Add key expiration dates (force rotation after N days)
// • Implement secure key deletion (overwrite, not just delete row)
// • Support biometric unlock on mobile (TouchID/FaceID unlocks key)
// • Add key recovery via trusted contacts (social recovery)
// • Support ephemeral keys for temporary contractors (auto-expire)
//
// ONBOARDING GUIDANCE:
// End-to-end encryption is a privacy feature for users who need maximum security
// for household repair photos. Most users won't realize it's happening - they'll
// just upload photos normally and the client handles encryption transparently.
//
// For household admins, explain:
// • "Your photos are encrypted before upload - even we can't see them"
// • "Don't lose your password - we can't recover your encrypted media"
// • "New household members automatically get access to all photos"
//
// Technical note: This is a PASSWORD-BASED encryption system. For better UX,
// consider integrating with platform keychains (iOS Keychain, macOS Keychain,
// Windows Credential Manager) to store the user's encryption password securely
// so they don't have to re-enter it every session.
//
// ALTERNATIVE ARCHITECTURES (for consideration):
//
// 1. **PUBLIC KEY ENCRYPTION (asymmetric)**:
//    Instead of password-based shared key, each member has a public/private keypair.
//    Media is encrypted with a symmetric key, then that key is encrypted with each
//    member's public key. Pros: No password needed, easier key rotation. Cons: More
//    complex key management, larger encrypted payloads.
//
// 2. **KEY DERIVATION FROM AUTH PASSWORD**:
//    Derive encryption key from Supabase auth password (PBKDF2 on client).
//    Pros: Single password to remember. Cons: Couples auth to encryption (password
//    reset destroys encrypted data).
//
// 3. **SERVER-SIDE ENCRYPTION (not E2E)**:
//    Encrypt media on server with server-managed keys. Pros: Simpler, password
//    recovery works. Cons: Server admins can decrypt media (less privacy).
//
// The current architecture (password-based shared key) balances security and UX
// for household sharing scenarios. Evaluate tradeoffs based on your threat model.
//
// ============================================================================

import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";
import { groups, groupMembers } from "./groups";

// ============================================
// TABLES - Encryption Key Management
// ============================================

/**
 * HOUSEHOLD_KEYS - Master Encryption Keys for Each Household
 *
 * Stores the master encryption key for a household, encrypted with the first
 * owner's password. This key is used to encrypt/decrypt all household media
 * (photos, videos). The master key is NEVER stored in plaintext - it's always
 * encrypted with a user's password-derived key.
 *
 * RELATIONSHIP:
 * • One household → One master key (1:1)
 * • One master key → Many member key shares (1:N)
 *
 * LIFECYCLE:
 * 1. Created when first household owner signs up
 * 2. Used to encrypt all media uploaded by any household member
 * 3. Rotated if compromised (keyVersion incremented)
 * 4. Deleted when household is deleted (cascade)
 *
 * SECURITY CONSIDERATIONS:
 * • encryptedMasterKey is encrypted with first owner's password (client-side)
 * • Server never sees plaintext master key
 * • Unique constraint ensures one key per household
 * • keyVersion tracks rotations (for detecting rollback attacks)
 * • algorithm field future-proofs for algorithm changes (e.g., post-quantum)
 *
 * EXAMPLE ROW:
 * {
 *   id: "550e8400-e29b-41d4-a716-446655440000",
 *   householdId: "123e4567-e89b-12d3-a456-426614174000",
 *   encryptedMasterKey: "AQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyA...", // Base64-encoded
 *   keyVersion: 1,
 *   algorithm: "AES-GCM-256",
 *   createdAt: "2025-01-15T10:30:00Z",
 *   updatedAt: "2025-01-15T10:30:00Z",
 * }
 *
 * QUERY EXAMPLE:
 * // Fetch household's encrypted master key
 * const key = await db.query.householdKeys.findFirst({
 *   where: eq(householdKeys.householdId, householdId),
 * });
 * // Client decrypts it with user's password (never send password to server)
 */
export const householdKeys = pgTable("household_keys", {
  /**
   * **Primary Key: Encryption Key ID**
   * Type: UUID (Universally Unique Identifier)
   * Auto-generated with .defaultRandom()
   */
  id: uuid("id").primaryKey().defaultRandom(),

  /**
   * **Foreign Key: Household ID**
   * Type: UUID
   * References: households.id
   * Constraint: ON DELETE CASCADE (delete key when household deleted)
   * Uniqueness: .unique() ensures one key per household
   *
   * **Why unique constraint?**
   * Each household should have exactly one master key. Multiple keys would
   * fragment encrypted media (some media encrypted with key A, some with key B).
   * Key rotation is handled by updating this row, not creating a new row.
   */
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" })
    .unique(), // One key per group

  /**
   * **Encrypted Master Key**
   * Type: TEXT (stores Base64-encoded encrypted key)
   * Length: ~200-500 chars (depends on encryption + encoding)
   *
   * **What is this field?**
   * The household's master encryption key (256-bit random value), encrypted
   * with the first owner's password-derived key. This is the CORE SECRET that
   * protects all household media.
   *
   * **Why never plaintext?**
   * If this were plaintext, anyone with database access (admin, breach) could
   * decrypt all household media. By encrypting it with the user's password
   * (which never touches the server), we achieve zero-knowledge encryption.
   *
   * **Encryption flow**:
   * 1. Client generates random 256-bit master key
   * 2. Client derives key from user's password (PBKDF2 + salt)
   * 3. Client encrypts master key with password-derived key (AES-GCM)
   * 4. Client uploads encrypted key to server (this field)
   * 5. Server stores it but cannot decrypt it
   *
   * **Decryption flow**:
   * 1. Client fetches encrypted key from server
   * 2. User enters password (client-side, never sent to server)
   * 3. Client derives same key from password (PBKDF2 + salt)
   * 4. Client decrypts master key
   * 5. Client uses master key to decrypt media
   *
   * **What happens if user forgets password?**
   * Data is permanently lost (zero-knowledge means no recovery). For production,
   * consider optional key escrow or social recovery (trusted contacts).
   */
  encryptedMasterKey: text("encrypted_master_key").notNull(),

  /**
   * **Key Version Number**
   * Type: INTEGER
   * Default: 1
   *
   * **Why version keys?**
   * Tracks key rotations. When a key is compromised (or rotated proactively),
   * you generate a new master key and increment keyVersion. Old media encrypted
   * with version 1 can still be decrypted (you store old keys temporarily), but
   * new media uses version 2.
   *
   * **Rotation workflow**:
   * 1. Generate new master key (version 2)
   * 2. Re-encrypt all media with new key (background job)
   * 3. Update this row: keyVersion = 2, encryptedMasterKey = <new key>
   * 4. Delete old key after all media re-encrypted
   *
   * **Security benefit**:
   * Prevents rollback attacks. If attacker tries to force use of old compromised
   * key, client checks keyVersion and rejects outdated keys.
   */
  keyVersion: integer("key_version").default(1).notNull(),

  /**
   * **Encryption Algorithm Identifier**
   * Type: TEXT
   * Default: "AES-GCM-256"
   *
   * **Why specify algorithm?**
   * Future-proofs the system. Today we use AES-GCM-256, but in 10 years we might
   * need to migrate to post-quantum algorithms. By storing the algorithm name,
   * the client knows how to decrypt old media even after algorithm changes.
   *
   * **Supported algorithms** (current):
   * • "AES-GCM-256" - AES in Galois/Counter Mode with 256-bit key
   *   → Provides both encryption AND authentication (integrity check)
   *   → Industry standard, fast hardware acceleration
   *   → WebCrypto API natively supports it
   *
   * **Future algorithms** (examples):
   * • "ChaCha20-Poly1305" - Alternative to AES (better on mobile)
   * • "Kyber-AES" - Post-quantum hybrid encryption
   */
  algorithm: text("algorithm").default("AES-GCM-256").notNull(),

  /**
   * **Creation Timestamp**
   * Type: TIMESTAMP WITH TIME ZONE
   * Auto-set: .defaultNow() on insert
   *
   * Tracks when household's master key was first generated.
   */
  createdAt: timestamp("created_at").defaultNow().notNull(),

  /**
   * **Last Updated Timestamp**
   * Type: TIMESTAMP WITH TIME ZONE
   * Auto-set: .defaultNow() on insert
   * **Should be updated**: When key is rotated (keyVersion incremented)
   *
   * Tracks when key was last rotated. If updatedAt is old (e.g., 2+ years),
   * prompt admin to rotate key proactively.
   */
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * MEMBER_KEY_SHARES - Per-Member Encrypted Copies of Master Key
 *
 * Each household member needs a copy of the master key to decrypt media. But
 * we can't give everyone the same encrypted key (they'd all need the first
 * owner's password). Instead, we RE-ENCRYPT the master key with each member's
 * password. Now each member can decrypt the master key using their own password.
 *
 * RELATIONSHIP:
 * • One household → Many member key shares (1:N)
 * • One member → Many key shares (across different households) (1:N)
 * • One master key → Many member copies (1:N)
 *
 * LIFECYCLE:
 * 1. First owner creates household → auto-create key share for owner
 * 2. New member joins → existing member re-encrypts master key for them
 * 3. Member leaves → cascade delete their key share (revoke access)
 * 4. Key rotated → update all members' key shares with new key
 *
 * SECURITY CONSIDERATIONS:
 * • Each member has unique salt (prevents rainbow table attacks)
 * • Iteration count stored per-member (allows gradual increases)
 * • encryptedKey is master key encrypted with THIS member's password
 * • Cascade delete on member removal automatically revokes access
 * • Salt MUST be cryptographically random (use crypto.getRandomValues)
 *
 * EXAMPLE ROW:
 * {
 *   id: "660e8400-e29b-41d4-a716-446655440000",
 *   householdId: "123e4567-e89b-12d3-a456-426614174000",
 *   memberId: "789e4567-e89b-12d3-a456-426614174000",
 *   encryptedKey: "AQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyA...", // Base64
 *   salt: "MTIzNDU2Nzg5MGFiY2RlZg==", // Base64-encoded 16-byte salt
 *   iterations: 100000,
 *   createdAt: "2025-01-15T10:30:00Z",
 * }
 *
 * QUERY EXAMPLE:
 * // Fetch current member's key share
 * const keyShare = await db.query.memberKeyShares.findFirst({
 *   where: and(
 *     eq(memberKeyShares.householdId, householdId),
 *     eq(memberKeyShares.memberId, currentMemberId)
 *   ),
 * });
 * // Client uses keyShare.salt and keyShare.iterations to derive password key
 * // Then decrypts keyShare.encryptedKey to get master key
 */
export const memberKeyShares = pgTable("member_key_shares", {
  /**
   * **Primary Key: Key Share ID**
   * Type: UUID (Universally Unique Identifier)
   * Auto-generated with .defaultRandom()
   */
  id: uuid("id").primaryKey().defaultRandom(),

  /**
   * **Foreign Key: Household ID**
   * Type: UUID
   * References: households.id
   * Constraint: ON DELETE CASCADE (delete key share when household deleted)
   *
   * Links this key share to the household. When household is deleted, all
   * member key shares are automatically cleaned up.
   */
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),

  /**
   * **Foreign Key: Member ID**
   * Type: UUID
   * References: groupMembers.id
   * Constraint: ON DELETE CASCADE (delete key share when member removed)
   *
   * **Why cascade delete?**
   * When a member is removed from the group, their key share MUST be deleted
   * to revoke their access to encrypted media. Cascade delete handles this
   * automatically - no manual cleanup needed.
   *
   * **Security implication**:
   * Removing a member from groupMembers immediately revokes their ability
   * to decrypt media. However, they may have ALREADY decrypted and saved media
   * locally. True revocation requires re-encrypting all media with a new key
   * (key rotation).
   */
  memberId: uuid("member_id")
    .notNull()
    .references(() => groupMembers.id, { onDelete: "cascade" }),

  /**
   * **Member's Encrypted Copy of Master Key**
   * Type: TEXT (stores Base64-encoded encrypted key)
   * Length: ~200-500 chars
   *
   * **What is this field?**
   * The household master key (same 256-bit key as in householdKeys), but
   * encrypted with THIS member's password instead of the first owner's password.
   *
   * **Why different from householdKeys.encryptedMasterKey?**
   * householdKeys.encryptedMasterKey is encrypted with the first owner's password.
   * If we only had that, every member would need the first owner's password to
   * decrypt media. That's a bad UX and security risk (single password shared).
   *
   * **How is this created?**
   * When a new member joins:
   * 1. Existing member decrypts master key (using their password)
   * 2. Client generates new salt for new member
   * 3. Client re-encrypts master key with new member's password
   * 4. Client uploads this encrypted copy (this field)
   * 5. New member can now decrypt master key with their own password
   *
   * **Example**:
   * Household has master key: 0x1234567890ABCDEF...
   * Owner (Alice) password: "alice_secure_pass"
   *   → encryptedKey for Alice: "Xj8k3n2..." (master key encrypted with Alice's pass)
   * Member (Bob) joins with password: "bob_different_pass"
   *   → encryptedKey for Bob: "9mLp4w1..." (same master key, encrypted with Bob's pass)
   *
   * Now Alice and Bob can both decrypt the master key (and thus media), but
   * each uses their own password. They don't share passwords.
   */
  encryptedKey: text("encrypted_key").notNull(),

  /**
   * **Password Salt for Key Derivation**
   * Type: TEXT (stores Base64-encoded 16-byte random value)
   * Length: ~24 chars (16 bytes Base64-encoded)
   *
   * **What is salt?**
   * A random value added to the password before hashing/deriving a key. Prevents
   * rainbow table attacks (pre-computed hash tables) and ensures that even if
   * two members use the same password, their derived keys are different.
   *
   * **Why unique per member?**
   * If all members used the same salt, an attacker could build a rainbow table
   * for that specific salt and crack all passwords faster. Unique salts force
   * attackers to crack each password individually.
   *
   * **How is it generated?**
   * Client-side: crypto.getRandomValues(new Uint8Array(16))
   * Server never generates salt (client generates and sends it)
   *
   * **Security requirement**:
   * MUST be cryptographically random (NOT Math.random, NOT timestamp).
   * Use crypto.getRandomValues in browser or crypto.randomBytes in Node.js.
   *
   * **Example**:
   * salt: "MTIzNDU2Nzg5MGFiY2RlZg==" (Base64)
   * Decoded: [0x12, 0x34, 0x56, 0x78, 0x90, 0xab, 0xcd, 0xef, ...]
   */
  salt: text("salt").notNull(), // For password-based key derivation

  /**
   * **PBKDF2 Iteration Count**
   * Type: INTEGER
   * Default: 100,000
   *
   * **What is PBKDF2?**
   * Password-Based Key Derivation Function 2 - a standard algorithm for
   * converting passwords into encryption keys. It repeatedly hashes the
   * password many times (iterations) to slow down brute-force attacks.
   *
   * **Why 100,000 iterations?**
   * As of 2025, OWASP recommends 600,000+ iterations for PBKDF2-HMAC-SHA256.
   * 100,000 is the absolute minimum. Higher is better (but slower).
   *
   * **Performance tradeoff**:
   * • More iterations = Harder to brute-force (attacker needs more compute)
   * • More iterations = Slower login (user waits longer for key derivation)
   * • Desktop/server: 600k+ iterations is reasonable
   * • Mobile browser: 100k-200k iterations (avoid UI freezing)
   *
   * **Why store it?**
   * Allows gradual increases. New members can use 200k iterations while old
   * members stay at 100k (until they reset password). You can't change iteration
   * count without knowing the user's password, so it's stored per-member.
   *
   * **Future improvement**:
   * Use Argon2id instead of PBKDF2 (better resistance to GPU/ASIC attacks).
   * Argon2id is the winner of the Password Hashing Competition (2015).
   */
  iterations: integer("iterations").default(100000).notNull(),

  /**
   * **Creation Timestamp**
   * Type: TIMESTAMP WITH TIME ZONE
   * Auto-set: .defaultNow() on insert
   *
   * Tracks when this member was granted access to the household key.
   * Useful for audit logs ("Bob gained access to encrypted media on Jan 15").
   */
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// TYPES - TypeScript Inference
// ============================================

/**
 * TYPE: HouseholdKey (Select)
 * Inferred from householdKeys table schema
 * Used for query results (when fetching existing rows)
 */
export type HouseholdKey = typeof householdKeys.$inferSelect;

/**
 * TYPE: NewHouseholdKey (Insert)
 * Inferred from householdKeys table schema
 * Used for inserts (when creating new rows)
 * Fields with .defaultRandom() or .defaultNow() are optional
 */
export type NewHouseholdKey = typeof householdKeys.$inferInsert;

/**
 * TYPE: MemberKeyShare (Select)
 * Inferred from memberKeyShares table schema
 * Used for query results
 */
export type MemberKeyShare = typeof memberKeyShares.$inferSelect;

/**
 * TYPE: NewMemberKeyShare (Insert)
 * Inferred from memberKeyShares table schema
 * Used for inserts
 */
export type NewMemberKeyShare = typeof memberKeyShares.$inferInsert;
