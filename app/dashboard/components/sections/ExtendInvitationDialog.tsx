"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  IoReload,
  IoCheckmark,
  IoCalendarOutline,
  IoClose,
  IoRefresh,
} from "react-icons/io5";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useExtendInvitation } from "@/hooks/useGroupMembers";

interface ExtendInvitationDialogProps {
  groupId: string;
  invitationId: string;
  inviteeEmail: string;
  currentExpiresAt: Date;
  trigger?: React.ReactNode;
}

export function ExtendInvitationDialog({
  groupId,
  invitationId,
  inviteeEmail,
  currentExpiresAt,
  trigger,
}: ExtendInvitationDialogProps) {
  const [open, setOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const extendInvitation = useExtendInvitation();

  // Default to 7 days from now
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 7);

  const handleSubmit = async () => {
    const expirationDate = selectedDate || defaultDate;
    try {
      await extendInvitation.mutateAsync({
        groupId,
        invitationId,
        newExpiresAt: expirationDate,
      });
      setShowSuccess(true);
    } catch {
      // Error handled by mutation
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setShowSuccess(false);
      setSelectedDate(undefined);
      extendInvitation.reset();
    }
    setOpen(newOpen);
  };

  // Disable dates in the past
  const disabledDays = { before: new Date() };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="inline-flex items-center gap-1 px-2 py-1 text-xs text-amber-500 hover:bg-amber-500/10 rounded transition-colors">
            <IoRefresh className="w-3.5 h-3.5" />
            Extend
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-[#111] border-[#1f1f1f] sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <IoCalendarOutline className="w-4 h-4 text-amber-500" />
            </div>
            <DialogTitle className="text-white">Extend Invitation</DialogTitle>
          </div>
        </DialogHeader>

        {showSuccess ? (
          <div className="py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <IoCheckmark className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              Invitation Extended!
            </h3>
            <p className="text-sm text-[#9a9a9a] mb-6">
              The invitation for{" "}
              <span className="text-white">{inviteeEmail}</span> has been
              extended until{" "}
              <span className="text-white">
                {format(selectedDate || defaultDate, "MMMM d, yyyy")}
              </span>
              . They&apos;ve been sent a reminder email.
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-lg bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-[#0c0c0c] font-medium text-sm transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[#9a9a9a] mb-4">
                Extend the invitation for{" "}
                <span className="text-white">{inviteeEmail}</span>. They will
                receive a reminder email with the invitation link.
              </p>
              <p className="text-xs text-[#666] mb-4">
                Current expiration:{" "}
                <span className="text-amber-500">
                  {format(new Date(currentExpiresAt), "MMMM d, yyyy")}
                </span>
              </p>
            </div>

            <div>
              <label className="text-xs text-[#9a9a9a] mb-1.5 block">
                New Expiration Date
              </label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full h-10 px-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a] text-white text-sm text-left flex items-center justify-between hover:border-[#3a3a3a] focus:outline-none focus:border-[#00D4FF]/50 transition-colors"
                  >
                    <span className={selectedDate ? "text-white" : "text-[#666]"}>
                      {selectedDate
                        ? format(selectedDate, "MMMM d, yyyy")
                        : format(defaultDate, "MMMM d, yyyy") + " (default)"}
                    </span>
                    <IoCalendarOutline className="w-4 h-4 text-[#666]" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setCalendarOpen(false);
                    }}
                    disabled={disabledDays}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {extendInvitation.isError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <IoClose className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">
                  {extendInvitation.error?.message ||
                    "Failed to extend invitation"}
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={extendInvitation.isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00D4FF] hover:bg-[#00D4FF]/90 disabled:bg-[#1f1f1f] disabled:text-[#9a9a9a] text-[#0c0c0c] font-medium text-sm transition-colors"
              >
                {extendInvitation.isPending ? (
                  <IoReload className="w-4 h-4 animate-spin" />
                ) : (
                  <IoCalendarOutline className="w-4 h-4" />
                )}
                Extend Invitation
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg text-[#a3a3a3] hover:text-white hover:bg-[#1f1f1f] text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
