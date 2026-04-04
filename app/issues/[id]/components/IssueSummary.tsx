"use client";

import {
  IoMedkit,
  IoWarning,
  IoAlertCircle,
  IoInformationCircle,
} from "react-icons/io5";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { IssueDetails } from "../../actions";

interface IssueSummaryProps {
  issue: IssueDetails;
}

function getSeverityConfig(severity: string | null) {
  switch (severity) {
    case "critical":
      return {
        label: "Critical",
        className: "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20",
      };
    case "serious":
      return {
        label: "Serious",
        className: "bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/20",
      };
    case "moderate":
      return {
        label: "Moderate",
        className: "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20",
      };
    case "minor":
      return {
        label: "Minor",
        className: "bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20 hover:bg-[#00D4FF]/20",
      };
    case "cosmetic":
      return {
        label: "Cosmetic",
        className: "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100",
      };
    default:
      return null;
  }
}

function getUrgencyConfig(urgency: string | null) {
  switch (urgency) {
    case "emergency":
      return {
        label: "Emergency - Call 911",
        className: "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20",
      };
    case "now":
      return {
        label: "Immediate Action",
        className: "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20",
      };
    case "today":
      return {
        label: "Today",
        className: "bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/20",
      };
    case "this_week":
      return {
        label: "This Week",
        className: "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20",
      };
    case "this_month":
      return {
        label: "This Month",
        className: "bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20 hover:bg-[#00D4FF]/20",
      };
    case "monitor":
      return {
        label: "Monitor",
        className: "bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100",
      };
    default:
      return null;
  }
}

export function IssueSummary({ issue }: IssueSummaryProps) {
  const severityConfig = getSeverityConfig(issue.severity);
  const urgencyConfig = getUrgencyConfig(issue.urgency);

  // Don't render if there's no meaningful data to show
  if (!issue.diagnosis && !severityConfig && !urgencyConfig && !issue.category) {
    return null;
  }

  return (
    <Card className="bg-white border-gray-200 py-0">
      <CardHeader className="flex-row items-center gap-2 px-4 py-3 border-b border-gray-200">
        <IoMedkit className="w-4 h-4 text-[#00D4FF]" />
        <CardTitle className="text-sm font-medium text-gray-900">
          Assessment Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Severity & Urgency badges */}
        {(severityConfig || urgencyConfig) && (
          <div className="flex flex-wrap gap-2">
            {severityConfig && (
              <Badge
                variant="outline"
                className={`rounded-lg py-1 ${severityConfig.className}`}
              >
                <IoWarning className="w-3.5 h-3.5" />
                {severityConfig.label} Severity
              </Badge>
            )}
            {urgencyConfig && (
              <Badge
                variant="outline"
                className={`rounded-lg py-1 ${urgencyConfig.className}`}
              >
                <IoAlertCircle className="w-3.5 h-3.5" />
                Address: {urgencyConfig.label}
              </Badge>
            )}
          </div>
        )}

        {/* Category */}
        {issue.category && (
          <div>
            <h3 className="text-xs font-medium text-gray-400 mb-1">Category</h3>
            <Badge
              variant="outline"
              className="bg-gray-50 text-gray-900 border-gray-200 rounded-lg py-1 capitalize"
            >
              {issue.category.replace("_", " ")}
            </Badge>
          </div>
        )}

        {/* Diagnosis */}
        {issue.diagnosis && (
          <div>
            <h3 className="text-xs font-medium text-gray-400 mb-1">AI Diagnosis</h3>
            <Card className="bg-gray-50 border-gray-200 p-3 py-3">
              <div className="flex items-start gap-2">
                <IoInformationCircle className="w-4 h-4 text-[#00D4FF] mt-0.5 shrink-0" />
                <p className="text-sm text-gray-500 leading-relaxed">
                  {issue.diagnosis}
                </p>
              </div>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
