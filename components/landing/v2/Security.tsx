"use client";

import {
  IoLockClosedOutline,
  IoShieldCheckmarkOutline,
  IoEyeOffOutline,
  IoTrashOutline,
  IoKeyOutline,
} from "react-icons/io5";

const securityFeatures = [
  { icon: IoLockClosedOutline, title: "Encrypted uploads", description: "AES-256-GCM in your browser before upload" },
  { icon: IoShieldCheckmarkOutline, title: "AI verified", description: "Every response checked for accuracy" },
  { icon: IoEyeOffOutline, title: "Never sold", description: "Your data is never shared or sold" },
  { icon: IoTrashOutline, title: "Delete anytime", description: "Remove all your data with one click" },
  { icon: IoKeyOutline, title: "Financial encryption", description: "Budget and income data encrypted at rest" },
];

export function Security() {
  return (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Your data stays yours.
          </h2>
          <p className="text-sm text-gray-500">
            Photos, finances, and location — encrypted and never sold.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {securityFeatures.map((f) => (
            <div key={f.title} className="text-center">
              <f.icon className="w-5 h-5 text-gray-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-900 mb-0.5">{f.title}</p>
              <p className="text-[11px] text-gray-400 leading-snug">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
