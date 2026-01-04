import {
  IoMic,
  IoBulb,
  IoTrendingUp,
  IoDocument,
  IoScale,
  IoPencil,
  IoDownload,
  IoNotifications,
  IoPhonePortrait,
  IoCheckmarkCircle,
  IoEllipse,
  IoTime,
  IoPeople,
  IoCash,
  IoLocate,
  IoWarning,
  IoFlash,
  IoMap,
  IoCalendar,
  IoHome,
  IoConstruct,
  IoCamera,
  IoGlobe,
  IoShield,
  IoTrendingDown,
  IoBarChart,
  IoPulse,
  IoServer,
  IoCode,
  IoLayers,
  IoArrowForward,
  IoOpenOutline,
} from "react-icons/io5";
import { FaVoteYea } from "react-icons/fa";
import { MdDashboardCustomize } from "react-icons/md";

const PROBLEM = {
  headline: "Homeowners waste $12,000+ per year on bad repair decisions",
  stats: [
    { value: "$12K", label: "Avg annual waste on unnecessary repairs", color: "#ef4444" },
    { value: "73%", label: "Overpay for contractor work", color: "#f59e0b" },
    { value: "4.5hrs", label: "Average time researching each repair", color: "#8b5cf6" },
    { value: "62%", label: "Regret their repair decisions", color: "#ec4899" },
  ],
  painPoints: [
    "No idea if they should DIY, hire, or wait",
    "Can't estimate real costs until they get 3+ quotes",
    "Don't know if contractor pricing is fair for their area",
    "Forget what they decided and why",
    "Can't coordinate decisions with spouse/roommates",
  ],
};

const SOLUTION = {
  headline: "Decision intelligence for homeowners",
  tagline: "Snap a photo. Get the answer. Know what it takes.",
  valueProps: [
    {
      icon: IoCamera,
      title: "Photo-First Input",
      description: "Snap a photo of any problem. AI identifies the issue and estimates scope.",
    },
    {
      icon: IoBulb,
      title: "Smart Recommendations",
      description: "DIY, hire, or defer? Get data-backed recommendations based on your situation.",
    },
    {
      icon: IoCash,
      title: "Zip-Code Pricing",
      description: "Know what repairs actually cost in YOUR area before calling contractors.",
    },
    {
      icon: IoPeople,
      title: "Household Decisions",
      description: "Collaborate with family on shared decisions. Vote, discuss, decide together.",
    },
  ],
};

