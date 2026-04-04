import {
  IoShield,
  IoPersonCircle,
  IoHammer,
  IoWallet,
  IoEye,
} from "react-icons/io5";
import type { GroupRole, RoleInfo } from "./types";

export const roleInfo: Record<GroupRole, RoleInfo> = {
  coordinator: { label: "Coordinator", description: "Full control over group", color: "bg-blue-100 text-blue-600", icon: IoShield },
  collaborator: { label: "Collaborator", description: "Can manage issues and members", color: "bg-blue-100 text-blue-600", icon: IoPersonCircle },
  participant: { label: "Participant", description: "Can create and work on issues", color: "bg-blue-100 text-blue-600", icon: IoHammer },
  contributor: { label: "Contributor", description: "Can contribute to budget", color: "bg-blue-100 text-blue-600", icon: IoWallet },
  observer: { label: "Observer", description: "View-only access", color: "bg-[#333] text-gray-500", icon: IoEye },
};

export function getRoleColor(role: string): string {
  return roleInfo[role as GroupRole]?.color || "bg-[#333] text-gray-500";
}

export function getRoleLabel(role: string): string {
  return roleInfo[role as GroupRole]?.label || role;
}
