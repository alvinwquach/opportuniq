"use client";

/**
 * INCOME MANAGER
 *
 * Displays income stream cards with edit/delete/toggle functionality.
 * Receives ALREADY-DECRYPTED data from parent (IncomePageClient).
 *
 * NO useEffect for decryption here! Parent handles it.
 * We receive both raw (for re-fetching) and decrypted (for display) data.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IoAdd } from "react-icons/io5";
import { IncomeStreamCard } from "./IncomeStreamCard";
import { IncomeFormDialog } from "./IncomeFormDialog";
import { updateIncomeStream } from "./actions/updateIncomeStream";
import { deleteIncomeStream } from "./actions/deleteIncomeStream";
import {
  useEncryptedFinancials,
  type RawIncomeStream,
  type DecryptedIncomeStream,
} from "@/hooks/useEncryptedFinancials";

interface IncomeManagerProps {
  userId: string;
  initialStreams: RawIncomeStream[];
  decryptedStreams: DecryptedIncomeStream[];
  setDecryptedStreams: React.Dispatch<React.SetStateAction<DecryptedIncomeStream[]>>;
}

export function IncomeManager({
  userId,
  initialStreams,
  decryptedStreams,
  setDecryptedStreams,
}: IncomeManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<DecryptedIncomeStream | null>(null);
  const { encryptIncomeData } = useEncryptedFinancials();

  // ─────────────────────────────────────────────────────────────────
  // NO useEffect FOR DECRYPTION
  // ─────────────────────────────────────────────────────────────────
  // Parent (IncomePageClient) handles decryption and passes down
  // decryptedStreams. We just use it directly!
  // ─────────────────────────────────────────────────────────────────

  const handleEdit = (stream: DecryptedIncomeStream) => {
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

  const handleToggleActive = (stream: DecryptedIncomeStream) => {
    startTransition(async () => {
      // Re-encrypt data when toggling active (since we're updating)
      const encryptedData = await encryptIncomeData({
        source: stream.source,
        amount: stream.amount,
        description: stream.description || undefined,
        frequency: stream.frequency,
        isActive: !stream.isActive,
      });
      await updateIncomeStream(stream.id, userId, encryptedData);
      router.refresh();
    });
  };

  // ─────────────────────────────────────────────────────────────────
  // SEPARATE ACTIVE AND INACTIVE STREAMS
  // ─────────────────────────────────────────────────────────────────
  const activeStreams = decryptedStreams.filter((s) => s.isActive);
  const inactiveStreams = decryptedStreams.filter((s) => !s.isActive);

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
        className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-gray-200 text-gray-500 hover:text-gray-900 hover:border-[#5eead4]/50 transition-colors"
      >
        <IoAdd className="w-4 h-4" />
        Add Income Source
      </button>
      {inactiveStreams.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
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
