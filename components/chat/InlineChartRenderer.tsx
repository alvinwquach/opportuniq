"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import {
  CostComparisonChart,
  SeverityGauge,
  DIYFeasibilityChart,
  SkillsRequiredChart,
  CostBreakdownChart,
  RiskAssessmentChart,
  TimelineChart,
  RedFlagsCard,
} from "./charts";
import type {
  CostChartData,
  SeverityData,
  DIYFeasibilityData,
  SkillsRequiredData,
  CostBreakdownData,
  RiskAssessmentData,
  TimelineData,
} from "@/lib/types/diagnosis";

interface Section {
  type: "markdown" | "chart";
  content?: string;
  chartType?: string;
  chartData?: unknown;
}

interface InlineChartRendererProps {
  content: string;
  markdownComponents: Record<string, React.ComponentType<{ children?: React.ReactNode; href?: string }>>;
}

// Section header patterns to detect where charts should be inserted
const SECTION_PATTERNS = {
  severity: /^#{1,3}\s*(?:\d+\.\s*)?(?:severity|urgency)\s*(?:rating|assessment|level)?/im,
  diyFeasibility: /^#{1,3}\s*(?:\d+\.\s*)?(?:can\s+(?:i|you)\s+do\s+this|diy\s+(?:assessment|feasibility))/im,
  risk: /^#{1,3}\s*(?:\d+\.\s*)?(?:risk\s+assessment|what\s+could\s+go\s+wrong)/im,
  cost: /^#{1,3}\s*(?:\d+\.\s*)?(?:cost\s+(?:breakdown|comparison|estimate)|pricing)/im,
  skills: /^#{1,3}\s*(?:\d+\.\s*)?(?:skills?\s+required|what\s+you(?:'ll)?\s+need|tools?\s+(?:needed|required))/im,
  redFlags: /^#{1,3}\s*(?:\d+\.\s*)?(?:red\s+flags?|warning\s+signs?|when\s+to\s+stop)/im,
  timeline: /^#{1,3}\s*(?:\d+\.\s*)?(?:timeline|time\s+to\s+act|urgency)/im,
};

/**
 * Extract severity data from a section of text
 */
function extractSeverityFromSection(text: string): SeverityData | null {
  const severityPatterns = [
    { pattern: /\*\*(?:emergency|critical)\*\*/i, level: "emergency" as const, score: 10, color: "#dc2626" },
    { pattern: /\*\*urgent\*\*/i, level: "urgent" as const, score: 7, color: "#f97316" },
    { pattern: /\*\*moderate\*\*/i, level: "moderate" as const, score: 5, color: "#eab308" },
    { pattern: /\*\*minor\*\*/i, level: "minor" as const, score: 2, color: "#22c55e" },
  ];

  for (const { pattern, level, score, color } of severityPatterns) {
    if (pattern.test(text)) {
      // Get description from surrounding text
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
      const description = sentences[0]?.trim().substring(0, 150) || `This issue is ${level}.`;

      return {
        level,
        score,
        label: level.charAt(0).toUpperCase() + level.slice(1),
        color,
        description,
      };
    }
  }
  return null;
}

/**
 * Extract DIY feasibility data from a section
 */
