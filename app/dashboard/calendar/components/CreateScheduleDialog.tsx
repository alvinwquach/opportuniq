"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { IoCalendar, IoPeople, IoCheckmark } from "react-icons/io5";

interface UserIssue {
  id: string;
  title: string;
  status: string;
  priority: string;
  groupId: string;
  groupName: string;
}

interface GroupMember {
  memberId: string;
  userId: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  role: string;
}

interface FormData {
  issueId: string;
  scheduledTime: string;
  estimatedDuration: number;
  participants: string[];
}

interface CreateScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: FormData;
  onFormChange: (updates: Partial<FormData>) => void;
  onSubmit: () => void;
  onToggleParticipant: (memberId: string) => void;
  userIssues: UserIssue[];
  groupMembers: GroupMember[];
  currentUserMemberId: string;
  isLoading: boolean;
}

export function CreateScheduleDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onSubmit,
  onToggleParticipant,
  userIssues,
  groupMembers,
  currentUserMemberId,
  isLoading,
}: CreateScheduleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0c0c0c] border-[#1f1f1f] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <IoCalendar className="w-5 h-5 text-[#00D4FF]" />
            Schedule DIY Task
          </DialogTitle>
          <DialogDescription className="text-[#666]">
            Schedule a time to work on a project with your group
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Issue Selection */}
          <div className="space-y-2">
            <Label htmlFor="issue" className="text-[#888]">
              Project/Issue
            </Label>
            <Select
              value={formData.issueId}
              onValueChange={(value) =>
                onFormChange({ issueId: value, participants: [] })
              }
            >
              <SelectTrigger className="bg-[#161616] border-[#1f1f1f] text-white">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent className="bg-[#161616] border-[#1f1f1f]">
                {userIssues.map((issue) => (
                  <SelectItem
                    key={issue.id}
                    value={issue.id}
                    className="text-white hover:bg-[#1f1f1f] focus:bg-[#1f1f1f]"
                  >
                    <div className="flex items-center gap-2">
                      <span>{issue.title}</span>
                      <span className="text-[#666] text-xs">
                        ({issue.groupName})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date/Time */}
          <div className="space-y-2">
            <Label htmlFor="datetime" className="text-[#888]">
              Date & Time
            </Label>
            <Input
              id="datetime"
              type="datetime-local"
              value={formData.scheduledTime}
              onChange={(e) => onFormChange({ scheduledTime: e.target.value })}
              className="bg-[#161616] border-[#1f1f1f] text-white"
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-[#888]">
              Estimated Duration
            </Label>
            <Select
              value={formData.estimatedDuration.toString()}
              onValueChange={(value) =>
                onFormChange({ estimatedDuration: parseInt(value) })
              }
            >
              <SelectTrigger className="bg-[#161616] border-[#1f1f1f] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#161616] border-[#1f1f1f]">
                <SelectItem
                  value="30"
                  className="text-white hover:bg-[#1f1f1f]"
                >
                  30 minutes
                </SelectItem>
                <SelectItem
                  value="60"
                  className="text-white hover:bg-[#1f1f1f]"
                >
                  1 hour
                </SelectItem>
                <SelectItem
                  value="120"
                  className="text-white hover:bg-[#1f1f1f]"
                >
                  2 hours
                </SelectItem>
                <SelectItem
                  value="180"
                  className="text-white hover:bg-[#1f1f1f]"
                >
                  3 hours
                </SelectItem>
                <SelectItem
                  value="240"
                  className="text-white hover:bg-[#1f1f1f]"
                >
                  4 hours
                </SelectItem>
                <SelectItem
                  value="480"
                  className="text-white hover:bg-[#1f1f1f]"
                >
                  Full day (8 hours)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Participants */}
          {formData.issueId && groupMembers.length > 0 && (
            <div className="space-y-2">
              <Label className="text-[#888] flex items-center gap-2">
                <IoPeople className="w-4 h-4" />
                Participants
              </Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {groupMembers.map((member) => (
                  <button
                    key={member.memberId}
                    type="button"
                    onClick={() => onToggleParticipant(member.memberId)}
                    className={cn(
                      "w-full flex items-center gap-3 p-2 rounded-lg border transition-colors",
                      formData.participants.includes(member.memberId)
                        ? "border-[#00D4FF] bg-[#00D4FF]/10"
                        : "border-[#1f1f1f] bg-[#161616] hover:border-[#2a2a2a]"
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatarUrl || undefined} />
                      <AvatarFallback className="bg-[#1f1f1f] text-white text-xs">
                        {member.name?.charAt(0) ||
                          member.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="text-sm text-white">
                        {member.name || member.email}
                        {member.memberId === currentUserMemberId && (
                          <span className="text-[#666] ml-1">(you)</span>
                        )}
                      </p>
                      <p className="text-xs text-[#666] capitalize">
                        {member.role}
                      </p>
                    </div>
                    {formData.participants.includes(member.memberId) && (
                      <IoCheckmark className="w-5 h-5 text-[#00D4FF]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#1f1f1f] text-[#888] hover:text-white hover:bg-[#1f1f1f]"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!formData.issueId || !formData.scheduledTime || isLoading}
            className="bg-[#00D4FF] text-black hover:bg-[#00D4FF]/90"
          >
            {isLoading ? "Creating..." : "Schedule"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
