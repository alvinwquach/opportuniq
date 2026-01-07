"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  IoAdd,
  IoTrash,
  IoPencil,
  IoClose,
  IoCheckmark,
  IoEllipsisHorizontal,
  IoCart,
  IoFlash,
  IoHome,
  IoConstruct,
  IoFilm,
  IoCar,
} from "react-icons/io5";
import { ImSpinner8 } from "react-icons/im";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  addExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
} from "./actions";
import {
  categoryApprovalRules,
  categoryApprovalRuleLabels,
  type CategoryApprovalRule,
  type CategoryFormValues,
} from "./schemas";
import type { GroupExpenseCategory } from "@/app/db/schema";

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "shopping-cart": IoCart,
  bolt: IoFlash,
  home: IoHome,
  wrench: IoConstruct,
  film: IoFilm,
  car: IoCar,
  ellipsis: IoEllipsisHorizontal,
};

const availableIcons = [
  { id: "shopping-cart", Icon: IoCart, label: "Shopping" },
  { id: "bolt", Icon: IoFlash, label: "Utilities" },
  { id: "home", Icon: IoHome, label: "Home" },
  { id: "wrench", Icon: IoConstruct, label: "Repairs" },
  { id: "film", Icon: IoFilm, label: "Entertainment" },
  { id: "car", Icon: IoCar, label: "Transportation" },
  { id: "ellipsis", Icon: IoEllipsisHorizontal, label: "Other" },
];

