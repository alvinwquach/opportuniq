"use client";

import { useEffect, useRef, use } from "react";
import Link from "next/link";
import { IoArrowBack, IoArrowForward, IoCalendar, IoLocation, IoCar, IoLocate, IoTime, IoCash, IoTrendingUp, IoCheckmarkCircle, IoWarning, IoRibbon, IoFlash } from "react-icons/io5";
import { notFound } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as d3 from "d3";

gsap.registerPlugin(ScrollTrigger);

// Light mode chart colors
const CHART_COLORS = {
  primary: "#0d9488", // teal-600
  secondary: "#2563eb", // blue-600
  success: "#16a34a", // green-600
  warning: "#d97706", // amber-600
  danger: "#dc2626", // red-600
  purple: "#7c3aed", // purple-600
  muted: "#6b7280", // neutral-500
  grid: "#e5e7eb", // neutral-200
  axis: "#9ca3af", // neutral-400
  text: "#374151", // neutral-700
  textMuted: "#6b7280", // neutral-500
  background: "#f9fafb", // neutral-50
  cardBorder: "#e5e7eb", // neutral-200
};

// Case study data
const caseStudies: Record<string, any> = {
  "porsche-cayenne": {
    title: "How Kevin saved $4,220 on his Porsche transmission",
    subtitle: "From \"my car jerks weird\" to a $280 fix—using OpportunIQ's decision framework",
    category: "Automotive Repair",
    publishDate: "December 2024",
    readTime: "6 min read",
    customer: {
      name: "Kevin",
      vehicle: "2014 Porsche Cayenne S",
      quote: "I was ready to drop $4,500 at the dealer because I didn't know any better. OpportunIQ showed me there was a $280 solution I could try first—and it worked. That's life-changing money saved."
    },
    stats: [
      { label: "Total saved", value: 4220, display: "$4,220", icon: IoCash, color: CHART_COLORS.success },
      { label: "Time to decision", value: 45, display: "45 min", icon: IoTime, color: CHART_COLORS.purple },
      { label: "Solution cost", value: 280, display: "$280", icon: IoLocate, color: CHART_COLORS.primary },
      { label: "Success rate", value: 100, display: "First try", icon: IoCheckmarkCircle, color: CHART_COLORS.warning }
    ],
    challenge: {
      title: "The Challenge",
      situation: "Kevin's 2014 Porsche Cayenne S began jerking hard around 3,000 RPM during gear shifts. With no check engine light and no clear diagnosis, he faced the typical car owner's dilemma: trust the dealer's expensive quote or risk making the wrong choice.",
      dealerQuote: "$4,500 for transmission rebuild",
      painPoints: [
        { text: "No clear understanding of the actual problem", icon: IoWarning },
        { text: "Dealer's vague \"transmission problem\" diagnosis", icon: IoWarning },
        { text: "Fear of catastrophic failure if ignored", icon: IoWarning },
        { text: "No knowledge of alternatives or escalation path", icon: IoWarning }
      ]
    },
    diagnosis: {
      title: "The Diagnosis",
      dealerSaid: "Transmission problem—needs rebuild",
      actualIssue: "Degraded automatic transmission fluid (ATF) causing hydraulic pressure issues in valve body solenoids",
      technical: "The 2014 Cayenne S uses an Aisin 8-speed automatic transmission. When ATF breaks down, it loses viscosity and friction properties, preventing proper hydraulic pressure in the valve body solenoids. This causes hard shifts at specific RPM ranges—the #1 cause of shifting issues in this model year.",
      possibleCauses: [
        { issue: "Degraded ATF", likelihood: 75, cost: 280, fix: "Fluid service", chosen: true, color: CHART_COLORS.primary },
        { issue: "Valve body solenoid", likelihood: 18, cost: 2100, fix: "Valve body repair", chosen: false, color: CHART_COLORS.purple },
        { issue: "Torque converter", likelihood: 4, cost: 3200, fix: "TC replacement", chosen: false, color: CHART_COLORS.warning },
        { issue: "Internal clutch pack", likelihood: 3, cost: 4500, fix: "Full rebuild", chosen: false, color: CHART_COLORS.danger }
      ]
    },
    solution: {
      title: "The OpportunIQ Approach",
      process: [
        { phase: "Input", description: "Kevin uploaded his symptoms: \"Car jerks hard around 3,000 RPM when shifting. No check engine light.\"", duration: "30 sec", icon: "01" },
        { phase: "Analysis", description: "OpportunIQ analyzed the symptoms against known issues for 2014 Cayenne S models and identified degraded ATF as the most likely cause.", duration: "15 sec", icon: "02" },
        { phase: "Options", description: "Received 3 tiered solutions ranked by likelihood, cost, and risk—with clear escalation path if first option fails.", duration: "Review", icon: "03" },
        { phase: "Decision", description: "Kevin chose Option 1: $280 fluid service (75% success rate, low risk, reversible).", duration: "Instant", icon: "04" }
      ],
      options: [
        {
          tier: 1,
          title: "Transmission Fluid Service",
          cost: 280,
          timeline: "1-2 hours",
          successRate: 75,
          risk: "Low",
          description: "Full ATF drain-and-fill (8-9 quarts OE-spec fluid). Replaces degraded fluid, restores hydraulic pressure to valve body solenoids.",
          pros: ["Cheapest solution", "Can't damage anything", "Fixes 75% of cases", "Immediate results"],
          cons: ["May not work if hardware failed"],
          outcome: "Problem solved. Shifting smoothed immediately."
        },
        {
          tier: 2,
          title: "Valve Body Repair",
          cost: 2100,
          timeline: "1-2 days",
          successRate: 95,
          risk: "Low",
          description: "Replace valve body with new solenoids and pressure regulator valves.",
          pros: ["95% success rate", "Addresses hardware failure"],
          cons: ["7.5x more expensive", "Requires transmission drop"]
        },
        {
          tier: 3,
          title: "Dealer Transmission Rebuild",
          cost: 4500,
          timeline: "3-5 days",
          successRate: 100,
          risk: "None",
          description: "Complete disassembly, clutch pack replacement, torque converter.",
          pros: ["100% guaranteed fix", "Extended warranty"],
          cons: ["16x more expensive", "Unnecessary 75% of the time"]
        }
      ]
    },
    results: {
      title: "The Results",
      outcome: "Kevin started with Option 1—the $280 fluid service. Shifting smoothed out immediately. No rebuild needed.",
      impact: [
        { metric: "Money saved", value: "$4,220", description: "Avoided unnecessary dealer rebuild", icon: IoCash },
        { metric: "Time saved", value: "2-4 days", description: "No extended shop time", icon: IoTime },
        { metric: "Decision confidence", value: "High", description: "Clear escalation path if needed", icon: IoRibbon },
        { metric: "Total cost", value: "$280", description: "93% less than dealer quote", icon: IoLocate }
      ]
    }
  }
};

