"use client";

import { useState } from "react";
import { IoCheckmark, IoPersonCircle, IoMail, IoCall } from "react-icons/io5";
import { ImSpinner8 } from "react-icons/im";

interface ProfileFormProps {
  initialValues: {
    name: string;
    email: string;
    phone: string;
    avatarUrl: string;
  };
}

export function ProfileForm({ initialValues }: ProfileFormProps) {
  const [values, setValues] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSaveMessage(null);

    // Simulate save for demo
    await new Promise((resolve) => setTimeout(resolve, 800));

    setSaveMessage("Profile saved");
    setIsSubmitting(false);
    setTimeout(() => setSaveMessage(null), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Section */}
      <div className="p-5 rounded-xl bg-[#161616] border border-[#1f1f1f]">
        <div className="flex items-center gap-4">
          <div className="relative">
            {values.avatarUrl ? (
              <img
                src={values.avatarUrl}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-[#2a2a2a]"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#1f1f1f] flex items-center justify-center border-2 border-[#2a2a2a]">
                <IoPersonCircle className="w-10 h-10 text-[#444]" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white mb-1">Profile Photo</p>
            <p className="text-xs text-[#666]">
              Your photo is synced from your login provider
            </p>
          </div>
        </div>
      </div>

      {/* Name Field */}
      <div className="p-5 rounded-xl bg-[#161616] border border-[#1f1f1f]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#00D4FF]/10 flex items-center justify-center">
            <IoPersonCircle className="w-5 h-5 text-[#00D4FF]" />
          </div>
          <div>
            <label className="text-sm font-medium text-white block">
              Full Name
            </label>
            <p className="text-[11px] text-[#555]">
              How we&apos;ll address you in the app
            </p>
          </div>
        </div>
        <input
          type="text"
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          placeholder="Enter your name"
          className="w-full h-11 px-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a] text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-[#00D4FF]/50 transition-colors"
        />
      </div>

      {/* Email Field */}
      <div className="p-5 rounded-xl bg-[#161616] border border-[#1f1f1f]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <IoMail className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-white block">
              Email Address
            </label>
            <p className="text-[11px] text-[#555]">
              Used for account notifications
            </p>
          </div>
        </div>
        <input
          type="email"
          value={values.email}
          disabled
          className="w-full h-11 px-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a] text-[#666] text-sm cursor-not-allowed"
        />
        <p className="text-[11px] text-[#444] mt-2">
          Email is managed by your login provider and cannot be changed here
        </p>
      </div>

      {/* Phone Field */}
      <div className="p-5 rounded-xl bg-[#161616] border border-[#1f1f1f]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <IoCall className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-white block">
              Phone Number
            </label>
            <p className="text-[11px] text-[#555]">
              Optional - for contractor callbacks
            </p>
          </div>
        </div>
        <input
          type="tel"
          value={values.phone}
          onChange={(e) => setValues({ ...values, phone: e.target.value })}
          placeholder="(555) 123-4567"
          className="w-full h-11 px-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a] text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-amber-500/50 transition-colors"
        />
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#00D4FF] hover:bg-[#00D4FF]/90 disabled:bg-[#1f1f1f] disabled:text-[#555] text-[#0c0c0c] font-medium text-sm transition-colors"
        >
          {isSubmitting ? (
            <ImSpinner8 className="w-4 h-4 animate-spin" />
          ) : (
            <IoCheckmark className="w-4 h-4" />
          )}
          Save Profile
        </button>
        {saveMessage && (
          <span className="text-sm text-[#00D4FF]">{saveMessage}</span>
        )}
      </div>
    </form>
  );
}
