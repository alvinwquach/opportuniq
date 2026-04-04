"use client";

import { useMemo } from "react";
import {
  CostComparisonChart,
  SeverityGauge,
  DIYFeasibilityChart,
  SkillsRequiredChart,
  CostBreakdownChart,
  RiskAssessmentChart,
} from "./charts";
import type {
  CostChartData,
  SeverityData,
  DIYFeasibilityData,
  SkillsRequiredData,
  CostBreakdownData,
  RiskAssessmentData,
} from "@/lib/types/diagnosis";

interface DiagnosisChartsProps {
  content: string;
  className?: string;
}

/**
 * Extract cost data from AI response text
 */
function extractCostData(content: string): CostChartData | null {
  // Look for DIY cost patterns
  const diyPattern = /(?:DIY|do.?it.?yourself)[^$]*?\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:-|to|–)\s*\$?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i;
  const diyMatch = diyPattern.exec(content);

  // Look for professional cost patterns
  const proPatterns = [
    /(?:professional|contractor|pro)[^$]*?\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:-|to|–)\s*\$?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    /typical\s+range[:\s]*\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:-|to|–)\s*\$?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    /\$\s*(\d{2,}(?:,\d{3})*)\s*(?:-|to|–)\s*\$?\s*(\d{2,}(?:,\d{3})*)/,
  ];

  let proMatch: RegExpExecArray | null = null;
  for (const pattern of proPatterns) {
    proMatch = pattern.exec(content);
    if (proMatch) break;
  }

  // Check for data source mentions
  const hasHomeAdvisor = /homeadvisor/i.test(content);
  const hasAngi = /angi/i.test(content);
  const hasSampleSize = /based on\s+(\d+(?:,\d{3})*)\s+projects?/i.exec(content);

  if (!diyMatch && !proMatch) {
    return null;
  }

  const parseNum = (str: string) => parseFloat(str.replace(/,/g, ""));

  const diy = diyMatch
    ? {
        min: parseNum(diyMatch[1]),
        max: parseNum(diyMatch[2]),
        avg: (parseNum(diyMatch[1]) + parseNum(diyMatch[2])) / 2,
      }
    : null;

  const pro = proMatch
    ? {
        min: parseNum(proMatch[1]),
        max: parseNum(proMatch[2]),
        avg: (parseNum(proMatch[1]) + parseNum(proMatch[2])) / 2,
      }
    : null;

  return {
    diy,
    pro,
    source: hasHomeAdvisor ? "homeadvisor" : hasAngi ? "angi" : "estimate",
    sampleSize: hasSampleSize ? parseInt(hasSampleSize[1].replace(/,/g, ""), 10) : undefined,
  };
}

/**
 * Extract severity data from AI response text
 */
function extractSeverityData(content: string): SeverityData | null {
  // Look for severity patterns
  const severityPatterns = [
    { pattern: /\*\*(?:emergency|critical)\*\*/i, level: "emergency" as const, score: 10, color: "#dc2626" },
    { pattern: /(?:severity|assessment)[:\s]*(?:\*\*)?emergency/i, level: "emergency" as const, score: 10, color: "#dc2626" },
    { pattern: /\*\*urgent\*\*/i, level: "urgent" as const, score: 7, color: "#f97316" },
    { pattern: /(?:severity|assessment)[:\s]*(?:\*\*)?urgent/i, level: "urgent" as const, score: 7, color: "#f97316" },
    { pattern: /\*\*moderate\*\*/i, level: "moderate" as const, score: 5, color: "#eab308" },
    { pattern: /(?:severity|assessment)[:\s]*(?:\*\*)?moderate/i, level: "moderate" as const, score: 5, color: "#eab308" },
    { pattern: /\*\*minor\*\*/i, level: "minor" as const, score: 2, color: "#22c55e" },
    { pattern: /(?:severity|assessment)[:\s]*(?:\*\*)?minor/i, level: "minor" as const, score: 2, color: "#22c55e" },
  ];

  for (const { pattern, level, score, color } of severityPatterns) {
    if (pattern.test(content)) {
      // Extract description if available
      const descPattern = new RegExp(`${level}[^.]*\\.([^.]+\\.)?`, "i");
      const descMatch = descPattern.exec(content);
      const description = descMatch ? descMatch[0].trim() : `This issue is ${level}.`;

      return {
        level,
        score,
        label: level.charAt(0).toUpperCase() + level.slice(1),
        color,
        description: description.substring(0, 150),
      };
    }
  }

  return null;
}

