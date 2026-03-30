export default function AdminCaseStudiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Case Studies</h1>
        <p className="text-sm text-[#888] mt-1">
          Admin-only preview of case studies content
        </p>
      </div>

      <div className="space-y-4">
        <article className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
              DIY Success
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-medium">
              Plumbing
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mb-3">
            Kitchen Faucet Repair
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-sm text-[#666] mb-4">
            <span>Alex, San Jose CA</span>
            <span className="w-1 h-1 rounded-full bg-[#333]" />
            <span className="text-emerald-400 font-medium">Saved $152</span>
            <span className="w-1 h-1 rounded-full bg-[#333]" />
            <span>45 minutes</span>
          </div>
          <p className="text-[#888] leading-relaxed">
            &quot;I was ready to call a plumber. OpportunIQ showed me it was just a worn O-ring.
            $8 at Home Depot and 30 minutes later, it was fixed. Saved $150 and learned something new.&quot;
          </p>
        </article>

        <article className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium">
              Hired Pro
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-medium">
              HVAC
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mb-3">
            AC Not Cooling
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-sm text-[#666] mb-4">
            <span>Maria, Mountain View CA</span>
            <span className="w-1 h-1 rounded-full bg-[#333]" />
            <span className="text-blue-400 font-medium">Connected with pro</span>
            <span className="w-1 h-1 rounded-full bg-[#333]" />
            <span>Same day service</span>
          </div>
          <p className="text-[#888] leading-relaxed">
            &quot;OpportunIQ told me this wasn&apos;t DIY-able and connected me with 3 HVAC pros.
            Got same-day service and a fair quote. Love that it was honest about when to call a pro.&quot;
          </p>
        </article>

        <article className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
              DIY Success
            </span>
            <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-medium">
              Appliance
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mb-3">
            Dishwasher Not Draining
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-sm text-[#666] mb-4">
            <span>James, Palo Alto CA</span>
            <span className="w-1 h-1 rounded-full bg-[#333]" />
            <span className="text-emerald-400 font-medium">Saved $200</span>
            <span className="w-1 h-1 rounded-full bg-[#333]" />
            <span>20 minutes</span>
          </div>
          <p className="text-[#888] leading-relaxed">
            &quot;Thought I needed a new dishwasher. OpportunIQ diagnosed a clogged filter and showed me
            exactly how to clean it. Zero cost, and it&apos;s been running perfectly for 6 months.&quot;
          </p>
        </article>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
        <p className="text-amber-400 text-sm">
          <strong>Note:</strong> These are placeholder case studies. Replace with real user stories once available.
        </p>
      </div>
    </div>
  );
}
