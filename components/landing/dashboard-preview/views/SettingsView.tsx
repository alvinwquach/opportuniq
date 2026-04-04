"use client";

import { useState, useRef, useEffect } from "react";
import {
  IoPersonOutline,
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
  IoHomeOutline,
  IoStarOutline,
  IoNavigateOutline,
  IoConstructOutline,
  IoPlayOutline,
  IoChatbubblesOutline,
} from "react-icons/io5";
import { Slider } from "@/components/ui/slider";
import { useDarkMode } from "../DarkModeContext";

type SectionId = "profile" | "budget" | "location" | "integrations" | "notifications";

const navItems: { id: SectionId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "profile",       label: "Profile",        icon: IoPersonOutline        },
  { id: "budget",        label: "Budget",          icon: IoWalletOutline        },
  { id: "location",      label: "Location",       icon: IoLocationOutline      },
  { id: "integrations",  label: "Integrations",   icon: IoLinkOutline          },
  { id: "notifications", label: "Notifications",  icon: IoNotificationsOutline },
];

// ── Shared primitives ─────────────────────────────────────────────────────────

function SectionHeader({ title, description }: { title: string; description: string }) {
  const dark = useDarkMode();
  return (
    <div className="mb-5">
      <h3 className={`text-sm font-semibold ${dark ? "text-gray-100" : "text-gray-900"}`}>{title}</h3>
      <p className={`text-xs mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}>{description}</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  const dark = useDarkMode();
  return (
    <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-colors cursor-pointer group ${
      dark
        ? "border-white/[0.06] hover:bg-white/[0.04]"
        : "border-gray-100 hover:bg-gray-50"
    }`}>
      <span className={`text-xs ${dark ? "text-gray-500" : "text-gray-500"}`}>{label}</span>
      <span className={`text-xs font-medium transition-colors group-hover:text-blue-500 ${dark ? "text-gray-200" : "text-gray-800"}`}>{value}</span>
    </div>
  );
}

