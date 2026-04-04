"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import {
  IoReload,
  IoCheckmark,
  IoPeople,
  IoLocation,
  IoSettings,
  IoTrash,
  IoWarning,
} from "react-icons/io5";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUpdateGroup, useDeleteGroup } from "@/hooks/useGroups";

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();
  const updateGroup = useUpdateGroup();
  const deleteGroup = useDeleteGroup();

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
      deleteGroup.reset();
      setShowDeleteConfirm(false);
    }
    setOpen(newOpen);
  };

  const handleDelete = async () => {
    try {
      await deleteGroup.mutateAsync(group.id);
      setOpen(false);
      router.push("/dashboard");
    } catch {
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-900 text-sm transition-colors">
            <IoSettings className="w-4 h-4" />
            Edit
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-white border-gray-200 sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <IoPeople className="w-4 h-4 text-blue-600" />
            </div>
            <DialogTitle className="text-gray-900">Edit Group</DialogTitle>
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
                  <label className="text-xs text-gray-400 mb-1.5 block">
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
                      disabled={updateGroup.isPending}
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
                  <label className="text-xs text-gray-400 mb-1.5 block">
                    Postal Code{" "}
                    <span className="text-gray-500">(optional)</span>
                  </label>
                  <div className="relative">
                    <IoLocation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g., 94102, SW1A 1AA, K1A 0B1"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      disabled={updateGroup.isPending}
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
                  <label className="text-xs text-gray-400 mb-1.5 block">
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
                  disabled={!canSubmit || updateGroup.isPending || deleteGroup.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-600/90 disabled:bg-gray-100 disabled:text-gray-400 text-white font-medium text-sm transition-colors"
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
              className="px-4 py-2 rounded-lg text-[#a3a3a3] hover:text-gray-900 hover:bg-gray-100 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="border-t border-gray-200 pt-4 mt-4">
          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={updateGroup.isPending || deleteGroup.isPending}
              className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
            >
              <IoTrash className="w-4 h-4" />
              Delete Group
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <IoWarning className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-400 font-medium">
                    Delete &quot;{group.name}&quot;?
                  </p>
                  <p className="text-xs text-red-400/70 mt-1">
                    This will permanently delete the group and all associated data including members, expenses, and issues. This action cannot be undone.
                  </p>
                </div>
              </div>
              {deleteGroup.isError && (
                <p className="text-[10px] text-red-400">
                  {deleteGroup.error?.message || "Failed to delete group"}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteGroup.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-gray-900 font-medium text-sm transition-colors"
                >
                  {deleteGroup.isPending ? (
                    <IoReload className="w-4 h-4 animate-spin" />
                  ) : (
                    <IoTrash className="w-4 h-4" />
                  )}
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteGroup.isPending}
                  className="px-4 py-2 rounded-lg text-[#a3a3a3] hover:text-gray-900 hover:bg-gray-100 text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
