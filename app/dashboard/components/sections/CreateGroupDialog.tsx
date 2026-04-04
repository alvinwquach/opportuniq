"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import {
  IoReload,
  IoCheckmark,
  IoPeople,
  IoLocation,
  IoAdd,
  IoPersonAdd,
} from "react-icons/io5";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateGroup } from "@/hooks/useGroups";

interface CreateGroupDialogProps {
  variant?: "empty" | "button";
}

export function CreateGroupDialog({ variant = "button" }: CreateGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const createGroup = useCreateGroup();

  const form = useForm({
    defaultValues: {
      name: "",
      postalCode: "",
      defaultSearchRadius: 25,
    },
    onSubmit: async ({ value }) => {
      try {
        await createGroup.mutateAsync(value);
        form.reset();
        setOpen(false);
      } catch {
      }
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
      createGroup.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {variant === "empty" ? (
          <button className="w-full text-left flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-blue-500/30 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <IoPersonAdd className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                Create your first group
              </h3>
              <p className="text-xs text-gray-500">
                Organize decisions by property or project, invite family members
              </p>
            </div>
            <IoAdd className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </button>
        ) : (
          <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-600/80 transition-colors">
            <IoAdd className="w-3.5 h-3.5" />
            New
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-white border-gray-200 sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <IoPeople className="w-4 h-4 text-blue-600" />
            </div>
            <DialogTitle className="text-gray-900">Create Group</DialogTitle>
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
                  <label className="text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 block">
                    Group Name
                  </label>
                  <div className="relative">
                    <IoPeople className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g., Johnson Family, Apartment 4B"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      disabled={createGroup.isPending}
                      className="w-full h-10 pl-10 pr-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
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
                  <label className="text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 block">
                    Postal Code{" "}
                    <span className="text-gray-500 normal-case">(optional)</span>
                  </label>
                  <div className="relative">
                    <IoLocation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g., 94102, SW1A 1AA, K1A 0B1"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      disabled={createGroup.isPending}
                      maxLength={10}
                      className="w-full h-10 pl-10 pr-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
                    />
                  </div>
                  {field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0 && (
                      <p className="text-[10px] text-red-400 mt-1">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  <p className="text-[10px] text-gray-500 mt-1">
                    Used to find nearby contractors and services
                  </p>
                </div>
              )}
            </form.Field>
            <form.Field name="defaultSearchRadius">
              {(field) => (
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-gray-400 mb-1.5 block">
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
                    disabled={createGroup.isPending}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00D4FF] disabled:opacity-50"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                    <span>5 mi</span>
                    <span>50 mi</span>
                    <span>100 mi</span>
                  </div>
                </div>
              )}
            </form.Field>
            {createGroup.isError && (
              <p className="text-[10px] text-red-400">
                {createGroup.error?.message || "Something went wrong"}
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
                  disabled={!canSubmit || createGroup.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-600/90 disabled:bg-gray-100 disabled:text-gray-400 text-white font-medium text-sm transition-colors"
                >
                  {createGroup.isPending ? (
                    <IoReload className="w-4 h-4 animate-spin" />
                  ) : (
                    <IoCheckmark className="w-4 h-4" />
                  )}
                  Create Group
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
      </DialogContent>
    </Dialog>
  );
}
