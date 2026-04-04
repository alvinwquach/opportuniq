/**
 * Conversation Mutations Tests
 *
 * Covers: createConversation (auth check, scope determination, key validation,
 * DB insert, key insert, return shape) and deleteConversation (auth check,
 * ownership WHERE clause, not-found, success).
 */

// ─── Supabase mock ────────────────────────────────────────────────────────────

const mockGetUser = jest.fn();

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
    })
  ),
}));

// ─── DB proxy (live object so tests can re-configure per-call behavior) ───────

const db = {
  insert: jest.fn(),
  delete: jest.fn(),
};

jest.mock("@/app/db/client", () => ({ db }));

jest.mock("@/app/db/schema", () => ({
  aiConversations: {
    id: "id",
    userId: "userId",
    encryptionScope: "encryptionScope",
    keyVersion: "keyVersion",
    algorithm: "algorithm",
    createdAt: "createdAt",
  },
  conversationKeys: { conversationId: "conversationId", userId: "userId" },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn((a: unknown, b: unknown) => `${String(a)}=${String(b)}`),
  and: jest.fn((...args: unknown[]) => args.join("&")),
}));

// ─── Constants ────────────────────────────────────────────────────────────────

const CONVERSATION_ROW = {
  id: "conv-123",
  encryptionScope: "user",
  keyVersion: 1,
  algorithm: "AES-GCM-256",
  createdAt: new Date("2024-01-01T00:00:00Z"),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Set up db.insert so:
 *  - 1st call (aiConversations) → .values().returning() resolves with convRow
 *  - 2nd call (conversationKeys) → .values() resolves with nothing (no .returning())
 */
function setupInsertConversation(convRow = CONVERSATION_ROW) {
  let insertCallCount = 0;
  db.insert.mockImplementation(() => {
    insertCallCount++;
    if (insertCallCount === 1) {
      // Conversation insert — has .returning()
      return {
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([convRow]),
        }),
      };
    }
    // Key insert — no .returning() needed; just resolve
    return {
      values: jest.fn().mockResolvedValue(undefined),
    };
  });
}

