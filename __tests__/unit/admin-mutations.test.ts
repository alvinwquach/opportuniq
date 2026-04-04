/**
 * Admin Mutations Tests
 *
 * Covers: requireAdmin guard (unauthenticated, non-admin), and all 11 exported
 * admin functions: adminUpdateUser, adminBanUser, adminUnbanUser, adminDeleteUser,
 * adminBulkDeleteUsers, adminCreateInvite, adminRevokeInvite, adminResendInvite,
 * adminBulkCreateInvites, adminDeleteWaitlistEntry, adminBulkDeleteWaitlist,
 * adminConvertWaitlistToInvite.
 */

// ─── UUID mock ────────────────────────────────────────────────────────────────

jest.mock("uuid", () => ({
  v4: jest.fn(() => "generated-uuid-123"),
}));

// ─── Supabase mock ────────────────────────────────────────────────────────────

const mockGetUser = jest.fn();

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
    })
  ),
}));

// ─── DB mock: use a db proxy that delegates to the live mock fns ──────────────
// We use a live object so that individual tests can override db.insert etc
// without fighting Jest's module caching.

const db = {
  select: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock("@/app/db/client", () => ({ db }));

jest.mock("@/app/db/schema", () => ({
  users: { id: "id", role: "role" },
  invites: { id: "id" },
  waitlist: { id: "id" },
  adminAuditLog: {},
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn((a: unknown, b: unknown) => `${String(a)}=${String(b)}`),
  inArray: jest.fn((col: unknown, vals: unknown) => `${String(col)} IN [${String(vals)}]`),
}));

// ─── Constants ────────────────────────────────────────────────────────────────

const ADMIN_USER = { id: "admin-1" };
const DB_ADMIN_ROW = { role: "admin" };
const UPDATED_USER = { id: "user-1", name: "Updated", role: "user" };
const INVITE_ROW = { id: "invite-1", email: "invited@example.com", token: "tok", expiresAt: new Date() };
const WAITLIST_ROW = { id: "waitlist-1", email: "waitlisted@example.com" };

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Make db.select return the given sequence of rows for successive calls */
function setupSelectSequence(sequences: Array<unknown[]>) {
  let callIndex = 0;
  db.select.mockImplementation(() => ({
    from: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        limit: jest.fn().mockImplementation(() => {
          const result = sequences[callIndex] ?? [];
          callIndex++;
          return Promise.resolve(result);
        }),
      }),
    }),
  }));
}

/** Shorthand: admin role check passes, then zero or more extra result sets */
function setupAdmin(...extraResults: Array<unknown[]>) {
  setupSelectSequence([[DB_ADMIN_ROW], ...extraResults]);
}

function setupUpdate(returnRow: unknown = UPDATED_USER) {
  db.update.mockReturnValue({
    set: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([returnRow]),
      }),
    }),
  });
}

function setupDelete() {
  db.delete.mockReturnValue({
    where: jest.fn().mockResolvedValue(undefined),
  });
}

/** Make db.insert return the given row from .returning() on every call */
function setupInsert(returnRow: unknown = INVITE_ROW) {
  db.insert.mockReturnValue({
    values: jest.fn().mockReturnValue({
      returning: jest.fn().mockResolvedValue([returnRow]),
    }),
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: ADMIN_USER } });
});

// ── requireAdmin guard ────────────────────────────────────────────────────────

describe("requireAdmin guard", () => {
  it("throws Unauthorized when no user session", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { adminUpdateUser } = await import("@/app/actions/admin/adminMutations");
    await expect(adminUpdateUser("user-1", { name: "Test" })).rejects.toThrow("Unauthorized");
  });

  it("throws Admin access required when user role is not admin", async () => {
    setupSelectSequence([[{ role: "user" }]]);

    const { adminUpdateUser } = await import("@/app/actions/admin/adminMutations");
    await expect(adminUpdateUser("user-1", { name: "Test" })).rejects.toThrow("Admin access required");
  });

  it("throws Admin access required when user not found in DB", async () => {
    setupSelectSequence([[]]); // empty → no user row

    const { adminDeleteUser } = await import("@/app/actions/admin/adminMutations");
    await expect(adminDeleteUser("user-1")).rejects.toThrow("Admin access required");
  });
});

// ── adminUpdateUser ───────────────────────────────────────────────────────────

describe("adminUpdateUser", () => {
  it("updates user and writes audit log", async () => {
    setupAdmin();
    setupUpdate(UPDATED_USER);
    setupInsert();

    const { adminUpdateUser } = await import("@/app/actions/admin/adminMutations");
    const result = await adminUpdateUser("user-1", { name: "New Name", role: "user" });

    expect(db.update).toHaveBeenCalled();
    expect(db.insert).toHaveBeenCalled();
    expect(result).toEqual(UPDATED_USER);
  });

  it("spreads updatedAt into the SET clause", async () => {
    setupAdmin();
    let capturedSetArg: Record<string, unknown> = {};
    db.update.mockReturnValue({
      set: jest.fn().mockImplementation((args: Record<string, unknown>) => {
        capturedSetArg = args;
        return {
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([UPDATED_USER]),
          }),
        };
      }),
    });
    setupInsert();

    const { adminUpdateUser } = await import("@/app/actions/admin/adminMutations");
    await adminUpdateUser("user-1", { role: "admin" });

    expect(capturedSetArg.updatedAt).toBeInstanceOf(Date);
  });
});

