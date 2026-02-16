"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { IoSettingsOutline, IoPersonAddOutline, IoLocation } from "react-icons/io5";
import { households, issues, mockWeatherData, mockUserLocation } from "../mockData";
import {
  GroupTabs,
  GroupOverviewTab,
  GroupIssuesTab,
  GroupBudgetTab,
  GroupPlanningTab,
  NewGroupModal,
  InviteModal,
  SettingsModal,
  RoleModal,
  ContributionHistoryModal,
  GroupsSidebar,
  EmptyGroupState,
  getRoleColor,
  getRoleLabel,
  contributionData,
  resolutionByGroup,
  monthlySavingsData,
  contributionHistory,
  pendingInvitations,
  type GroupTab,
  type GroupRole,
  type NewGroupForm,
  type InviteForm,
  type SettingsForm,
} from "./groups";

export function GroupsView() {
  const totalSavings = households.reduce((sum, h) => sum + h.savings, 0);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(households[0]?.id || null);
  const [activeTab, setActiveTab] = useState<GroupTab>("overview");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showContributionHistory, setShowContributionHistory] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState<string | null>(null);
  const [newGroupForm, setNewGroupForm] = useState<NewGroupForm>({ name: "", postalCode: "", searchRadius: "25" });
  const [inviteForm, setInviteForm] = useState<InviteForm>({ email: "", role: "participant", message: "" });
  const [settingsForm, setSettingsForm] = useState<SettingsForm>({ name: "", postalCode: "", searchRadius: "25", monthlyBudget: "800" });
  const [selectedMemberRole, setSelectedMemberRole] = useState<GroupRole>("participant");

  const selectedGroupData = households.find((h) => h.id === selectedGroup);

  const handleCreateGroup = () => {
    setShowNewGroupModal(false);
    setNewGroupForm({ name: "", postalCode: "", searchRadius: "25" });
  };

  const handleInviteMember = () => {
    setShowInviteModal(false);
    setInviteForm({ email: "", role: "participant", message: "" });
  };

  const handleSaveSettings = () => {
    setShowSettingsModal(false);
  };

  const handleChangeRole = () => {
    setShowRoleModal(null);
  };

  const handleRemoveMember = (memberId: string) => {
    setOpenMenuId(null);
  };

  // Initialize settings form when group changes
  useEffect(() => {
    if (selectedGroupData) {
      setSettingsForm({
        name: selectedGroupData.name,
        postalCode: "90210",
        searchRadius: "25",
        monthlyBudget: "800",
      });
    }
  }, [selectedGroupData]);

  return (
    <>
      {typeof window !== "undefined" && createPortal(
        <NewGroupModal
          isOpen={showNewGroupModal}
          form={newGroupForm}
          onChange={setNewGroupForm}
          onSave={handleCreateGroup}
          onClose={() => setShowNewGroupModal(false)}
        />,
        document.body
      )}
      {typeof window !== "undefined" && createPortal(
        <InviteModal
          isOpen={showInviteModal}
          form={inviteForm}
          onChange={setInviteForm}
          onSave={handleInviteMember}
          onClose={() => setShowInviteModal(false)}
        />,
        document.body
      )}
      {typeof window !== "undefined" && createPortal(
        <SettingsModal
          isOpen={showSettingsModal}
          form={settingsForm}
          onChange={setSettingsForm}
          onSave={handleSaveSettings}
          onClose={() => setShowSettingsModal(false)}
        />,
        document.body
      )}
      {typeof window !== "undefined" && createPortal(
        <RoleModal
          isOpen={!!showRoleModal}
          memberId={showRoleModal}
          selectedRole={selectedMemberRole}
          onRoleChange={setSelectedMemberRole}
          onSave={handleChangeRole}
          onClose={() => setShowRoleModal(null)}
        />,
        document.body
      )}
      {typeof window !== "undefined" && createPortal(
        <ContributionHistoryModal
          isOpen={showContributionHistory}
          contributions={contributionHistory}
          onClose={() => setShowContributionHistory(false)}
        />,
        document.body
      )}

      <div className="flex min-h-[calc(100vh-48px)] bg-[#0f0f0f]">
        {/* Left: Groups List - Hidden below lg */}
        <GroupsSidebar
          households={households}
          selectedGroup={selectedGroup}
          totalSavings={totalSavings}
          onSelectGroup={setSelectedGroup}
          onTabChange={setActiveTab}
          onNewGroup={() => setShowNewGroupModal(true)}
        />

        {/* Center: Group Details with Tabs */}
        <div className="flex-1 overflow-y-auto p-5">
          {selectedGroupData ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-semibold text-white">{selectedGroupData.name}</h2>
                    <span className={`text-[10px] px-2 py-0.5 rounded capitalize ${getRoleColor(selectedGroupData.members[0]?.role || "participant")}`}>
                      {getRoleLabel(selectedGroupData.members[0]?.role || "participant")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#666]">
                    <span className="flex items-center gap-1"><IoLocation className="w-3.5 h-3.5" />90210</span>
                    <span>{selectedGroupData.members.length} members</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowSettingsModal(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm text-[#888] border border-[#2a2a2a] hover:border-[#333] hover:text-white rounded-lg transition-colors">
                    <IoSettingsOutline className="w-4 h-4" />
                    Settings
                  </button>
                  <button onClick={() => setShowInviteModal(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10 rounded-lg transition-colors">
                    <IoPersonAddOutline className="w-4 h-4" />
                    Invite
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <GroupTabs activeTab={activeTab} onTabChange={setActiveTab} />

              {/* Tab Content */}
              {activeTab === "overview" && (
                <GroupOverviewTab
                  group={selectedGroupData}
                  pendingInvitations={pendingInvitations}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                  setShowInviteModal={setShowInviteModal}
                  setShowRoleModal={setShowRoleModal}
                  setSelectedMemberRole={setSelectedMemberRole}
                  handleRemoveMember={handleRemoveMember}
                />
              )}

              {activeTab === "issues" && (
                <GroupIssuesTab
                  issues={issues}
                  resolutionByGroup={resolutionByGroup}
                />
              )}

              {activeTab === "budget" && (
                <GroupBudgetTab
                  contributionData={contributionData}
                  monthlySavingsData={monthlySavingsData}
                  contributionHistory={contributionHistory}
                  setShowContributionHistory={setShowContributionHistory}
                />
              )}

              {activeTab === "planning" && (
                <GroupPlanningTab
                  weather={mockWeatherData}
                  location={mockUserLocation}
                />
              )}
            </>
          ) : (
            <EmptyGroupState onNewGroup={() => setShowNewGroupModal(true)} />
          )}
        </div>

        {/* Close menu when clicking outside */}
        {openMenuId && (
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpenMenuId(null)} />
        )}
      </div>
    </>
  );
}