/**
 * Extract DIY feasibility data from AI response text
 * Answers: Can I do it? Should I do it? Will I make things worse?
 */
function extractDIYFeasibilityData(content: string): DIYFeasibilityData | null {
  const lowerContent = content.toLowerCase();

  // Check for DIY-related discussion
  const hasDIYMention = /diy|do.?it.?yourself|can you do|should you do|beginner|intermediate|advanced/i.test(content);
  if (!hasDIYMention) return null;

  // Determine skill level from patterns
  let skillLevel: "beginner" | "intermediate" | "advanced" | "professional" = "intermediate";
  let skillMatch = 5;

  if (/\*\*beginner\*\*|beginner.?friendly|easy\s+diy|simple\s+(?:fix|repair)|straightforward/i.test(content)) {
    skillLevel = "beginner";
    skillMatch = 8;
  } else if (/\*\*advanced\*\*|experienced\s+diy|requires\s+experience|complex|difficult/i.test(content)) {
    skillLevel = "advanced";
    skillMatch = 3;
  } else if (/\*\*professional\*\*|hire\s+(?:a\s+)?(?:professional|pro|contractor)|not\s+(?:recommended|advisable)\s+(?:for\s+)?diy/i.test(content)) {
    skillLevel = "professional";
    skillMatch = 1;
  } else if (/\*\*intermediate\*\*|some\s+(?:experience|skill)|moderate\s+difficulty/i.test(content)) {
    skillLevel = "intermediate";
    skillMatch = 5;
  }

  // Determine if worth doing DIY
  let worthDoing = 5;
  if (/great\s+diy|perfect\s+(?:for\s+)?diy|easy\s+(?:to\s+)?save|significant\s+savings/i.test(content)) {
    worthDoing = 8;
  } else if (/not\s+(?:worth|recommended)|better\s+to\s+hire|risk\s+(?:of\s+)?damage/i.test(content)) {
    worthDoing = 2;
  } else if (/consider\s+(?:hiring|professional)|might\s+want\s+(?:to\s+)?hire/i.test(content)) {
    worthDoing = 4;
  }

  // Determine risk level
  let riskLevel = 5;
  if (/low\s+risk|minimal\s+risk|safe\s+(?:to\s+)?diy|unlikely\s+(?:to\s+)?cause/i.test(content)) {
    riskLevel = 2;
  } else if (/high\s+risk|dangerous|could\s+(?:cause|worsen|damage)|water\s+damage|electrical|structural/i.test(content)) {
    riskLevel = 8;
  } else if (/moderate\s+risk|some\s+risk|be\s+careful/i.test(content)) {
    riskLevel = 5;
  }

  // Extract time estimate
  let timeEstimate = "Unknown";
  let timeScore = 5;
  const timeMatch = /(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)\s*(hour|minute|day|weekend)/i.exec(content);
  if (timeMatch) {
    const min = parseFloat(timeMatch[1]);
    const max = parseFloat(timeMatch[2]);
    const unit = timeMatch[3].toLowerCase();
    timeEstimate = `${min}-${max} ${unit}${max > 1 ? "s" : ""}`;

    // Score based on time (shorter = higher score)
    const hours = unit.startsWith("minute") ? (min + max) / 2 / 60 :
                  unit.startsWith("day") ? (min + max) / 2 * 8 :
                  unit.startsWith("weekend") ? (min + max) / 2 * 16 :
                  (min + max) / 2;
    timeScore = hours <= 1 ? 9 : hours <= 4 ? 7 : hours <= 8 ? 5 : hours <= 16 ? 3 : 1;
  } else if (/quick|fast|(?:few|couple)\s+minutes/i.test(content)) {
    timeEstimate = "< 1 hour";
    timeScore = 9;
  } else if (/half\s+day|several\s+hours/i.test(content)) {
    timeEstimate = "Half day";
    timeScore = 5;
  } else if (/full\s+day|all\s+day/i.test(content)) {
    timeEstimate = "Full day";
    timeScore = 3;
  } else if (/weekend|multiple\s+days/i.test(content)) {
    timeEstimate = "Weekend project";
    timeScore = 2;
  }

  // Calculate savings score based on cost difference
  let savingsScore = 5;
  const diyPattern = /diy[^$]*?\$\s*(\d+)/i;
  const proPattern = /professional[^$]*?\$\s*(\d+)/i;
  const diyMatch = diyPattern.exec(content);
  const proMatch = proPattern.exec(content);
  if (diyMatch && proMatch) {
    const diyCost = parseFloat(diyMatch[1]);
    const proCost = parseFloat(proMatch[1]);
    const savings = (proCost - diyCost) / proCost;
    savingsScore = savings >= 0.7 ? 9 : savings >= 0.5 ? 7 : savings >= 0.3 ? 5 : savings >= 0.1 ? 3 : 1;
  }

  // Determine recommendation
  const avgScore = (skillMatch + worthDoing + (10 - riskLevel) + timeScore + savingsScore) / 5;
  const recommendation = avgScore >= 6 ? "diy" : avgScore >= 4 ? "consider" : "hire_pro";

  return {
    skillMatch,
    worthDoing,
    riskLevel,
    timeScore,
    savingsScore,
    skillLevel,
    timeEstimate,
    recommendation,
  };
}

