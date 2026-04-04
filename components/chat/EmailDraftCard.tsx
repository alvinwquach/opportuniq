"use client";

import { useState, useEffect } from "react";
import {
  IoMail,
  IoCopy,
  IoCheckmark,
  IoOpen,
  IoCall,
  IoGlobe,
  IoSend,
  IoLogoGoogle,
} from "react-icons/io5";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  trackEmailDraftOpened,
  trackEmailDraftCopied,
  trackContractorCalled,
  trackContractorWebsiteVisited,
  trackGmailConnected,
  trackEmailSent,
  trackEmailSendFailed,
} from "@/lib/analytics";

interface EmailDraftCardProps {
  contractor: {
    name: string;
    email?: string;
    phone?: string;
    website?: string;
  };
  email: {
    subject: string;
    body: string;
  };
  conversationId?: string | null;
}

interface GmailStatus {
  connected: boolean;
  gmailAddress: string | null;
}

export function EmailDraftCard({
  contractor,
  email,
  conversationId,
}: EmailDraftCardProps) {
  const [copied, setCopied] = useState(false);
  const [gmailStatus, setGmailStatus] = useState<GmailStatus | null>(null);
  const [isLoadingGmail, setIsLoadingGmail] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<
    "idle" | "success" | "error" | "needs-email"
  >("idle");
  const [recipientEmail, setRecipientEmail] = useState(contractor.email || "");
  const [showEmailInput, setShowEmailInput] = useState(false);

  // Check Gmail connection status
  useEffect(() => {
    const checkGmailStatus = async () => {
      try {
        const response = await fetch("/api/gmail/status");
        if (response.ok) {
          const data = await response.json();
          setGmailStatus(data);
        }
      } catch (error) {
      } finally {
        setIsLoadingGmail(false);
      }
    };

    checkGmailStatus();

    // Check for gmail_connected query param (after OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("gmail_connected") === "true") {
      trackGmailConnected({
        conversationId,
        source: "email_draft",
      });
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete("gmail_connected");
      window.history.replaceState({}, "", url.toString());
    }
  }, [conversationId]);

  const handleCopy = async () => {
    const copyText = `Subject: ${email.subject}\n\n${email.body}`;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackEmailDraftCopied({
        conversationId,
        contractorName: contractor.name,
      });
    } catch (err) {
    }
  };

  const handleOpenEmail = () => {
    const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`;
    window.open(mailtoLink, "_blank");
    trackEmailDraftOpened({
      conversationId,
      contractorName: contractor.name,
    });
  };

  const handleConnectGmail = () => {
    // Redirect to Gmail OAuth flow with current page as redirect
    const redirectUrl = encodeURIComponent(window.location.pathname);
    window.location.href = `/api/gmail/connect?redirect=${redirectUrl}`;
  };

  const handleSendEmail = async () => {
    if (!recipientEmail) {
      setShowEmailInput(true);
      setSendStatus("needs-email");
      return;
    }

    setIsSending(true);
    setSendStatus("idle");

    try {
      const response = await fetch("/api/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipientEmail,
          subject: email.subject,
          body: email.body,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSendStatus("success");
        trackEmailSent({
          conversationId,
          contractorName: contractor.name,
          sentVia: "gmail",
        });
      } else {
        setSendStatus("error");
        trackEmailSendFailed({
          conversationId,
          contractorName: contractor.name,
          errorCode: data.code || "UNKNOWN",
        });

        // If token expired, prompt to reconnect
        if (
          data.code === "GMAIL_TOKEN_EXPIRED" ||
          data.code === "GMAIL_ACCESS_REVOKED"
        ) {
          setGmailStatus({ connected: false, gmailAddress: null });
        }
      }
    } catch (error) {
      setSendStatus("error");
      trackEmailSendFailed({
        conversationId,
        contractorName: contractor.name,
        errorCode: "NETWORK_ERROR",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCall = () => {
    trackContractorCalled({
      conversationId,
      contractorName: contractor.name,
      source: "email_draft",
    });
  };

  const handleWebsiteVisit = () => {
    trackContractorWebsiteVisited({
      conversationId,
      contractorName: contractor.name,
      source: "email_draft",
    });
  };

  return (
    <Card className="mt-4 bg-[#141414] border-[#2a2a2a]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <IoMail className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm truncate">
              Email Draft for {contractor.name}
            </CardTitle>
            <CardDescription className="text-xs">
              {sendStatus === "success"
                ? "Email sent successfully!"
                : "Ready to customize and send"}
            </CardDescription>
          </div>
          {gmailStatus?.connected && (
            <Badge variant="outline" className="text-[10px] text-green-400 border-green-400/30">
              Gmail Connected
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Recipient Email Input */}
        {(showEmailInput || !contractor.email) && (
          <div className="space-y-1.5">
            <Label htmlFor="recipient-email" className="text-xs text-muted-foreground">
              Contractor Email
            </Label>
            <Input
              id="recipient-email"
              type="email"
              placeholder="contractor@example.com"
              value={recipientEmail}
              onChange={(e) => {
                setRecipientEmail(e.target.value);
                if (sendStatus === "needs-email") setSendStatus("idle");
              }}
              className="h-8 text-sm bg-[#0c0c0c] border-[#1f1f1f]"
            />
            {sendStatus === "needs-email" && (
              <p className="text-xs text-yellow-400">
                Please enter the contractor&apos;s email address
              </p>
            )}
          </div>
        )}

        {/* Subject */}
        <div>
          <Badge variant="outline" className="mb-1 text-[10px] uppercase">
            Subject
          </Badge>
          <p className="text-sm text-white">{email.subject}</p>
        </div>

        {/* Body Preview */}
        <div>
          <Badge variant="outline" className="mb-1 text-[10px] uppercase">
            Message
          </Badge>
          <div className="mt-1 p-3 rounded-lg bg-[#0c0c0c] border border-[#1f1f1f] max-h-48 overflow-y-auto">
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans">
              {email.body}
            </pre>
          </div>
        </div>

        {/* Send Status Messages */}
        {sendStatus === "success" && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-sm text-green-400 flex items-center gap-2">
              <IoCheckmark className="w-4 h-4" />
              Email sent successfully from {gmailStatus?.gmailAddress}
            </p>
          </div>
        )}
        {sendStatus === "error" && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">
              Failed to send email. Please try again or use &quot;Open in Email&quot;.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 pt-0">
        {/* Gmail Send Button */}
        {!isLoadingGmail && (
          <>
            {gmailStatus?.connected ? (
              <Button
                onClick={handleSendEmail}
                size="sm"
                disabled={isSending || sendStatus === "success"}
              >
                {isSending ? (
                  <>
                    <span className="animate-spin mr-1">◌</span>
                    Sending...
                  </>
                ) : sendStatus === "success" ? (
                  <>
                    <IoCheckmark className="w-4 h-4" />
                    Sent
                  </>
                ) : (
                  <>
                    <IoSend className="w-4 h-4" />
                    Send via Gmail
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleConnectGmail} size="sm" variant="outline">
                <IoLogoGoogle className="w-4 h-4" />
                Connect Gmail
              </Button>
            )}
          </>
        )}

        <Button onClick={handleOpenEmail} variant="secondary" size="sm">
          <IoOpen className="w-4 h-4" />
          Open in Email
        </Button>
        <Button onClick={handleCopy} variant="secondary" size="sm">
          {copied ? (
            <>
              <IoCheckmark className="w-4 h-4 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <IoCopy className="w-4 h-4" />
              Copy
            </>
          )}
        </Button>
        {contractor.phone && (
          <Button variant="secondary" size="sm" asChild>
            <a href={`tel:${contractor.phone}`} onClick={handleCall}>
              <IoCall className="w-4 h-4" />
              Call
            </a>
          </Button>
        )}
        {contractor.website && (
          <Button variant="secondary" size="sm" asChild>
            <a
              href={
                contractor.website.startsWith("http")
                  ? contractor.website
                  : `https://${contractor.website}`
              }
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWebsiteVisit}
            >
              <IoGlobe className="w-4 h-4" />
              Website
            </a>
          </Button>
        )}
      </CardFooter>

      {/* Tips */}
      <div className="px-6 py-2 border-t border-[#2a2a2a] bg-[#0c0c0c] rounded-b-xl">
        <p className="text-xs text-muted-foreground">
          {gmailStatus?.connected
            ? `Sending from ${gmailStatus.gmailAddress}`
            : "Tip: Connect Gmail to send emails directly, or use your email app"}
        </p>
      </div>
    </Card>
  );
}
