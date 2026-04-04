"use client";

import { useState } from "react";
import {
  IoPersonOutline,
  IoCashOutline,
  IoWalletOutline,
  IoLocationOutline,
  IoLinkOutline,
  IoNotificationsOutline,
  IoCheckmarkCircle,
  IoCalendarOutline,
  IoMailOutline,
  IoSpeedometerOutline,
  IoShieldCheckmarkOutline,
  IoCloseCircleOutline,
  IoAddOutline,
  IoLogoGoogle,
} from "react-icons/io5";
import { Slider } from "@/components/ui/slider";

type SectionId = "profile" | "income" | "budget" | "location" | "integrations" | "notifications";

const navItems: { id: SectionId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "profile",       label: "Profile",        icon: IoPersonOutline        },
  { id: "income",        label: "Income & Rate",  icon: IoCashOutline          },
  { id: "budget",        label: "Budget & Risk",  icon: IoWalletOutline        },
  { id: "location",      label: "Location",       icon: IoLocationOutline      },
  { id: "integrations",  label: "Integrations",   icon: IoLinkOutline          },
  { id: "notifications", label: "Notifications",  icon: IoNotificationsOutline },
];

// ── Shared primitives ─────────────────────────────────────────────────────────

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-5">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <p className="text-xs text-gray-400 mt-0.5">{description}</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-medium text-gray-800 group-hover:text-blue-600 transition-colors">{value}</span>
    </div>
  );
}