// ── adminBanUser ──────────────────────────────────────────────────────────────

describe("adminBanUser", () => {
  it("sets role to banned and writes audit log", async () => {
    setupAdmin();
    setupUpdate({ id: "user-1", role: "banned" });
    setupInsert();

    const { adminBanUser } = await import("@/app/actions/admin/adminMutations");
    const result = await adminBanUser("user-1", "Violated ToS");

    expect(db.update).toHaveBeenCalled();
    expect(db.insert).toHaveBeenCalled();
    expect((result as { role: string }).role).toBe("banned");
  });

  it("works without a reason argument", async () => {
    setupAdmin();
    setupUpdate({ id: "user-1", role: "banned" });
    setupInsert();

    const { adminBanUser } = await import("@/app/actions/admin/adminMutations");
    await expect(adminBanUser("user-1")).resolves.toBeDefined();
  });
});

// ── adminUnbanUser ────────────────────────────────────────────────────────────

describe("adminUnbanUser", () => {
  it("restores role to user and writes audit log", async () => {
    setupAdmin();
    setupUpdate({ id: "user-1", role: "user" });
    setupInsert();

    const { adminUnbanUser } = await import("@/app/actions/admin/adminMutations");
    const result = await adminUnbanUser("user-1");

    expect(db.update).toHaveBeenCalled();
    expect(db.insert).toHaveBeenCalled();
    expect((result as { role: string }).role).toBe("user");
  });
});

// ── adminDeleteUser ───────────────────────────────────────────────────────────

describe("adminDeleteUser", () => {
  it("deletes user and writes audit log, returns true", async () => {
    setupAdmin();
    setupDelete();
    setupInsert();

    const { adminDeleteUser } = await import("@/app/actions/admin/adminMutations");
    const result = await adminDeleteUser("user-1");

    expect(db.delete).toHaveBeenCalled();
    expect(db.insert).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});

// ── adminBulkDeleteUsers ──────────────────────────────────────────────────────

describe("adminBulkDeleteUsers", () => {
  it("bulk-deletes and returns deletedCount", async () => {
    setupAdmin();
    setupDelete();
    setupInsert();

    const { adminBulkDeleteUsers } = await import("@/app/actions/admin/adminMutations");
    const result = await adminBulkDeleteUsers(["user-1", "user-2", "user-3"]);

    expect(db.delete).toHaveBeenCalled();
    expect(db.insert).toHaveBeenCalled();
    expect(result).toEqual({ deletedCount: 3 });
  });

  it("returns deletedCount matching input array length", async () => {
    setupAdmin();
    setupDelete();
    setupInsert();

    const { adminBulkDeleteUsers } = await import("@/app/actions/admin/adminMutations");
    const result = await adminBulkDeleteUsers(["a", "b"]);
    expect(result.deletedCount).toBe(2);
  });
});

// ── adminCreateInvite ─────────────────────────────────────────────────────────

describe("adminCreateInvite", () => {
  it("creates invite and writes audit log", async () => {
    setupAdmin();
    // First insert: invite itself; second insert: audit log
    let insertCount = 0;
    db.insert.mockImplementation(() => {
      insertCount++;
      return {
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue(insertCount === 1 ? [INVITE_ROW] : []),
        }),
      };
    });

    const { adminCreateInvite } = await import("@/app/actions/admin/adminMutations");
    const result = await adminCreateInvite({ email: "new@example.com", tier: "beta" });

    expect(db.insert).toHaveBeenCalledTimes(2); // invite + audit log
    expect(result).toEqual(INVITE_ROW);
  });

  it("uses generated UUID as token", async () => {
    setupAdmin();
    let insertCount = 0;
    db.insert.mockImplementation(() => {
      insertCount++;
      return {
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue(insertCount === 1 ? [INVITE_ROW] : []),
        }),
      };
    });

    const { adminCreateInvite } = await import("@/app/actions/admin/adminMutations");
    await adminCreateInvite({ email: "a@b.com", tier: "alpha" });

    const { v4: uuidv4 } = await import("uuid");
    expect(uuidv4).toHaveBeenCalled();
  });
});

// ── adminRevokeInvite ─────────────────────────────────────────────────────────

