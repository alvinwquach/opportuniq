"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  type: "source" | "processor" | "output";
}

interface Connection {
  id: string;
  source: string;
  target: string;
  label: string;
  type: "rca" | "ground" | "speaker";
  correct: boolean;
  phonoMode?: boolean; // true = phono, false = line, undefined = always valid
  explanation: string;
  consequence: string;
}

export function StereoWiringDiagram() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [phonoMode, setPhonoMode] = useState(true);
  const [hoveredConnection, setHoveredConnection] = useState<Connection | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 800;
    const height = 600;

    // Define nodes (equipment)
    const nodes: Node[] = [
      { id: "turntable", label: "Turntable", x: 100, y: 150, type: "source" },
      { id: "receiver", label: "Receiver", x: 400, y: 200, type: "processor" },
      { id: "amp", label: "Amplifier", x: 400, y: 400, type: "processor" },
      { id: "speaker-l", label: "Speaker L", x: 650, y: 300, type: "output" },
      { id: "speaker-r", label: "Speaker R", x: 650, y: 450, type: "output" },
    ];

    // Define connections based on phono mode
    const connections: Connection[] = [
      // Turntable to Receiver - Phono RCA (correct in phono mode)
      {
        id: "tt-rec-phono",
        source: "turntable",
        target: "receiver",
        label: "RCA → Phono Input",
        type: "rca",
        correct: phonoMode,
        phonoMode: true,
        explanation: "Turntable cartridge outputs low-level phono signal that requires RIAA equalization",
        consequence: phonoMode
          ? "✓ Correct: Phono preamp boosts and equalizes the signal properly"
          : "✗ Wrong input! Using line-level input will result in very quiet, bass-heavy sound. You need the phono preamp."
      },
      // Turntable to Receiver - Line RCA (correct in line mode, wrong in phono)
      {
        id: "tt-rec-line",
        source: "turntable",
        target: "receiver",
        label: "RCA → Line Input",
        type: "rca",
        correct: !phonoMode,
        phonoMode: false,
        explanation: "Line-level input expects pre-amplified signal (turntable with built-in preamp)",
        consequence: !phonoMode
          ? "✓ Correct: Turntable has built-in phono preamp, signal level matches line input"
          : "✗ Wrong input! Signal will be over-amplified, causing severe distortion and potential speaker damage."
      },
      // Ground wire
      {
        id: "tt-rec-ground",
        source: "turntable",
        target: "receiver",
        label: "Ground Wire",
        type: "ground",
        correct: true,
        explanation: "Ground connection prevents hum and electrical noise",
        consequence: "✓ Essential: Eliminates 60Hz hum. Without it, you'll hear loud buzzing through speakers."
      },
      // Receiver to Amp
      {
        id: "rec-amp",
        source: "receiver",
        target: "amp",
        label: "RCA → Line Level",
        type: "rca",
        correct: true,
        explanation: "Pre-out from receiver to power amplifier input",
        consequence: "✓ Correct: Line-level signal routing for external amplification"
      },
      // Amp to Speakers (correct 8Ω connections)
      {
        id: "amp-spk-l",
        source: "amp",
        target: "speaker-l",
        label: "Speaker Wire (8Ω)",
        type: "speaker",
        correct: true,
        explanation: "Left channel speaker wire with proper impedance matching",
        consequence: "✓ Correct: 8Ω speaker matches amp output impedance. Check polarity: red to +, black to -"
      },
      {
        id: "amp-spk-r",
        source: "amp",
        target: "speaker-r",
        label: "Speaker Wire (8Ω)",
        type: "speaker",
        correct: true,
        explanation: "Right channel speaker wire with proper impedance matching",
        consequence: "✓ Correct: 8Ω speaker matches amp output impedance. Check polarity: red to +, black to -"
      },
    ];

    // Filter connections based on phono mode (only show active connection type)
    const visibleConnections = connections.filter(conn => {
      if (conn.id === "tt-rec-phono") return phonoMode;
      if (conn.id === "tt-rec-line") return !phonoMode;
      return true;
    });

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    // Create arrow markers for connections
    svg.append("defs")
      .selectAll("marker")
      .data(["arrow-correct", "arrow-incorrect"])
      .join("marker")
      .attr("id", d => d)
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 25)
      .attr("refY", 5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", d => d.includes("correct") ? "#10b981" : "#ef4444");

    // Draw connections
    const connectionGroup = svg.append("g").attr("class", "connections");

    visibleConnections.forEach(conn => {
      const sourceNode = nodes.find(n => n.id === conn.source)!;
      const targetNode = nodes.find(n => n.id === conn.target)!;

      const color = conn.correct ? "#10b981" : "#ef4444";
      const dashArray = conn.type === "ground" ? "5,5" : "none";

      // Draw connection line
      connectionGroup.append("line")
        .attr("x1", sourceNode.x + 60)
        .attr("y1", sourceNode.y)
        .attr("x2", targetNode.x - 60)
        .attr("y2", targetNode.y)
        .attr("stroke", color)
        .attr("stroke-width", conn.type === "speaker" ? 4 : 3)
        .attr("stroke-dasharray", dashArray)
        .attr("marker-end", `url(#arrow-${conn.correct ? "correct" : "incorrect"})`)
        .attr("opacity", 0.8)
        .style("cursor", "pointer")
        .on("mouseenter", function() {
          d3.select(this).attr("opacity", 1).attr("stroke-width", conn.type === "speaker" ? 6 : 5);
          setHoveredConnection(conn);
        })
        .on("mouseleave", function() {
          d3.select(this).attr("opacity", 0.8).attr("stroke-width", conn.type === "speaker" ? 4 : 3);
          setHoveredConnection(null);
        });

      // Draw connection label
      const midX = (sourceNode.x + targetNode.x) / 2;
      const midY = (sourceNode.y + targetNode.y) / 2;

      connectionGroup.append("text")
        .attr("x", midX)
        .attr("y", midY - 10)
        .attr("text-anchor", "middle")
        .attr("fill", color)
        .attr("font-size", "11px")
        .attr("font-weight", "600")
        .attr("pointer-events", "none")
        .text(conn.label);
    });

    // Draw nodes
    const nodeGroup = svg.append("g").attr("class", "nodes");

    nodes.forEach(node => {
      const nodeColor =
        node.type === "source" ? "#3b82f6" :
        node.type === "processor" ? "#8b5cf6" :
        "#f59e0b";

      // Node rectangle
      nodeGroup.append("rect")
        .attr("x", node.x - 60)
        .attr("y", node.y - 30)
        .attr("width", 120)
        .attr("height", 60)
        .attr("rx", 8)
        .attr("fill", nodeColor)
        .attr("stroke", "#1e293b")
        .attr("stroke-width", 2);

      // Node label
      nodeGroup.append("text")
        .attr("x", node.x)
        .attr("y", node.y + 5)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .attr("pointer-events", "none")
        .text(node.label);
    });

  }, [phonoMode]);

  return (
    <section className="relative py-20 md:py-24 bg-slate-50 dark:bg-slate-900">
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Interactive Wiring Guide
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600">
              Vintage Stereo Setup
            </span>
          </h2>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Visual diagram showing correct connections and common mistakes. Toggle between phono and line-level inputs to see what changes.
          </p>
        </div>
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Turntable Type:
            </span>
            <button
              onClick={() => setPhonoMode(true)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                phonoMode
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
              }`}
            >
              Phono (no preamp)
            </button>
            <button
              onClick={() => setPhonoMode(false)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                !phonoMode
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
              }`}
            >
              Line-Level (built-in preamp)
            </button>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-8 mb-8">
          <svg ref={svgRef} className="w-full h-auto" />
        </div>
        {hoveredConnection && (
          <div className="bg-slate-900 text-white rounded-xl p-6 shadow-2xl border border-slate-700">
            <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
              {hoveredConnection.correct ? (
                <span className="text-green-400">✓</span>
              ) : (
                <span className="text-red-400">✗</span>
              )}
              {hoveredConnection.label}
            </h4>
            <div className="space-y-2 text-sm">
              <p className="text-slate-300">
                <span className="font-semibold text-white">What it does:</span>{" "}
                {hoveredConnection.explanation}
              </p>
              <p className={hoveredConnection.correct ? "text-green-300" : "text-red-300"}>
                <span className="font-semibold text-white">Result:</span>{" "}
                {hoveredConnection.consequence}
              </p>
            </div>
          </div>
        )}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
            <div className="w-12 h-1 bg-green-500 rounded"></div>
            <div>
              <div className="font-semibold text-green-700 dark:text-green-400 text-sm">Correct Connection</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Safe and proper wiring</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <div className="w-12 h-1 bg-red-500 rounded"></div>
            <div>
              <div className="font-semibold text-red-700 dark:text-red-400 text-sm">Incorrect Connection</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Will cause problems</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-500/10 border border-slate-500/30 rounded-xl">
            <div className="w-12 h-1 border-t-2 border-dashed border-slate-500 rounded"></div>
            <div>
              <div className="font-semibold text-slate-700 dark:text-slate-400 text-sm">Ground Wire</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Prevents hum and noise</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