/**
 * Extract skills required data from AI response text
 */
function extractSkillsData(content: string): SkillsRequiredData | null {
  // Check for skills-related discussion
  const hasSkillsMention = /skill|tool|experience|knowledge|know.?how/i.test(content);
  if (!hasSkillsMention) return null;

  // Determine skill level
  let level: "beginner" | "intermediate" | "advanced" | "professional" = "intermediate";
  if (/\*\*beginner\*\*|beginner.?friendly|no\s+(?:special\s+)?(?:skills?|experience)\s+(?:needed|required)/i.test(content)) {
    level = "beginner";
  } else if (/\*\*advanced\*\*|experienced|expertise|specialized/i.test(content)) {
    level = "advanced";
  } else if (/\*\*professional\*\*|licensed|certified|professional\s+(?:only|required)/i.test(content)) {
    level = "professional";
  }

  // Extract skills mentioned
  const skillPatterns = [
    /basic\s+(\w+(?:\s+\w+)?)/gi,
    /knowledge\s+of\s+(\w+(?:\s+\w+)?)/gi,
    /(?:need|require)s?\s+(?:to\s+)?(?:know|understand)\s+(\w+(?:\s+\w+)?)/gi,
  ];

  const skills: string[] = [];
  for (const pattern of skillPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const skill = match[1].trim();
      if (skill.length > 2 && skill.length < 30 && !skills.includes(skill)) {
        skills.push(skill);
      }
    }
  }

  // Common skill keywords to extract
  const commonSkills = [
    "plumbing", "electrical", "carpentry", "drywall", "painting",
    "tile work", "roofing", "hvac", "welding", "soldering",
    "measuring", "cutting", "drilling", "leveling"
  ];
  for (const skill of commonSkills) {
    if (content.toLowerCase().includes(skill) && !skills.some(s => s.toLowerCase().includes(skill))) {
      skills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  }

  // Extract tools mentioned
  const toolPatterns = [
    /(?:need|require|use)\s+(?:a\s+)?([^,.]+(?:wrench|screwdriver|hammer|drill|saw|pliers|level|tape|meter|gauge))/gi,
    /tools?\s*(?:needed|required)?[:\s]+([^.]+)/gi,
  ];

  const toolsRequired: string[] = [];
  for (const pattern of toolPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const tools = match[1].split(/,|and/).map(t => t.trim()).filter(t => t.length > 2 && t.length < 40);
      for (const tool of tools) {
        if (!toolsRequired.includes(tool)) {
          toolsRequired.push(tool);
        }
      }
    }
  }

  // Common tools to extract
  const commonTools = [
    "wrench", "screwdriver", "hammer", "drill", "saw", "pliers",
    "level", "tape measure", "utility knife", "ladder", "safety glasses",
    "gloves", "flashlight", "bucket", "putty knife", "caulk gun"
  ];
  for (const tool of commonTools) {
    if (content.toLowerCase().includes(tool) && !toolsRequired.some(t => t.toLowerCase().includes(tool))) {
      toolsRequired.push(tool.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "));
    }
  }

  // Determine learning curve
  let learningCurve: "low" | "medium" | "high" = "medium";
  if (/easy\s+to\s+learn|straightforward|simple\s+process/i.test(content)) {
    learningCurve = "low";
  } else if (/steep\s+learning\s+curve|complex|takes\s+(?:practice|time\s+to\s+master)/i.test(content)) {
    learningCurve = "high";
  }

  if (skills.length === 0 && toolsRequired.length === 0) {
    return null;
  }

  return {
    level,
    skills: skills.slice(0, 6),
    toolsRequired: toolsRequired.slice(0, 6),
    learningCurve,
  };
}