function Toggle({ label, description, on }: { label: string; description?: string; on: boolean }) {
  return (
    <div className="flex items-center justify-between px-3 py-3 rounded-lg border border-gray-100">
      <div className="flex-1 min-w-0 mr-3">
        <p className="text-xs font-medium text-gray-800">{label}</p>
        {description && <p className="text-[10px] text-gray-400 mt-0.5">{description}</p>}
      </div>
      <div className={`w-9 h-5 rounded-full relative flex-shrink-0 ${on ? "bg-blue-500" : "bg-gray-200"}`}>
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? "right-0.5" : "left-0.5"}`} />
      </div>
    </div>
  );
}

// ── Profile ───────────────────────────────────────────────────────────────────

function ProfileSection() {
  return (
    <div className="p-5">
      <SectionHeader title="Profile" description="Your personal information and account details." />
      <div className="grid grid-cols-2 gap-5">
        {/* Left col */}
        <div className="space-y-3">
          {/* Avatar */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-base font-bold text-white">JM</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Jamie M.</p>
              <p className="text-[10px] text-gray-400">jamie@home.com</p>
              <button className="text-[10px] text-blue-600 font-medium mt-0.5">Change photo</button>
            </div>
          </div>
          <Field label="Full name"    value="Jamie M."       />
          <Field label="Email"        value="jamie@home.com" />
          <Field label="Phone"        value="(614) 555-0182" />
        </div>
        {/* Right col */}
        <div className="space-y-3">
          <Field label="Member since" value="Dec 2025"        />
          <Field label="Plan"         value="Beta · Free"     />
          <Field label="Location"     value="ZIP 90210 · 25mi"/>
          <Field label="Household"    value="2 members"       />
          {/* Plan card */}
          <div className="p-3 rounded-xl border border-blue-100 bg-blue-50">
            <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide mb-1">Current Plan</p>
            <p className="text-sm font-bold text-blue-700">Beta — Free</p>
            <p className="text-[10px] text-blue-600/70 mt-0.5">All features unlocked during beta</p>
          </div>
          <div className="pt-1 border-t border-gray-100">
            <button className="text-xs text-red-500 hover:text-red-600 font-medium">Delete account</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Income & Rate ─────────────────────────────────────────────────────────────

function IncomeSection() {
  return (
    <div className="p-5">
      <SectionHeader title="Income & Rate" description="Your time is worth money — we use this to evaluate DIY vs pro." />
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-3">
          {/* Rate cards */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Hourly",  value: "$47",     color: "text-blue-600"  },
              { label: "Monthly", value: "$8,125",  color: "text-gray-900" },
              { label: "Annual",  value: "$97.5k",  color: "text-gray-900" },
            ].map((s) => (
              <div key={s.label} className="p-2.5 rounded-lg border border-gray-100 bg-gray-50 text-center">
                <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
                <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
          {/* Opportunity cost */}
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
            <p className="text-[10px] font-semibold text-blue-700 mb-1">Opportunity Cost</p>
            <p className="text-xs text-blue-700 leading-relaxed">
              A 4-hour DIY needs to save at least <span className="font-bold">$188</span> to beat your hourly rate.
            </p>
          </div>
          {/* DIY threshold */}
          <div className="p-3 rounded-lg border border-gray-100">
            <p className="text-[10px] text-gray-400 mb-1">DIY Threshold</p>
            <p className="text-base font-bold text-gray-900">$47 / hr</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Anything cheaper isn't worth your time</p>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Income Streams</p>
          {[
            { source: "Primary Salary", amount: "$6,500/mo", pct: 79 },
            { source: "Rental Income",  amount: "$1,300/mo", pct: 16 },
            { source: "Freelance",      amount: "$800/mo",   pct: 10 },
          ].map((s) => (
            <div key={s.source} className="space-y-1">
              <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-100">
                <span className="text-xs text-gray-700">{s.source}</span>
                <span className="text-xs font-semibold text-green-600">{s.amount}</span>
              </div>
              <div className="px-1">
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-400 rounded-full" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            </div>
          ))}
          <button className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-500 border border-dashed border-gray-200 rounded-lg hover:border-gray-300 hover:text-gray-700 transition-colors">
            <IoAddOutline className="w-3.5 h-3.5" />Add stream
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Budget & Risk ─────────────────────────────────────────────────────────────

function BudgetSection({ riskLevel, setRiskLevel }: { riskLevel: number; setRiskLevel: (v: number) => void }) {
  const riskLabels = ["None", "Very Low", "Low", "Moderate", "High", "Very High"];

  return (
    <div className="p-5">
      <SectionHeader title="Budget & Risk" description="Set your spending limits and DIY comfort level." />
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-3">
          {/* Budget progress */}
          <div className="p-4 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-[10px] text-gray-400">Monthly Budget</p>
                <p className="text-2xl font-bold text-gray-900">$800</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400">Spent</p>
                <p className="text-base font-semibold text-amber-600">$480</p>
              </div>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: "60%" }} />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">60% used · $320 remaining</p>
          </div>
          {/* Limit cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-lg border border-gray-100">
              <p className="text-[10px] text-gray-400 mb-1">Monthly Limit</p>
              <p className="text-base font-bold text-gray-900">$800</p>
            </div>
            <div className="p-3 rounded-lg border border-gray-100">
              <p className="text-[10px] text-gray-400 mb-1">Emergency Buffer</p>
              <p className="text-base font-bold text-gray-900">$2,000</p>
              <div className="flex items-center gap-1 mt-0.5">
                <IoShieldCheckmarkOutline className="w-3 h-3 text-blue-600" />
                <span className="text-[10px] text-blue-600">Protected</span>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {/* DIY comfort slider */}
          <div className="p-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <IoSpeedometerOutline className="w-4 h-4 text-blue-600" />
              <p className="text-xs font-medium text-gray-700">DIY Comfort Level</p>
            </div>
            <div className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 mb-3">
              <p className="text-sm font-semibold text-blue-600">{riskLabels[riskLevel]}</p>
            </div>
            <div className="px-1">
              <Slider
                value={[riskLevel]}
                onValueChange={(values) => setRiskLevel(values[0])}
                min={0} max={5} step={1}
                className="[&_[data-slot=slider-track]]:bg-gray-200 [&_[data-slot=slider-range]]:bg-blue-500 [&_[data-slot=slider-thumb]]:border-blue-500 [&_[data-slot=slider-thumb]]:bg-white"
              />
              <div className="flex justify-between mt-2 text-[10px] text-gray-400">
                <span>Always Hire</span>
                <span>Always DIY</span>
              </div>
            </div>
          </div>
          {/* Category overrides */}
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Category Limits</p>
          {[
            { cat: "HVAC",      limit: "$300" },
            { cat: "Plumbing",  limit: "$150" },
            { cat: "Electrical",limit: "$200" },
          ].map((c) => (
            <div key={c.cat} className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-100">
              <span className="text-xs text-gray-600">{c.cat}</span>
              <span className="text-xs font-semibold text-gray-800">{c.limit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Location ──────────────────────────────────────────────────────────────────

function LocationSection() {
  return (
    <div className="p-5">
      <SectionHeader title="Location" description="Used to find local contractors, parts stores, and pricing." />
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-3">
          <Field label="ZIP Code"       value="90210"      />
          <Field label="City"           value="Beverly Hills, CA" />
          <Field label="Search Radius"  value="25 miles"   />
          <Field label="Country"        value="United States" />
          {/* Mock map */}
          <div className="relative w-full h-[90px] rounded-lg overflow-hidden border border-gray-200">
            <svg viewBox="0 0 200 90" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
              <rect width="200" height="90" fill="#f8f9fa"/>
              <rect x="0"   y="0"  width="60"  height="35" fill="#f1f3f4" stroke="#e5e7eb" strokeWidth="0.5"/>
              <rect x="65"  y="0"  width="55"  height="35" fill="#f1f3f4" stroke="#e5e7eb" strokeWidth="0.5"/>
              <rect x="125" y="0"  width="75"  height="35" fill="#f1f3f4" stroke="#e5e7eb" strokeWidth="0.5"/>
              <rect x="0"   y="42" width="45"  height="48" fill="#f1f3f4" stroke="#e5e7eb" strokeWidth="0.5"/>
              <rect x="50"  y="42" width="65"  height="48" fill="#f1f3f4" stroke="#e5e7eb" strokeWidth="0.5"/>
              <rect x="120" y="42" width="80"  height="48" fill="#f1f3f4" stroke="#e5e7eb" strokeWidth="0.5"/>
              <rect x="0"   y="35" width="200" height="7"  fill="#e5e7eb"/>
              <rect x="60"  y="0"  width="5"   height="90" fill="#e5e7eb"/>
              <rect x="120" y="0"  width="5"   height="90" fill="#e5e7eb"/>
              {/* radius ring */}
              <circle cx="100" cy="45" r="30" fill="#2563eb" fillOpacity="0.06" stroke="#2563eb" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3 2"/>
              {/* you */}
              <circle cx="100" cy="45" r="5" fill="#2563eb"/>
              <circle cx="100" cy="45" r="9" fill="#2563eb" fillOpacity="0.2"/>
              {/* nearby pins */}
              <circle cx="72"  cy="22" r="4" fill="#f97316"/>
              <circle cx="138" cy="22" r="4" fill="#f97316"/>
              <circle cx="130" cy="62" r="4" fill="#10b981"/>
              <circle cx="65"  cy="60" r="4" fill="#10b981"/>
            </svg>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Nearby Found</p>
          {[
            { name: "Home Depot",    dist: "0.8mi", type: "store",      dot: "bg-orange-400" },
            { name: "Ace Hardware",  dist: "1.9mi", type: "store",      dot: "bg-orange-400" },
            { name: "Johnson HVAC",  dist: "1.2mi", type: "contractor", dot: "bg-emerald-500"},
            { name: "Peak Plumbing", dist: "2.1mi", type: "contractor", dot: "bg-emerald-500"},
          ].map((p) => (
            <div key={p.name} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-100">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${p.dot}`} />
              <span className="text-xs text-gray-700 flex-1">{p.name}</span>
              <span className="text-[10px] text-gray-400">{p.dist}</span>
            </div>
          ))}
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
            <p className="text-[10px] font-semibold text-emerald-700">Local pricing active</p>
            <p className="text-[10px] text-emerald-600/80 mt-0.5">Quotes and parts costs reflect your ZIP</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Integrations ──────────────────────────────────────────────────────────────

