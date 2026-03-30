"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import * as d3 from "d3";
import {
  IoGitBranch,
  IoHelpCircle,
  IoConstruct,
  IoPeople,
  IoTime,
  IoWarning,
  IoCheckmarkCircle,
  IoCloseCircle,
} from "react-icons/io5";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);
}

/**
 * Decision Tree Visualization
 *
 * Interactive D3 tree showing decision flow from problem to resolution
 * Animated path drawing with GSAP DrawSVG
 * Click nodes to explore different paths
 */

interface TreeNode {
  id: string;
  label: string;
  type: "question" | "action" | "outcome";
  color: string;
  icon: "question" | "wrench" | "users" | "clock" | "warning" | "check" | "x";
  children?: TreeNode[];
}

const DECISION_TREE: TreeNode = {
  id: "root",
  label: "Problem Detected",
  type: "question",
  color: "#3b82f6",
  icon: "question",
  children: [
    {
      id: "diy-check",
      label: "DIY Feasible?",
      type: "question",
      color: "#8b5cf6",
      icon: "question",
      children: [
        {
          id: "risk-check",
          label: "Check Risk Level",
          type: "question",
          color: "#f59e0b",
          icon: "warning",
          children: [
            {
              id: "low-risk",
              label: "Low Risk",
              type: "action",
              color: "#22c55e",
              icon: "wrench",
              children: [
                {
                  id: "diy-success",
                  label: "DIY & Save",
                  type: "outcome",
                  color: "#22c55e",
                  icon: "check",
                },
              ],
            },
            {
              id: "high-risk",
              label: "High Risk",
              type: "action",
              color: "#ef4444",
              icon: "warning",
              children: [
                {
                  id: "hire-pro",
                  label: "Hire Pro",
                  type: "outcome",
                  color: "#3b82f6",
                  icon: "users",
                },
              ],
            },
          ],
        },
        {
          id: "not-feasible",
          label: "Not Feasible",
          type: "action",
          color: "#6b7280",
          icon: "x",
          children: [
            {
              id: "find-contractor",
              label: "Find Contractor",
              type: "outcome",
              color: "#3b82f6",
              icon: "users",
            },
          ],
        },
      ],
    },
    {
      id: "defer-check",
      label: "Can Defer?",
      type: "question",
      color: "#f59e0b",
      icon: "clock",
      children: [
        {
          id: "defer-yes",
          label: "Monitor",
          type: "outcome",
          color: "#f59e0b",
          icon: "clock",
        },
        {
          id: "defer-no",
          label: "Urgent",
          type: "action",
          color: "#ef4444",
          icon: "warning",
          children: [
            {
              id: "emergency",
              label: "Call Pro Now",
              type: "outcome",
              color: "#ef4444",
              icon: "users",
            },
          ],
        },
      ],
    },
  ],
};

const ICONS: Record<string, React.FC<{ className?: string }>> = {
  question: IoHelpCircle,
  wrench: IoConstruct,
  users: IoPeople,
  clock: IoTime,
  warning: IoWarning,
  check: IoCheckmarkCircle,
  x: IoCloseCircle,
};

