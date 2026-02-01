"use client";

import Link from "next/link";
import { WaitlistModal } from "@/components/landing/WaitlistModal";
import { Button } from "@/components/ui/button";
import {
  IoPeopleOutline,
  IoCheckmarkCircle,
  IoShieldCheckmarkOutline,
  IoPersonAddOutline,
  IoWalletOutline,
  IoDocumentTextOutline,
  IoChevronForward,
} from "react-icons/io5";

const HOUSEHOLD_MEMBERS = [
  { name: "Alex", role: "Coordinator", status: "active", color: "bg-teal-500" },
  { name: "Sam", role: "Collaborator", status: "active", color: "bg-blue-500" },
  { name: "Jordan", role: "Participant", status: "active", color: "bg-amber-500" },
  { name: "Taylor", role: "Observer", status: "pending", color: "bg-neutral-500" },
];

const FEATURES = [
  {
    icon: IoPeopleOutline,
    title: "Household Groups",
    description: "Create a group for your household, roommates, or property. Everyone sees the same issues and can contribute to decisions.",
  },
  {
    icon: IoWalletOutline,
    title: "Shared Budget Pool",
    description: "Set a monthly budget, track the shared balance, and record who paid for what. Built-in expense approval workflows.",
  },
  {
    icon: IoDocumentTextOutline,
    title: "Decision Voting",
    description: "When options are generated, household members can vote approve, reject, or abstain before finalizing a decision.",
  },
  {
    icon: IoShieldCheckmarkOutline,
    title: "Role-Based Permissions",
    description: "Coordinators have full control. Collaborators can manage. Participants and observers have limited access.",
  },
];

const ROLES = [
  {
    role: "Coordinator",
    permissions: ["Full access", "Invite members", "Manage budget", "Delete group"],
    description: "Group owner with full control"
  },
  {
    role: "Collaborator",
    permissions: ["Create issues", "Approve expenses", "Assign tasks", "View reports"],
    description: "Can manage most group functions"
  },
  {
    role: "Participant",
    permissions: ["Create issues", "Vote on decisions", "Log expenses", "View history"],
    description: "Active contributor with limited admin"
  },
  {
    role: "Observer",
    permissions: ["View issues", "View decisions", "View expenses"],
    description: "Read-only access to group"
  },
];

const USE_CASES = [
  {
    title: "Couples & Families",
    description: "Share home maintenance decisions. Both partners see the same diagnoses and vote on what to do."
  },
  {
    title: "Roommates",
    description: "Split repair costs fairly with built-in expense tracking and approval workflows."
  },
  {
    title: "Landlords & Tenants",
    description: "Tenants can report issues with photos. Landlords see diagnoses and cost estimates."
  },
];

export default function CollaborationPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-28 pb-16 px-6 bg-neutral-950">
        <div className="max-w-4xl mx-auto text-center">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-sm text-neutral-500 mb-6">
            <Link href="/product" className="hover:text-teal-400 transition-colors">
              Product
            </Link>
            <IoChevronForward className="w-3 h-3" />
            <span className="text-neutral-300">Collaboration</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-400 text-xs font-mono mb-6">
            <IoPeopleOutline className="w-4 h-4" />
            Collaboration
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Fix it{" "}
            <span className="text-teal-400">
              together
            </span>
          </h1>

          <p className="text-lg text-neutral-200 max-w-2xl mx-auto mb-10">
            Create a household group, invite members with different roles, and make repair
            decisions together. Shared budgets, decision voting, and expense tracking built in.
          </p>

          <WaitlistModal>
            <Button className="h-12 px-8 font-mono font-bold bg-teal-500 hover:bg-teal-400 text-black rounded-lg transition-all duration-300 shadow-[0_0_20px_rgba(20,184,166,0.4)]">
              Get Early Access
            </Button>
          </WaitlistModal>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6 border-t border-neutral-800">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {FEATURES.map((feature, i) => (
              <div key={i} className="p-6 rounded-xl bg-neutral-900 border border-neutral-700">
                <div className="w-12 h-12 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Household Demo */}
      <section className="py-20 px-6 bg-gradient-to-b from-neutral-950 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Everyone on the same page
              </h2>
              <p className="text-neutral-300 mb-8">
                Invite household members via email. They join with the role you assign—from
                full coordinator access to read-only observer. Magic link invitations with 7-day expiry.
              </p>

              <div className="space-y-4">
                {USE_CASES.map((useCase, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <IoCheckmarkCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-white font-medium">{useCase.title}</p>
                      <p className="text-sm text-neutral-500">{useCase.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-neutral-950/80 rounded-xl border border-neutral-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-400">Household Members</span>
                <span className="text-xs text-teal-400">4 members</span>
              </div>
              <div className="divide-y divide-neutral-800/50">
                {HOUSEHOLD_MEMBERS.map((member, i) => (
                  <div key={i} className="p-4 hover:bg-neutral-900/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${member.color} flex items-center justify-center text-sm font-bold text-white`}>
                          {member.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{member.name}</p>
                          <p className="text-xs text-neutral-500">{member.role}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        member.status === "active"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {member.status === "active" ? "Active" : "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-neutral-800">
                <button className="text-xs text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1">
                  <IoPersonAddOutline className="w-3 h-3" />
                  Invite member
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-16 px-6 border-t border-neutral-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Role-based permissions</h2>
            <p className="text-neutral-300 max-w-xl mx-auto">
              Four permission levels from full control to read-only. Assign roles when you invite members.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROLES.map((level, i) => (
              <div
                key={i}
                className="bg-neutral-900 rounded-xl border border-neutral-700 p-5"
              >
                <div className="text-base font-bold text-white mb-1">
                  {level.role}
                </div>
                <p className="text-xs text-neutral-500 mb-4">{level.description}</p>
                <ul className="space-y-1.5">
                  {level.permissions.map((perm, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-neutral-400">
                      <IoCheckmarkCircle className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                      {perm}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-neutral-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Better together
          </h2>
          <p className="text-neutral-300 mb-8">
            Manage home maintenance as a team with shared visibility and democratic decision-making.
          </p>
          <WaitlistModal>
            <Button className="h-14 px-8 font-mono font-bold text-lg bg-teal-500 hover:bg-teal-400 text-black rounded-lg transition-all duration-300 shadow-[0_0_30px_rgba(20,184,166,0.4)]">
              Join the Waitlist
            </Button>
          </WaitlistModal>
        </div>
      </section>
    </>
  );
}