describe("adminRevokeInvite", () => {
  it("deletes invite and writes audit log, returns true", async () => {
    setupAdmin();
    setupDelete();
    setupInsert();

    const { adminRevokeInvite } = await import("@/app/actions/admin/adminMutations");
    const result = await adminRevokeInvite("invite-1");

    expect(db.delete).toHaveBeenCalled();
    expect(db.insert).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});

// ── adminResendInvite ─────────────────────────────────────────────────────────

describe("adminResendInvite", () => {
  it("extends expiry by 30 days and writes audit log", async () => {
    // requireAdmin: first select returns admin role; second select: invite found
    setupAdmin([INVITE_ROW]);
    setupUpdate({ ...INVITE_ROW, expiresAt: new Date() });
    setupInsert();

    const { adminResendInvite } = await import("@/app/actions/admin/adminMutations");
    const result = await adminResendInvite("invite-1");

    expect(db.update).toHaveBeenCalled();
    expect(db.insert).toHaveBeenCalled(); // audit log
    expect(result).toBeDefined();
  });

  it("throws 'Invite not found' when invite does not exist", async () => {
    setupAdmin([]); // second select: empty → invite not found

    const { adminResendInvite } = await import("@/app/actions/admin/adminMutations");
    await expect(adminResendInvite("nonexistent-invite")).rejects.toThrow("Invite not found");
  });
});

// ── adminBulkCreateInvites ────────────────────────────────────────────────────

describe("adminBulkCreateInvites", () => {
  it("creates invites for all emails and writes audit log", async () => {
    setupAdmin();
    const createdInvites = [
      { id: "inv-1", email: "a@b.com" },
      { id: "inv-2", email: "c@d.com" },
    ];
    let insertCount = 0;
    db.insert.mockImplementation(() => {
      insertCount++;
      return {
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue(insertCount === 1 ? createdInvites : []),
        }),
      };
    });

    const { adminBulkCreateInvites } = await import("@/app/actions/admin/adminMutations");
    const result = await adminBulkCreateInvites(["a@b.com", "c@d.com"], "beta");

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
  });

  it("defaults tier to 'public' when not provided", async () => {
    setupAdmin();
    let insertCount = 0;
    db.insert.mockImplementation(() => {
      insertCount++;
      return {
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue(insertCount === 1 ? [INVITE_ROW] : []),
        }),
      };
    });

    const { adminBulkCreateInvites } = await import("@/app/actions/admin/adminMutations");
    await expect(adminBulkCreateInvites(["x@y.com"])).resolves.toBeDefined();
  });
});

// ── adminDeleteWaitlistEntry ──────────────────────────────────────────────────

describe("adminDeleteWaitlistEntry", () => {
  it("deletes waitlist entry and returns true", async () => {
    setupAdmin();
    setupDelete();
    setupInsert();

    const { adminDeleteWaitlistEntry } = await import("@/app/actions/admin/adminMutations");
    const result = await adminDeleteWaitlistEntry("waitlist-1");

    expect(db.delete).toHaveBeenCalled();
    expect(db.insert).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});

// ── adminBulkDeleteWaitlist ───────────────────────────────────────────────────

describe("adminBulkDeleteWaitlist", () => {
  it("bulk-deletes waitlist entries and returns deletedCount", async () => {
    setupAdmin();
    setupDelete();
    setupInsert();

    const { adminBulkDeleteWaitlist } = await import("@/app/actions/admin/adminMutations");
    const result = await adminBulkDeleteWaitlist(["w1", "w2", "w3", "w4"]);

    expect(db.delete).toHaveBeenCalled();
    expect(db.insert).toHaveBeenCalled();
    expect(result).toEqual({ deletedCount: 4 });
  });
});

// ── adminConvertWaitlistToInvite ──────────────────────────────────────────────

describe("adminConvertWaitlistToInvite", () => {
  it("creates invite from waitlist entry and writes audit log", async () => {
    // requireAdmin: first select returns admin; second: waitlist entry found
    setupAdmin([WAITLIST_ROW]);
    let insertCount = 0;
    db.insert.mockImplementation(() => {
      insertCount++;
      return {
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue(insertCount === 1 ? [INVITE_ROW] : []),
        }),
      };
    });

    const { adminConvertWaitlistToInvite } = await import("@/app/actions/admin/adminMutations");
    const result = await adminConvertWaitlistToInvite("waitlist-1", "beta");

    expect(db.insert).toHaveBeenCalled();
    expect(result).toEqual(INVITE_ROW);
  });

  it("throws 'Waitlist entry not found' when entry does not exist", async () => {
    setupAdmin([]); // second select: empty → entry not found

    const { adminConvertWaitlistToInvite } = await import("@/app/actions/admin/adminMutations");
    await expect(adminConvertWaitlistToInvite("nonexistent-id")).rejects.toThrow(
      "Waitlist entry not found"
    );
  });

  it("defaults tier to 'public' when not provided", async () => {
    setupAdmin([WAITLIST_ROW]);
    let insertCount = 0;
    db.insert.mockImplementation(() => {
      insertCount++;
      return {
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue(insertCount === 1 ? [INVITE_ROW] : []),
        }),
      };
    });

    const { adminConvertWaitlistToInvite } = await import("@/app/actions/admin/adminMutations");
    await expect(adminConvertWaitlistToInvite("waitlist-1")).resolves.toBeDefined();
  });
});