export function DecisionTreeViz() {
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string[]>(["root"]);
  const [dimensions, setDimensions] = useState({ width: 680, height: 420 });

  useEffect(() => {
    setMounted(true);

    const updateDimensions = () => {
      const width = Math.min(window.innerWidth - 48, 680);
      const height = width < 500 ? 340 : 420;
      setDimensions({ width, height });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // D3 Tree Layout
  useEffect(() => {
    if (!svgRef.current || !mounted) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Create hierarchy
    const root = d3.hierarchy(DECISION_TREE);

    // Tree layout
    const treeLayout = d3.tree<TreeNode>()
      .size([innerWidth, innerHeight - 60]);

    treeLayout(root);

    // Links (paths between nodes)
    const linkGenerator = d3.linkVertical<d3.HierarchyPointLink<TreeNode>, d3.HierarchyPointNode<TreeNode>>()
      .x(d => d.x)
      .y(d => d.y);

    const links = g.selectAll(".tree-link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "tree-link")
      .attr("d", linkGenerator as string)
      .attr("fill", "none")
      .attr("stroke", d => {
        const isSelected = selectedPath.includes(d.source.data.id) && selectedPath.includes(d.target.data.id);
        return isSelected ? d.target.data.color : "#4b5563";
      })
      .attr("stroke-width", d => {
        const isSelected = selectedPath.includes(d.source.data.id) && selectedPath.includes(d.target.data.id);
        return isSelected ? 3 : 2;
      })
      .attr("opacity", d => {
        const isSelected = selectedPath.includes(d.source.data.id) && selectedPath.includes(d.target.data.id);
        return isSelected ? 1 : 0.4;
      })
      .attr("stroke-dasharray", function() {
        return (this as SVGPathElement).getTotalLength();
      })
      .attr("stroke-dashoffset", function() {
        return (this as SVGPathElement).getTotalLength();
      });

    // Nodes
    const nodes = g.selectAll(".tree-node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "tree-node")
      .attr("transform", d => `translate(${d.x}, ${d.y})`)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        // Build path from root to clicked node
        const path: string[] = [];
        let current: d3.HierarchyNode<TreeNode> | null = d;
        while (current) {
          path.unshift(current.data.id);
          current = current.parent;
        }
        setSelectedPath(path);
      });

    // Node circles
    nodes.append("circle")
      .attr("r", 0)
      .attr("fill", d => {
        const isSelected = selectedPath.includes(d.data.id);
        return isSelected ? d.data.color : "#1f2937";
      })
      .attr("stroke", d => d.data.color)
      .attr("stroke-width", 3);

    // Node labels
    nodes.append("text")
      .attr("dy", d => d.children ? -25 : 30)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .attr("font-weight", "500")
      .attr("fill", "#e5e7eb")
      .attr("opacity", 0)
      .text(d => d.data.label);

    // Scroll-triggered animation
    if (sectionRef.current) {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 70%",
        onEnter: () => {
          // Animate links
          links.each(function(_, i) {
            gsap.to(this, {
              strokeDashoffset: 0,
              duration: 0.5,
              delay: i * 0.1,
              ease: "power2.out",
            });
          });

          // Animate nodes
          nodes.selectAll("circle")
            .transition()
            .duration(400)
            .delay((_, i) => i * 80)
            .attr("r", 18);

          // Animate labels
          nodes.selectAll("text")
            .transition()
            .duration(300)
            .delay((_, i) => i * 80 + 200)
            .attr("opacity", 1);
        },
      });
    }

  }, [mounted, dimensions, selectedPath]);

  // Section animations
  useEffect(() => {
    if (!sectionRef.current || !mounted) return;

    const ctx = gsap.context(() => {
      gsap.from(".tree-header", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [mounted]);

  if (!mounted) return null;

  // Get current path info
  const currentNode = selectedPath[selectedPath.length - 1];
  const findNode = (tree: TreeNode, id: string): TreeNode | null => {
    if (tree.id === id) return tree;
    if (tree.children) {
      for (const child of tree.children) {
        const found = findNode(child, id);
        if (found) return found;
      }
    }
    return null;
  };
  const selectedNode = findNode(DECISION_TREE, currentNode);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 lg:py-28 bg-gray-900 overflow-hidden"
    >
      {/* Background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at center, #8b5cf6 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative">
        {/* Header */}
        <div className="tree-header text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-xs font-medium mb-4">
            <IoGitBranch className="w-3.5 h-3.5" />
            Decision Flow
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-white">
            Every Path{" "}
            <span className="text-purple-400">Mapped</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto text-gray-400">
            From problem to solution, we guide you through every decision point.
            Click nodes to explore different paths.
          </p>
        </div>

        {/* Tree Visualization */}
        <div className="bg-gray-800/30 rounded-2xl border border-gray-700 p-4 lg:p-6 overflow-x-auto">
          <div className="flex justify-center min-w-[600px]">
            <svg ref={svgRef} />
          </div>
        </div>

        {/* Current Selection Info */}
        {selectedNode && (
          <div className="mt-6 flex justify-center">
            <div
              className="inline-flex items-center gap-3 px-5 py-3 rounded-xl border"
              style={{
                backgroundColor: `${selectedNode.color}15`,
                borderColor: `${selectedNode.color}40`,
              }}
            >
              {(() => {
                const IconComponent = ICONS[selectedNode.icon];
                return (
                  <span style={{ color: selectedNode.color }}>
                    <IconComponent className="w-5 h-5" />
                  </span>
                );
              })()}
              <div>
                <div className="text-sm font-medium text-white">{selectedNode.label}</div>
                <div className="text-xs text-gray-400">
                  {selectedNode.type === "question" && "Decision Point"}
                  {selectedNode.type === "action" && "Next Step"}
                  {selectedNode.type === "outcome" && "Resolution"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs text-gray-400">Question</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-gray-400">DIY Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-xs text-gray-400">Defer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-gray-400">Hire Pro</span>
          </div>
        </div>
      </div>
    </section>
  );
}