const ROADMAP = {
  alpha: {
    phase: "Alpha",
    status: "In Development",
    color: "#8b5cf6",
    description: "ML-powered features for early adopters",
    features: [
      {
        icon: IoMic,
        title: "Voice Input",
        status: "building",
        progress: 25,
        techStack: ["Whisper API", "Claude/GPT", "FastAPI"],
        why: "Users are often looking at the problem with dirty hands. Voice lets them describe issues naturally without typing.",
        metric: "Reduce input friction by 80%",
        color: "#00F0FF",
      },
      {
        icon: IoBulb,
        title: "Cost Predictions",
        status: "building",
        progress: 15,
        techStack: ["scikit-learn", "XGBoost", "Pandas"],
        why: "Homeowners have no idea what repairs should cost. We train on real pricing data to give instant estimates.",
        metric: "Accuracy target: 85% within 20%",
        color: "#8b5cf6",
      },
      {
        icon: IoTrendingUp,
        title: "Smart Timing",
        status: "planned",
        progress: 0,
        techStack: ["Pandas", "NumPy", "Rule Engine"],
        why: "HVAC in summer costs 40% more. We tell users the optimal time to buy/repair based on seasonal data.",
        metric: "Save users 15-30% on timing alone",
        color: "#22c55e",
      },
      {
        icon: IoMap,
        title: "Regional Pricing (Mapbox)",
        status: "building",
        progress: 40,
        techStack: ["Mapbox GL JS", "Postgres", "D3.js"],
        why: "A roof in SF costs 3x more than in Ohio. Zip-code-based pricing makes estimates actually useful.",
        metric: "Cover 95% of US zip codes",
        color: "#f59e0b",
      },
    ],
  },
  beta: {
    phase: "Beta",
    status: "Planned",
    color: "#00F0FF",
    description: "Decision intelligence features for power users",
    features: [
      {
        icon: MdDashboardCustomize,
        title: "Decision Templates",
        status: "planned",
        progress: 0,
        techStack: ["Next.js", "Postgres", "React"],
        why: "Common decisions (repair vs replace, DIY vs hire) have proven frameworks. We codify expert knowledge.",
        metric: "50+ pre-built templates",
        color: "#00F0FF",
      },
      {
        icon: IoScale,
        title: "Regret Minimization Score",
        status: "planned",
        progress: 0,
        techStack: ["Custom Algorithm", "D3.js"],
        why: "Inspired by Bezos. Quantify the cost of waiting vs acting now. Visual score makes decisions easier.",
        metric: "Reduce decision paralysis by 60%",
        color: "#ec4899",
      },
      {
        icon: IoTrendingDown,
        title: "Multi-Scenario Modeling",
        status: "planned",
        progress: 0,
        techStack: ["D3.js", "NumPy", "React"],
        why: "\"What if I wait 6 months?\" \"What if I DIY the easy parts?\" Interactive projections.",
        metric: "3+ scenarios per decision",
        color: "#22c55e",
      },
      {
        icon: FaVoteYea,
        title: "Collaborative Voting",
        status: "planned",
        progress: 0,
        techStack: ["Supabase Realtime", "React"],
        why: "Couples fight about home decisions. Voting + structured discussion reduces conflict.",
        metric: "Reduce household decision time 50%",
        color: "#8b5cf6",
      },
      {
        icon: IoPencil,
        title: "Decision Journaling",
        status: "planned",
        progress: 0,
        techStack: ["Postgres", "Tiptap Editor"],
        why: "People forget why they made decisions. Journaling creates a record to learn from.",
        metric: "Improve future decisions by 25%",
        color: "#f59e0b",
      },
      {
        icon: IoDownload,
        title: "Export to PDF/Spreadsheet",
        status: "planned",
        progress: 0,
        techStack: ["react-pdf", "xlsx", "Node.js"],
        why: "Insurance claims, tax records, selling your home - you need documentation.",
        metric: "Save 5+ hours on documentation",
        color: "#06b6d4",
      },
    ],
  },
  ga: {
    phase: "v1.0 GA",
    status: "Future",
    color: "#22c55e",
    description: "General availability with mobile apps",
    features: [
      {
        icon: IoBulb,
        title: "Outcome Analyzer",
        status: "future",
        progress: 0,
        techStack: ["scikit-learn", "Pandas", "D3.js"],
        why: "After 6 months of decisions, ML can identify patterns. \"You tend to overspend on plumbing.\"",
        metric: "Personalized insights from your data",
        color: "#8b5cf6",
      },
      {
        icon: IoNotifications,
        title: "Smart Notifications",
        status: "future",
        progress: 0,
        techStack: ["Supabase", "Push API", "Cron"],
        why: "\"Your deferred AC decision is 6 months old. Summer is coming.\" Context-aware nudges.",
        metric: "Reduce forgotten decisions by 80%",
        color: "#00F0FF",
      },
      {
        icon: IoPhonePortrait,
        title: "Mobile App",
        status: "future",
        progress: 0,
        techStack: ["React Native", "Expo"],
        why: "Most home issues are discovered on-site. Mobile-first capture is essential.",
        metric: "iOS + Android launch",
        color: "#22c55e",
      },
    ],
  },
};

