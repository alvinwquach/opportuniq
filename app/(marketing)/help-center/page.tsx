import { createPageMetadata } from "@/lib/seo";
import Link from "next/link";

export const metadata = createPageMetadata({
  title: "Help Center",
  description:
    "Get help with OpportunIQ. Community Discord, FAQs, and support options for home and auto decision support.",
  path: "/help-center",
});

const FAQ_ITEMS = [
  {
    question: "What is OpportunIQ?",
    answer:
      "OpportunIQ is an AI assistant for home and auto issues. Describe a problem — by text, photo, or voice — and it tells you whether it's safe, whether you can DIY it, what it will cost, and whether it's urgent. It can also find local contractors and draft quote requests.",
  },
  {
    question: "Is it free?",
    answer:
      "OpportunIQ is free to use during beta — no credit card required, no trial period. We'll give advance notice before any paid plans are introduced.",
  },
  {
    question: "What languages are supported?",
    answer:
      "OpportunIQ supports 40+ languages. You can describe a problem in any language and receive a full diagnosis — including contractor outreach and guides — in that same language.",
  },
  {
    question: "How does the AI diagnose issues?",
    answer:
      "It combines your description, any photos or videos you share, and 12 live data sources — including HomeAdvisor, Angi, Home Depot, Reddit, YouTube, iFixit, and others — to assess safety, urgency, DIY feasibility, and cost.",
  },
  {
    question: "Can I trust the cost estimates?",
    answer:
      "Cost estimates are pulled from real data sources specific to your region. DIY part prices reflect current Home Depot inventory. Professional quotes come from HomeAdvisor and Angi averages. These are reference points, not guarantees.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. All data is encrypted in transit and at rest. Your photos, descriptions, and personal information are never sold or shared with third parties.",
  },
  {
    question: "How do I get more help?",
    answer:
      "Join our Discord community for real-time support from the team and other users. We're active and responsive there.",
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-28 pb-16 px-6 border-b border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-4">
            Help Center
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-5 tracking-tight">
            How can we help?
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            Browse common questions below, or join our Discord for live support from the team.
          </p>
        </div>
      </section>

      {/* Discord CTA */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-gray-50 border border-gray-200">
            <div
              className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#5865F2" }}
            >
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm font-semibold text-gray-900 mb-0.5">Community Discord</p>
              <p className="text-sm text-gray-500">
                Ask questions, share feedback, and get real-time help from the team and other users.
              </p>
            </div>
            <a
              href="https://discord.gg/TRjNfmtR"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-2 h-10 px-5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Join Discord
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-8 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Frequently asked questions
          </h2>
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="px-6 py-5">
                <p className="text-sm font-semibold text-gray-900 mb-2">{item.question}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-6 border-t border-gray-100 bg-gray-50">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-sm font-medium text-gray-900 mb-2">Still have questions?</p>
          <p className="text-sm text-gray-500 mb-6">
            Join the Discord or start using OpportunIQ — it&apos;s free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://discord.gg/TRjNfmtR"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-10 px-5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Join Discord
            </a>
            <Link
              href="/auth/login"
              className="inline-flex items-center h-10 px-5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