function IntegrationsSection() {
  return (
    <div className="p-5">
      <SectionHeader title="Integrations" description="Connected services used by OpportunIQ." />
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Connected</p>
          {[
            { name: "Gmail",           sub: "Send quote requests",         icon: IoMailOutline,     iconBg: "bg-red-50",   iconColor: "text-red-500"   },
            { name: "Google Calendar", sub: "Schedule appointments",       icon: IoCalendarOutline, iconBg: "bg-blue-50",  iconColor: "text-blue-600"  },
          ].map((s) => (
            <div key={s.name} className="flex items-center gap-3 px-3 py-3 rounded-lg border border-gray-100">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${s.iconBg}`}>
                <s.icon className={`w-4 h-4 ${s.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900">{s.name}</p>
                <p className="text-[10px] text-gray-400">{s.sub}</p>
              </div>
              <IoCheckmarkCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
        </div>
      </div>
    </div>
  );
}

// ── Notifications ─────────────────────────────────────────────────────────────

function NotificationsSection() {
  return (
    <div className="p-5">
      <SectionHeader title="Notifications" description="Control what updates you receive and how." />
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Email</p>
          <Toggle label="Email notifications" description="Issue updates, quotes, alerts"  on={true}  />
          <Toggle label="Weekly digest"       description="Summary of activity each week"  on={true}  />
          <Toggle label="Marketing emails"    description="Tips, guides, and new features" on={false} />
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">In-App</p>
          <Toggle label="DIY reminders"     description="Nudges when tasks are due"         on={true}  />
          <Toggle label="Contractor quotes" description="Alert when a quote arrives"        on={true}  />
          <Toggle label="Safety alerts"     description="Urgent home safety warnings"       on={true}  />
          <Toggle label="Budget warnings"   description="Alert at 80% of monthly budget"   on={false} />
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function SettingsView() {
  const [activeSection, setActiveSection] = useState<SectionId>("profile");
  const [riskLevel, setRiskLevel] = useState(3);

  return (
    <div className="flex h-full overflow-hidden bg-white">
      {/* Left nav */}
      <div className="w-[180px] flex-shrink-0 border-r border-gray-100 flex flex-col h-full">
        <div className="px-3 py-3 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-900">Settings</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                  isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="px-3 py-2.5 border-t border-gray-100">
          <span className="text-[10px] px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">Beta</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 h-full overflow-y-auto">
        {activeSection === "profile"       && <ProfileSection />}
        {activeSection === "income"        && <IncomeSection />}
        {activeSection === "budget"        && <BudgetSection riskLevel={riskLevel} setRiskLevel={setRiskLevel} />}
        {activeSection === "location"      && <LocationSection />}
        {activeSection === "integrations"  && <IntegrationsSection />}
        {activeSection === "notifications" && <NotificationsSection />}
      </div>
    </div>
  );
}