const STRETCH_GOALS = [
  {
    icon: IoHome,
    title: "Home Inventory",
    description: "Track appliances, warranties, purchase dates. Know when things need replacement.",
    effort: "Medium",
  },
  {
    icon: IoCalendar,
    title: "Maintenance Calendar",
    description: "HVAC filters, gutter cleaning, etc. Recurring reminders based on your home.",
    effort: "Low",
  },
  {
    icon: IoConstruct,
    title: "Contractor CRM",
    description: "Rate contractors, track who you've used, never lose a good plumber's number.",
    effort: "Medium",
  },
  {
    icon: IoGlobe,
    title: "Browser Extension",
    description: "Clip product info while shopping. Compare prices. Add to decisions.",
    effort: "High",
  },
  {
    icon: IoShield,
    title: "Insurance Docs",
    description: "Auto-generate claim-ready documentation from your decision history.",
    effort: "Medium",
  },
  {
    icon: IoTrendingUp,
    title: "Home Value Impact",
    description: "Estimate how repairs/upgrades affect your property value.",
    effort: "High",
  },
];

const TECH_DECISIONS = [
  {
    category: "Voice Input",
    decision: "Whisper API → Claude/GPT",
    reasoning: "Whisper handles speech-to-text (99 languages). Claude/GPT understands intent and extracts structured data (issue type, urgency, scope).",
    alternatives: ["Deepgram", "AssemblyAI", "ElevenLabs (wrong tool - TTS not STT)"],
  },
  {
    category: "Cost Predictions",
    decision: "scikit-learn (XGBoost)",
    reasoning: "Tabular data (zip, home age, materials) → price. XGBoost excels here. Easier to train, deploy, and explain than deep learning.",
    alternatives: ["PyTorch (overkill)", "Linear Regression (too simple)"],
  },
  {
    category: "Smart Timing",
    decision: "Rule Engine + Pandas",
    reasoning: "Seasonal patterns are well-known. Start with rules (\"AC cheaper in winter\"), add ML when we have user data.",
    alternatives: ["Full ML (not enough data yet)"],
  },
  {
    category: "Regret Minimization",
    decision: "Custom Algorithm",
    reasoning: "Formula: (cost of waiting × probability of failure) + opportunity cost. No ML needed - just good UX.",
    alternatives: ["ML scoring (unnecessary complexity)"],
  },
  {
    category: "Outcome Analyzer",
    decision: "scikit-learn + Pandas (later)",
    reasoning: "Need 6+ months of user decisions before ML adds value. Pattern recognition on personal history.",
    alternatives: ["Build now (not enough data)"],
  },
  {
    category: "Receipt Parsing",
    decision: "Defer to post-GA",
    reasoning: "Nice-to-have, not core. Users can type costs for now. OCR is complex and error-prone.",
    alternatives: ["PaddleOCR", "Tesseract", "Claude Vision"],
  },
];

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    building: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Building" },
    planned: { bg: "bg-amber-500/20", text: "text-amber-400", label: "Planned" },
    future: { bg: "bg-neutral-500/20", text: "text-neutral-400", label: "Future" },
    done: { bg: "bg-green-500/20", text: "text-green-400", label: "Done" },
  }[status] || { bg: "bg-neutral-500/20", text: "text-neutral-400", label: status };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

