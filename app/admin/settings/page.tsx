import {
  IoMail,
  IoShield,
  IoFlash,
  IoPeople,
  IoLockClosed,
} from "react-icons/io5";

export default function Settings() {
  return (
    <div className="min-h-[calc(100vh-48px)] lg:min-h-screen bg-[#0f0f0f] p-3 sm:p-4 lg:p-5 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-white">Settings</h1>
        <p className="text-[10px] sm:text-xs text-[#666]">Configure platform settings and feature flags</p>
      </div>

      {/* Settings Grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Access Control */}
        <div className="bg-[#171717] border border-white/[0.06] rounded-lg p-4">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <IoLockClosed className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-white">Access Control</h2>
              <p className="text-[10px] text-[#666]">Manage user registration and access</p>
            </div>
          </div>
          <div className="space-y-0">
            <ToggleItem
              label="Maintenance Mode"
              description="Disable public access temporarily"
              defaultChecked={false}
            />
            <ToggleItem
              label="Public Registration"
              description="Allow anyone to sign up"
              defaultChecked={false}
            />
            <ToggleItem
              label="Waitlist Mode"
              description="Non-invited users join waitlist"
              defaultChecked={true}
            />
            <ToggleItem
              label="Auto-approve Referrals"
              description="Automatically accept referral signups"
              defaultChecked={true}
            />
          </div>
        </div>

        {/* Email Notifications */}
        <div className="bg-[#171717] border border-white/[0.06] rounded-lg p-4">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <IoMail className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-white">Email Notifications</h2>
              <p className="text-[10px] text-[#666]">Configure email triggers</p>
            </div>
          </div>
          <div className="space-y-0">
            <ToggleItem
              label="Welcome Emails"
              description="Send email when users sign up"
              defaultChecked={true}
            />
            <ToggleItem
              label="Invite Emails"
              description="Send email with invite link"
              defaultChecked={true}
            />
            <ToggleItem
              label="Referral Notifications"
              description="Notify when referrals convert"
              defaultChecked={true}
            />
            <ToggleItem
              label="Weekly Digest"
              description="Send platform summary to admins"
              defaultChecked={false}
            />
          </div>
        </div>

        {/* Feature Flags */}
        <div className="bg-[#171717] border border-white/[0.06] rounded-lg p-4">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <IoFlash className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-white">Feature Flags</h2>
              <p className="text-[10px] text-[#666]">Toggle features for beta testing</p>
            </div>
          </div>
          <div className="space-y-0">
            <ToggleItem
              label="Smart Decision Engine"
              description="Enable smart suggestions"
              defaultChecked={true}
            />
            <ToggleItem
              label="Vendor Discovery"
              description="Show contractor recommendations"
              defaultChecked={true}
            />
            <ToggleItem
              label="Cost Simulations"
              description="What-if scenario modeling"
              defaultChecked={false}
            />
            <ToggleItem
              label="Group Voting"
              description="Household decision voting"
              defaultChecked={true}
            />
          </div>
        </div>

        {/* Referral Program */}
        <div className="bg-[#171717] border border-white/[0.06] rounded-lg p-4">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <IoPeople className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-white">Referral Program</h2>
              <p className="text-[10px] text-[#666]">Configure referral rewards</p>
            </div>
          </div>
          <div className="space-y-0">
            <div className="flex items-center justify-between py-2.5 border-b border-white/[0.06]">
              <div>
                <p className="text-xs text-white">Invite Expiry</p>
                <p className="text-[10px] text-[#666]">Days until invite expires</p>
              </div>
              <input
                type="number"
                defaultValue={7}
                className="w-16 px-2 py-1 text-xs text-white bg-[#0f0f0f] border border-white/[0.06] rounded-md focus:border-white/[0.1] focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-white/[0.06]">
              <div>
                <p className="text-xs text-white">Max Referrals per User</p>
                <p className="text-[10px] text-[#666]">0 = unlimited</p>
              </div>
              <input
                type="number"
                defaultValue={0}
                className="w-16 px-2 py-1 text-xs text-white bg-[#0f0f0f] border border-white/[0.06] rounded-md focus:border-white/[0.1] focus:outline-none"
              />
            </div>
            <ToggleItem
              label="Show Leaderboard"
              description="Display top referrers publicly"
              defaultChecked={false}
            />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="lg:col-span-2 bg-red-500/5 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <IoShield className="h-4 w-4 text-red-400" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-red-400">Danger Zone</h2>
              <p className="text-[10px] text-[#666]">Irreversible actions</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <button className="px-3 py-2.5 text-left text-red-400 bg-[#171717] border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors">
              <p className="text-xs font-medium">Reset Waitlist</p>
              <p className="text-[10px] text-[#666] mt-0.5">Clear all waitlist entries</p>
            </button>
            <button className="px-3 py-2.5 text-left text-red-400 bg-[#171717] border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors">
              <p className="text-xs font-medium">Revoke All Invites</p>
              <p className="text-[10px] text-[#666] mt-0.5">Expire pending invites</p>
            </button>
            <button className="px-3 py-2.5 text-left text-red-400 bg-[#171717] border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors">
              <p className="text-xs font-medium">Export All Data</p>
              <p className="text-[10px] text-[#666] mt-0.5">Download database backup</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleItem({
  label,
  description,
  defaultChecked,
}: {
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.06] last:border-0">
      <div>
        <p className="text-xs text-white">{label}</p>
        <p className="text-[10px] text-[#666]">{description}</p>
      </div>
      <label className="relative inline-flex cursor-pointer">
        <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} />
        <div className="w-8 h-4 bg-white/[0.06] rounded-full peer peer-checked:bg-emerald-500 transition-colors relative">
          <div
            className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"
            style={{ transform: defaultChecked ? "translateX(16px)" : "translateX(0)" }}
          />
        </div>
      </label>
    </div>
  );
}
