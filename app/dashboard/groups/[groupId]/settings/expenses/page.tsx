import { getCurrentUser } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import Link from "next/link";
import { getExpenseSettings, getExpenseCategories } from "./actions";
import { ExpenseSettingsForm } from "./ExpenseSettingsForm";
import { CategoryManager } from "./CategoryManager";
import type { ExpenseApprovalMode } from "./schemas";

interface ExpenseSettingsPageProps {
  params: Promise<{
    groupId: string;
  }>;
}

export default async function ExpenseSettingsPage({ params }: ExpenseSettingsPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { groupId } = await params;

  const [settingsResult, categoriesResult] = await Promise.all([
    getExpenseSettings(groupId),
    getExpenseCategories(groupId),
  ]);

  if (!settingsResult.success) {
    notFound();
  }

  const settings = settingsResult.settings;
  const categories = categoriesResult.success ? categoriesResult.categories : [];
  const userRole = settingsResult.userRole;

  // Permission checks
  const isCoordinatorOrCollaborator = userRole === "coordinator" || userRole === "collaborator";
  const canEditSettings = isCoordinatorOrCollaborator;
  const canAddCategory = isCoordinatorOrCollaborator || userRole === "participant";
  const canEditCategory = isCoordinatorOrCollaborator || userRole === "participant";
  const canDeleteCategory = isCoordinatorOrCollaborator;

  // Parse settings for form
  const formValues = {
    approvalMode: (settings?.approvalMode ?? "none") as ExpenseApprovalMode,
    defaultThreshold: settings?.defaultThreshold ? parseFloat(settings.defaultThreshold) : null,
    trustOwnerAdmin: settings?.trustOwnerAdmin ?? false,
    moderatorThreshold: settings?.moderatorThreshold ? parseFloat(settings.moderatorThreshold) : null,
    allowModeratorApprove: settings?.allowModeratorApprove ?? false,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/dashboard/groups/${groupId}`}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
          >
            <IoArrowBack className="w-4 h-4" />
            Back to Group
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Expense Settings
          </h1>
          <p className="text-sm text-gray-500">
            Configure how expenses are approved and manage categories for this group.
          </p>
        </div>

        <div className="space-y-6">
          {/* Expense Settings Form */}
          <ExpenseSettingsForm
            groupId={groupId}
            initialValues={formValues}
            canEdit={canEditSettings}
          />

          {/* Category Manager */}
          <CategoryManager
            groupId={groupId}
            categories={categories ?? []}
            defaultThreshold={formValues.defaultThreshold}
            canAdd={canAddCategory}
            canEdit={canEditCategory}
            canDelete={canDeleteCategory}
          />
        </div>
      </div>
    </div>
  );
}