function extractDIYFromSection(text: string): DIYFeasibilityData | null {
  // Determine skill level
  let skillLevel: "beginner" | "intermediate" | "advanced" | "professional" = "intermediate";
  let skillMatch = 5;

  if (/\*\*(?:yes|can\s+do)\*\*|beginner.?friendly|easy|straightforward/i.test(text)) {
    skillLevel = "beginner";
    skillMatch = 8;
  } else if (/\*\*(?:no|hire|professional)\*\*|not\s+recommended|requires?\s+(?:a\s+)?(?:pro|professional)/i.test(text)) {
    skillLevel = "professional";
    skillMatch = 2;
  } else if (/\*\*(?:maybe|consider)\*\*|challenging|difficult|experienced/i.test(text)) {
    skillLevel = "advanced";
    skillMatch = 4;
  }

  // Extract time estimate
  let timeEstimate = "Varies";
  let timeScore = 5;
  const timeMatch = /(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*(hour|minute|day)/i.exec(text);
  if (timeMatch) {
    timeEstimate = `${timeMatch[1]}-${timeMatch[2]} ${timeMatch[3]}s`;
    const hours = timeMatch[3].startsWith("minute") ? parseFloat(timeMatch[2]) / 60 : parseFloat(timeMatch[2]);
    timeScore = hours <= 2 ? 8 : hours <= 4 ? 6 : hours <= 8 ? 4 : 2;
  }

  // Risk assessment
  let riskLevel = 5;
  if (/low\s+risk|minimal\s+risk|unlikely/i.test(text)) riskLevel = 2;
  if (/high\s+risk|could\s+(?:damage|worsen)|dangerous/i.test(text)) riskLevel = 8;

  // Worth doing
  let worthDoing = 5;
  if (/significant\s+savings|great\s+diy|perfect\s+for\s+diy/i.test(text)) worthDoing = 8;
  if (/not\s+worth|better\s+to\s+hire|waste\s+of\s+time/i.test(text)) worthDoing = 2;

  const avgScore = (skillMatch + (10 - riskLevel) + worthDoing + timeScore) / 4;

  return {
    skillMatch,
    worthDoing,
    riskLevel,
    timeScore,
    savingsScore: 5,
    skillLevel,
    timeEstimate,
    recommendation: avgScore >= 6 ? "diy" : avgScore >= 4 ? "consider" : "hire_pro",
  };
}

/**
 * Extract risk assessment data from a section
 */
function extractRiskFromSection(text: string): RiskAssessmentData | null {
  // Look for explicit scores like "Safety Risk: 7/10"
  const safetyMatch = /safety\s*(?:risk)?[:\s]*(\d+)\s*\/\s*10/i.exec(text);
  const damageMatch = /(?:property\s+)?damage\s*(?:risk)?[:\s]*(\d+)\s*\/\s*10/i.exec(text);
  const costMatch = /cost\s*(?:overrun|risk)?[:\s]*(\d+)\s*\/\s*10/i.exec(text);
  const codeMatch = /code\s*(?:violation)?[:\s]*(\d+)\s*\/\s*10/i.exec(text);

  const safetyRisk = safetyMatch ? parseInt(safetyMatch[1]) : undefined;
  const damageRisk = damageMatch ? parseInt(damageMatch[1]) : undefined;
  const costRisk = costMatch ? parseInt(costMatch[1]) : undefined;
  const codeViolationRisk = codeMatch ? parseInt(codeMatch[1]) : undefined;

  // If no scores found, estimate from keywords
  if (!safetyRisk && !damageRisk && !costRisk && !codeViolationRisk) {
    return null;
  }

  // Determine overall level
  const maxRisk = Math.max(safetyRisk || 0, damageRisk || 0, costRisk || 0, codeViolationRisk || 0);
  const level = maxRisk >= 8 ? "critical" : maxRisk >= 6 ? "high" : maxRisk >= 4 ? "medium" : "low";

  // Extract consequences
  const consequences: string[] = [];
  const consMatch = text.match(/(?:if\s+(?:things\s+)?go\s+wrong|worst.?case)[:\s]*([^#]+)/i);
  if (consMatch) {
    const items = consMatch[1].split(/[-•*]\s+/).filter(s => s.trim().length > 10);
    consequences.push(...items.slice(0, 3).map(s => s.trim()));
  }

  // Extract mitigations
  const mitigations: string[] = [];
  const mitMatch = text.match(/(?:reduce\s+(?:your\s+)?risk|how\s+to\s+(?:avoid|prevent))[:\s]*([^#]+)/i);
  if (mitMatch) {
    const items = mitMatch[1].split(/[-•*]\s+/).filter(s => s.trim().length > 10);
    mitigations.push(...items.slice(0, 3).map(s => s.trim()));
  }

  return {
    level,
    safetyRisk,
    damageRisk,
    costRisk,
    codeViolationRisk,
    consequences,
    mitigations,
    permitRequired: /permit/i.test(text),
  };
}

/**
 * Extract cost data from a section
 */
function extractCostFromSection(text: string): CostChartData | null {
  const parseNum = (str: string) => parseFloat(str.replace(/,/g, ""));

  // Look for DIY cost
  const diyMatch = /diy[^$]*?\$\s*(\d+(?:,\d{3})*)\s*(?:-|to|–)\s*\$?\s*(\d+(?:,\d{3})*)/i.exec(text);

  // Look for Pro cost
  const proMatch = /(?:professional|contractor|pro)[^$]*?\$\s*(\d+(?:,\d{3})*)\s*(?:-|to|–)\s*\$?\s*(\d+(?:,\d{3})*)/i.exec(text);

  if (!diyMatch && !proMatch) return null;

  return {
    diy: diyMatch ? {
      min: parseNum(diyMatch[1]),
      max: parseNum(diyMatch[2]),
      avg: (parseNum(diyMatch[1]) + parseNum(diyMatch[2])) / 2,
    } : null,
    pro: proMatch ? {
      min: parseNum(proMatch[1]),
      max: parseNum(proMatch[2]),
      avg: (parseNum(proMatch[1]) + parseNum(proMatch[2])) / 2,
    } : null,
    source: /homeadvisor/i.test(text) ? "homeadvisor" : /angi/i.test(text) ? "angi" : "estimate",
  };
}

/**
 * Extract cost breakdown from a section
 */
function extractCostBreakdownFromSection(text: string): CostBreakdownData | null {
  const parseNum = (str: string) => parseFloat(str.replace(/,/g, ""));

  const materialsMatch = /materials?[:\s|]*\$\s*(\d+(?:,\d{3})*)/i.exec(text);
  const toolsMatch = /tools?[:\s|]*\$\s*(\d+(?:,\d{3})*)/i.exec(text);
  const ppeMatch = /(?:ppe|safety)[:\s|]*\$\s*(\d+(?:,\d{3})*)/i.exec(text);

  if (!materialsMatch && !toolsMatch) return null;

  const whereToBuy: string[] = [];
  if (/home\s*depot/i.test(text)) whereToBuy.push("Home Depot");
  if (/lowe'?s/i.test(text)) whereToBuy.push("Lowe's");
  if (/amazon/i.test(text)) whereToBuy.push("Amazon");

  return {
    materials: materialsMatch ? parseNum(materialsMatch[1]) : 0,
    tools: toolsMatch ? parseNum(toolsMatch[1]) : 0,
    ppe: ppeMatch ? parseNum(ppeMatch[1]) : undefined,
    whereToBuy: whereToBuy.length > 0 ? whereToBuy : undefined,
  };
}

/**
 * Extract skills data from a section
 */
function extractSkillsFromSection(text: string): SkillsRequiredData | null {
  // Determine level
  let level: "beginner" | "intermediate" | "advanced" | "professional" = "intermediate";
  if (/beginner|easy|no\s+(?:special\s+)?(?:skills?|experience)/i.test(text)) level = "beginner";
  if (/advanced|experienced|expertise/i.test(text)) level = "advanced";
  if (/professional|licensed|certified/i.test(text)) level = "professional";

  // Extract skills
  const skills: string[] = [];
  const commonSkills = ["plumbing", "electrical", "carpentry", "painting", "measuring", "cutting"];
  for (const skill of commonSkills) {
    if (text.toLowerCase().includes(skill)) skills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
  }

  // Extract tools
  const toolsRequired: string[] = [];
  const toolPatterns = ["wrench", "screwdriver", "hammer", "drill", "saw", "pliers", "level", "tape measure"];
  for (const tool of toolPatterns) {
    if (text.toLowerCase().includes(tool)) toolsRequired.push(tool.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "));
  }

  if (skills.length === 0 && toolsRequired.length === 0) return null;

  return {
    level,
    skills: skills.slice(0, 4),
    toolsRequired: toolsRequired.slice(0, 4),
    learningCurve: level === "beginner" ? "low" : level === "professional" ? "high" : "medium",
  };
}

/**
 * Extract red flags from a section
 */
function extractRedFlagsFromSection(text: string): string[] {
  const flags: string[] = [];

  // Look for bullet points after "stop" or "red flags"
  const items = text.split(/[-•*]\s+/).slice(1);
  for (const item of items) {
    const cleaned = item.split("\n")[0].trim();
    if (cleaned.length > 10 && cleaned.length < 100) {
      flags.push(cleaned);
    }
  }

  return flags.slice(0, 5);
}

/**
 * Split content into sections and identify where to insert charts
 */
function splitIntoSections(content: string): Section[] {
  const sections: Section[] = [];
  const lines = content.split("\n");

  let currentMarkdown = "";
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Check if this line starts a chartable section
    let chartType: string | null = null;
    for (const [type, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(line)) {
        chartType = type;
        break;
      }
    }

    if (chartType) {
      // Save any accumulated markdown before this section
      if (currentMarkdown.trim()) {
        sections.push({ type: "markdown", content: currentMarkdown });
        currentMarkdown = "";
      }

      // Find the end of this section (next heading or end of content)
      let sectionContent = line + "\n";
      i++;
      while (i < lines.length) {
        const nextLine = lines[i];
        // Stop if we hit another major heading
        if (/^#{1,3}\s*(?:\d+\.)?/.test(nextLine) && !nextLine.match(/^\s/)) {
          break;
        }
        sectionContent += nextLine + "\n";
        i++;
      }

      // Add the markdown for this section
      sections.push({ type: "markdown", content: sectionContent });

      // Extract and add chart data based on section type
      let chartData: unknown = null;
      switch (chartType) {
        case "severity":
          chartData = extractSeverityFromSection(sectionContent);
          break;
        case "diyFeasibility":
          chartData = extractDIYFromSection(sectionContent);
          break;
        case "risk":
          chartData = extractRiskFromSection(sectionContent);
          break;
        case "cost":
          chartData = extractCostFromSection(sectionContent) || extractCostBreakdownFromSection(sectionContent);
          break;
        case "skills":
          chartData = extractSkillsFromSection(sectionContent);
          break;
        case "redFlags":
          const flags = extractRedFlagsFromSection(sectionContent);
          if (flags.length > 0) chartData = flags;
          break;
      }

      if (chartData) {
        sections.push({ type: "chart", chartType, chartData });
      }
    } else {
      currentMarkdown += line + "\n";
      i++;
    }
  }

  // Add remaining markdown
  if (currentMarkdown.trim()) {
    sections.push({ type: "markdown", content: currentMarkdown });
  }

  return sections;
}

/**
 * Render a chart based on type and data
 */
function renderChart(chartType: string, chartData: unknown): React.ReactNode {
  const wrapperClass = "my-4 rounded-xl bg-gradient-to-b from-[#0a0a0a] to-[#111111] border border-[#1f1f1f] p-4";
  const innerClass = "bg-[#0c0c0c] rounded-lg p-4 border border-[#1a1a1a]";

  switch (chartType) {
    case "severity":
      return (
        <div className={wrapperClass}>
          <div className={innerClass}>
            <SeverityGauge data={chartData as SeverityData} />
          </div>
        </div>
      );
    case "diyFeasibility":
      return (
        <div className={wrapperClass}>
          <div className={innerClass}>
            <DIYFeasibilityChart data={chartData as DIYFeasibilityData} />
          </div>
        </div>
      );
    case "risk":
      return (
        <div className={wrapperClass}>
          <div className={innerClass}>
            <RiskAssessmentChart data={chartData as RiskAssessmentData} />
          </div>
        </div>
      );
    case "cost":
      // Could be CostChartData or CostBreakdownData
      const costData = chartData as CostChartData | CostBreakdownData;
      if ("diy" in costData || "pro" in costData) {
        return (
          <div className={wrapperClass}>
            <div className={innerClass}>
              <CostComparisonChart data={costData as CostChartData} />
            </div>
          </div>
        );
      } else {
        return (
          <div className={wrapperClass}>
            <div className={innerClass}>
              <CostBreakdownChart data={costData as CostBreakdownData} />
            </div>
          </div>
        );
      }
    case "skills":
      return (
        <div className={wrapperClass}>
          <div className={innerClass}>
            <SkillsRequiredChart data={chartData as SkillsRequiredData} />
          </div>
        </div>
      );
    case "redFlags":
      return (
        <div className={wrapperClass}>
          <div className={innerClass}>
            <RedFlagsCard flags={chartData as string[]} />
          </div>
        </div>
      );
    default:
      return null;
  }
}

export function InlineChartRenderer({ content, markdownComponents }: InlineChartRendererProps) {
  const sections = useMemo(() => splitIntoSections(content), [content]);

  return (
    <>
      {sections.map((section, index) => {
        if (section.type === "markdown" && section.content) {
          return (
            <div key={index} className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown components={markdownComponents}>
                {section.content}
              </ReactMarkdown>
            </div>
          );
        } else if (section.type === "chart" && section.chartType && section.chartData) {
          return (
            <React.Fragment key={index}>
              {renderChart(section.chartType, section.chartData)}
            </React.Fragment>
          );
        }
        return null;
      })}
    </>
  );
}
