import { getCurrentUser } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getIssueDetails, getIssueTimeline } from "../actions";
import { IssueDetailClient } from "./IssueDetailClient";
import { IoArrowBack, IoAlertCircle } from "react-icons/io5";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface IssueDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function IssueDetailPage({ params }: IssueDetailPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/auth/login?redirect=/issues/${id}`);
  }

  const [issueResult, timelineResult] = await Promise.all([
    getIssueDetails(id),
    getIssueTimeline(id, { limit: 50 }),
  ]);

  if (!issueResult.success || !issueResult.issue) {
    notFound();
  }

  const { issue } = issueResult;
  const timeline = timelineResult.success ? timelineResult.entries : [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-xl bg-[#161616] border border-[#1f1f1f] flex items-center justify-center hover:bg-[#1a1a1a] transition-colors"
        >
          <IoArrowBack className="w-5 h-5 text-[#9a9a9a]" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <IoAlertCircle className="w-5 h-5 text-orange-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-white truncate">
                {issue.title}
              </h1>
              <p className="text-sm text-[#666]">
                {issue.groupName}
              </p>
            </div>
          </div>
        </div>
      </div>
      <IssueDetailClient issue={issue} initialTimeline={timeline} />
    </div>
  );
}