export default function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const study = caseStudies[slug];

  const d3ChartRef = useRef<SVGSVGElement>(null);
  const costChartRef = useRef<SVGSVGElement>(null);
  const sankeyChartRef = useRef<SVGSVGElement>(null);
  const gaugeChartRef = useRef<SVGSVGElement>(null);
  const timelineChartRef = useRef<SVGSVGElement>(null);
  const savingsBreakdownRef = useRef<SVGSVGElement>(null);
  const riskMatrixRef = useRef<SVGSVGElement>(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mediaQuery.matches;
    const handleChange = () => { prefersReducedMotion.current = mediaQuery.matches; };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // D3.js Radial Diagnostic Chart (Light Mode)
  useEffect(() => {
    if (!study || !d3ChartRef.current) return;

    const width = 500;
    const height = 450;
    const radius = Math.min(width, height) / 2 - 140;

    const svg = d3.select(d3ChartRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("role", "img")
      .attr("aria-label", "Diagnostic probability chart showing 4 possible causes");

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const data = study.diagnosis.possibleCauses;

    const pie = d3.pie<any>()
      .value((d: any) => d.likelihood)
      .sort(null);

    const arc = d3.arc<any>()
      .innerRadius(radius * 0.5)
      .outerRadius(radius * 0.85);

    const arcs = g.selectAll(".arc")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs.append("path")
      .attr("d", arc)
      .attr("fill", (d: any) => d.data.color)
      .attr("opacity", (d: any) => d.data.chosen ? 1 : 0.6)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 3);

    const fixedLabelY = [-100, 20, -120, 110];

    arcs.each(function(d: any, i: number) {
      const g = d3.select(this);
      const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
      const x = (radius * 1.25) * (midAngle < Math.PI ? 1 : -1);
      const y = fixedLabelY[i];
      const textAnchor = midAngle < Math.PI ? "start" : "end";

      g.append("text")
        .attr("transform", `translate(${x}, ${y})`)
        .attr("dy", "0em")
        .attr("text-anchor", textAnchor)
        .attr("fill", CHART_COLORS.text)
        .attr("font-size", "20px")
        .attr("font-weight", "700")
        .text(`${d.data.likelihood}%`);

      g.append("text")
        .attr("transform", `translate(${x}, ${y})`)
        .attr("dy", "1.3em")
        .attr("text-anchor", textAnchor)
        .attr("fill", CHART_COLORS.text)
        .attr("font-size", "15px")
        .attr("font-weight", "600")
        .text(d.data.issue);

      g.append("text")
        .attr("transform", `translate(${x}, ${y})`)
        .attr("dy", "2.7em")
        .attr("text-anchor", textAnchor)
        .attr("fill", CHART_COLORS.textMuted)
        .attr("font-size", "14px")
        .attr("font-weight", "600")
        .text(`$${d.data.cost.toLocaleString()}`);

      const arcCentroid = d3.arc<any>()
        .innerRadius(radius * 0.5)
        .outerRadius(radius * 0.85)
        .centroid(d);

      g.append("line")
        .attr("x1", arcCentroid[0])
        .attr("y1", arcCentroid[1])
        .attr("x2", x > 0 ? x - 10 : x + 10)
        .attr("y2", y + 15)
        .attr("stroke", CHART_COLORS.axis)
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.6);
    });

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.8em")
      .attr("fill", CHART_COLORS.text)
      .attr("font-size", "20px")
      .attr("font-weight", "700")
      .text("Diagnostic");

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.8em")
      .attr("fill", CHART_COLORS.textMuted)
      .attr("font-size", "16px")
      .attr("font-weight", "500")
      .text("Probabilities");
  }, [study]);

  // D3.js Cost Comparison Bar Chart (Light Mode)
  useEffect(() => {
    if (!study || !costChartRef.current) return;

    const margin = { top: 20, right: 80, bottom: 20, left: 200 };
    const width = 700 - margin.left - margin.right;
    const height = 240 - margin.top - margin.bottom;

    const svg = d3.select(costChartRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const costData = [
      { scenario: "Kevin's actual cost", cost: 280, color: CHART_COLORS.success, chosen: true },
      { scenario: "If valve body repair", cost: 2100, color: CHART_COLORS.purple, chosen: false },
      { scenario: "If dealer rebuild", cost: 4500, color: CHART_COLORS.danger, chosen: false }
    ];

    const xScale = d3.scaleLinear()
      .domain([0, 5000])
      .range([0, width]);

    const yScale = d3.scaleBand()
      .domain(costData.map(d => d.scenario))
      .range([0, height])
      .padding(0.3);

    g.selectAll(".bar")
      .data(costData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", (d: any) => yScale(d.scenario)!)
      .attr("width", (d: any) => xScale(d.cost))
      .attr("height", yScale.bandwidth())
      .attr("fill", (d: any) => d.color)
      .attr("opacity", (d: any) => d.chosen ? 1 : 0.7)
      .attr("rx", 4);

    g.selectAll(".label")
      .data(costData)
      .enter()
      .append("text")
      .attr("x", -10)
      .attr("y", (d: any) => yScale(d.scenario)! + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("fill", CHART_COLORS.text)
      .attr("font-size", "14px")
      .attr("font-weight", (d: any) => d.chosen ? "700" : "500")
      .text((d: any) => d.scenario);

    g.selectAll(".value")
      .data(costData)
      .enter()
      .append("text")
      .attr("x", (d: any) => xScale(d.cost) + 10)
      .attr("y", (d: any) => yScale(d.scenario)! + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("fill", CHART_COLORS.text)
      .attr("font-size", "16px")
      .attr("font-weight", "700")
      .attr("font-family", "monospace")
      .text((d: any) => `$${d.cost.toLocaleString()}`);

    g.append("text")
      .attr("x", xScale(280) + 10)
      .attr("y", yScale("Kevin's actual cost")! - 8)
      .attr("fill", CHART_COLORS.success)
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .text("✓ Saved $4,220");
  }, [study]);

  // D3.js Sankey Diagram (Light Mode)
  useEffect(() => {
    if (!study || !sankeyChartRef.current) return;

    const margin = { top: 20, right: 80, bottom: 20, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(sankeyChartRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const nodes = [
      { id: 0, name: "Symptom:\nJerking at 3k RPM", x: 0, y: height / 2, color: CHART_COLORS.danger },
      { id: 1, name: "Diagnosis:\nDegraded ATF (75%)", x: width * 0.3, y: height * 0.3, color: CHART_COLORS.primary },
      { id: 2, name: "Diagnosis:\nValve body (18%)", x: width * 0.3, y: height * 0.5, color: CHART_COLORS.purple },
      { id: 3, name: "Diagnosis:\nOther causes (7%)", x: width * 0.3, y: height * 0.7, color: CHART_COLORS.muted },
      { id: 4, name: "Solution:\nFluid service $280", x: width * 0.65, y: height * 0.3, color: CHART_COLORS.success },
      { id: 5, name: "Outcome:\nProblem solved", x: width, y: height / 2, color: CHART_COLORS.success }
    ];

    const links = [
      { source: 0, target: 1, value: 75, color: CHART_COLORS.primary },
      { source: 0, target: 2, value: 18, color: CHART_COLORS.purple },
      { source: 0, target: 3, value: 7, color: CHART_COLORS.muted },
      { source: 1, target: 4, value: 75, color: CHART_COLORS.primary },
      { source: 4, target: 5, value: 75, color: CHART_COLORS.success }
    ];

    links.forEach(link => {
      const sourceNode = nodes[link.source];
      const targetNode = nodes[link.target];

      g.append("path")
        .attr("d", () => {
          const x0 = sourceNode.x;
          const y0 = sourceNode.y;
          const x1 = targetNode.x;
          const y1 = targetNode.y;
          const xi = d3.interpolateNumber(x0, x1);
          const xMid = xi(0.5);
          return `M${x0},${y0} C${xMid},${y0} ${xMid},${y1} ${x1},${y1}`;
        })
        .attr("fill", "none")
        .attr("stroke", link.color)
        .attr("stroke-width", Math.max(2, link.value / 5))
        .attr("opacity", 0.7);
    });

    nodes.forEach(node => {
      const nodeG = g.append("g")
        .attr("transform", `translate(${node.x}, ${node.y})`);

      nodeG.append("circle")
        .attr("r", 8)
        .attr("fill", node.color)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 2);

      const lines = node.name.split('\n');
      lines.forEach((line, i) => {
        nodeG.append("text")
          .attr("x", 0)
          .attr("y", -15 - (lines.length - 1 - i) * 14)
          .attr("text-anchor", "middle")
          .attr("fill", CHART_COLORS.text)
          .attr("font-size", "12px")
          .attr("font-weight", "600")
          .text(line);
      });
    });
  }, [study]);

  // D3.js Gauge Charts (Light Mode)
  useEffect(() => {
    if (!study || !gaugeChartRef.current) return;

    const width = 600;
    const height = 160;

    const svg = d3.select(gaugeChartRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    const gauges = [
      { label: "Tier 1: Fluid Service", rate: 75, x: 100, color: CHART_COLORS.primary },
      { label: "Tier 2: Valve Repair", rate: 95, x: 300, color: CHART_COLORS.purple },
      { label: "Tier 3: Full Rebuild", rate: 100, x: 500, color: CHART_COLORS.success }
    ];

    gauges.forEach(gauge => {
      const g = svg.append("g")
        .attr("transform", `translate(${gauge.x}, 80)`);

      const radius = 50;
      const arcWidth = 8;

      const backgroundArc = d3.arc()
        .innerRadius(radius - arcWidth)
        .outerRadius(radius)
        .startAngle(-Math.PI / 2)
        .endAngle(Math.PI / 2);

      g.append("path")
        .attr("d", backgroundArc as any)
        .attr("fill", CHART_COLORS.grid);

      const angle = -Math.PI / 2 + (gauge.rate / 100) * Math.PI;
      const foregroundArc = d3.arc()
        .innerRadius(radius - arcWidth)
        .outerRadius(radius)
        .startAngle(-Math.PI / 2)
        .endAngle(angle);

      g.append("path")
        .attr("d", foregroundArc as any)
        .attr("fill", gauge.color);

      g.append("text")
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .attr("fill", CHART_COLORS.text)
        .attr("font-size", "24px")
        .attr("font-weight", "700")
        .attr("font-family", "monospace")
        .text(`${gauge.rate}%`);

      g.append("text")
        .attr("y", 70)
        .attr("text-anchor", "middle")
        .attr("fill", CHART_COLORS.textMuted)
        .attr("font-size", "11px")
        .attr("font-weight", "600")
        .text(gauge.label);
    });
  }, [study]);

  // NEW CHART 1: Timeline Chart showing decision process duration
  useEffect(() => {
    if (!study || !timelineChartRef.current) return;

    const margin = { top: 30, right: 40, bottom: 40, left: 100 };
    const width = 600 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    const svg = d3.select(timelineChartRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const timelineData = [
      { phase: "Input", duration: 0.5, cumulative: 0.5, color: CHART_COLORS.secondary },
      { phase: "Analysis", duration: 0.25, cumulative: 0.75, color: CHART_COLORS.primary },
      { phase: "Options", duration: 5, cumulative: 5.75, color: CHART_COLORS.purple },
      { phase: "Decision", duration: 1, cumulative: 6.75, color: CHART_COLORS.success }
    ];

    const xScale = d3.scaleLinear()
      .domain([0, 10])
      .range([0, width]);

    const yScale = d3.scaleBand()
      .domain(timelineData.map(d => d.phase))
      .range([0, height])
      .padding(0.3);

    // X axis
    g.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `${d}m`))
      .selectAll("text")
      .attr("fill", CHART_COLORS.textMuted)
      .attr("font-size", "11px");

    g.selectAll(".domain, .tick line")
      .attr("stroke", CHART_COLORS.grid);

    // Bars
    g.selectAll(".bar")
      .data(timelineData)
      .enter()
      .append("rect")
      .attr("x", (d: any) => xScale(d.cumulative - d.duration))
      .attr("y", (d: any) => yScale(d.phase)!)
      .attr("width", (d: any) => xScale(d.duration))
      .attr("height", yScale.bandwidth())
      .attr("fill", (d: any) => d.color)
      .attr("rx", 4);

    // Labels
    g.selectAll(".label")
      .data(timelineData)
      .enter()
      .append("text")
      .attr("x", -10)
      .attr("y", (d: any) => yScale(d.phase)! + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("fill", CHART_COLORS.text)
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .text((d: any) => d.phase);

    // Duration labels
    g.selectAll(".duration")
      .data(timelineData)
      .enter()
      .append("text")
      .attr("x", (d: any) => xScale(d.cumulative - d.duration / 2))
      .attr("y", (d: any) => yScale(d.phase)! + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .text((d: any) => d.duration < 1 ? `${d.duration * 60}s` : `${d.duration}m`);
  }, [study]);

  // NEW CHART 2: Savings Breakdown Stacked Bar
  useEffect(() => {
    if (!study || !savingsBreakdownRef.current) return;

    const width = 500;
    const height = 200;

    const svg = d3.select(savingsBreakdownRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    const savingsData = [
      { category: "Parts", dealer: 2800, kevin: 180, color: CHART_COLORS.secondary },
      { category: "Labor", dealer: 1200, kevin: 100, color: CHART_COLORS.purple },
      { category: "Diagnostic", dealer: 500, kevin: 0, color: CHART_COLORS.warning }
    ];

    const g = svg.append("g")
      .attr("transform", "translate(50, 20)");

    const barWidth = 80;
    const spacing = 150;

    // Dealer bar
    let dealerY = 0;
    savingsData.forEach((d, i) => {
      const barHeight = (d.dealer / 4500) * 140;
      g.append("rect")
        .attr("x", 50)
        .attr("y", dealerY)
        .attr("width", barWidth)
        .attr("height", barHeight)
        .attr("fill", d.color)
        .attr("opacity", 0.5)
        .attr("rx", i === 0 ? 4 : 0);
      dealerY += barHeight;
    });

    // Kevin bar
    let kevinY = 0;
    savingsData.forEach((d, i) => {
      const barHeight = (d.kevin / 4500) * 140;
      if (barHeight > 0) {
        g.append("rect")
          .attr("x", 50 + spacing)
          .attr("y", kevinY)
          .attr("width", barWidth)
          .attr("height", barHeight)
          .attr("fill", d.color)
          .attr("rx", i === 0 ? 4 : 0);
        kevinY += barHeight;
      }
    });

    // Labels
    g.append("text")
      .attr("x", 90)
      .attr("y", 160)
      .attr("text-anchor", "middle")
      .attr("fill", CHART_COLORS.text)
      .attr("font-size", "13px")
      .attr("font-weight", "600")
      .text("Dealer Quote");

    g.append("text")
      .attr("x", 90)
      .attr("y", 175)
      .attr("text-anchor", "middle")
      .attr("fill", CHART_COLORS.danger)
      .attr("font-size", "16px")
      .attr("font-weight", "700")
      .attr("font-family", "monospace")
      .text("$4,500");

    g.append("text")
      .attr("x", 90 + spacing)
      .attr("y", 160)
      .attr("text-anchor", "middle")
      .attr("fill", CHART_COLORS.text)
      .attr("font-size", "13px")
      .attr("font-weight", "600")
      .text("Kevin Paid");

    g.append("text")
      .attr("x", 90 + spacing)
      .attr("y", 175)
      .attr("text-anchor", "middle")
      .attr("fill", CHART_COLORS.success)
      .attr("font-size", "16px")
      .attr("font-weight", "700")
      .attr("font-family", "monospace")
      .text("$280");

    // Legend
    const legend = g.append("g")
      .attr("transform", "translate(320, 20)");

    savingsData.forEach((d, i) => {
      const lg = legend.append("g")
        .attr("transform", `translate(0, ${i * 25})`);

      lg.append("rect")
        .attr("width", 16)
        .attr("height", 16)
        .attr("fill", d.color)
        .attr("rx", 2);

      lg.append("text")
        .attr("x", 24)
        .attr("y", 12)
        .attr("fill", CHART_COLORS.text)
        .attr("font-size", "12px")
        .text(d.category);
    });
  }, [study]);

  // NEW CHART 3: Risk vs Cost Matrix
  useEffect(() => {
    if (!study || !riskMatrixRef.current) return;

    const margin = { top: 40, right: 60, bottom: 60, left: 80 };
    const width = 500 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    const svg = d3.select(riskMatrixRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const options = [
      { name: "Fluid Service", cost: 280, risk: 1, success: 75, chosen: true, color: CHART_COLORS.primary },
      { name: "Valve Body", cost: 2100, risk: 2, success: 95, chosen: false, color: CHART_COLORS.purple },
      { name: "Full Rebuild", cost: 4500, risk: 3, success: 100, chosen: false, color: CHART_COLORS.danger }
    ];

    const xScale = d3.scaleLinear()
      .domain([0, 5000])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, 4])
      .range([height, 0]);

    // Grid lines
    g.selectAll(".grid-x")
      .data([1000, 2000, 3000, 4000])
      .enter()
      .append("line")
      .attr("x1", (d: any) => xScale(d))
      .attr("x2", (d: any) => xScale(d))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", CHART_COLORS.grid)
      .attr("stroke-dasharray", "4,4");

    g.selectAll(".grid-y")
      .data([1, 2, 3])
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", (d: any) => yScale(d))
      .attr("y2", (d: any) => yScale(d))
      .attr("stroke", CHART_COLORS.grid)
      .attr("stroke-dasharray", "4,4");

    // Axes
    g.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `$${d}`).ticks(5))
      .selectAll("text")
      .attr("fill", CHART_COLORS.textMuted)
      .attr("font-size", "11px");

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(3).tickFormat(d => ["", "Low", "Med", "High"][+d]))
      .selectAll("text")
      .attr("fill", CHART_COLORS.textMuted)
      .attr("font-size", "11px");

    g.selectAll(".domain, .tick line")
      .attr("stroke", CHART_COLORS.grid);

    // Axis labels
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height + 45)
      .attr("text-anchor", "middle")
      .attr("fill", CHART_COLORS.text)
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .text("Cost");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -55)
      .attr("text-anchor", "middle")
      .attr("fill", CHART_COLORS.text)
      .attr("font-size", "12px")
      .attr("font-weight", "600")
      .text("Complexity / Risk");

    // Bubbles
    options.forEach(opt => {
      const bubbleG = g.append("g")
        .attr("transform", `translate(${xScale(opt.cost)}, ${yScale(opt.risk)})`);

      bubbleG.append("circle")
        .attr("r", opt.success / 3)
        .attr("fill", opt.color)
        .attr("opacity", opt.chosen ? 0.9 : 0.6)
        .attr("stroke", opt.chosen ? CHART_COLORS.text : "none")
        .attr("stroke-width", 2);

      bubbleG.append("text")
        .attr("y", opt.success / 3 + 18)
        .attr("text-anchor", "middle")
        .attr("fill", CHART_COLORS.text)
        .attr("font-size", "11px")
        .attr("font-weight", "600")
        .text(opt.name);

      if (opt.chosen) {
        bubbleG.append("text")
          .attr("y", -opt.success / 3 - 8)
          .attr("text-anchor", "middle")
          .attr("fill", CHART_COLORS.success)
          .attr("font-size", "10px")
          .attr("font-weight", "700")
          .text("✓ CHOSEN");
      }
    });
  }, [study]);

  if (!study) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-teal-600 focus:text-white focus:rounded">
        Skip to main content
      </a>

      {/* 1. HERO - Big impact number */}
      <header className="relative border-b border-neutral-200 overflow-hidden bg-gradient-to-b from-neutral-50 to-white" role="banner">
        <div className="relative max-w-5xl mx-auto px-6 py-12 pt-28">
          <Link href="/case-studies" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-teal-600 transition-colors mb-8 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-3 py-2 hover:bg-teal-50">
            <IoArrowBack className="h-4 w-4" aria-hidden="true" />
            <span className="font-medium">Back to case studies</span>
          </Link>

          <div className="flex items-center gap-3 text-sm text-neutral-500 mb-6">
            <span className="px-4 py-1.5 bg-teal-50 border border-teal-200 text-teal-600 rounded font-semibold">
              {study.category}
            </span>
            <span className="flex items-center gap-1.5">
              <IoCalendar className="h-4 w-4" aria-hidden="true" />
              <time dateTime="2024-12">{study.publishDate}</time>
            </span>
            <span aria-hidden="true">•</span>
            <span>{study.readTime}</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-neutral-900">
            {study.title}
          </h1>

          <div className="relative p-8 bg-green-50 border border-green-200 rounded-xl mb-6 overflow-hidden">
            <div className="text-center">
              <p className="text-sm text-green-600 font-mono uppercase tracking-wider mb-2">Total Savings</p>
              <p className="text-6xl md:text-7xl font-bold text-green-600 font-mono mb-2">$4,220</p>
              <p className="text-lg text-neutral-600">93% less than the dealer quote</p>
            </div>
          </div>

          <p className="text-xl text-neutral-600 leading-relaxed">
            {study.subtitle}
          </p>
        </div>
      </header>

      <main id="main-content" className="relative max-w-5xl mx-auto px-6 py-16">

        {/* 2. THE WIN - Results first */}
        <section aria-labelledby="results-heading" className="mb-24">
          <div className="text-center mb-12">
            <h2 id="results-heading" className="text-4xl font-bold text-neutral-900 mb-4">The Outcome</h2>
            <p className="text-lg text-neutral-600">Kevin avoided an unnecessary $4,500 rebuild with data-driven decision making</p>
          </div>

          <div className="relative p-8 bg-green-50 border border-green-200 rounded-xl mb-12 overflow-hidden">
            <div className="relative flex items-start gap-4">
              <IoCheckmarkCircle className="h-10 w-10 text-green-600 flex-shrink-0 mt-1" aria-hidden="true" />
              <div>
                <p className="text-xs text-green-600 font-mono uppercase tracking-wider mb-3">Success</p>
                <p className="text-2xl text-neutral-900 leading-relaxed font-semibold">{study.results.outcome}</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {study.stats.map((stat: any, i: number) => (
              <div key={i} className="relative p-6 bg-white border border-neutral-200 rounded-xl shadow-sm hover:shadow-md transition-all group overflow-hidden">
                <div className="relative flex items-center justify-center mb-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }} aria-hidden="true">
                    <stat.icon className="h-6 w-6" style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="relative text-3xl font-bold text-neutral-900 text-center mb-2 font-mono">{stat.display}</p>
                <p className="relative text-xs text-neutral-500 text-center uppercase tracking-wide font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. COST COMPARISON - Visual proof */}
        <section className="mb-24">
          <div className="relative p-8 bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
            <h3 className="text-2xl font-semibold text-neutral-900 mb-3 text-center">The Cost Difference</h3>
            <p className="text-sm text-neutral-500 mb-8 text-center">What Kevin paid vs. what he almost paid</p>

            <div className="flex justify-center">
              <svg ref={costChartRef} className="max-w-full h-auto" />
            </div>
          </div>
        </section>

        {/* NEW: Savings Breakdown Chart */}
        <section className="mb-24">
          <div className="relative p-8 bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
            <h3 className="text-2xl font-semibold text-neutral-900 mb-3 text-center">Cost Breakdown Comparison</h3>
            <p className="text-sm text-neutral-500 mb-8 text-center">Where the savings came from</p>

            <div className="flex justify-center">
              <svg ref={savingsBreakdownRef} className="max-w-full h-auto" />
            </div>
          </div>
        </section>

        {/* 4. THE PROBLEM - Challenge */}
        <section aria-labelledby="challenge-heading" className="mb-24">
          <div className="text-center mb-12">
            <h2 id="challenge-heading" className="text-4xl font-bold text-neutral-900 mb-4">The Challenge</h2>
            <p className="text-lg text-neutral-600">A vague diagnosis and a $4,500 quote with no alternatives</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 relative p-8 bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
              <p className="text-lg text-neutral-700 leading-relaxed mb-6">{study.challenge.situation}</p>
              <div className="pt-6 border-t border-red-200">
                <p className="text-sm text-neutral-500 mb-2 uppercase tracking-wide font-mono">Dealer Quote</p>
                <p className="text-4xl font-bold text-red-600 font-mono">{study.challenge.dealerQuote}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-700 mb-4 uppercase tracking-wide">Pain Points</h3>
              <ul className="space-y-3" role="list">
                {study.challenge.painPoints.map((point: any, i: number) => (
                  <li key={i} className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg hover:border-amber-300 transition-colors">
                    <point.icon className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <span className="text-sm text-neutral-700 leading-relaxed">{point.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 5. SOCIAL PROOF - Testimonial */}
        <section aria-labelledby="testimonial-heading" className="mb-24">
          <figure className="relative p-10 bg-teal-50 border border-teal-200 rounded-xl overflow-hidden">
            <div className="absolute top-6 left-6 text-7xl text-teal-200 font-serif leading-none" aria-hidden="true">"</div>

            <blockquote className="relative text-xl text-neutral-700 leading-relaxed mb-8 pl-10">{study.customer.quote}</blockquote>

            <figcaption className="relative flex items-center gap-4 pl-10">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-2xl font-bold text-white" aria-hidden="true">
                {study.customer.name.charAt(0)}
              </div>
              <div>
                <p className="text-lg font-bold text-neutral-900">— {study.customer.name}</p>
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <IoCar className="h-3 w-3" aria-hidden="true" />
                  <span>{study.customer.vehicle}</span>
                </div>
              </div>
            </figcaption>
          </figure>
        </section>

        {/* 6. DIAGNOSIS - What we discovered */}
        <section aria-labelledby="diagnosis-heading" className="mb-24">
          <div className="text-center mb-12">
            <h2 id="diagnosis-heading" className="text-4xl font-bold text-neutral-900 mb-4">The Diagnosis</h2>
            <p className="text-lg text-neutral-600">OpportunIQ identified the real issue in under 60 seconds</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="relative p-8 bg-red-50 border border-red-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <IoFlash className="h-7 w-7 text-red-600" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">Dealer Diagnosis</h3>
              </div>
              <p className="text-2xl text-red-600 font-semibold mb-4">{study.diagnosis.dealerSaid}</p>
              <p className="text-sm text-neutral-600">Recommended solution: Full transmission rebuild at $4,500</p>
            </div>

            <div className="relative p-8 bg-teal-50 border border-teal-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <IoLocate className="h-7 w-7 text-teal-600" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-neutral-700 uppercase tracking-wide">Actual Issue</h3>
              </div>
              <p className="text-2xl text-teal-600 font-semibold mb-4">{study.diagnosis.actualIssue}</p>
              <p className="text-sm text-neutral-600">{study.diagnosis.technical}</p>
            </div>
          </div>

          <div className="relative p-10 bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
            <h3 className="relative text-2xl font-semibold text-neutral-900 mb-10 text-center">Diagnostic Probability Analysis</h3>

            <div className="relative flex justify-center">
              <svg ref={d3ChartRef} className="max-w-full h-auto" />
            </div>

            <p className="relative text-sm text-neutral-500 text-center mt-10 leading-relaxed max-w-2xl mx-auto">
              Probability distribution across four potential failure modes. Teal segment shows the recommended diagnostic path with 75% likelihood.
            </p>
          </div>
        </section>

        {/* NEW: Risk vs Cost Matrix */}
        <section className="mb-24">
          <div className="relative p-8 bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
            <h3 className="text-2xl font-semibold text-neutral-900 mb-3 text-center">Risk vs Cost Analysis</h3>
            <p className="text-sm text-neutral-500 mb-8 text-center">Bubble size represents success rate for each option</p>

            <div className="flex justify-center">
              <svg ref={riskMatrixRef} className="max-w-full h-auto" />
            </div>
          </div>
        </section>

        {/* 7. SOLUTION FLOW - How it works */}
        <section aria-labelledby="solution-heading" className="mb-24">
          <div className="text-center mb-12">
            <h2 id="solution-heading" className="text-4xl font-bold text-neutral-900 mb-4">The Solution Process</h2>
            <p className="text-lg text-neutral-600">From symptom to solution in 4 simple steps</p>
          </div>

          <div className="relative p-8 bg-white border border-neutral-200 rounded-xl shadow-sm mb-12 overflow-hidden">
            <h3 className="text-xl font-semibold text-neutral-900 mb-6 text-center">Decision Flow Visualization</h3>
            <p className="text-sm text-neutral-500 mb-8 text-center">How OpportunIQ mapped Kevin&apos;s symptom through diagnosis to the optimal solution</p>

            <div className="flex justify-center">
              <svg ref={sankeyChartRef} className="max-w-full h-auto" />
            </div>
          </div>

          {/* NEW: Timeline Chart */}
          <div className="relative p-8 bg-white border border-neutral-200 rounded-xl shadow-sm mb-12 overflow-hidden">
            <h3 className="text-xl font-semibold text-neutral-900 mb-6 text-center">Time to Decision</h3>
            <p className="text-sm text-neutral-500 mb-8 text-center">Total time: under 7 minutes from symptom input to confident decision</p>

            <div className="flex justify-center">
              <svg ref={timelineChartRef} className="max-w-full h-auto" />
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {study.solution.process.map((step: any, i: number) => (
              <article key={i} className="relative p-6 bg-white border border-neutral-200 rounded-xl shadow-sm group hover:shadow-md transition-all overflow-hidden">
                {i < 3 && <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-px bg-teal-300" aria-hidden="true" />}

                <div className="relative w-14 h-14 rounded-full bg-teal-50 border-2 border-teal-200 flex items-center justify-center mb-4 text-teal-600 font-bold text-xl">
                  {step.icon}
                </div>
                <div className="relative flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-neutral-900">{step.phase}</h3>
                  <span className="text-xs text-teal-600 font-mono uppercase tracking-wider">{step.duration}</span>
                </div>
                <p className="relative text-sm text-neutral-600 leading-relaxed">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* 8. SUCCESS METRICS - Gauge charts */}
        <section className="mb-24">
          <div className="relative p-8 bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
            <h3 className="text-2xl font-semibold text-neutral-900 mb-3 text-center">Historical Success Rates</h3>
            <p className="text-sm text-neutral-500 mb-8 text-center">Each tier&apos;s track record across thousands of similar cases</p>

            <div className="flex justify-center">
              <svg ref={gaugeChartRef} className="max-w-full h-auto" />
            </div>
          </div>
        </section>

        {/* 9. ALL OPTIONS - Full tier breakdown */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">All Solution Tiers</h2>
            <p className="text-lg text-neutral-600">Transparent options ranked by cost, risk, and success probability</p>
          </div>

          <div className="space-y-6">
            {study.solution.options.map((option: any, i: number) => (
              <article key={i} className={`relative p-8 rounded-xl border group transition-all overflow-hidden ${option.tier === 1 ? 'bg-teal-50 border-teal-200 shadow-lg' : 'bg-white border-neutral-200 shadow-sm hover:shadow-md'}`}>
                <div className="relative grid md:grid-cols-[auto_1fr_auto] gap-8 items-start">
                  <div className="flex flex-col gap-3">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider ${option.tier === 1 ? 'bg-teal-600 text-white' : 'bg-neutral-100 text-neutral-600 border border-neutral-200'}`}>
                      {option.tier === 1 && <IoLocate className="h-3.5 w-3.5" aria-hidden="true" />}
                      Tier {option.tier}
                      {option.tier === 1 && <span className="ml-2 opacity-80">★</span>}
                    </span>
                    <div>
                      <p className="text-xs text-neutral-500 mb-2 font-mono uppercase tracking-wider">Cost</p>
                      <p className={`text-4xl font-bold font-mono leading-none ${option.tier === 1 ? 'text-teal-600' : 'text-neutral-700'}`}>
                        ${option.cost.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-neutral-900 mb-4 leading-tight">{option.title}</h3>
                    <p className="text-base text-neutral-600 leading-relaxed mb-6">{option.description}</p>

                    <div className="grid md:grid-cols-2 gap-6 text-sm">
                      <div>
                        <p className="text-xs text-neutral-500 mb-3 font-semibold uppercase tracking-wide flex items-center gap-2">
                          <IoCheckmarkCircle className="h-3.5 w-3.5 text-green-600" aria-hidden="true" />
                          Advantages
                        </p>
                        <ul className="space-y-2" role="list">
                          {option.pros.map((pro: string, j: number) => (
                            <li key={j} className="text-neutral-600 flex items-start gap-2 leading-relaxed">
                              <span className="text-green-600 mt-0.5 text-lg">•</span>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {option.cons && (
                        <div>
                          <p className="text-xs text-neutral-500 mb-3 font-semibold uppercase tracking-wide flex items-center gap-2">
                            <IoWarning className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
                            Trade-offs
                          </p>
                          <ul className="space-y-2" role="list">
                            {option.cons.map((con: string, j: number) => (
                              <li key={j} className="text-neutral-500 flex items-start gap-2 leading-relaxed">
                                <span className="text-amber-600 mt-0.5 text-lg">•</span>
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 min-w-[150px]">
                    <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg text-center">
                      <p className="text-xs text-neutral-500 mb-1 uppercase tracking-wide font-mono">Timeline</p>
                      <p className="text-base font-bold text-neutral-900">{option.timeline}</p>
                    </div>
                    <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg text-center">
                      <p className="text-xs text-neutral-500 mb-1 uppercase tracking-wide font-mono">Success</p>
                      <p className="text-base font-bold text-neutral-900">{option.successRate}%</p>
                    </div>
                    <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg text-center">
                      <p className="text-xs text-neutral-500 mb-1 uppercase tracking-wide font-mono">Risk</p>
                      <p className="text-base font-bold text-neutral-900">{option.risk}</p>
                    </div>
                  </div>
                </div>

                {option.outcome && (
                  <div className="relative mt-8 pt-6 border-t border-green-200">
                    <div className="flex items-center gap-3 text-base text-green-600 font-semibold">
                      <IoCheckmarkCircle className="h-6 w-6" aria-hidden="true" />
                      <span className="uppercase tracking-wide text-xs text-green-600">Result:</span>
                      <span className="text-neutral-700">{option.outcome}</span>
                    </div>
                  </div>
                )}

              </article>
            ))}
          </div>
        </section>
        <section aria-labelledby="cta-heading" className="relative text-center p-16 bg-teal-50 border border-teal-200 rounded-xl overflow-hidden">
          <div className="relative">
            <h2 id="cta-heading" className="text-4xl font-bold text-neutral-900 mb-4">
              Make confident decisions like Kevin
            </h2>
            <p className="text-xl text-neutral-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Get instant diagnosis, tiered options, and clear trade-offs for any repair or purchase—saving thousands by starting with the right solution.
            </p>
            <Link href="/onboarding" className="inline-flex items-center gap-3 px-10 py-5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-lg rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 group">
              Get started free
              <IoArrowForward className="h-6 w-6 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
            <p className="text-sm text-neutral-500 mt-6 font-mono">No credit card required • 2 minutes to set up</p>
          </div>
        </section>
      </main>
    </div>
  );
}