/**
 * Extract cost breakdown data for DIY projects
 */
function extractCostBreakdown(content: string): CostBreakdownData | null {
  const parseNum = (str: string) => parseFloat(str.replace(/,/g, ""));

  // Look for materials cost
  const materialsMatch = /materials?[:\s]*\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i.exec(content);
  const materials = materialsMatch ? parseNum(materialsMatch[1]) : 0;

  // Look for tools cost
  const toolsMatch = /tools?[:\s]*\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i.exec(content);
  const tools = toolsMatch ? parseNum(toolsMatch[1]) : 0;

  // Look for rental cost
  const rentalMatch = /(?:rental|rent)[:\s]*\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i.exec(content);
  const rental = rentalMatch ? parseNum(rentalMatch[1]) : undefined;

  // Look for safety/PPE cost
  const ppeMatch = /(?:safety|ppe|protective)[:\s]*\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i.exec(content);
  const ppe = ppeMatch ? parseNum(ppeMatch[1]) : undefined;

  // If no specific breakdown, but we have DIY cost, estimate
  if (materials === 0 && tools === 0) {
    const diyPattern = /diy[^$]*?\$\s*(\d+(?:,\d{3})*)/i;
    const diyMatch = diyPattern.exec(content);
    if (diyMatch) {
      const totalDiy = parseNum(diyMatch[1]);
      return {
        materials: Math.round(totalDiy * 0.7),
        tools: Math.round(totalDiy * 0.2),
        ppe: Math.round(totalDiy * 0.1),
      };
    }
    return null;
  }

  // Detect where to buy mentions
  const whereToBuy: string[] = [];
  if (/home\s*depot/i.test(content)) whereToBuy.push("Home Depot");
  if (/lowe'?s/i.test(content)) whereToBuy.push("Lowe's");
  if (/amazon/i.test(content)) whereToBuy.push("Amazon");
  if (/ace\s*hardware/i.test(content)) whereToBuy.push("Ace Hardware");
  if (/menards/i.test(content)) whereToBuy.push("Menards");
  if (/harbor\s*freight/i.test(content)) whereToBuy.push("Harbor Freight");

  return {
    materials,
    tools,
    rental,
    ppe,
    whereToBuy: whereToBuy.length > 0 ? whereToBuy : undefined,
  };
}

/**
 * Extract risk assessment data
 */
function extractRiskData(content: string): RiskAssessmentData | null {
  // Check for risk-related discussion
  const hasRiskMention = /risk|danger|hazard|warning|could\s+(?:cause|worsen|damage)|if\s+(?:done\s+)?(?:wrong|incorrectly)/i.test(content);
  if (!hasRiskMention) return null;

  // Determine overall risk level
  let level: "low" | "medium" | "high" | "critical" = "medium";
  if (/\*\*(?:low|minimal)\s+risk\*\*|low.?risk|safe\s+(?:to\s+)?diy/i.test(content)) {
    level = "low";
  } else if (/\*\*high\s+risk\*\*|high.?risk|dangerous|serious\s+(?:damage|injury)/i.test(content)) {
    level = "high";
  } else if (/\*\*critical\*\*|extremely\s+dangerous|life.?threatening|structural\s+damage/i.test(content)) {
    level = "critical";
  }

  // Calculate individual risk scores
  let safetyRisk = 3;
  if (/electrical|gas|height|ladder|chemical|toxic|asbestos/i.test(content)) {
    safetyRisk = 7;
  }
  if (/high\s+voltage|gas\s+leak|fall\s+hazard/i.test(content)) {
    safetyRisk = 9;
  }

  let damageRisk = 4;
  if (/water\s+damage|flood|mold|structural|foundation/i.test(content)) {
    damageRisk = 7;
  }
  if (/could\s+(?:worsen|spread|cause\s+more\s+damage)/i.test(content)) {
    damageRisk = 8;
  }

  let costRisk = 3;
  if (/unexpected\s+(?:costs?|expenses?)|could\s+cost\s+more|hidden\s+(?:damage|issues?)/i.test(content)) {
    costRisk = 6;
  }

  let codeViolationRisk = 2;
  if (/permit|code|inspection|licensed|regulation/i.test(content)) {
    codeViolationRisk = 6;
  }
  if (/requires?\s+(?:a\s+)?permit|must\s+be\s+inspected/i.test(content)) {
    codeViolationRisk = 8;
  }

  // Extract consequences
  const consequences: string[] = [];
  const consequencePatterns = [
    /if\s+(?:done\s+)?(?:wrong|incorrectly)[,:\s]+([^.]+)/gi,
    /could\s+(?:cause|result\s+in|lead\s+to)\s+([^.]+)/gi,
    /risk\s+of\s+([^.]+)/gi,
    /might\s+(?:cause|damage|worsen)\s+([^.]+)/gi,
  ];
  for (const pattern of consequencePatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const consequence = match[1].trim();
      if (consequence.length > 10 && consequence.length < 100 && !consequences.includes(consequence)) {
        consequences.push(consequence);
      }
    }
  }

  // Extract mitigations/tips
  const mitigations: string[] = [];
  const mitigationPatterns = [
    /(?:to\s+)?(?:avoid|prevent|reduce\s+risk)[,:\s]+([^.]+)/gi,
    /make\s+sure\s+(?:to\s+)?([^.]+)/gi,
    /(?:always|be\s+sure\s+to)\s+([^.]+)/gi,
    /tip[:\s]+([^.]+)/gi,
  ];
  for (const pattern of mitigationPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const tip = match[1].trim();
      if (tip.length > 10 && tip.length < 100 && !mitigations.includes(tip)) {
        mitigations.push(tip);
      }
    }
  }

  // Check for permit requirement
  const permitRequired = /requires?\s+(?:a\s+)?permit|permit\s+(?:required|needed|may\s+be\s+needed)/i.test(content);

  return {
    level,
    safetyRisk,
    damageRisk,
    costRisk,
    codeViolationRisk,
    consequences: consequences.slice(0, 4),
    mitigations: mitigations.slice(0, 4),
    permitRequired,
  };
}

