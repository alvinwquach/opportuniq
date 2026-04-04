"use client";

import {
  IoHomeOutline,
  IoKeyOutline,
  IoBusinessOutline,
  IoConstructOutline,
  IoPeopleOutline,
  IoCarOutline,
} from "react-icons/io5";

const personas = [
  {
    icon: IoHomeOutline,
    title: "Homeowners",
    description:
      "Something breaks and you don't know where to start. Is it urgent? Is it safe? What should it cost? Get answers before you call anyone.",
  },
  {
    icon: IoKeyOutline,
    title: "Renters",
    description:
      "Not sure if it's your responsibility or the landlord's? Get a diagnosis first so you know what to ask for.",
  },
  {
    icon: IoBusinessOutline,
    title: "Landlords",
    description:
      "Manage repairs across multiple properties. Track costs, find reliable contractors, and keep tenants informed.",
  },
  {
    icon: IoConstructOutline,
    title: "DIY enthusiasts",
    description:
      "Building a shelf, connecting a stereo, setting up a home theater. Get guides, parts lists, and step-by-step instructions.",
  },
  {
    icon: IoPeopleOutline,
    title: "Households",
    description:
      "Make repair decisions together. Vote on DIY vs hiring a pro. Track shared expenses and budgets as a team.",
  },
  {
    icon: IoCarOutline,
    title: "Car owners",
    description:
      "Record that strange noise. The AI analyzes the audio and video to diagnose the issue before you go to the shop.",
  },
];

export function WhoIsThisFor() {
  return (
    <section className="py-24 sm:py-32 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-3">
            Who is this for
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            If you own it, rent it, or fix it — this is for you.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {personas.map((p) => (
            <div
              key={p.title}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow duration-200"
            >
              <p.icon className="w-7 h-7 text-blue-600 mb-4" />
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                {p.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
