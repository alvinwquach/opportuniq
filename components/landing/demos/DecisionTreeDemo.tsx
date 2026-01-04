"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";

/**
 * Decision Tree Demo
 *
 * Interaction: User clicks on a real-world issue, watch a decision tree branch out
 * showing DIY / Outsource / Defer paths with costs and time estimates.
 *
 * 5-second insight: "This isn't a chatbot. It shows me exactly what each choice costs."
 *
 * Why it converts: Visualizes decision complexity instantly. No typing required.
 * Users see the product thinking, not just responding.
 */

interface TreeNode {
  id: string;
  label: string;
  type: "root" | "branch" | "leaf";
  color: string;
  x: number;
  y: number;
  cost?: string;
  time?: string;
  children?: string[];
  parent?: string;
}

const ISSUES = [
  { id: "faucet", label: "Leaky Faucet", icon: "💧" },
  { id: "garage", label: "Garage Door Noise", icon: "🚗" },
  { id: "hvac", label: "AC Not Cooling", icon: "❄️" },
];

const TREE_DATA: Record<string, TreeNode[]> = {
  faucet: [
    { id: "root", label: "Leaky Faucet", type: "root", color: "#00F0FF", x: 200, y: 40 },
    { id: "diy", label: "DIY", type: "branch", color: "#00FF88", x: 80, y: 120, parent: "root", cost: "$15", time: "45 min" },
    { id: "outsource", label: "Outsource", type: "branch", color: "#FF8800", x: 200, y: 120, parent: "root", cost: "$150", time: "Same day" },
    { id: "defer", label: "Defer", type: "branch", color: "#888", x: 320, y: 120, parent: "root", cost: "$0", time: "Risk: water damage" },
    { id: "diy-easy", label: "Replace washer", type: "leaf", color: "#00FF88", x: 40, y: 200, parent: "diy", cost: "$8", time: "30 min" },
    { id: "diy-hard", label: "Replace cartridge", type: "leaf", color: "#00FF88", x: 120, y: 200, parent: "diy", cost: "$25", time: "1 hr" },
    { id: "plumber", label: "Call plumber", type: "leaf", color: "#FF8800", x: 200, y: 200, parent: "outsource", cost: "$150", time: "Today" },
  ],
  garage: [
    { id: "root", label: "Garage Door Noise", type: "root", color: "#00F0FF", x: 200, y: 40 },
    { id: "diy", label: "DIY", type: "branch", color: "#00FF88", x: 80, y: 120, parent: "root", cost: "$20", time: "1 hr" },
    { id: "outsource", label: "Outsource", type: "branch", color: "#FF8800", x: 200, y: 120, parent: "root", cost: "$200", time: "2-3 days" },
    { id: "defer", label: "Defer", type: "branch", color: "#888", x: 320, y: 120, parent: "root", cost: "$0", time: "Risk: spring failure" },
    { id: "diy-lube", label: "Lubricate tracks", type: "leaf", color: "#00FF88", x: 40, y: 200, parent: "diy", cost: "$12", time: "20 min" },
    { id: "diy-tighten", label: "Tighten hardware", type: "leaf", color: "#00FF88", x: 120, y: 200, parent: "diy", cost: "$0", time: "30 min" },
    { id: "tech", label: "Garage door tech", type: "leaf", color: "#FF8800", x: 200, y: 200, parent: "outsource", cost: "$200", time: "This week" },
  ],
  hvac: [
    { id: "root", label: "AC Not Cooling", type: "root", color: "#00F0FF", x: 200, y: 40 },
    { id: "diy", label: "DIY", type: "branch", color: "#00FF88", x: 80, y: 120, parent: "root", cost: "$30", time: "1 hr" },
    { id: "outsource", label: "Outsource", type: "branch", color: "#FF8800", x: 200, y: 120, parent: "root", cost: "$300", time: "1-2 days" },
    { id: "defer", label: "Defer", type: "branch", color: "#888", x: 320, y: 120, parent: "root", cost: "$0", time: "Risk: compressor damage" },
    { id: "diy-filter", label: "Replace filter", type: "leaf", color: "#00FF88", x: 40, y: 200, parent: "diy", cost: "$20", time: "10 min" },
    { id: "diy-clean", label: "Clean coils", type: "leaf", color: "#00FF88", x: 120, y: 200, parent: "diy", cost: "$10", time: "45 min" },
    { id: "hvac-tech", label: "HVAC technician", type: "leaf", color: "#FF8800", x: 200, y: 200, parent: "outsource", cost: "$300", time: "Tomorrow" },
  ],
};

