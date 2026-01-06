"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { Toast } from "@/components/ui/Toast";
import { IoCheckmarkCircle, IoCloseCircle, IoPeople, IoMail, IoTime } from "react-icons/io5";
import { declineInvitation } from "@/app/dashboard/groups/actions";

interface InviteDecisionClientProps {
  token: string;
  groupName: string;
  inviterName: string;
  inviteeEmail: string;
  role: string;
  message?: string | null;
  expiresAt: string;
  acceptUrl: string;
}

export function InviteDecisionClient({
  token,
  groupName,
  inviterName,
  inviteeEmail,
  role,
  message,
  expiresAt,
  acceptUrl,
}: InviteDecisionClientProps) {
  const router = useRouter();
  const [isDeclineDialogOpen, setIsDeclineDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setIsToastVisible(false);
  }, []);

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleAccept = () => {
    setIsProcessing(true);
    router.push(acceptUrl);
  };

  const handleDecline = async () => {
    setIsProcessing(true);
    try {
      const result = await declineInvitation(token);
      if (result.success) {
        showToast("Invitation declined");
        router.push("/invite/declined");
      } else {
        showToast(result.error || "Failed to decline invitation");
        setIsProcessing(false);
      }
    } catch (error) {
      showToast("Failed to decline invitation");
      setIsProcessing(false);
    }
    setIsDeclineDialogOpen(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-20">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <IoPeople className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            You're invited to join
          </h1>
          <p className="text-xl font-semibold text-primary">{groupName}</p>
        </div>

        <div className="bg-card border rounded-xl p-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <IoMail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Invited by</p>
                <p className="font-medium text-foreground">{inviterName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <IoPeople className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Your role</p>
                <p className="font-medium text-foreground">{formatRole(role)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <IoTime className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Expires on</p>
                <p className="font-medium text-foreground">{formatDate(expiresAt)}</p>
              </div>
            </div>

            {message && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Message from inviter:</p>
                <p className="text-foreground italic">"{message}"</p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground mb-6">
          <p>This invitation was sent to <span className="font-medium">{inviteeEmail}</span></p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleAccept}
            disabled={isProcessing}
            className="flex-1 gap-2"
            size="lg"
          >
            <IoCheckmarkCircle className="h-5 w-5" />
            Accept Invitation
          </Button>
          <Button
            onClick={() => setIsDeclineDialogOpen(true)}
            disabled={isProcessing}
            variant="outline"
            className="flex-1 gap-2"
            size="lg"
          >
            <IoCloseCircle className="h-5 w-5" />
            Decline
          </Button>
        </div>

        <AlertDialog open={isDeclineDialogOpen} onOpenChange={setIsDeclineDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Decline Invitation?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to decline this invitation to join "{groupName}"?
                The inviter will be notified that you declined.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDecline}
                disabled={isProcessing}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isProcessing ? "Declining..." : "Yes, Decline"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Toast
          message={toastMessage}
          isVisible={isToastVisible}
          onClose={hideToast}
        />
      </div>
    </div>
  );
}
