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
      <DialogContent className="bg-gray-50 border-gray-200 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-900 flex items-center gap-2">
            <IoCalendar className="w-5 h-5 text-blue-600" />
            Schedule DIY Task
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Schedule a time to work on a project with your group
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Issue Selection */}
          <div className="space-y-2">
            <Label htmlFor="issue" className="text-gray-500">
              Project/Issue
            </Label>
            <Select
              value={formData.issueId}
              onValueChange={(value) =>
                onFormChange({ issueId: value, participants: [] })
              }
            >
              <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent className="bg-gray-50 border-gray-200">
                {userIssues.map((issue) => (
                  <SelectItem
                    key={issue.id}
                    value={issue.id}
                    className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      <span>{issue.title}</span>
                      <span className="text-gray-500 text-xs">
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
            <Label htmlFor="datetime" className="text-gray-500">
              Date & Time
            </Label>
            <Input
              id="datetime"
              type="datetime-local"
              value={formData.scheduledTime}
              onChange={(e) => onFormChange({ scheduledTime: e.target.value })}
              className="bg-gray-50 border-gray-200 text-gray-900"
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-gray-500">
              Estimated Duration
            </Label>
            <Select
              value={formData.estimatedDuration.toString()}
              onValueChange={(value) =>
                onFormChange({ estimatedDuration: parseInt(value) })
              }
            >
              <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-50 border-gray-200">
                <SelectItem
                  value="30"
                  className="text-gray-900 hover:bg-gray-100"
                >
                  30 minutes
                </SelectItem>
                <SelectItem
                  value="60"
                  className="text-gray-900 hover:bg-gray-100"
                >
                  1 hour
                </SelectItem>
                <SelectItem
                  value="120"
                  className="text-gray-900 hover:bg-gray-100"
                >
                  2 hours
                </SelectItem>
                <SelectItem
                  value="180"
                  className="text-gray-900 hover:bg-gray-100"
                >
                  3 hours
                </SelectItem>
                <SelectItem
                  value="240"
                  className="text-gray-900 hover:bg-gray-100"
                >
                  4 hours
                </SelectItem>
                <SelectItem
                  value="480"
                  className="text-gray-900 hover:bg-gray-100"
                >
                  Full day (8 hours)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Participants */}
          {formData.issueId && groupMembers.length > 0 && (
            <div className="space-y-2">
              <Label className="text-gray-500 flex items-center gap-2">
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
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-gray-50 hover:border-gray-200"
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatarUrl || undefined} />
                      <AvatarFallback className="bg-gray-100 text-gray-900 text-xs">
                        {member.name?.charAt(0) ||
                          member.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="text-sm text-gray-900">
                        {member.name || member.email}
                        {member.memberId === currentUserMemberId && (
                          <span className="text-gray-500 ml-1">(you)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {member.role}
                      </p>
                    </div>
                    {formData.participants.includes(member.memberId) && (
                      <IoCheckmark className="w-5 h-5 text-blue-600" />
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
            className="border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!formData.issueId || !formData.scheduledTime || isLoading}
            className="bg-blue-600 text-white hover:bg-blue-600/90"
          >
            {isLoading ? "Creating..." : "Schedule"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
