"use client";

import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IoCalendar, IoTime, IoPeople, IoTrash } from "react-icons/io5";
import type { ScheduleEvent } from "../actions";

interface ViewScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: ScheduleEvent | null;
  onDelete: () => void;
  isLoading: boolean;
}

export function ViewScheduleDialog({
  open,
  onOpenChange,
  event,
  onDelete,
  isLoading,
}: ViewScheduleDialogProps) {
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-50 border-gray-200 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gray-900">{event.issueTitle}</DialogTitle>
          <DialogDescription className="text-gray-500">
            {event.groupName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 text-gray-500">
            <IoCalendar className="w-4 h-4" />
            <span>
              {format(new Date(event.scheduledTime), "EEEE, MMMM d, yyyy")}
            </span>
          </div>

          <div className="flex items-center gap-3 text-gray-500">
            <IoTime className="w-4 h-4" />
            <span>
              {format(new Date(event.scheduledTime), "h:mm a")}
              {event.estimatedDuration && (
                <span className="text-gray-500">
                  {" "}
                  ({event.estimatedDuration} min)
                </span>
              )}
            </span>
          </div>

          {event.participantDetails.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-500">
                <IoPeople className="w-4 h-4" />
                <span>Participants</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {event.participantDetails.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200"
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={participant.avatarUrl || undefined} />
                      <AvatarFallback className="bg-gray-100 text-gray-900 text-xs">
                        {participant.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-white">
                      {participant.name || "Unknown"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={onDelete}
            disabled={isLoading}
            className="border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <IoTrash className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