function setupDelete(returnedRows: unknown[] = [{ id: "conv-123" }]) {
  db.delete.mockReturnValue({
    where: jest.fn().mockReturnValue({
      returning: jest.fn().mockResolvedValue(returnedRows),
    }),
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
  setupInsertConversation();
  setupDelete();
});

describe("createConversation", () => {
  // ── Auth check ───────────────────────────────��────────────────────────────

  it("returns error when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { createConversation } = await import("@/app/actions/conversations/mutations");
    const result = await createConversation({
      wrappedConversationKey: "wrapped-key",
      publicKeyFingerprint: "fp-123",
    });

    expect((result as { error: string }).error).toBe("Unauthorized");
  });

  // ── User-scoped validation ───────────────────────────────────���────────────

  it("returns error when wrappedConversationKey is missing for user-scoped", async () => {
    const { createConversation } = await import("@/app/actions/conversations/mutations");
    const result = await createConversation({
      publicKeyFingerprint: "fp-123",
    });

    expect((result as { error: string }).error).toContain("wrappedConversationKey");
  });

  it("returns error when publicKeyFingerprint is missing for user-scoped", async () => {
    const { createConversation } = await import("@/app/actions/conversations/mutations");
    const result = await createConversation({
      wrappedConversationKey: "wrapped-key",
    });

    expect((result as { error: string }).error).toContain("publicKeyFingerprint");
  });

  // ── User-scoped success ─────────────────────────────────���─────────────────

  it("inserts conversation and wrapped key for user-scoped", async () => {
    const { createConversation } = await import("@/app/actions/conversations/mutations");
    const result = await createConversation({
      wrappedConversationKey: "wrapped-key-abc",
      publicKeyFingerprint: "fp-xyz",
      type: "diagnosis",
    });

    // Two inserts: conversation + key
    expect(db.insert).toHaveBeenCalledTimes(2);
    expect((result as { conversation: { id: string } }).conversation.id).toBe("conv-123");
  });

  it("returns correct encryption metadata", async () => {
    const { createConversation } = await import("@/app/actions/conversations/mutations");
    const result = await createConversation({
      wrappedConversationKey: "key",
      publicKeyFingerprint: "fp",
    });

    const conv = (result as { conversation: { encryption: { scope: string; keyVersion: number; algorithm: string } } }).conversation;
    expect(conv.encryption.scope).toBe("user");
    expect(conv.encryption.keyVersion).toBe(1);
    expect(conv.encryption.algorithm).toBe("AES-GCM-256");
  });

  it("returns createdAt as ISO string", async () => {
    const { createConversation } = await import("@/app/actions/conversations/mutations");
    const result = await createConversation({
      wrappedConversationKey: "key",
      publicKeyFingerprint: "fp",
    });

    const createdAt = (result as { conversation: { createdAt: string } }).conversation.createdAt;
    expect(typeof createdAt).toBe("string");
    expect(new Date(createdAt).toISOString()).toBe(createdAt);
  });

  it("defaults type to 'diagnosis' when not provided", async () => {
    let capturedValues: Record<string, unknown> = {};
    let insertCount = 0;
    db.insert.mockImplementation(() => {
      insertCount++;
      if (insertCount === 1) {
        return {
          values: jest.fn().mockImplementation((vals: Record<string, unknown>) => {
            capturedValues = vals;
            return { returning: jest.fn().mockResolvedValue([CONVERSATION_ROW]) };
          }),
        };
      }
      return { values: jest.fn().mockResolvedValue(undefined) };
    });

    const { createConversation } = await import("@/app/actions/conversations/mutations");
    await createConversation({ wrappedConversationKey: "key", publicKeyFingerprint: "fp" });

    expect(capturedValues.type).toBe("diagnosis");
  });

  // ── Group-scoped ─────────────────────────────────��────────────────────────

  it("does NOT require wrappedConversationKey for group-scoped", async () => {
    // Group-scoped only inserts conversation (no key insert)
    db.insert.mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([CONVERSATION_ROW]),
      }),
    });

    const { createConversation } = await import("@/app/actions/conversations/mutations");
    const result = await createConversation({ groupId: "group-abc" });

    expect((result as { error: string }).error).toBeUndefined();
    expect((result as { conversation: { id: string } }).conversation.id).toBe("conv-123");
  });

  it("does NOT insert conversationKeys for group-scoped", async () => {
    db.insert.mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([CONVERSATION_ROW]),
      }),
    });

    const { createConversation } = await import("@/app/actions/conversations/mutations");
    await createConversation({ groupId: "group-abc" });

    // Only one insert (for conversation), not two
    expect(db.insert).toHaveBeenCalledTimes(1);
  });

  // ── Encrypted title ───────────────────────────────────────────────────────

  it("sets title to [ENCRYPTED] when encryptedTitle is provided", async () => {
    let capturedValues: Record<string, unknown> = {};
    let insertCount = 0;
    db.insert.mockImplementation(() => {
      insertCount++;
      if (insertCount === 1) {
        return {
          values: jest.fn().mockImplementation((vals: Record<string, unknown>) => {
            capturedValues = vals;
            return { returning: jest.fn().mockResolvedValue([CONVERSATION_ROW]) };
          }),
        };
      }
      return { values: jest.fn().mockResolvedValue(undefined) };
    });

    const { createConversation } = await import("@/app/actions/conversations/mutations");
    await createConversation({
      wrappedConversationKey: "key",
      publicKeyFingerprint: "fp",
      encryptedTitle: "enc-title-base64",
      titleIv: "iv-base64",
    });

    expect(capturedValues.title).toBe("[ENCRYPTED]");
    expect(capturedValues.encryptedTitle).toBe("enc-title-base64");
  });

  // ── Error handling ────────────────────────────────────────────────────────

  it("returns 'Internal Server Error' on DB failure", async () => {
    db.insert.mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockRejectedValue(new Error("DB crashed")),
      }),
    });

    const { createConversation } = await import("@/app/actions/conversations/mutations");
    const result = await createConversation({
      wrappedConversationKey: "key",
      publicKeyFingerprint: "fp",
    });

    expect((result as { error: string }).error).toBe("Internal Server Error");
  });
});

describe("deleteConversation", () => {
  // ── Auth check ──────────────────────────���───────────────────────────���─────

  it("returns error when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { deleteConversation } = await import("@/app/actions/conversations/mutations");
    const result = await deleteConversation("conv-123");

    expect((result as { error: string }).error).toBe("Unauthorized");
  });

  // ── Success ───────────────────────────────────────────────────────────────

  it("returns success when conversation belongs to user", async () => {
    const { deleteConversation } = await import("@/app/actions/conversations/mutations");
    const result = await deleteConversation("conv-123");

    expect((result as { success: boolean }).success).toBe(true);
  });

  // ── Not found (ownership check) ───────────────────────────────────────────

  it("returns 'Not found' when no rows deleted", async () => {
    setupDelete([]); // 0 rows returned → not found / not owned

    const { deleteConversation } = await import("@/app/actions/conversations/mutations");
    const result = await deleteConversation("conv-other");

    expect((result as { error: string }).error).toBe("Not found");
  });

  // ── Error handling ──────────────────────��───────────────────────────────��─

  it("returns 'Internal Server Error' on DB failure", async () => {
    db.delete.mockReturnValue({
      where: jest.fn().mockReturnValue({
        returning: jest.fn().mockRejectedValue(new Error("DB error")),
      }),
    });

    const { deleteConversation } = await import("@/app/actions/conversations/mutations");
    const result = await deleteConversation("conv-123");

    expect((result as { error: string }).error).toBe("Internal Server Error");
  });
});
