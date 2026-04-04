"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import {
  IoReload,
  IoCheckmark,
  IoPeople,
  IoClose,
  IoCalendarOutline,
  IoCloudUploadOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
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
import { useInviteMultipleMembers } from "@/hooks/useGroupMembers";

type GroupRole = "coordinator" | "collaborator" | "participant" | "contributor" | "observer";

interface BulkInviteMemberDialogProps {
  groupId: string;
  groupName: string;
  trigger?: React.ReactNode;
}

interface InviteResult {
  email: string;
  success: boolean;
  error?: string;
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

function parseEmails(text: string): string[] {
  // Split by common delimiters: comma, semicolon, newline, space
  const emails = text
    .split(/[,;\n\s]+/)
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);

  // Remove duplicates
  return [...new Set(emails)];
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function BulkInviteMemberDialog({
  groupId,
  groupName,
  trigger,
}: BulkInviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<InviteResult[]>([]);
  const [summary, setSummary] = useState({ total: 0, successful: 0, failed: 0 });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const inviteMultiple = useInviteMultipleMembers();

  // Default to 7 days from now
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 7);

  // Disable dates in the past
  const disabledDays = { before: new Date() };

  const form = useForm({
    defaultValues: {
      emailsText: "",
      role: "participant" as GroupRole,
      message: "",
      expiresAt: undefined as Date | undefined,
    },
    onSubmit: async ({ value }) => {
      const emails = parseEmails(value.emailsText);

      if (emails.length === 0) {
        return;
      }

      try {
        const result = await inviteMultiple.mutateAsync({
          groupId,
          invites: emails.map((email) => ({ email })),
          defaultRole: value.role,
          defaultMessage: value.message || undefined,
          expiresAt: value.expiresAt,
        });

        if (result.results) {
          setResults(result.results);
        }
        if (result.summary) {
          setSummary(result.summary);
        }
        setShowResults(true);
      } catch {
        // Error is handled by the mutation
      }
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      form.reset();
      setShowResults(false);
      setResults([]);
      setSummary({ total: 0, successful: 0, failed: 0 });
      setEmailsText("");
      inviteMultiple.reset();
    }
    setOpen(newOpen);
  };

  const handleInviteMore = () => {
    form.reset();
    setShowResults(false);
    setResults([]);
    setSummary({ total: 0, successful: 0, failed: 0 });
    setEmailsText("");
    inviteMultiple.reset();
  };

  // Parse emails for preview - track with state since form.useStore was removed in newer versions
  const [emailsText, setEmailsText] = useState("");
  const parsedEmails = parseEmails(emailsText);
  const validEmails = parsedEmails.filter(validateEmail);
  const invalidEmails = parsedEmails.filter((e) => !validateEmail(e));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-sm transition-colors">
            <IoPeople className="w-4 h-4" />
            Bulk Invite
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-white border-gray-200 sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <IoPeople className="w-4 h-4 text-purple-400" />
            </div>
            <DialogTitle className="text-gray-900">
              Bulk Invite to {groupName}
            </DialogTitle>
          </div>
        </DialogHeader>

        {showResults ? (
          <div className="py-4">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-2">
                  <IoCheckmarkCircle className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-2xl font-semibold text-white">
                  {summary.successful}
                </p>
                <p className="text-xs text-gray-500">Sent</p>
              </div>
              {summary.failed > 0 && (
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-2">
                    <IoCloseCircle className="w-6 h-6 text-red-500" />
                  </div>
                  <p className="text-2xl font-semibold text-white">
                    {summary.failed}
                  </p>
                  <p className="text-xs text-gray-500">Failed</p>
                </div>
              )}
            </div>

            {summary.successful > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">
                  Successfully sent to:
                </p>
                <div className="max-h-32 overflow-y-auto rounded-lg bg-gray-50 border border-gray-200 p-3">
                  {results
                    .filter((r) => r.success)
                    .map((result, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm text-green-400 py-1"
                      >
                        <IoCheckmark className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{result.email}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {summary.failed > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Failed to send:</p>
                <div className="max-h-32 overflow-y-auto rounded-lg bg-gray-50 border border-gray-200 p-3">
                  {results
                    .filter((r) => !r.success)
                    .map((result, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm text-red-400 py-1"
                      >
                        <IoClose className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{result.email}</span>
                        {result.error && (
                          <span className="text-[10px] text-gray-500 ml-auto shrink-0">
                            {result.error}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-4">
              <button
                type="button"
                onClick={handleInviteMore}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-600/90 text-white font-medium text-sm transition-colors"
              >
                <IoPeople className="w-4 h-4" />
                Invite More
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg text-[#a3a3a3] hover:text-gray-900 text-sm transition-colors"
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
                name="emailsText"
                validators={{
                  onChange: ({ value }) => {
                    const emails = parseEmails(value);
                    if (emails.length === 0 && value.trim().length > 0) {
                      return "Please enter valid email addresses";
                    }
                    if (emails.length > 50) {
                      return "Maximum 50 email addresses allowed";
                    }
                    const invalid = emails.filter((e) => !validateEmail(e));
                    if (invalid.length > 0) {
                      return `Invalid email(s): ${invalid.slice(0, 3).join(", ")}${invalid.length > 3 ? "..." : ""}`;
                    }
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">
                      Email Addresses
                    </label>
                    <div className="relative">
                      <IoCloudUploadOutline className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <textarea
                        placeholder="Enter email addresses separated by commas, spaces, or new lines..."
                        value={field.state.value}
                        onChange={(e) => {
                          field.handleChange(e.target.value);
                          setEmailsText(e.target.value);
                        }}
                        onBlur={field.handleBlur}
                        disabled={inviteMultiple.isPending}
                        rows={4}
                        className="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50 resize-none"
                        autoFocus
                      />
                    </div>
                    {parsedEmails.length > 0 && (
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="text-gray-400">
                          {validEmails.length} valid email{validEmails.length !== 1 ? "s" : ""}
                        </span>
                        {invalidEmails.length > 0 && (
                          <span className="text-red-400">
                            {invalidEmails.length} invalid
                          </span>
                        )}
                      </div>
                    )}
                    {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 && (
                        <p className="text-[10px] text-red-400 mt-1">
                          {field.state.meta.errors[0]}
                        </p>
                      )}
                    <p className="text-[10px] text-gray-500 mt-1">
                      Paste a list of emails or type them separated by commas
                    </p>
                  </div>
                )}
              </form.Field>

              <form.Field name="role">
                {(field) => (
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">
                      Role for All Invitees
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {roleOptions.map((option) => (
                        <label
                          key={option.value}
                          className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                            field.state.value === option.value
                              ? "bg-blue-50 border-blue-500/30"
                              : "bg-gray-50 border-gray-200 hover:border-[#3a3a3a]"
                          } ${inviteMultiple.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={option.value}
                            checked={field.state.value === option.value}
                            onChange={() => field.handleChange(option.value)}
                            disabled={inviteMultiple.isPending}
                            className="sr-only"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-900 font-medium">
                              {option.label}
                            </p>
                          </div>
                          {field.state.value === option.value && (
                            <IoCheckmark className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </form.Field>

              <form.Field name="message">
                {(field) => (
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">
                      Personal Message{" "}
                      <span className="text-gray-500">(optional)</span>
                    </label>
                    <textarea
                      placeholder="Add a personal note to all invitations..."
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={inviteMultiple.isPending}
                      rows={2}
                      maxLength={500}
                      className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50 resize-none"
                    />
                    <p className="text-[10px] text-gray-500 mt-1 text-right">
                      {field.state.value.length}/500
                    </p>
                  </div>
                )}
              </form.Field>

              <form.Field name="expiresAt">
                {(field) => (
                  <div>
                    <label className="text-xs text-gray-400 mb-1.5 block">
                      Invitation Expires{" "}
                      <span className="text-gray-500">(optional)</span>
                    </label>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          disabled={inviteMultiple.isPending}
                          className="w-full h-10 px-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm text-left flex items-center justify-between hover:border-[#3a3a3a] focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
                        >
                          <span
                            className={
                              field.state.value ? "text-gray-900" : "text-gray-500"
                            }
                          >
                            {field.state.value
                              ? format(field.state.value, "MMMM d, yyyy")
                              : format(defaultDate, "MMMM d, yyyy") +
                                " (default)"}
                          </span>
                          <IoCalendarOutline className="w-4 h-4 text-gray-500" />
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
                  </div>
                )}
              </form.Field>

              {inviteMultiple.isError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <IoClose className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">
                    {inviteMultiple.error?.message ||
                      "Failed to send invitations"}
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
                    disabled={
                      !canSubmit ||
                      inviteMultiple.isPending ||
                      validEmails.length === 0
                    }
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-600/90 disabled:bg-gray-100 disabled:text-gray-400 text-white font-medium text-sm transition-colors"
                  >
                    {inviteMultiple.isPending ? (
                      <IoReload className="w-4 h-4 animate-spin" />
                    ) : (
                      <IoPeople className="w-4 h-4" />
                    )}
                    {inviteMultiple.isPending
                      ? "Sending..."
                      : `Send ${validEmails.length} Invitation${validEmails.length !== 1 ? "s" : ""}`}
                  </button>
                )}
              </form.Subscribe>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg text-[#a3a3a3] hover:text-gray-900 hover:bg-gray-100 text-sm transition-colors"
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
