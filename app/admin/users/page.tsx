import Image from "next/image";
import { getUsersData } from "./actions";

export default async function Users() {
  let allUsers: any[] = [];
  let userStats: any = null;
  let error: string | null = null;

  try {
    const result = await getUsersData();
    allUsers = result.allUsers || [];
    userStats = result.userStats || null;
  } catch (err: any) {
    error = err?.message || "Failed to load users";
    console.error("[Admin Users] Error loading users:", err);
  }

  const tierColors: Record<string, { bg: string; text: string }> = {
    johatsu: { bg: 'rgba(244, 63, 94, 0.15)', text: '#f43f5e' },
    alpha: { bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7' },
    beta: { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e' },
    public: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' },
  };

  const roleColors: Record<string, { bg: string; text: string }> = {
    admin: { bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24' },
    moderator: { bg: 'rgba(167, 139, 250, 0.15)', text: '#a78bfa' },
    user: { bg: 'rgba(94, 234, 212, 0.15)', text: '#5eead4' },
    banned: { bg: 'rgba(248, 113, 113, 0.15)', text: '#f87171' },
  };

  if (error) {
    return (
      <div className="p-4 lg:p-5">
        <div className="mb-4">
          <h1 className="text-[15px] font-medium text-white">Users</h1>
          <p className="text-[13px] text-[#666]">Manage all registered users</p>
        </div>
        <div className="bg-red-900/50 border border-red-800 rounded-lg p-4">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Users</h2>
          <p className="text-red-300">{error}</p>
          <p className="text-sm text-red-400 mt-2">
            This is likely a database connection issue. Check your DATABASE_URL configuration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white mb-1">Users</h1>
        <p className="text-[13px] text-[#666]">Manage all registered users and access tiers</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-[#161616] border border-[#1f1f1f] hover:border-[#2a2a2a] transition-colors">
          <p className="text-[11px] font-medium text-[#666] mb-2">Total Users</p>
          <span className="text-2xl font-bold text-white">{userStats?.total || 0}</span>
        </div>
        <div className="p-4 rounded-lg bg-[#161616] border border-[#1f1f1f] hover:border-[#2a2a2a] transition-colors">
          <p className="text-[11px] font-medium text-[#666] mb-2">Johatsu</p>
          <span className="text-2xl font-bold text-white">{userStats?.johatsu || 0}</span>
        </div>
        <div className="p-4 rounded-lg bg-[#161616] border border-[#1f1f1f] hover:border-[#2a2a2a] transition-colors">
          <p className="text-[11px] font-medium text-[#666] mb-2">Alpha Users</p>
          <span className="text-2xl font-bold text-white">{userStats?.alpha || 0}</span>
        </div>
        <div className="p-4 rounded-lg bg-[#161616] border border-[#1f1f1f] hover:border-[#2a2a2a] transition-colors">
          <p className="text-[11px] font-medium text-[#666] mb-2">Beta Users</p>
          <span className="text-2xl font-bold text-white">{userStats?.beta || 0}</span>
        </div>
        <div className="p-4 rounded-lg bg-[#161616] border border-[#1f1f1f] hover:border-[#2a2a2a] transition-colors">
          <p className="text-[11px] font-medium text-[#666] mb-2">Banned</p>
          <span className="text-2xl font-bold text-white">{userStats?.banned || 0}</span>
        </div>
      </div>
      <div className="rounded-lg bg-[#161616] border border-[#1f1f1f] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1f1f1f]">
                <th className="text-left text-[11px] font-medium text-[#666] px-4 py-3">User</th>
                <th className="text-left text-[11px] font-medium text-[#666] px-4 py-3">Tier</th>
                <th className="text-left text-[11px] font-medium text-[#666] px-4 py-3">Role</th>
                <th className="text-left text-[11px] font-medium text-[#666] px-4 py-3">Referrals</th>
                <th className="text-left text-[11px] font-medium text-[#666] px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f1f]">
              {allUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#1a1a1a] transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      {user.avatarUrl ? (
                        <Image
                          src={user.avatarUrl}
                          alt={user.name || user.email}
                          width={28}
                          height={28}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#1f1f1f] flex items-center justify-center text-[11px] font-medium text-[#888]">
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-[13px] text-white">{user.name || "No name"}</p>
                        <p className="text-[11px] text-[#666]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded capitalize"
                      style={{
                        backgroundColor: tierColors[user.accessTier || 'public']?.bg,
                        color: tierColors[user.accessTier || 'public']?.text,
                      }}
                    >
                      {(user.accessTier || 'public').toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded capitalize"
                      style={{
                        backgroundColor: roleColors[user.role]?.bg,
                        color: roleColors[user.role]?.text,
                      }}
                    >
                      {user.role.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-white font-mono">{user.referralCount || 0}</span>
                      {user.referralCode && (
                        <code className="text-[10px] text-[#666] bg-[#1f1f1f] px-1 py-0.5 rounded">
                          {user.referralCode}
                        </code>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-[13px] text-[#888]">
                      {user.createdAt.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