export default function DevelopmentPage() {
  return (
    <div className="p-6 lg:p-8 space-y-12">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Development Roadmap</h1>
        <p className="text-neutral-400">What we&apos;re building and why - the YC pitch version</p>
      </div>
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
            <IoWarning className="w-4 h-4 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">The Problem</h2>
        </div>
        <div className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800">
          <h3 className="text-xl font-bold text-white mb-6">{PROBLEM.headline}</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {PROBLEM.stats.map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-lg bg-neutral-800/50">
                <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs text-neutral-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {PROBLEM.painPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                <p className="text-sm text-neutral-400">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
            <IoBulb className="w-4 h-4 text-green-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">The Solution</h2>
        </div>
        <div className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800">
          <h3 className="text-xl font-bold text-white mb-2">{SOLUTION.headline}</h3>
          <p className="text-[#00F0FF] font-medium mb-6">{SOLUTION.tagline}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {SOLUTION.valueProps.map((prop, i) => {
              const Icon = prop.icon;
              return (
                <div key={i} className="p-4 rounded-lg bg-neutral-800/50 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#00F0FF]/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#00F0FF]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">{prop.title}</h4>
                    <p className="text-sm text-neutral-500">{prop.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {Object.entries(ROADMAP).map(([key, phase]) => (
        <section key={key} className="space-y-6">
          <div className="flex items-center gap-3">
            <div
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ backgroundColor: `${phase.color}20`, color: phase.color }}
            >
              {phase.phase}
            </div>
            <span className="text-sm text-neutral-500">{phase.status}</span>
            <div className="flex-1 h-px bg-neutral-800" />
            <span className="text-xs text-neutral-600">{phase.description}</span>
          </div>
          <div className="grid gap-4">
            {phase.features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="p-5 rounded-xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${feature.color}15` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: feature.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white">{feature.title}</h3>
                        <StatusBadge status={feature.status} />
                      </div>

                      <div className="p-3 rounded-lg bg-neutral-800/50 mb-3">
                        <p className="text-sm text-neutral-300 leading-relaxed">
                          <span className="text-[#00F0FF] font-medium">Why: </span>
                          {feature.why}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5 text-neutral-500">
                          <IoLocate className="w-3.5 h-3.5" />
                          <span>{feature.metric}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <IoCode className="w-3.5 h-3.5 text-neutral-600" />
                          <span className="text-neutral-600">{feature.techStack.join(" + ")}</span>
                        </div>
                      </div>
                      {feature.progress > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-neutral-500">Progress</span>
                            <span style={{ color: feature.color }}>{feature.progress}%</span>
                          </div>
                          <ProgressBar value={feature.progress} color={feature.color} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <IoServer className="w-4 h-4 text-purple-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Tech Decisions</h2>
          <div className="flex-1 h-px bg-neutral-800" />
        </div>
        <div className="grid gap-4">
          {TECH_DECISIONS.map((decision, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-white">{decision.category}</h3>
                    <IoArrowForward className="w-4 h-4 text-neutral-600" />
                    <span className="text-[#00F0FF] font-mono text-sm">{decision.decision}</span>
                  </div>
                  <p className="text-sm text-neutral-400 mb-2">{decision.reasoning}</p>
                  <div className="flex flex-wrap gap-2">
                    {decision.alternatives.map((alt, j) => (
                      <span key={j} className="px-2 py-0.5 rounded bg-neutral-800 text-xs text-neutral-500 line-through">
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <IoFlash className="w-4 h-4 text-amber-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Post-GA Stretch Goals</h2>
          <div className="flex-1 h-px bg-neutral-800" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STRETCH_GOALS.map((goal, i) => {
            const Icon = goal.icon;
            return (
              <div
                key={i}
                className="p-4 rounded-xl bg-neutral-900/30 border border-dashed border-neutral-800"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-neutral-800/50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-neutral-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-neutral-300">{goal.title}</h3>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        goal.effort === "Low" ? "bg-green-500/20 text-green-400" :
                        goal.effort === "Medium" ? "bg-amber-500/20 text-amber-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {goal.effort}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600">{goal.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <section className="p-6 rounded-xl bg-gradient-to-r from-[#00F0FF]/10 to-[#8b5cf6]/10 border border-[#00F0FF]/20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-[#00F0FF]">13</p>
            <p className="text-sm text-neutral-400">Features Planned</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#8b5cf6]">4</p>
            <p className="text-sm text-neutral-400">ML/AI Features</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#22c55e]">6</p>
            <p className="text-sm text-neutral-400">Stretch Goals</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#f59e0b]">3</p>
            <p className="text-sm text-neutral-400">Release Phases</p>
          </div>
        </div>
      </section>
    </div>
  );
}
