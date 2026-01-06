"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import {
  IoReload,
  IoCheckmark,
  IoPersonAdd,
  IoMail,
  IoShieldCheckmark,
  IoClose,
  IoCalendarOutline,
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
import { useInviteMember } from "@/hooks/useGroupMembers";

type GroupRole = "coordinator" | "collaborator" | "participant" | "contributor" | "observer";

interface InviteMemberDialogProps {
  groupId: string;
  groupName: string;
  trigger?: React.ReactNode;
}

const roleOptions: { value: GroupRole; label: string; description: string }[] = [
  {
    value: "participant",
    label: "Participant",
    description: "Can view and contribute to issues",
  },
  {
    value: "contributor",
    label: "Contributor",
    description: "Can create and manage issues",
  },
  {
    value: "collaborator",
    label: "Collaborator",
    description: "Can invite members and manage issues",
  },
  {
    value: "observer",
    label: "Observer",
    description: "View-only access to the group",
  },
];

export function InviteMemberDialog({ groupId, groupName, trigger }: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const inviteMember = useInviteMember();

  // Default to 7 days from now
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 7);

  // Disable dates in the past
  const disabledDays = { before: new Date() };

  const form = useForm({
    defaultValues: {
      email: "",
      role: "participant" as GroupRole,
      message: "",
      expiresAt: undefined as Date | undefined,
    },
    onSubmit: async ({ value }) => {
      try {
        await inviteMember.mutateAsync({
          groupId,
          email: value.email,
          role: value.role,
          message: value.message || undefined,
          expiresAt: value.expiresAt,
        });
        setInvitedEmail(value.email);
        setShowSuccess(true);
      } catch {
      }
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      form.reset();
      setShowSuccess(false);
      setInvitedEmail("");
      inviteMember.reset();
    }
    setOpen(newOpen);
  };

  const handleInviteAnother = () => {
    form.reset();
    setShowSuccess(false);
    setInvitedEmail("");
    inviteMember.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00D4FF]/10 hover:bg-[#00D4FF]/20 text-[#00D4FF] text-sm transition-colors">
            <IoPersonAdd className="w-4 h-4" />
            Invite
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-[#111] border-[#1f1f1f] sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <IoPersonAdd className="w-4 h-4 text-purple-400" />
            </div>
            <DialogTitle className="text-white">Invite to {groupName}</DialogTitle>
          </div>
        </DialogHeader>

        {showSuccess ? (
          <div className="py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <IoCheckmark className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Invitation Sent!</h3>
            <p className="text-sm text-[#9a9a9a] mb-6">
              We&apos;ve sent an invitation to <span className="text-white">{invitedEmail}</span>.
              They&apos;ll receive an email with a link to join the group.
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleInviteAnother}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#00D4FF] hover:bg-[#00D4FF]/90 text-[#0c0c0c] font-medium text-sm transition-colors mx-auto"
              >
                <IoPersonAdd className="w-4 h-4" />
                Invite Another
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg text-[#a3a3a3] hover:text-white text-sm transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div className="space-y-4">
              <form.Field
                name="email"
                validators={{
                  onChange: ({ value }) => {
                    if (!value.trim()) return "Email is required";
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) return "Please enter a valid email";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div>
                    <label className="text-xs text-[#9a9a9a] mb-1.5 block">
                      Email Address
                    </label>
                    <div className="relative">
                      <IoMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9a9a]" />
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        disabled={inviteMember.isPending}
                        className="w-full h-10 pl-10 pr-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a] text-white text-sm placeholder:text-[#666] focus:outline-none focus:border-[#00D4FF]/50 transition-colors disabled:opacity-50"
                        autoFocus
                      />
                    </div>
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 && (
                        <p className="text-[10px] text-red-400 mt-1">
                          {field.state.meta.errors[0]}
                        </p>
                      )}
                  </div>
                )}
              </form.Field>

              <form.Field name="role">
                {(field) => (
                  <div>
                    <label className="text-xs text-[#9a9a9a] mb-1.5 block">
                      Role
                    </label>
                    <div className="space-y-2">
                      {roleOptions.map((option) => (
                        <label
                          key={option.value}
                          className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            field.state.value === option.value
                              ? "bg-[#00D4FF]/5 border-[#00D4FF]/30"
                              : "bg-[#0c0c0c] border-[#2a2a2a] hover:border-[#3a3a3a]"
                          } ${inviteMember.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={option.value}
                            checked={field.state.value === option.value}
                            onChange={() => field.handleChange(option.value)}
                            disabled={inviteMember.isPending}
                            className="mt-0.5 accent-[#00D4FF]"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium">{option.label}</p>
                            <p className="text-xs text-[#666]">{option.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </form.Field>

              <form.Field name="message">
                {(field) => (
                  <div>
                    <label className="text-xs text-[#9a9a9a] mb-1.5 block">
                      Personal Message <span className="text-[#666]">(optional)</span>
                    </label>
                    <textarea
                      placeholder="Add a personal note to the invitation..."
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={inviteMember.isPending}
                      rows={3}
                      maxLength={500}
                      className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a] text-white text-sm placeholder:text-[#666] focus:outline-none focus:border-[#00D4FF]/50 transition-colors disabled:opacity-50 resize-none"
                    />
                    <p className="text-[10px] text-[#666] mt-1 text-right">
                      {field.state.value.length}/500
                    </p>
                  </div>
                )}
              </form.Field>

              <form.Field name="expiresAt">
                {(field) => (
                  <div>
                    <label className="text-xs text-[#9a9a9a] mb-1.5 block">
                      Invitation Expires <span className="text-[#666]">(optional)</span>
                    </label>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          disabled={inviteMember.isPending}
                          className="w-full h-10 px-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a] text-white text-sm text-left flex items-center justify-between hover:border-[#3a3a3a] focus:outline-none focus:border-[#00D4FF]/50 transition-colors disabled:opacity-50"
                        >
                          <span className={field.state.value ? "text-white" : "text-[#666]"}>
                            {field.state.value
                              ? format(field.state.value, "MMMM d, yyyy")
                              : format(defaultDate, "MMMM d, yyyy") + " (default)"}
                          </span>
                          <IoCalendarOutline className="w-4 h-4 text-[#666]" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.state.value}
                          onSelect={(date) => {
                            field.handleChange(date);
                            setCalendarOpen(false);
                          }}
                          disabled={disabledDays}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-[10px] text-[#666] mt-1">
                      The invitation link will expire on this date
                    </p>
                  </div>
                )}
              </form.Field>

              {inviteMember.isError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <IoClose className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">
                    {inviteMember.error?.message || "Failed to send invitation"}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-6">
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit]) => (
                  <button
                    type="submit"
                    disabled={!canSubmit || inviteMember.isPending}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00D4FF] hover:bg-[#00D4FF]/90 disabled:bg-[#1f1f1f] disabled:text-[#9a9a9a] text-[#0c0c0c] font-medium text-sm transition-colors"
                  >
                    {inviteMember.isPending ? (
                      <IoReload className="w-4 h-4 animate-spin" />
                    ) : (
                      <IoPersonAdd className="w-4 h-4" />
                    )}
                    Send Invitation
                  </button>
                )}
              </form.Subscribe>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg text-[#a3a3a3] hover:text-white hover:bg-[#1f1f1f] text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
