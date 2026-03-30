"use client";

import { useState } from "react";
import { IoCash, IoChevronDown, IoChevronUp, IoCheckmark } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuoteSubmission } from "@/hooks/useQuoteSubmission";

interface QuoteFeedbackCardProps {
  conversationId?: string | null;
  issueId?: string | null;
  serviceType: string;
  zipCode?: string | null;
}

export function QuoteFeedbackCard({
  conversationId,
  issueId,
  serviceType,
  zipCode,
}: QuoteFeedbackCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dollarAmount, setDollarAmount] = useState("");
  const [quoteType, setQuoteType] = useState<"diy" | "professional" | "">("");
  const [contractorName, setContractorName] = useState("");
  const [wasAccepted, setWasAccepted] = useState<"yes" | "no" | "pending" | "">("");
  const [notes, setNotes] = useState("");
  const [zipCodeInput, setZipCodeInput] = useState(zipCode ?? "");
  const [validationError, setValidationError] = useState<string | null>(null);

  const { mutate: submitQuote, isPending, isSuccess } = useQuoteSubmission();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate required fields
    if (!dollarAmount || dollarAmount.trim() === "") {
      setValidationError("Please enter a dollar amount.");
      return;
    }
    if (isNaN(Number(dollarAmount)) || Number(dollarAmount) < 0) {
      setValidationError("Please enter a valid dollar amount.");
      return;
    }
    if (!quoteType) {
      setValidationError("Please select DIY or Professional.");
      return;
    }
    if (!zipCodeInput.trim()) {
      setValidationError("Please enter a zip code.");
      return;
    }

    const quoteCents = Math.round(Number(dollarAmount) * 100);

    submitQuote({
      conversationId: conversationId ?? null,
      issueId: issueId ?? null,
      serviceType,
      zipCode: zipCodeInput.trim(),
      quoteCents,
      quoteType,
      contractorName: contractorName.trim() || null,
      description: notes.trim() || null,
      wasAccepted: wasAccepted || null,
    });
  };

  return (
    <Card className="mt-4 bg-[#141414] border-[#2a2a2a]">
      <CardHeader
        className="pb-3 cursor-pointer select-none"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
            <IoCash className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm">Did you get a quote? What did you pay?</CardTitle>
            <CardDescription className="text-xs">
              Help others by sharing real-world pricing
            </CardDescription>
          </div>
          {isExpanded ? (
            <IoChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <IoChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {isSuccess ? (
            <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/20">
              <p className="text-sm text-teal-400 flex items-center gap-2">
                <IoCheckmark className="w-4 h-4" />
                Quote submitted — thank you!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dollar amount + zip code row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="quote-amount" className="text-xs text-muted-foreground">
                    Quote amount ($) *
                  </Label>
                  <Input
                    id="quote-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 350"
                    value={dollarAmount}
                    onChange={(e) => setDollarAmount(e.target.value)}
                    className="h-8 text-sm bg-[#0c0c0c] border-[#1f1f1f]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="quote-zip" className="text-xs text-muted-foreground">
                    Zip code *
                  </Label>
                  <Input
                    id="quote-zip"
                    type="text"
                    placeholder="e.g. 90210"
                    value={zipCodeInput}
                    onChange={(e) => setZipCodeInput(e.target.value)}
                    className="h-8 text-sm bg-[#0c0c0c] border-[#1f1f1f]"
                  />
                </div>
              </div>

              {/* Quote type + accepted row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Type *</Label>
                  <Select
                    value={quoteType}
                    onValueChange={(v) => setQuoteType(v as "diy" | "professional")}
                  >
                    <SelectTrigger className="h-8 text-sm bg-[#0c0c0c] border-[#1f1f1f]">
                      <SelectValue placeholder="DIY / Professional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diy">DIY</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Select
                    value={wasAccepted}
                    onValueChange={(v) => setWasAccepted(v as "yes" | "no" | "pending")}
                  >
                    <SelectTrigger className="h-8 text-sm bg-[#0c0c0c] border-[#1f1f1f]">
                      <SelectValue placeholder="Accepted?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Accepted</SelectItem>
                      <SelectItem value="no">Rejected</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contractor name */}
              <div className="space-y-1.5">
                <Label htmlFor="contractor-name" className="text-xs text-muted-foreground">
                  Contractor name (optional)
                </Label>
                <Input
                  id="contractor-name"
                  type="text"
                  placeholder="e.g. ABC Plumbing"
                  value={contractorName}
                  onChange={(e) => setContractorName(e.target.value)}
                  className="h-8 text-sm bg-[#0c0c0c] border-[#1f1f1f]"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="quote-notes" className="text-xs text-muted-foreground">
                  Notes (optional)
                </Label>
                <Textarea
                  id="quote-notes"
                  placeholder="What was included in the quote?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="text-sm bg-[#0c0c0c] border-[#1f1f1f] resize-none"
                  rows={2}
                />
              </div>

              {validationError && (
                <p className="text-xs text-red-400">{validationError}</p>
              )}

              <Button
                type="submit"
                size="sm"
                disabled={isPending}
                className="w-full"
              >
                {isPending ? "Submitting..." : "Submit Quote"}
              </Button>
            </form>
          )}
        </CardContent>
      )}
    </Card>
  );
}
