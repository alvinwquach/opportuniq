"use client";

import { WaitlistModal } from "@/components/landing/WaitlistModal";
import { Button } from "@/components/ui/button";
import { IoPeople, IoCheckmarkCircle, IoShieldCheckmark, IoPersonAdd, IoWallet, IoDocumentText } from "react-icons/io5";

const HOUSEHOLD_MEMBERS = [
  { name: "Alex", role: "Coordinator", status: "active", color: "bg-teal-500" },
  { name: "Sam", role: "Collaborator", status: "active", color: "bg-blue-500" },
  { name: "Jordan", role: "Participant", status: "active", color: "bg-amber-500" },
  { name: "Taylor", role: "Observer", status: "pending", color: "bg-purple-500" },
];

const FEATURES = [
  {
    icon: IoPeople,
    title: "Household Groups",
    description: "Create a group for your household, roommates, or property. Everyone sees the same issues and can contribute to decisions.",
  },
  {
    icon: IoWallet,
    title: "Shared Budget Pool",
    description: "Set a monthly budget, track the shared balance, and record who paid for what. Built-in expense approval workflows.",
  },
  {
    icon: IoDocumentText,
    title: "Decision Voting",
    description: "When options are generated, household members can vote approve, reject, or abstain before finalizing a decision.",
  },
  {
    icon: IoShieldCheckmark,
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
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-sm font-medium mb-6">
            <IoPeople className="w-4 h-4" />
            Built for Households
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-neutral-900 mb-6 tracking-tight">
            Collaboration
          </h1>

          <p className="text-lg sm:text-xl text-neutral-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Create a household group, invite members with different roles, and make repair decisions together. Shared budgets, decision voting, and expense tracking built in.
          </p>

          <WaitlistModal>
            <Button className="h-12 px-8 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded-lg">
              Join the Waitlist
            </Button>
          </WaitlistModal>
        </div>
      </section>

      <section className="py-12 px-6 border-t border-neutral-200">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-4">
                Everyone on the same page
              </h2>
              <p className="text-neutral-600 mb-8 leading-relaxed">
                Invite household members via email. They join with the role you assign—from full coordinator access to read-only observer. Magic link invitations with 7-day expiry.
              </p>

              <div className="space-y-4">
                {USE_CASES.map((useCase, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <IoCheckmarkCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-neutral-900 font-medium">{useCase.title}</p>
                      <p className="text-sm text-neutral-500">{useCase.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
                <span className="text-sm font-medium text-neutral-900">Household Members</span>
                <span className="text-xs text-neutral-500">4 members</span>
              </div>
              <div className="divide-y divide-neutral-100">
                {HOUSEHOLD_MEMBERS.map((member, i) => (
                  <div key={i} className="p-4 hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${member.color} flex items-center justify-center text-sm font-bold text-white`}>
                          {member.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{member.name}</p>
                          <p className="text-xs text-neutral-500">{member.role}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        member.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {member.status === "active" ? "Active" : "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50">
                <button className="text-xs text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-1">
                  <IoPersonAdd className="w-3 h-3" />
                  Invite member
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-neutral-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-4">
              Role-based permissions
            </h2>
            <p className="text-neutral-600 max-w-xl mx-auto">
              Four permission levels from full control to read-only. Assign roles when you invite members.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROLES.map((level, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm"
              >
                <div className="text-base font-bold text-neutral-900 mb-1">
                  {level.role}
                </div>
                <p className="text-xs text-neutral-500 mb-4">{level.description}</p>
                <ul className="space-y-1.5">
                  {level.permissions.map((perm, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs text-neutral-600">
                      <IoCheckmarkCircle className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                      {perm}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 px-6 border-t border-neutral-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-4">
              Collaboration features
            </h2>
            <p className="text-neutral-600 max-w-xl mx-auto">
              Everything you need to manage home maintenance as a team.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => (
              <div key={i} className="bg-white rounded-xl border border-neutral-200 p-6 hover:border-neutral-300 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 px-6 bg-neutral-50 border-t border-neutral-200">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-4">
            Better together
          </h2>
          <p className="text-neutral-600 mb-8">
            Manage home maintenance as a team with shared visibility and democratic decision-making.
          </p>
          <WaitlistModal>
            <Button className="h-12 px-8 bg-teal-700 hover:bg-teal-800 text-white font-medium rounded-lg">
              Join the Waitlist
            </Button>
          </WaitlistModal>
        </div>
      </section>
    </div>
  );
}
