"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IoAdd } from "react-icons/io5";
import { IncomeStreamCard, type IncomeStream } from "./IncomeStreamCard";
import { IncomeFormDialog } from "./IncomeFormDialog";
import { updateIncomeStream, deleteIncomeStream } from "./actions";

interface IncomeManagerProps {
  userId: string;
  initialStreams: IncomeStream[];
}

export function IncomeManager({ userId, initialStreams }: IncomeManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<IncomeStream | null>(null);

  const handleEdit = (stream: IncomeStream) => {
    setEditingStream(stream);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingStream(null);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingStream(null);
    }
  };

  const handleDelete = (streamId: string) => {
    startTransition(async () => {
      await deleteIncomeStream(streamId, userId);
      router.refresh();
    });
  };

  const handleToggleActive = (stream: IncomeStream) => {
    startTransition(async () => {
      await updateIncomeStream(stream.id, userId, {
        isActive: !stream.isActive,
      });
      router.refresh();
    });
  };

  const activeStreams = initialStreams.filter((s) => s.isActive);
  const inactiveStreams = initialStreams.filter((s) => !s.isActive);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {activeStreams.map((stream) => (
          <IncomeStreamCard
            key={stream.id}
            stream={stream}
            onEdit={() => handleEdit(stream)}
            onDelete={() => handleDelete(stream.id)}
            onToggleActive={() => handleToggleActive(stream)}
            isPending={isPending}
            variant="active"
          />
        ))}
      </div>
      <button
        onClick={handleAdd}
        className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-[#2a2a2a] text-[#666] hover:text-white hover:border-[#5eead4]/50 transition-colors"
      >
        <IoAdd className="w-4 h-4" />
        Add Income Source
      </button>
      {inactiveStreams.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xs font-medium text-[#555] uppercase tracking-wider mb-3">
            Inactive
          </h3>
          <div className="space-y-2">
            {inactiveStreams.map((stream) => (
              <IncomeStreamCard
                key={stream.id}
                stream={stream}
                onEdit={() => handleEdit(stream)}
                onDelete={() => handleDelete(stream.id)}
                onToggleActive={() => handleToggleActive(stream)}
                isPending={isPending}
                variant="inactive"
              />
            ))}
          </div>
        </div>
      )}
      <IncomeFormDialog
        userId={userId}
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        editingStream={editingStream}
      />
    </div>
  );
}
