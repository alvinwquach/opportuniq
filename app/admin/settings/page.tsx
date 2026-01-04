import {
  IoMail,
  IoShield,
  IoFlash,
  IoPeople,
  IoLockClosed,
} from "react-icons/io5";

export default function Settings() {
  return (
    <div className="p-4 lg:p-5">
      <div className="mb-4">
        <h1 className="text-[15px] font-medium text-white">Settings</h1>
        <p className="text-[13px] text-[#666]">Configure platform settings and feature flags</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-[#161616] border border-[#1f1f1f]">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-1.5 rounded-md bg-[#1f1f1f]">
              <IoLockClosed className="h-3.5 w-3.5 text-[#888]" />
            </div>
            <div>
              <h2 className="text-[13px] font-medium text-white">Access Control</h2>
              <p className="text-[11px] text-[#666]">Manage user registration and access</p>
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
        <div className="p-4 rounded-lg bg-[#161616] border border-[#1f1f1f]">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-1.5 rounded-md bg-[#1f1f1f]">
              <IoMail className="h-3.5 w-3.5 text-[#888]" />
            </div>
            <div>
              <h2 className="text-[13px] font-medium text-white">Email Notifications</h2>
              <p className="text-[11px] text-[#666]">Configure email triggers</p>
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
        <div className="p-4 rounded-lg bg-[#161616] border border-[#1f1f1f]">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-1.5 rounded-md bg-[#1f1f1f]">
              <IoFlash className="h-3.5 w-3.5 text-[#888]" />
            </div>
            <div>
              <h2 className="text-[13px] font-medium text-white">Feature Flags</h2>
              <p className="text-[11px] text-[#666]">Toggle features for beta testing</p>
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
        <div className="p-4 rounded-lg bg-[#161616] border border-[#1f1f1f]">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-1.5 rounded-md bg-[#1f1f1f]">
              <IoPeople className="h-3.5 w-3.5 text-[#888]" />
            </div>
            <div>
              <h2 className="text-[13px] font-medium text-white">Referral Program</h2>
              <p className="text-[11px] text-[#666]">Configure referral rewards</p>
            </div>
          </div>
          <div className="space-y-0">
            <div className="flex items-center justify-between py-2.5 border-b border-[#1f1f1f]">
              <div>
                <p className="text-[13px] text-white">Invite Expiry</p>
                <p className="text-[11px] text-[#666]">Days until invite expires</p>
              </div>
              <input
                type="number"
                defaultValue={7}
                className="w-16 px-2 py-1 text-[13px] text-white bg-[#1f1f1f] border border-[#2a2a2a] rounded-md focus:border-[#3a3a3a] focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-[#1f1f1f]">
              <div>
                <p className="text-[13px] text-white">Max Referrals per User</p>
                <p className="text-[11px] text-[#666]">0 = unlimited</p>
              </div>
              <input
                type="number"
                defaultValue={0}
                className="w-16 px-2 py-1 text-[13px] text-white bg-[#1f1f1f] border border-[#2a2a2a] rounded-md focus:border-[#3a3a3a] focus:outline-none"
              />
            </div>
            <ToggleItem
              label="Show Leaderboard"
              description="Display top referrers publicly"
              defaultChecked={false}
            />
          </div>
        </div>
        <div className="lg:col-span-2 p-4 rounded-lg bg-[#161616] border border-red-500/20">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-1.5 rounded-md bg-red-500/10">
              <IoShield className="h-3.5 w-3.5 text-red-400" />
            </div>
            <div>
              <h2 className="text-[13px] font-medium text-red-400">Danger Zone</h2>
              <p className="text-[11px] text-[#666]">Irreversible actions</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <button className="px-3 py-2.5 text-left text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/5 transition-colors">
              <p className="text-[13px] font-medium">Reset Waitlist</p>
              <p className="text-[11px] text-[#666] mt-0.5">Clear all waitlist entries</p>
            </button>
            <button className="px-3 py-2.5 text-left text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/5 transition-colors">
              <p className="text-[13px] font-medium">Revoke All Invites</p>
              <p className="text-[11px] text-[#666] mt-0.5">Expire pending invites</p>
            </button>
            <button className="px-3 py-2.5 text-left text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/5 transition-colors">
              <p className="text-[13px] font-medium">Export All Data</p>
              <p className="text-[11px] text-[#666] mt-0.5">Download database backup</p>
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
    <div className="flex items-center justify-between py-2.5 border-b border-[#1f1f1f] last:border-0">
      <div>
        <p className="text-[13px] text-white">{label}</p>
        <p className="text-[11px] text-[#666]">{description}</p>
      </div>
      <label className="relative inline-flex cursor-pointer">
        <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} />
        <div className="w-8 h-4 bg-[#2a2a2a] rounded-full peer peer-checked:bg-[#5eead4] transition-colors relative">
          <div
            className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"
            style={{ transform: defaultChecked ? "translateX(16px)" : "translateX(0)" }}
          />
        </div>
      </label>
    </div>
  );
}
