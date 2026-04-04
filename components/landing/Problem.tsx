import { IoCamera, IoMic, IoFlash, IoGlobe, IoCheckmarkCircle } from "react-icons/io5";

function ShowVisual() {
  return (
    <div className="relative w-full max-w-60">
      <div className="bg-white rounded-[1.75rem] border border-neutral-200 shadow-xl p-2.5">
        <div className="bg-neutral-900 rounded-[1.25rem] aspect-[9/14] flex flex-col overflow-hidden">
          {/* Camera viewfinder */}
          <div className="flex-1 flex flex-col items-center justify-center p-3 relative">
            {/* Simulated ceiling with crack */}
            <div className="w-full aspect-square bg-gradient-to-br from-neutral-200 via-neutral-100 to-neutral-200 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden shadow-inner">
              {/* Texture pattern */}
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(0,0,0,0.03) 1px, transparent 1px)',
                backgroundSize: '8px 8px'
              }} />
              {/* The crack - more visible branching pattern */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" fill="none">
                <path
                  d="M35 15 L40 35 L38 45 L42 55 L40 70 L45 85"
                  stroke="#374151"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M40 35 L50 40 L55 38"
                  stroke="#374151"
                  strokeWidth="1"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M42 55 L35 60 L30 58"
                  stroke="#374151"
                  strokeWidth="1"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              {/* Focus reticle */}
              <div className="w-16 h-16 border-2 border-blue-500 rounded-lg relative z-10">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-1 bg-blue-500" />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-1 bg-blue-500" />
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-1 h-2 bg-blue-500" />
                <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-1 h-2 bg-blue-500" />
              </div>
            </div>
            {/* Camera controls */}
            <div className="flex gap-4 items-center">
              <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700" />
              <button
                className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-neutral-300"
                aria-label="Take photo"
              >
                <div className="w-11 h-11 rounded-full bg-blue-500 flex items-center justify-center">
                  <IoCamera className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
              </button>
              <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                <IoFlash className="w-4 h-4 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SayVisual() {
  return (
    <div className="relative w-full max-w-70">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4">
        <div className="bg-neutral-50 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center">
              <IoMic className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm text-neutral-700">Recording...</span>
            <span className="text-xs text-neutral-600 ml-auto">0:04</span>
          </div>
          <div className="flex items-center justify-center gap-0.5 h-6">
            {[3, 5, 8, 10, 7, 12, 9, 5, 8, 11, 6, 4, 7, 9, 5].map((h, i) => (
              <div
                key={`bar-${i}-${h}`}
                className="w-1 bg-blue-500 rounded-full"
                style={{ height: `${h * 1.5}px`, opacity: 0.5 + (h / 24) }}
              />
            ))}
          </div>
        </div>
        <p className="text-sm text-neutral-600 italic mb-2">
          &ldquo;This crack appeared after the rain last week...&rdquo;
        </p>
        <div className="flex items-center gap-1.5 text-xs text-neutral-600">
          <IoGlobe className="w-3 h-3" aria-hidden="true" />
          <span>Auto-detected: English</span>
        </div>
      </div>
    </div>
  );
}

function SolvedVisual() {
  return (
    <div className="relative w-full max-w-75">
      <div className="bg-emerald-50/50 rounded-xl border-l-4 border-l-emerald-500 border border-emerald-100 overflow-hidden">
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-3 mb-3">
            <IoCheckmarkCircle className="w-6 h-6 text-emerald-500" />
            <div>
              <div className="text-base font-semibold text-neutral-900">DIY Recommended</div>
              <div className="text-sm text-neutral-600">Hairline crack — cosmetic only</div>
            </div>
          </div>
          <div className="h-px bg-emerald-200/60 my-4" />
          <div className="mb-3">
            <p className="text-xl font-medium text-emerald-700">
              You&apos;d save around $200
            </p>
            <p className="text-sm text-neutral-600">
              by handling this yourself
            </p>
          </div>
          <p className="text-sm text-neutral-600">
            30 min · Low risk · No special tools
          </p>
        </div>
      </div>
    </div>
  );
}

interface Step {
  number: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  visual: React.ReactNode;
}

const STEPS: Step[] = [
  {
    number: 1,
    title: "Show",
    subtitle: "Capture the problem",
    description: "Take a photo or video of what you're working on. A ceiling crack, car dashboard warning, leaky faucet, or mystery issue. No expertise needed—just point and shoot.",
    icon: IoCamera,
    visual: <ShowVisual />,
  },
  {
    number: 2,
    title: "Say",
    subtitle: "Add context in any language",
    description: "Describe what's happening—when it started, what you've tried, any concerns. Voice notes work perfectly. Speak naturally in any of 100+ languages.",
    icon: IoMic,
    visual: <SayVisual />,
  },
  {
    number: 3,
    title: "Solved",
    subtitle: "Get your personalized analysis",
    description: "Receive a clear recommendation: DIY or hire a pro. Complete with cost estimates, time required, risk assessment, and step-by-step guidance tailored to your skill level.",
    icon: IoFlash,
    visual: <SolvedVisual />,
  },
];

export function Problem() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-neutral-50">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-14 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-4 leading-tight text-neutral-900 tracking-tight">
            Real-World Decisions Are Expensive.
            <br />
            <span className="text-blue-700">We Make Them Simple.</span>
          </h2>
          <p className="text-base sm:text-lg max-w-xl mx-auto leading-relaxed text-neutral-600">
            The ceiling crack. The car noise. The appliance that stopped working.
            Each demands your time, money, or both.
          </p>
        </div>
        <div className="space-y-0">
          {STEPS.map((step, index) => (
            <div key={step.number}>
              {index > 0 && (
                <div className="h-px bg-neutral-200/80 my-10 sm:my-12" />
              )}
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="order-2 md:order-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Step {step.number}
                    </span>
                    <step.icon className="w-4 h-4 text-blue-500" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-neutral-900 mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base font-medium text-blue-700 mb-3">
                    {step.subtitle}
                  </p>
                  <p className="text-neutral-600 leading-relaxed text-base sm:text-[17px]" style={{ lineHeight: 1.65 }}>
                    {step.description}
                  </p>
                </div>
                <div className="order-1 md:order-2 flex justify-center md:justify-end">
                  {step.visual}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