export function DecisionTreeDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [visibleNodes, setVisibleNodes] = useState<string[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const animateTree = useCallback((issueId: string) => {
    const nodes = TREE_DATA[issueId];
    if (!nodes) return;

    setVisibleNodes([]);

    // Animate nodes appearing one by one
    const timeline = gsap.timeline();

    nodes.forEach((node, index) => {
      timeline.call(() => {
        setVisibleNodes(prev => [...prev, node.id]);
      }, [], index * 0.15);
    });
  }, []);

  const handleIssueClick = (issueId: string) => {
    if (selectedIssue === issueId) return;
    setSelectedIssue(issueId);
    animateTree(issueId);
  };

  const getNodeById = (issueId: string, nodeId: string) => {
    return TREE_DATA[issueId]?.find(n => n.id === nodeId);
  };

  if (!mounted) return null;

  const currentNodes = selectedIssue ? TREE_DATA[selectedIssue] : [];

  return (
    <section className="relative py-16 lg:py-24 bg-black">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Interactive Demo */}
          <div ref={containerRef} className="order-2 md:order-1">
            {/* Issue Selector */}
            <div className="flex gap-2 mb-6">
              {ISSUES.map(issue => (
                <button
                  key={issue.id}
                  onClick={() => handleIssueClick(issue.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedIssue === issue.id
                      ? "bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/50"
                      : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  <span className="mr-1.5">{issue.icon}</span>
                  {issue.label}
                </button>
              ))}
            </div>

            {/* Tree Visualization */}
            <div className="relative bg-neutral-950 rounded-xl border border-neutral-800 p-4 h-[280px]">
              {!selectedIssue ? (
                <div className="absolute inset-0 flex items-center justify-center text-neutral-600 text-sm">
                  Select an issue to see decision paths
                </div>
              ) : (
                <svg
                  ref={svgRef}
                  viewBox="0 0 400 240"
                  className="w-full h-full"
                  style={{ overflow: "visible" }}
                >
                  {/* Connection lines */}
                  {currentNodes.map(node => {
                    if (!node.parent || !visibleNodes.includes(node.id)) return null;
                    const parent = getNodeById(selectedIssue, node.parent);
                    if (!parent || !visibleNodes.includes(parent.id)) return null;

                    return (
                      <line
                        key={`line-${node.id}`}
                        x1={parent.x}
                        y1={parent.y + 16}
                        x2={node.x}
                        y2={node.y - 8}
                        stroke={node.color}
                        strokeWidth="1.5"
                        strokeOpacity="0.4"
                        className="transition-all duration-300"
                      />
                    );
                  })}

                  {/* Nodes */}
                  {currentNodes.map(node => {
                    if (!visibleNodes.includes(node.id)) return null;

                    const isHovered = hoveredNode === node.id;
                    const nodeRadius = node.type === "root" ? 24 : node.type === "branch" ? 20 : 16;

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                        className="cursor-pointer"
                        style={{ opacity: visibleNodes.includes(node.id) ? 1 : 0 }}
                      >
                        {/* Glow effect */}
                        <circle
                          r={nodeRadius + 4}
                          fill={node.color}
                          opacity={isHovered ? 0.2 : 0.1}
                          className="transition-opacity duration-200"
                        />
                        {/* Main circle */}
                        <circle
                          r={nodeRadius}
                          fill="#0a0a0a"
                          stroke={node.color}
                          strokeWidth="2"
                        />
                        {/* Label */}
                        <text
                          y={nodeRadius + 16}
                          textAnchor="middle"
                          fill="white"
                          fontSize={node.type === "leaf" ? "9" : "10"}
                          fontWeight="500"
                        >
                          {node.label}
                        </text>

                        {/* Cost/Time tooltip on hover */}
                        {isHovered && node.cost && (
                          <g transform="translate(0, -40)">
                            <rect
                              x="-35"
                              y="-20"
                              width="70"
                              height="36"
                              rx="4"
                              fill="#1a1a1a"
                              stroke={node.color}
                              strokeWidth="1"
                            />
                            <text y="-6" textAnchor="middle" fill={node.color} fontSize="11" fontWeight="600">
                              {node.cost}
                            </text>
                            <text y="8" textAnchor="middle" fill="#888" fontSize="9">
                              {node.time}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 text-xs text-neutral-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#00FF88]" />
                <span>DIY</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#FF8800]" />
                <span>Outsource</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-neutral-500" />
                <span>Defer</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 md:order-2">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
              See Every Path
            </h2>
            <p className="text-base text-neutral-400 leading-relaxed mb-4">
              Pick an issue. Watch the decision tree unfold. Hover to see costs and time for each option.
            </p>
            <p className="text-sm text-neutral-600">
              No chat. No typing. Just the choices that matter.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
