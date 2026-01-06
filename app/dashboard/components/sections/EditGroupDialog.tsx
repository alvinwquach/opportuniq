"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import {
  IoReload,
  IoCheckmark,
  IoPeople,
  IoLocation,
  IoSettings,
} from "react-icons/io5";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUpdateGroup } from "@/hooks/useGroups";

interface EditGroupDialogProps {
  group: {
    id: string;
    name: string;
    postalCode: string | null;
    defaultSearchRadius: number | null;
  };
  trigger?: React.ReactNode;
}

export function EditGroupDialog({ group, trigger }: EditGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const updateGroup = useUpdateGroup();

  const form = useForm({
    defaultValues: {
      name: group.name,
      postalCode: group.postalCode || "",
      defaultSearchRadius: group.defaultSearchRadius || 25,
    },
    onSubmit: async ({ value }) => {
      try {
        await updateGroup.mutateAsync({
          groupId: group.id,
          ...value,
        });
        setOpen(false);
      } catch {
      }
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      form.setFieldValue("name", group.name);
      form.setFieldValue("postalCode", group.postalCode || "");
      form.setFieldValue("defaultSearchRadius", group.defaultSearchRadius || 25);
    } else {
      updateGroup.reset();
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1f1f1f] hover:bg-[#2a2a2a] text-[#9a9a9a] hover:text-white text-sm transition-colors">
            <IoSettings className="w-4 h-4" />
            Edit
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-[#111] border-[#1f1f1f] sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00D4FF]/10 flex items-center justify-center">
              <IoPeople className="w-4 h-4 text-[#00D4FF]" />
            </div>
            <DialogTitle className="text-white">Edit Group</DialogTitle>
          </div>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="space-y-4">
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) => {
                  if (!value.trim()) return "Group name is required";
                  if (value.length > 100)
                    return "Group name must be 100 characters or less";
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div>
                  <label className="text-xs text-[#9a9a9a] mb-1.5 block">
                    Group Name
                  </label>
                  <div className="relative">
                    <IoPeople className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9a9a]" />
                    <input
                      type="text"
                      placeholder="e.g., Johnson Family, Apartment 4B"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      disabled={updateGroup.isPending}
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
            <form.Field
              name="postalCode"
              validators={{
                onChange: ({ value }) => {
                  if (value && value.length < 3) {
                    return "Postal code must be at least 3 characters";
                  }
                  if (value && value.length > 10) {
                    return "Postal code must be 10 characters or less";
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div>
                  <label className="text-xs text-[#9a9a9a] mb-1.5 block">
                    Postal Code{" "}
                    <span className="text-[#666]">(optional)</span>
                  </label>
                  <div className="relative">
                    <IoLocation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9a9a]" />
                    <input
                      type="text"
                      placeholder="e.g., 94102, SW1A 1AA, K1A 0B1"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      disabled={updateGroup.isPending}
                      maxLength={10}
                      className="w-full h-10 pl-10 pr-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a] text-white text-sm placeholder:text-[#666] focus:outline-none focus:border-[#00D4FF]/50 transition-colors disabled:opacity-50"
                    />
                  </div>
                  {field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0 && (
                      <p className="text-[10px] text-red-400 mt-1">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  <p className="text-[10px] text-[#666] mt-1">
                    Used to find nearby contractors and services
                  </p>
                </div>
              )}
            </form.Field>
            <form.Field name="defaultSearchRadius">
              {(field) => (
                <div>
                  <label className="text-xs text-[#9a9a9a] mb-1.5 block">
                    Search Radius: {field.state.value} miles
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(parseInt(e.target.value))
                    }
                    disabled={updateGroup.isPending}
                    className="w-full h-2 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#00D4FF] disabled:opacity-50"
                  />
                  <div className="flex justify-between text-[10px] text-[#666] mt-1">
                    <span>5 mi</span>
                    <span>50 mi</span>
                    <span>100 mi</span>
                  </div>
                </div>
              )}
            </form.Field>
            {updateGroup.isError && (
              <p className="text-[10px] text-red-400">
                {updateGroup.error?.message || "Something went wrong"}
              </p>
            )}
          </div>
          <div className="flex gap-2 pt-6">
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit]) => (
                <button
                  type="submit"
                  disabled={!canSubmit || updateGroup.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00D4FF] hover:bg-[#00D4FF]/90 disabled:bg-[#1f1f1f] disabled:text-[#9a9a9a] text-[#0c0c0c] font-medium text-sm transition-colors"
                >
                  {updateGroup.isPending ? (
                    <IoReload className="w-4 h-4 animate-spin" />
                  ) : (
                    <IoCheckmark className="w-4 h-4" />
                  )}
                  Save Changes
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
      </DialogContent>
    </Dialog>
  );
}