/**
 * Component that extracts and displays charts from AI diagnosis response
 * Charts are rendered in a visually distinct section above the markdown content
 */
export function DiagnosisCharts({ content, className }: DiagnosisChartsProps) {
  const {
    costData,
    severityData,
    diyFeasibilityData,
    skillsData,
    costBreakdownData,
    riskData,
  } = useMemo(() => {
    return {
      costData: extractCostData(content),
      severityData: extractSeverityData(content),
      diyFeasibilityData: extractDIYFeasibilityData(content),
      skillsData: extractSkillsData(content),
      costBreakdownData: extractCostBreakdown(content),
      riskData: extractRiskData(content),
    };
  }, [content]);

  // Don't render if no data extracted
  if (!costData && !severityData && !diyFeasibilityData && !skillsData && !costBreakdownData && !riskData) {
    return null;
  }

  return (
    <div className={`mb-6 ${className || ""}`}>
      {/* Section header - visual break from chat */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#5eead4]/30 to-transparent" />
        <span className="text-xs font-medium text-[#5eead4] uppercase tracking-wider">
          Quick Analysis
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#5eead4]/30 to-transparent" />
      </div>

      {/* Charts container with distinct styling */}
      <div className="rounded-xl bg-gradient-to-b from-gray-50 to-white border border-gray-200 p-4 shadow-lg">
        {/* Primary metrics - always show first if available */}
        {(severityData || diyFeasibilityData) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {severityData && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-200 transition-colors">
                <SeverityGauge data={severityData} />
              </div>
            )}
            {diyFeasibilityData && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-200 transition-colors">
                <DIYFeasibilityChart data={diyFeasibilityData} />
              </div>
            )}
          </div>
        )}

        {/* Cost information - show together */}
        {(costData || costBreakdownData) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {costData && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-200 transition-colors">
                <CostComparisonChart data={costData} />
              </div>
            )}
            {costBreakdownData && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-200 transition-colors">
                <CostBreakdownChart data={costBreakdownData} />
              </div>
            )}
          </div>
        )}

        {/* Skills and Risk - secondary info */}
        {(skillsData || riskData) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skillsData && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-200 transition-colors">
                <SkillsRequiredChart data={skillsData} />
              </div>
            )}
            {riskData && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-200 transition-colors">
                <RiskAssessmentChart data={riskData} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visual separator before markdown content */}
      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <span className="text-xs text-gray-400">Details</span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>
    </div>
  );
}
