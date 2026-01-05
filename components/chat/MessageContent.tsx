"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import {
  trackContractorClicked,
  trackDIYGuideClicked,
  trackProductClicked,
} from "@/lib/analytics";
import { InlineChartRenderer } from "./InlineChartRenderer";
import { DIYGuideLinks } from "./DIYGuideLinks";

interface MessageContentProps {
  content: string;
  conversationId?: string | null;
  showCharts?: boolean;
}

// Detect link type based on URL patterns
function getLinkType(url: string): "contractor" | "diy_guide" | "product" | "other" {
  const lowerUrl = url.toLowerCase();

  // DIY Guide sources (Reddit, forums, etc.)
  if (
    lowerUrl.includes("reddit.com") ||
    lowerUrl.includes("diy.stackexchange.com") ||
    lowerUrl.includes("instructables.com") ||
    lowerUrl.includes("familyhandyman.com") ||
    lowerUrl.includes("thisoldhouse.com") ||
    lowerUrl.includes("bobvila.com") ||
    lowerUrl.includes("doityourself.com") ||
    lowerUrl.includes("hometalk.com") ||
    lowerUrl.includes("diychatroom.com")
  ) {
    return "diy_guide";
  }

  // Store/retail sites = product
  if (
    lowerUrl.includes("homedepot.com") ||
    lowerUrl.includes("lowes.com") ||
    lowerUrl.includes("amazon.com") ||
    lowerUrl.includes("walmart.com") ||
    lowerUrl.includes("target.com") ||
    lowerUrl.includes("acehardware.com") ||
    lowerUrl.includes("menards.com") ||
    lowerUrl.includes("harborfreight.com")
  ) {
    return "product";
  }

  // Google Maps/Yelp = contractor
  if (
    lowerUrl.includes("google.com/maps") ||
    lowerUrl.includes("maps.google.com") ||
    lowerUrl.includes("yelp.com") ||
    lowerUrl.includes("angieslist.com") ||
    lowerUrl.includes("homeadvisor.com") ||
    lowerUrl.includes("thumbtack.com")
  ) {
    return "contractor";
  }

  return "other";
}

// Extract source from URL
function getSource(url: string): "google" | "yelp" | "reddit" | "other" {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes("google")) return "google";
  if (lowerUrl.includes("yelp")) return "yelp";
  if (lowerUrl.includes("reddit")) return "reddit";
  return "other";
}

// Extract DIY guide source from URL
function getDIYGuideSource(url: string): string {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes("reddit.com/r/diy")) return "r/DIY";
  if (lowerUrl.includes("reddit.com/r/homeimprovement")) return "r/HomeImprovement";
  if (lowerUrl.includes("reddit.com/r/fixit")) return "r/fixit";
  if (lowerUrl.includes("reddit.com/r/cartalk")) return "r/Cartalk";
  if (lowerUrl.includes("reddit.com/r/mechanicadvice")) return "r/MechanicAdvice";
  if (lowerUrl.includes("reddit.com")) return "Reddit";
  if (lowerUrl.includes("diy.stackexchange.com")) return "DIY Stack Exchange";
  if (lowerUrl.includes("instructables.com")) return "Instructables";
  if (lowerUrl.includes("familyhandyman.com")) return "Family Handyman";
  if (lowerUrl.includes("thisoldhouse.com")) return "This Old House";
  if (lowerUrl.includes("bobvila.com")) return "Bob Vila";
  if (lowerUrl.includes("doityourself.com")) return "DoItYourself.com";
  if (lowerUrl.includes("hometalk.com")) return "Hometalk";
  if (lowerUrl.includes("diychatroom.com")) return "DIY Chatroom";
  return "DIY Guide";
}

// Extract retailer from URL
function getRetailer(url: string): string {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes("homedepot")) return "Home Depot";
  if (lowerUrl.includes("lowes")) return "Lowes";
  if (lowerUrl.includes("amazon")) return "Amazon";
  if (lowerUrl.includes("walmart")) return "Walmart";
  if (lowerUrl.includes("target")) return "Target";
  if (lowerUrl.includes("acehardware")) return "Ace Hardware";
  if (lowerUrl.includes("menards")) return "Menards";
  return "Other";
}

export function MessageContent({ content, conversationId, showCharts = true }: MessageContentProps) {
  // Handle link clicks with tracking
  const handleLinkClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest("a");

    if (!anchor) return;

    const url = anchor.href;
    const linkText = anchor.textContent || "";
    const linkType = getLinkType(url);

    switch (linkType) {
      case "contractor":
        trackContractorClicked({
          conversationId,
          contractorName: linkText,
          source: getSource(url) as "google" | "yelp" | "other",
        });
        break;
      case "diy_guide":
        trackDIYGuideClicked({
          conversationId,
          guideTitle: linkText,
          guideSource: getDIYGuideSource(url),
          url,
        });
        break;
      case "product":
        trackProductClicked({
          conversationId,
          productName: linkText,
          retailer: getRetailer(url),
        });
        break;
    }
  };

  // Memoize markdown components to prevent recreation on each render
  const markdownComponents = useMemo(() => ({
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#5eead4] hover:underline"
      >
        {children}
      </a>
    ),
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 className="text-lg font-bold mt-4 mb-2 text-white">{children}</h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-base font-bold mt-3 mb-2 text-white">{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-sm font-bold mt-2 mb-1 text-white">{children}</h3>
    ),
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="mb-2 last:mb-0">{children}</p>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
      <li className="text-sm">{children}</li>
    ),
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-bold">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic">{children}</em>
    ),
    code: ({ children }: { children?: React.ReactNode }) => (
      <code className="bg-[#2a2a2a] px-1 py-0.5 rounded text-[#5eead4] text-xs">{children}</code>
    ),
    pre: ({ children }: { children?: React.ReactNode }) => (
      <pre className="bg-[#2a2a2a] p-2 rounded overflow-x-auto mb-2">{children}</pre>
    ),
    table: ({ children }: { children?: React.ReactNode }) => (
      <table className="w-full my-2 text-sm border-collapse">{children}</table>
    ),
    thead: ({ children }: { children?: React.ReactNode }) => (
      <thead className="bg-[#2a2a2a]">{children}</thead>
    ),
    tbody: ({ children }: { children?: React.ReactNode }) => (
      <tbody className="divide-y divide-[#2a2a2a]">{children}</tbody>
    ),
    tr: ({ children }: { children?: React.ReactNode }) => (
      <tr className="border-b border-[#2a2a2a]">{children}</tr>
    ),
    th: ({ children }: { children?: React.ReactNode }) => (
      <th className="px-2 py-1 text-left font-medium text-[#888888]">{children}</th>
    ),
    td: ({ children }: { children?: React.ReactNode }) => (
      <td className="px-2 py-1">{children}</td>
    ),
  }), []);

  // Detect if this is a full diagnosis response (has structured sections) or simple message
  const isStructuredResponse = useMemo(() => {
    return /^#{1,3}\s*(?:\d+\.\s*)?(?:issue|severity|diy|risk|cost|skill|safety)/im.test(content);
  }, [content]);

  return (
    <div onClick={handleLinkClick}>
      {showCharts && <DIYGuideLinks content={content} conversationId={conversationId} />}
      {showCharts && isStructuredResponse ? (
        <InlineChartRenderer content={content} markdownComponents={markdownComponents} />
      ) : (
        <div className="prose prose-sm prose-invert max-w-none">
          <ReactMarkdown components={markdownComponents}>
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
