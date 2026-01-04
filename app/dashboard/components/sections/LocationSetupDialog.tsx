"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IoReload, IoCheckmark, IoLocation, IoAdd } from "react-icons/io5";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateUserLocation } from "../../settings/location/actions";

interface LocationSetupDialogProps {
  userId: string;
}

export function LocationSetupDialog({ userId }: LocationSetupDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [postalCode, setPostalCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postalCode.trim()) {
      setError("Please enter a postal code");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await updateUserLocation(userId, { postalCode: postalCode.trim() });
      if (result.success) {
        setOpen(false);
        setPostalCode("");
        router.refresh();
      } else {
        setError(result.error || "Failed to update location");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full text-left p-4 rounded-xl bg-[#161616] border border-[#1f1f1f] hover:border-[#333] transition-colors group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#1f1f1f] flex items-center justify-center">
              <IoLocation className="w-4 h-4 text-[#a3a3a3]" />
            </div>
            <h3 className="text-sm font-medium text-[#ccc] group-hover:text-white transition-colors">
              Set your location
            </h3>
            <div className="ml-auto w-6 h-6 rounded-full bg-[#1f1f1f] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <IoAdd className="w-3.5 h-3.5 text-[#a3a3a3]" />
            </div>
          </div>
          <p className="text-xs text-[#a3a3a3]">
            Add your postal code to see local weather, find nearby vendors, and get outdoor work recommendations.
          </p>
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#111] border-[#1f1f1f] sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#5eead4]/10 flex items-center justify-center">
              <IoLocation className="w-4 h-4 text-[#5eead4]" />
            </div>
            <DialogTitle className="text-white">Set Location</DialogTitle>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#9a9a9a] mb-1.5 block">
                Postal Code
              </label>
              <div className="relative">
                <IoLocation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9a9a]" />
                <input
                  type="text"
                  placeholder="e.g., 90210"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 rounded-lg bg-[#0c0c0c] border border-[#2a2a2a] text-white text-sm placeholder:text-[#9a9a9a] focus:outline-none focus:border-[#5eead4]/50 transition-colors"
                  autoComplete="postal-code"
                />
              </div>
              {error && (
                <p className="text-[10px] text-red-400 mt-1">{error}</p>
              )}
            </div>
            <p className="text-[10px] text-[#9a9a9a]">
              Your location helps us show local weather conditions, find vendors near you, and recommend the best days for outdoor projects.
            </p>
          </div>

          <div className="flex gap-2 pt-6">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5eead4] hover:bg-[#5eead4]/90 disabled:bg-[#1f1f1f] disabled:text-[#9a9a9a] text-[#0c0c0c] font-medium text-sm transition-colors"
            >
              {isPending ? (
                <IoReload className="w-4 h-4 animate-spin" />
              ) : (
                <IoCheckmark className="w-4 h-4" />
              )}
              Save Location
            </button>
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