interface CategoryManagerProps {
  groupId: string;
  categories: GroupExpenseCategory[];
  defaultThreshold: number | null;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export function CategoryManager({
  groupId,
  categories,
  defaultThreshold,
  canAdd,
  canEdit,
  canDelete,
}: CategoryManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<GroupExpenseCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<GroupExpenseCategory | null>(null);

  // Form state
  const [formData, setFormData] = useState<CategoryFormValues>({
    name: "",
    icon: "ellipsis",
    approvalRule: "use_default",
    customThreshold: null,
  });
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      name: "",
      icon: "ellipsis",
      approvalRule: "use_default",
      customThreshold: null,
    });
    setFormError(null);
    setEditingCategory(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: GroupExpenseCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      approvalRule: category.approvalRule as CategoryApprovalRule,
      customThreshold: category.customThreshold ? parseFloat(category.customThreshold) : null,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError("Category name is required");
      return;
    }

    startTransition(async () => {
      try {
        let result;
        if (editingCategory) {
          result = await updateExpenseCategory(groupId, editingCategory.id, formData);
        } else {
          result = await addExpenseCategory(groupId, formData);
        }

        if (result.success) {
          setIsDialogOpen(false);
          resetForm();
          router.refresh();
        } else {
          setFormError(result.error ?? "Failed to save category");
        }
      } catch {
        setFormError("An unexpected error occurred");
      }
    });
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    startTransition(async () => {
      try {
        const result = await deleteExpenseCategory(groupId, deletingCategory.id);
        if (result.success) {
          setDeletingCategory(null);
          router.refresh();
        }
      } catch {
        // Silent fail - could add toast notification
      }
    });
  };

  const getThresholdDisplay = (category: GroupExpenseCategory) => {
    switch (category.approvalRule) {
      case "use_default":
        return defaultThreshold ? `Default ($${defaultThreshold})` : "Use default";
      case "always_require":
        return "Always require approval";
      case "custom_threshold":
        return category.customThreshold ? `$${category.customThreshold}` : "Not set";
      default:
        return "—";
    }
  };

  const IconComponent = (iconId: string | null) => {
    const Icon = iconMap[iconId ?? "ellipsis"] ?? IoEllipsisHorizontal;
    return Icon;
  };

  return (
    <div className="p-5 rounded-xl bg-[#161616] border border-[#1f1f1f]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-white">Expense Categories</h3>
          <p className="text-[11px] text-[#555]">
            Configure approval rules per category
          </p>
        </div>
        {canAdd && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <button
                onClick={openAddDialog}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5eead4] hover:bg-[#5eead4]/90 text-[#0c0c0c] font-medium text-xs transition-colors"
              >
                <IoAdd className="w-4 h-4" />
                Add Category
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#161616] border-[#2a2a2a] text-white max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "Edit Category" : "Add Category"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                {/* Category Name */}
                <div>
                  <label className="text-sm text-[#888] block mb-1.5">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Groceries"
                    className="w-full h-10 px-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a] text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-[#5eead4]/50 transition-colors"
                  />
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="text-sm text-[#888] block mb-1.5">
                    Icon
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {availableIcons.map(({ id, Icon, label }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: id })}
                        className={`p-2.5 rounded-lg border transition-all ${
                          formData.icon === id
                            ? "bg-[#5eead4]/10 border-[#5eead4]/50"
                            : "bg-[#0c0c0c] border-[#2a2a2a] hover:border-[#3a3a3a]"
                        }`}
                        title={label}
                      >
                        <Icon className={`w-5 h-5 ${formData.icon === id ? "text-[#5eead4]" : "text-[#888]"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Approval Rule */}
                <div>
                  <label className="text-sm text-[#888] block mb-1.5">
                    Approval Rule
                  </label>
                  <div className="space-y-2">
                    {categoryApprovalRules.map((rule) => (
                      <button
                        key={rule}
                        type="button"
                        onClick={() => setFormData({ ...formData, approvalRule: rule })}
                        className={`w-full p-3 rounded-lg border text-left transition-all ${
                          formData.approvalRule === rule
                            ? "bg-purple-500/10 border-purple-500/50"
                            : "bg-[#0c0c0c] border-[#2a2a2a] hover:border-[#3a3a3a]"
                        }`}
                      >
                        <span className="text-sm text-white">
                          {categoryApprovalRuleLabels[rule]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Threshold */}
                {formData.approvalRule === "custom_threshold" && (
                  <div>
                    <label className="text-sm text-[#888] block mb-1.5">
                      Custom Threshold
                    </label>
                    <div className="relative max-w-xs">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555] text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        value={formData.customThreshold ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customThreshold: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                        placeholder="e.g., 100"
                        className="w-full h-10 pl-7 pr-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a] text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-[#5eead4]/50 transition-colors"
                      />
                    </div>
                  </div>
                )}

                {formError && (
                  <p className="text-sm text-red-400">{formError}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 rounded-lg border border-[#2a2a2a] text-[#888] hover:text-white hover:border-[#3a3a3a] text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#5eead4] hover:bg-[#5eead4]/90 disabled:bg-[#1f1f1f] disabled:text-[#555] text-[#0c0c0c] font-medium text-sm transition-colors"
                  >
                    {isPending ? (
                      <ImSpinner8 className="w-4 h-4 animate-spin" />
                    ) : (
                      <IoCheckmark className="w-4 h-4" />
                    )}
                    {editingCategory ? "Save" : "Add"}
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Categories List */}
      {categories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-[#555]">No categories yet</p>
          {canAdd && (
            <p className="text-xs text-[#444] mt-1">
              Add categories to organize and control expense approvals
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => {
            const Icon = IconComponent(category.icon);
            return (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#161616] flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#888]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{category.name}</p>
                    <p className="text-[11px] text-[#555]">
                      {getThresholdDisplay(category)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {canEdit && (
                    <button
                      onClick={() => openEditDialog(category)}
                      className="p-2 rounded-lg hover:bg-[#161616] text-[#555] hover:text-white transition-colors"
                    >
                      <IoPencil className="w-4 h-4" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => setDeletingCategory(category)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-[#555] hover:text-red-400 transition-colors"
                    >
                      <IoTrash className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        <AlertDialogContent className="bg-[#161616] border-[#2a2a2a]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Category</AlertDialogTitle>
            <AlertDialogDescription className="text-[#888]">
              Are you sure you want to delete &quot;{deletingCategory?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-[#2a2a2a] text-[#888] hover:bg-[#1f1f1f] hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {isPending ? (
                <ImSpinner8 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