function Toggle({ label, description, on }: { label: string; description?: string; on: boolean }) {
  const dark = useDarkMode();
  return (
    <div className={`flex items-center justify-between px-3 py-3 rounded-lg border ${
      dark ? "border-white/[0.06]" : "border-gray-100"
    }`}>
      <div className="flex-1 min-w-0 mr-3">
        <p className={`text-xs font-medium ${dark ? "text-gray-200" : "text-gray-800"}`}>{label}</p>
        {description && <p className={`text-[10px] mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}>{description}</p>}
      </div>
      <div className={`w-9 h-5 rounded-full relative flex-shrink-0 ${on ? "bg-blue-500" : dark ? "bg-white/10" : "bg-gray-200"}`}>
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? "right-0.5" : "left-0.5"}`} />
      </div>
    </div>
  );
}

// ── Profile ───────────────────────────────────────────────────────────────────

function ProfileSection() {
  const dark = useDarkMode();
  return (
    <div className="p-5">
      <SectionHeader title="Profile" description="Your personal information and account details." />
      <div className="grid grid-cols-2 gap-5">
        {/* Left col — personal info */}
        <div className="space-y-3">
          {/* Avatar */}
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${
            dark ? "border-white/[0.06] bg-[#1a1a1a]" : "border-gray-100 bg-gray-50"
          }`}>
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-base font-bold text-white">JM</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${dark ? "text-gray-100" : "text-gray-900"}`}>Jamie M.</p>
              <p className={`text-[10px] ${dark ? "text-gray-500" : "text-gray-400"}`}>jamie@home.com</p>
              <button className="text-[10px] text-blue-500 font-medium mt-0.5">Change photo</button>
            </div>
          </div>
          <Field label="Full name"      value="Jamie M."              />
          <Field label="Display name"  value="Jamie"                 />
          <Field label="Email"         value="jamie@home.com"        />
          <Field label="Phone"         value="(614) 555-0182"        />
          <Field label="Language"      value="English"               />
          <Field label="Timezone"      value="America/Los_Angeles"   />
          <Field label="Units"         value="Imperial (°F, miles)"  />
        </div>
        {/* Right col — account info */}
        <div className="space-y-3">
          <Field label="Member since"      value="Dec 2025"      />
          <Field label="Access tier"       value="Beta"           />
          <Field label="Default household" value="Main House"     />
          <Field label="Data retention"    value="Keep forever"   />

          {/* Plan card */}
          <div className={`p-3 rounded-xl border ${
            dark ? "border-blue-500/20 bg-blue-500/10" : "border-blue-100 bg-blue-50"
          }`}>
            <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1 ${dark ? "text-blue-400" : "text-blue-600"}`}>Current Plan</p>
            <p className={`text-sm font-bold ${dark ? "text-blue-300" : "text-blue-700"}`}>Beta — Free</p>
            <p className={`text-[10px] mt-0.5 ${dark ? "text-blue-400" : "text-blue-600"}`}>All features unlocked during beta</p>
          </div>

          {/* Account actions */}
          <div className={`p-3 rounded-xl border space-y-2 ${dark ? "border-white/[0.06]" : "border-gray-100"}`}>
            <p className={`text-[10px] font-semibold uppercase tracking-wide ${dark ? "text-gray-600" : "text-gray-400"}`}>Account</p>
            <button className={`w-full text-left text-xs font-medium px-3 py-2 rounded-lg transition-colors ${
              dark ? "text-gray-400 hover:bg-white/[0.04]" : "text-gray-600 hover:bg-gray-50"
            }`}>
              Export my data
            </button>
            <button className="w-full text-left text-xs font-medium text-red-500 hover:text-red-400 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors">
              Delete account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Budget (merged Income & Rate + Budget & Risk) ────────────────────────────

interface IncomeStream {
  id: string;
  source: string;
  amount: number;
}

const defaultStreams: IncomeStream[] = [
  { id: "1", source: "Primary Salary", amount: 6500 },
  { id: "2", source: "Rental Income",  amount: 1300 },
  { id: "3", source: "Freelance",      amount: 800  },
];

function AnimatedNumber({ value, prefix = "$" }: { value: number; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || prevValue.current === value) { prevValue.current = value; return; }
    const start = prevValue.current;
    const diff = value - start;
    const duration = 400;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(start + diff * eased);
      if (el) el.textContent = `${prefix}${current.toLocaleString()}`;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
    prevValue.current = value;
  }, [value, prefix]);

  return <span ref={ref}>{prefix}{value.toLocaleString()}</span>;
}

function BudgetSection({ riskLevel, setRiskLevel }: { riskLevel: number; setRiskLevel: (v: number) => void }) {
  const dark = useDarkMode();
  const riskLabels = ["None", "Very Low", "Low", "Moderate", "High", "Very High"];
  const riskDescriptions = [
    "Always recommend hiring a professional",
    "Only suggest DIY for trivial tasks",
    "Suggest DIY for simple repairs",
    "Balance DIY and professional recommendations",
    "Prefer DIY unless safety risk or licensing required",
    "Always try DIY first, even for complex projects",
  ];
  const [hourlyRate, setHourlyRate] = useState(47);
  const [streams, setStreams] = useState<IncomeStream[]>(defaultStreams);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSource, setNewSource] = useState("");
  const [newAmount, setNewAmount] = useState("");

  const monthly = Math.round(hourlyRate * 173.33); // ~2080 hrs/yr ÷ 12
  const annual = hourlyRate * 2080;
  const opportunityCost = hourlyRate * 4;
  const totalIncome = streams.reduce((sum, s) => sum + s.amount, 0);

  const handleAddStream = () => {
    if (!newSource.trim() || !newAmount.trim()) return;
    const amount = parseInt(newAmount, 10);
    if (isNaN(amount) || amount <= 0) return;
    setStreams(prev => [...prev, { id: String(Date.now()), source: newSource.trim(), amount }]);
    setNewSource("");
    setNewAmount("");
    setShowAddForm(false);
  };

  const inputCls = `w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors ${
    dark
      ? "bg-white/[0.04] border-white/10 text-gray-200 placeholder:text-gray-600"
      : "bg-white border-gray-200 text-gray-800 placeholder:text-gray-400"
  }`;

  return (
    <div className="p-5">
      <SectionHeader title="Budget" description="Your spending limits, income, and DIY comfort level." />

      {/* Income & Rate row */}
      <div className="grid grid-cols-2 gap-5 mb-6">
        <div className="space-y-3">
          <p className={`text-[10px] font-semibold uppercase tracking-wide ${dark ? "text-gray-600" : "text-gray-400"}`}>Your Rate</p>
          <div className="grid grid-cols-3 gap-2">
            {/* Hourly — editable */}
            <div className={`p-2.5 rounded-lg border text-center ${
              dark ? "border-blue-500/30 bg-blue-500/10" : "border-blue-200 bg-blue-50"
            }`}>
              <p className={`text-[9px] uppercase tracking-wider mb-1 ${dark ? "text-blue-400" : "text-blue-600"}`}>Hourly</p>
              <div className="flex items-center justify-center gap-0.5">
                <span className="text-sm font-bold text-blue-500">$</span>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v) && v >= 0 && v <= 999) setHourlyRate(v);
                  }}
                  className={`w-10 text-sm font-bold text-blue-500 text-center bg-transparent border-none outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                />
              </div>
            </div>
            {/* Monthly — computed */}
            <div className={`p-2.5 rounded-lg border text-center ${
              dark ? "border-white/[0.06] bg-[#1a1a1a]" : "border-gray-100 bg-gray-50"
            }`}>
              <p className={`text-[9px] uppercase tracking-wider mb-1 ${dark ? "text-gray-500" : "text-gray-400"}`}>Monthly</p>
              <p className={`text-sm font-bold ${dark ? "text-gray-200" : "text-gray-900"}`}>
                <AnimatedNumber value={monthly} />
              </p>
            </div>
            {/* Annual — computed */}
            <div className={`p-2.5 rounded-lg border text-center ${
              dark ? "border-white/[0.06] bg-[#1a1a1a]" : "border-gray-100 bg-gray-50"
            }`}>
              <p className={`text-[9px] uppercase tracking-wider mb-1 ${dark ? "text-gray-500" : "text-gray-400"}`}>Annual</p>
              <p className={`text-sm font-bold ${dark ? "text-gray-200" : "text-gray-900"}`}>
                <AnimatedNumber value={annual} prefix="$" />
              </p>
            </div>
          </div>
          <div className={`p-3 rounded-lg border ${dark ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50 border-blue-100"}`}>
            <p className={`text-[10px] font-semibold mb-1 ${dark ? "text-blue-400" : "text-blue-700"}`}>Opportunity Cost</p>
            <p className={`text-xs leading-relaxed ${dark ? "text-blue-300" : "text-blue-700"}`}>
              A 4-hour DIY needs to save at least <span className="font-bold"><AnimatedNumber value={opportunityCost} /></span> to beat your hourly rate.
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className={`text-[10px] font-semibold uppercase tracking-wide ${dark ? "text-gray-600" : "text-gray-400"}`}>Income Streams</p>
            <p className={`text-[10px] ${dark ? "text-gray-600" : "text-gray-400"}`}>
              <AnimatedNumber value={totalIncome} />/mo
            </p>
          </div>
          {streams.map((s) => {
            const pct = totalIncome > 0 ? Math.round((s.amount / totalIncome) * 100) : 0;
            return (
              <div key={s.id} className="space-y-1">
                <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                  dark ? "border-white/[0.06]" : "border-gray-100"
                }`}>
                  <span className={`text-xs ${dark ? "text-gray-300" : "text-gray-700"}`}>{s.source}</span>
                  <span className="text-xs font-semibold text-green-500">${s.amount.toLocaleString()}/mo</span>
                </div>
                <div className="px-1">
                  <div className={`h-1 rounded-full overflow-hidden ${dark ? "bg-white/[0.06]" : "bg-gray-100"}`}>
                    <div className="h-full bg-green-400 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add stream form */}
          {showAddForm ? (
            <div className={`p-3 rounded-lg border space-y-2 ${dark ? "border-white/[0.06]" : "border-gray-200"}`}>
              <input
                type="text"
                placeholder="Source name"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                className={inputCls}
                autoFocus
              />
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs ${dark ? "text-gray-500" : "text-gray-400"}`}>$</span>
                  <input
                    type="number"
                    placeholder="Amount/mo"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className={`${inputCls} pl-6`}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddStream}
                  className="flex-1 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => { setShowAddForm(false); setNewSource(""); setNewAmount(""); }}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                    dark ? "text-gray-400 border-white/10 hover:bg-white/[0.06]" : "text-gray-500 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className={`w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium border border-dashed rounded-lg transition-colors ${
                dark
                  ? "text-gray-600 border-white/10 hover:border-white/20 hover:text-gray-400"
                  : "text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <IoAddOutline className="w-3.5 h-3.5" />Add stream
            </button>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className={`border-t mb-6 ${dark ? "border-white/[0.06]" : "border-gray-100"}`} />

      {/* Budget & Risk row */}
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-3">
          <p className={`text-[10px] font-semibold uppercase tracking-wide ${dark ? "text-gray-600" : "text-gray-400"}`}>Spending</p>
          <div className={`p-4 rounded-xl border ${dark ? "border-white/[0.06]" : "border-gray-100"}`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className={`text-[10px] ${dark ? "text-gray-500" : "text-gray-400"}`}>Monthly Budget</p>
                <p className={`text-2xl font-bold ${dark ? "text-gray-100" : "text-gray-900"}`}>$800</p>
              </div>
              <div className="text-right">
                <p className={`text-[10px] ${dark ? "text-gray-500" : "text-gray-400"}`}>Spent</p>
                <p className="text-base font-semibold text-amber-500">$480</p>
              </div>
            </div>
            <div className={`h-1.5 rounded-full overflow-hidden ${dark ? "bg-white/[0.06]" : "bg-gray-100"}`}>
              <div className="h-full bg-blue-500 rounded-full" style={{ width: "60%" }} />
            </div>
            <p className={`text-[10px] mt-1 ${dark ? "text-gray-500" : "text-gray-400"}`}>60% used · $320 remaining</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className={`p-3 rounded-lg border ${dark ? "border-white/[0.06]" : "border-gray-100"}`}>
              <p className={`text-[10px] mb-1 ${dark ? "text-gray-500" : "text-gray-400"}`}>Monthly Limit</p>
              <p className={`text-base font-bold ${dark ? "text-gray-100" : "text-gray-900"}`}>$800</p>
            </div>
            <div className={`p-3 rounded-lg border ${dark ? "border-white/[0.06]" : "border-gray-100"}`}>
              <p className={`text-[10px] mb-1 ${dark ? "text-gray-500" : "text-gray-400"}`}>Emergency Buffer</p>
              <p className={`text-base font-bold ${dark ? "text-gray-100" : "text-gray-900"}`}>$2,000</p>
              <div className="flex items-center gap-1 mt-0.5">
                <IoShieldCheckmarkOutline className="w-3 h-3 text-blue-500" />
                <span className="text-[10px] text-blue-500">Protected</span>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <p className={`text-[10px] font-semibold uppercase tracking-wide ${dark ? "text-gray-600" : "text-gray-400"}`}>DIY Preferences</p>
          <div className={`p-4 rounded-xl border ${dark ? "border-white/[0.06]" : "border-gray-100"}`}>
            <div className="flex items-center gap-2 mb-2">
              <IoSpeedometerOutline className="w-4 h-4 text-blue-500" />
              <p className={`text-xs font-medium ${dark ? "text-gray-300" : "text-gray-700"}`}>DIY Comfort Level</p>
            </div>
            <div className={`px-3 py-2 rounded-lg border mb-3 ${
              dark ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50 border-blue-100"
            }`}>
              <p className={`text-sm font-semibold ${dark ? "text-blue-400" : "text-blue-600"}`}>{riskLabels[riskLevel]}</p>
              <p className={`text-[10px] mt-0.5 ${dark ? "text-blue-400/70" : "text-blue-600/70"}`}>{riskDescriptions[riskLevel]}</p>
            </div>
            <div className="px-1">
              <Slider
                value={[riskLevel]}
                onValueChange={(values) => setRiskLevel(values[0])}
                min={0} max={5} step={1}
                className={dark
                  ? "[&_[data-slot=slider-track]]:bg-white/10 [&_[data-slot=slider-range]]:bg-blue-500 [&_[data-slot=slider-thumb]]:border-blue-500 [&_[data-slot=slider-thumb]]:bg-[#252525]"
                  : "[&_[data-slot=slider-track]]:bg-gray-200 [&_[data-slot=slider-range]]:bg-blue-500 [&_[data-slot=slider-thumb]]:border-blue-500 [&_[data-slot=slider-thumb]]:bg-white"
                }
              />
              <div className={`flex justify-between mt-2 text-[10px] ${dark ? "text-gray-600" : "text-gray-400"}`}>
                <span>Always Hire</span>
                <span>Always DIY</span>
              </div>
            </div>
          </div>
          <p className={`text-[10px] font-semibold uppercase tracking-wide ${dark ? "text-gray-600" : "text-gray-400"}`}>Category Limits</p>
          {[
            { cat: "HVAC",       limit: "$300" },
            { cat: "Plumbing",   limit: "$150" },
            { cat: "Electrical", limit: "$200" },
          ].map((c) => (
            <div key={c.cat} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
              dark ? "border-white/[0.06]" : "border-gray-100"
            }`}>
              <span className={`text-xs ${dark ? "text-gray-400" : "text-gray-600"}`}>{c.cat}</span>
              <span className={`text-xs font-semibold ${dark ? "text-gray-200" : "text-gray-800"}`}>{c.limit}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Location ──────────────────────────────────────────────────────────────────

function LocationSection() {
  const dark = useDarkMode();
  return (
    <div className="p-5">
      <SectionHeader title="Location" description="Your location powers cost estimates, contractor search, parts availability, weather forecasts, and local rebates." />

      {/* Map — prominent, full width */}
      <div className={`relative w-full h-[140px] rounded-xl overflow-hidden border mb-5 ${dark ? "border-white/[0.06]" : "border-gray-200"}`}>
        <svg viewBox="0 0 400 140" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          <rect width="400" height="140" fill={dark ? "#1a1a1a" : "#f8f9fa"}/>
          {/* Street grid */}
          <rect x="0"   y="0"   width="120" height="55"  fill={dark ? "#222222" : "#f1f3f4"} stroke={dark ? "#333333" : "#e5e7eb"} strokeWidth="0.5"/>
          <rect x="130" y="0"   width="110" height="55"  fill={dark ? "#222222" : "#f1f3f4"} stroke={dark ? "#333333" : "#e5e7eb"} strokeWidth="0.5"/>
          <rect x="250" y="0"   width="150" height="55"  fill={dark ? "#222222" : "#f1f3f4"} stroke={dark ? "#333333" : "#e5e7eb"} strokeWidth="0.5"/>
          <rect x="0"   y="68"  width="90"  height="72"  fill={dark ? "#222222" : "#f1f3f4"} stroke={dark ? "#333333" : "#e5e7eb"} strokeWidth="0.5"/>
          <rect x="100" y="68"  width="130" height="72"  fill={dark ? "#222222" : "#f1f3f4"} stroke={dark ? "#333333" : "#e5e7eb"} strokeWidth="0.5"/>
          <rect x="240" y="68"  width="100" height="72"  fill={dark ? "#222222" : "#f1f3f4"} stroke={dark ? "#333333" : "#e5e7eb"} strokeWidth="0.5"/>
          <rect x="350" y="68"  width="50"  height="72"  fill={dark ? "#222222" : "#f1f3f4"} stroke={dark ? "#333333" : "#e5e7eb"} strokeWidth="0.5"/>
          {/* Roads */}
          <rect x="0"   y="55"  width="400" height="13"  fill={dark ? "#333333" : "#e5e7eb"}/>
          <rect x="120" y="0"   width="10"  height="140" fill={dark ? "#333333" : "#e5e7eb"}/>
          <rect x="240" y="0"   width="10"  height="140" fill={dark ? "#333333" : "#e5e7eb"}/>
          {/* Search radius ring */}
          <circle cx="200" cy="70" r="55" fill="#2563eb" fillOpacity="0.04" stroke="#2563eb" strokeOpacity="0.25" strokeWidth="1.5" strokeDasharray="4 3"/>
          {/* You */}
          <circle cx="200" cy="70" r="6"  fill="#2563eb"/>
          <circle cx="200" cy="70" r="12" fill="#2563eb" fillOpacity="0.15"/>
          {/* Stores (orange) */}
          <circle cx="145" cy="30" r="5" fill="#f97316"/>
          <circle cx="300" cy="35" r="5" fill="#f97316"/>
          <circle cx="110" cy="100" r="5" fill="#f97316"/>
          {/* Contractors (green) */}
          <circle cx="260" cy="95" r="5" fill="#10b981"/>
          <circle cx="160" cy="105" r="5" fill="#10b981"/>
          <circle cx="330" cy="85" r="5" fill="#10b981"/>
        </svg>
        {/* Legend overlay */}
        <div className="absolute bottom-2 left-3 flex items-center gap-3">
          {[
            { color: "bg-blue-500",    label: "You" },
            { color: "bg-orange-400",  label: "Stores" },
            { color: "bg-emerald-500", label: "Contractors" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              <span className={`text-[9px] font-medium ${dark ? "text-gray-400" : "text-gray-500"}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Left — location fields + what it controls */}
        <div className="space-y-3">
          <p className={`text-[10px] font-semibold uppercase tracking-wide ${dark ? "text-gray-600" : "text-gray-400"}`}>Your location</p>
          <Toggle label="Auto-detect location" description="Use browser geolocation instead of manual ZIP" on={false} />
          <Field label="ZIP Code"       value="90210"            />
          <Field label="City"           value="Beverly Hills, CA"/>
          <Field label="Search Radius"  value="25 miles"         />
          <Field label="Country"        value="United States"    />

          {/* Saved locations */}
          <div className={`p-3 rounded-lg border space-y-2 ${dark ? "border-white/[0.06]" : "border-gray-100"}`}>
            <p className={`text-[10px] font-semibold uppercase tracking-wide ${dark ? "text-gray-600" : "text-gray-400"}`}>Saved locations</p>
            {[
              { name: "Main House",   zip: "90210", active: true  },
              { name: "Rental Unit",  zip: "90405", active: false },
            ].map((loc) => (
              <div key={loc.name} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                loc.active
                  ? dark ? "border-blue-500/30 bg-blue-500/10" : "border-blue-200 bg-blue-50"
                  : dark ? "border-white/[0.06]" : "border-gray-100"
              }`}>
                <div>
                  <p className={`text-xs font-medium ${dark ? "text-gray-200" : "text-gray-900"}`}>{loc.name}</p>
                  <p className={`text-[10px] ${dark ? "text-gray-600" : "text-gray-400"}`}>{loc.zip}</p>
                </div>
                {loc.active && (
                  <span className={`text-[10px] font-medium ${dark ? "text-blue-400" : "text-blue-600"}`}>Active</span>
                )}
              </div>
            ))}
            <button className={`w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-medium border border-dashed rounded-lg transition-colors ${
              dark ? "text-gray-600 border-white/10 hover:border-white/20" : "text-gray-500 border-gray-200 hover:border-gray-300"
            }`}>
              <IoAddOutline className="w-3 h-3" />Add location
            </button>
          </div>

          {/* What location enables */}
          <div className={`p-3 rounded-lg border space-y-1.5 ${dark ? "border-white/[0.06]" : "border-gray-100"}`}>
            <p className={`text-[10px] font-semibold uppercase tracking-wide ${dark ? "text-gray-600" : "text-gray-400"}`}>Your location powers</p>
            {[
              "Regional cost estimates from HomeAdvisor & Angi",
              "Contractor search within your radius",
              "In-store parts availability at Home Depot",
              "Weather forecasts for outdoor projects",
              "State-specific rebates and tax credits",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <IoCheckmarkCircle className={`w-3 h-3 flex-shrink-0 mt-0.5 ${dark ? "text-blue-400" : "text-blue-500"}`} />
                <span className={`text-[10px] ${dark ? "text-gray-400" : "text-gray-500"}`}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — nearby found + preferred contractors */}
        <div className="space-y-3">
          <p className={`text-[10px] font-semibold uppercase tracking-wide ${dark ? "text-gray-600" : "text-gray-400"}`}>Nearby found</p>
          {[
            { name: "Home Depot",    dist: "0.8mi", type: "store",      dot: "bg-orange-400" },
            { name: "Ace Hardware",  dist: "1.9mi", type: "store",      dot: "bg-orange-400" },
            { name: "Johnson HVAC",  dist: "1.2mi", type: "contractor", dot: "bg-emerald-500"},
            { name: "Peak Plumbing", dist: "2.1mi", type: "contractor", dot: "bg-emerald-500"},
            { name: "Bay Electric",  dist: "3.4mi", type: "contractor", dot: "bg-emerald-500"},
          ].map((p) => (
            <div key={p.name} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
              dark ? "border-white/[0.06]" : "border-gray-100"
            }`}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${p.dot}`} />
              <span className={`text-xs flex-1 ${dark ? "text-gray-300" : "text-gray-700"}`}>{p.name}</span>
              <span className={`text-[10px] ${dark ? "text-gray-600" : "text-gray-400"}`}>{p.dist}</span>
            </div>
          ))}

          {/* Preferred contractors */}
          <div className={`p-3 rounded-lg border space-y-2 ${dark ? "border-white/[0.06]" : "border-gray-100"}`}>
            <p className={`text-[10px] font-semibold uppercase tracking-wide ${dark ? "text-gray-600" : "text-gray-400"}`}>Preferred contractors</p>
            <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${dark ? "border-white/[0.06]" : "border-gray-100"}`}>
              <div>
                <p className={`text-xs font-medium ${dark ? "text-gray-200" : "text-gray-900"}`}>Johnson HVAC</p>
                <p className={`text-[10px] ${dark ? "text-gray-600" : "text-gray-400"}`}>HVAC · 4.8 rating</p>
              </div>
              <IoCheckmarkCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            </div>
            <p className={`text-[10px] ${dark ? "text-gray-600" : "text-gray-400"}`}>Preferred contractors are recommended first in search results</p>
          </div>

          <div className={`p-3 rounded-lg border ${
            dark ? "bg-emerald-50 border-emerald-100" : "bg-emerald-50 border-emerald-100"
          }`}>
            <p className={`text-[10px] font-semibold ${dark ? "text-emerald-400" : "text-emerald-700"}`}>Local pricing active</p>
            <p className={`text-[10px] mt-0.5 ${dark ? "text-emerald-600" : "text-emerald-600"}`}>Cost estimates, quotes, and parts prices reflect your ZIP</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Integrations ──────────────────────────────────────────────────────────────

function IntegrationsSection() {
  const dark = useDarkMode();

  const connectedServices = [
    { name: "Gmail",           sub: "Send quote requests to contractors",    icon: IoMailOutline,     iconBg: dark ? "bg-red-500/20"    : "bg-red-50",    iconColor: "text-red-500",   synced: "2 min ago" },
    { name: "Google Calendar", sub: "Schedule repairs and reminders",        icon: IoCalendarOutline, iconBg: dark ? "bg-blue-500/20"   : "bg-blue-50",   iconColor: "text-blue-500",  synced: "5 min ago" },
  ];

  const dataSources: { category: string; items: { name: string; sub: string; icon: typeof IoMailOutline; iconBg: string; iconColor: string; synced?: string }[] }[] = [
    {
      category: "Cost data",
      items: [
        { name: "HomeAdvisor", sub: "Regional cost estimates for repairs",      icon: IoHomeOutline,       iconBg: dark ? "bg-orange-500/20" : "bg-orange-50",  iconColor: "text-orange-500" },
        { name: "Angi",        sub: "Professional pricing and availability",    icon: IoConstructOutline,  iconBg: dark ? "bg-red-500/20"    : "bg-red-50",     iconColor: "text-red-500"    },
        { name: "Home Depot",  sub: "Parts availability and in-store pricing",  icon: IoHomeOutline,       iconBg: dark ? "bg-orange-500/20" : "bg-orange-50",  iconColor: "text-orange-500" },
      ],
    },
    {
      category: "Contractors",
      items: [
        { name: "Yelp",       sub: "Contractor ratings and reviews",           icon: IoStarOutline,       iconBg: dark ? "bg-red-500/20"    : "bg-red-50",     iconColor: "text-red-500"    },
        { name: "Foursquare", sub: "Local contractor and store discovery",      icon: IoNavigateOutline,   iconBg: dark ? "bg-blue-500/20"   : "bg-blue-50",    iconColor: "text-blue-500"   },
      ],
    },
    {
      category: "DIY guides",
      items: [
        { name: "iFixit",     sub: "Step-by-step repair guides",               icon: IoConstructOutline,  iconBg: dark ? "bg-blue-500/20"   : "bg-blue-50",    iconColor: "text-blue-500"   },
        { name: "YouTube",    sub: "Video tutorials matched to your project",   icon: IoPlayOutline,       iconBg: dark ? "bg-red-500/20"    : "bg-red-50",     iconColor: "text-red-500"    },
        { name: "Reddit",     sub: "Community threads from real repairs",       icon: IoChatbubblesOutline,      iconBg: dark ? "bg-orange-500/20" : "bg-orange-50",  iconColor: "text-orange-500" },
      ],
    },
    {
      category: "Safety",
      items: [
        { name: "CPSC",       sub: "Consumer product safety recalls",           icon: IoShieldCheckmarkOutline, iconBg: dark ? "bg-amber-500/20" : "bg-amber-50", iconColor: "text-amber-500" },
        { name: "NHTSA",      sub: "Vehicle safety recalls and defects",        icon: IoShieldCheckmarkOutline, iconBg: dark ? "bg-amber-500/20" : "bg-amber-50", iconColor: "text-amber-500" },
      ],
    },
  ];

  const renderRow = (item: { name: string; sub: string; icon: typeof IoMailOutline; iconBg: string; iconColor: string; synced?: string }) => {
    const Icon = item.icon;
    return (
      <div key={item.name} className={`flex items-center gap-3 px-3 py-3 rounded-lg border ${
        dark ? "border-white/[0.06]" : "border-gray-100"
      }`}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.iconBg}`}>
          <Icon className={`w-4 h-4 ${item.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium ${dark ? "text-gray-200" : "text-gray-900"}`}>{item.name}</p>
          <p className={`text-[10px] ${dark ? "text-gray-500" : "text-gray-400"}`}>{item.sub}</p>
          {item.synced && <p className={`text-[9px] mt-0.5 ${dark ? "text-gray-600" : "text-gray-300"}`}>Synced {item.synced}</p>}
        </div>
        <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
      </div>
    );
  };

  return (
    <div className="p-5">
      <SectionHeader title="Integrations" description="Connected services and data sources used by OpportunIQ." />
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-4">
          {/* Sign-in method */}
          <div className={`p-3 rounded-lg border ${dark ? "border-white/[0.06]" : "border-gray-100"}`}>
            <p className={`text-[10px] font-semibold uppercase tracking-wide mb-2 ${dark ? "text-gray-600" : "text-gray-400"}`}>Sign-in method</p>
            <div className="flex items-center gap-2">
              <IoLogoGoogle className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium ${dark ? "text-gray-200" : "text-gray-900"}`}>Google</p>
                <p className={`text-[10px] ${dark ? "text-gray-500" : "text-gray-400"}`}>jamie@home.com</p>
              </div>
              <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className={`text-[10px] font-semibold uppercase tracking-wide ${dark ? "text-gray-600" : "text-gray-400"}`}>Your accounts</p>
            </div>
            {connectedServices.map((s) => (
              <div key={s.name} className={`flex items-center gap-3 px-3 py-3 rounded-lg border ${
                dark ? "border-white/[0.06]" : "border-gray-100"
              }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${s.iconBg}`}>
                  <s.icon className={`w-4 h-4 ${s.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium ${dark ? "text-gray-200" : "text-gray-900"}`}>{s.name}</p>
                  <p className={`text-[10px] ${dark ? "text-gray-500" : "text-gray-400"}`}>{s.sub}</p>
                  <p className={`text-[9px] mt-0.5 ${dark ? "text-gray-600" : "text-gray-300"}`}>Synced {s.synced}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <IoCheckmarkCircle className="w-4 h-4 text-green-500" />
                  <button className={`text-[10px] font-medium ${dark ? "text-gray-600 hover:text-gray-400" : "text-gray-400 hover:text-gray-600"}`}>
                    Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
          {dataSources.slice(0, 2).map((group) => (
            <div key={group.category} className="space-y-2">
              <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1 ${dark ? "text-gray-600" : "text-gray-400"}`}>{group.category}</p>
              {group.items.map(renderRow)}
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {dataSources.slice(2).map((group) => (
            <div key={group.category} className="space-y-2">
              <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1 ${dark ? "text-gray-600" : "text-gray-400"}`}>{group.category}</p>
              {group.items.map(renderRow)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Notifications ─────────────────────────────────────────────────────────────

function NotificationsSection() {
  const dark = useDarkMode();
  return (
    <div className="p-5">
      <SectionHeader title="Notifications" description="Choose what you get notified about." />
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-2">
          <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1 ${dark ? "text-gray-600" : "text-gray-400"}`}>Projects & Contractors</p>
          <Toggle label="Quote received"      description="A contractor responded to your request"             on={true}  />
          <Toggle label="Repair reminders"    description="Scheduled DIY or contractor visits coming up"       on={true}  />
          <Toggle label="Recall alerts"       description="CPSC or NHTSA recall matches your product or vehicle" on={true} />
          <Toggle label="Price drops"         description="A part you need went on sale at a nearby store"     on={false} />

          {/* Delivery preferences */}
          <div className={`mt-2 pt-3 border-t ${dark ? "border-white/[0.06]" : "border-gray-100"}`}>
            <p className={`text-[10px] font-semibold uppercase tracking-wide mb-2 ${dark ? "text-gray-600" : "text-gray-400"}`}>Delivery</p>
            <Field label="Email digest" value="Daily summary" />
            <div className="mt-2">
              <Field label="Quiet hours" value="10:00 PM – 7:00 AM" />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1 ${dark ? "text-gray-600" : "text-gray-400"}`}>Budget & Household</p>
          <Toggle label="Budget alerts"       description="Notify when approaching your monthly limit"         on={false} />
          <Toggle label="Weather warnings"    description="Outdoor project scheduled but bad weather forecast"  on={true}  />
          <Toggle label="Household activity"  description="When group members resolve issues or contribute"    on={true}  />

          {/* Safety alerts — always on, not toggleable */}
          <div className={`flex items-center justify-between px-3 py-3 rounded-lg border ${
            dark ? "border-green-500/20 bg-green-500/5" : "border-green-100 bg-green-50/50"
          }`}>
            <div className="flex-1 min-w-0 mr-3">
              <p className={`text-xs font-medium ${dark ? "text-gray-200" : "text-gray-800"}`}>Safety alerts</p>
              <p className={`text-[10px] mt-0.5 ${dark ? "text-gray-500" : "text-gray-400"}`}>CO detectors, gas leaks, electrical hazards</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <IoCheckmarkCircle className="w-4 h-4 text-green-500" />
              <span className={`text-[10px] font-medium ${dark ? "text-green-400" : "text-green-600"}`}>Always on</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function SettingsView() {
  const dark = useDarkMode();
  const b = dark ? "border-white/[0.06]" : "border-gray-100";
  const [activeSection, setActiveSection] = useState<SectionId>("profile");
  const [riskLevel, setRiskLevel] = useState(3);

  return (
    <div className={`flex h-full overflow-hidden ${dark ? "bg-[#111111]" : "bg-white"}`}>
      {/* Left nav */}
      <div className={`w-[180px] flex-shrink-0 border-r flex flex-col h-full ${b} ${dark ? "bg-[#141414]" : "bg-white"}`}>
        <div className={`px-3 py-3 border-b ${b}`}>
          <span className={`text-xs font-semibold ${dark ? "text-gray-100" : "text-gray-900"}`}>Settings</span>
        </div>
        <nav className="flex-1 scrollbar-auto-hide py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                  isActive
                    ? dark ? "bg-blue-600/10 text-blue-400" : "bg-blue-100/60 text-gray-900 font-semibold"
                    : dark ? "text-gray-500 hover:bg-white/[0.04] hover:text-gray-300" : "text-gray-700 hover:bg-blue-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className={`px-3 py-2.5 border-t ${b}`}>
          <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
            dark ? "bg-blue-500/20 text-blue-400" : "bg-blue-50 text-blue-700"
          }`}>Beta</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 h-full scrollbar-auto-hide">
        {activeSection === "profile"       && <ProfileSection />}
        {activeSection === "budget"        && <BudgetSection riskLevel={riskLevel} setRiskLevel={setRiskLevel} />}
        {activeSection === "location"      && <LocationSection />}
        {activeSection === "integrations"  && <IntegrationsSection />}
        {activeSection === "notifications" && <NotificationsSection />}
      </div>
    </div>
  );
}
