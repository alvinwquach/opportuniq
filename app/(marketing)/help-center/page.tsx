import { Button } from "@/components/ui/button";

const SUPPORT_OPTIONS = [
  {
    title: "Community Discord",
    description: "Join our Discord server to get help from the community and team. Ask questions, share feedback, and connect with other users.",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
      </svg>
    ),
    href: "https://discord.gg/TRjNfmtR",
    cta: "Join Discord",
    color: "#5865F2",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
  },
];

const FAQ_ITEMS = [
  {
    question: "What is OpportunIQ?",
    answer: "OpportunIQ is a decision intelligence platform that helps you make smarter choices about home repairs and maintenance. Upload a photo, answer a few questions, and get instant recommendations on whether to DIY or hire a professional.",
  },
  {
    question: "How much does it cost?",
    answer: "OpportunIQ is currently in beta. Join our waitlist to get early access when we launch. We'll offer both free and premium tiers.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes. We use end-to-end encryption for all sensitive data. Your photos, budgets, and personal information are never shared with third parties.",
  },
  {
    question: "How do I get help?",
    answer: "Join our Discord community for real-time support from our team and other users.",
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="pt-28 pb-16 px-6 bg-gradient-to-b from-neutral-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-600 text-xs font-mono mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />
            Help Center
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-neutral-900">
            How can we help?
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Get support from our community, browse documentation, or reach out directly.
            We&apos;re here to help you make smarter decisions.
          </p>
        </div>
      </section>
      <section className="py-16 px-6 bg-white">
        <div className="max-w-xl mx-auto">
          <div className="grid gap-6">
            {SUPPORT_OPTIONS.map((option, i) => (
              <div
                key={i}
                className={`p-6 rounded-xl bg-white border shadow-sm ${
                  option.disabled ? "opacity-60 border-neutral-200" : `${option.borderColor} hover:shadow-md`
                } transition-all`}
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${option.bgColor}`}
                  style={{ color: option.color }}
                >
                  {option.icon}
                </div>

                <h3 className="text-xl font-semibold mb-3 text-neutral-900">{option.title}</h3>
                <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
                  {option.description}
                </p>
                {option.disabled ? (
                  <Button
                    disabled
                    className="w-full h-11 font-mono bg-neutral-100 text-neutral-400 cursor-not-allowed"
                  >
                    {option.cta}
                  </Button>
                ) : (
                  <a
                    href={option.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button
                      className="w-full h-11 font-mono font-bold transition-all text-white"
                      style={{ backgroundColor: option.color }}
                    >
                      {option.cta}
                      <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Button>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 px-6 border-t border-neutral-100 bg-neutral-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-neutral-900">
              Frequently Asked Questions
            </h2>
            <p className="text-neutral-600">
              Quick answers to common questions about OpportunIQ.
            </p>
          </div>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-white border border-neutral-200 shadow-sm"
              >
                <h3 className="text-lg font-semibold mb-3 flex items-start gap-3 text-neutral-900">
                  <span className="text-teal-600 font-mono text-sm mt-0.5">Q:</span>
                  {item.question}
                </h3>
                <p className="text-neutral-600 leading-relaxed pl-6">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 px-6 bg-linear-to-b from-white to-neutral-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4 text-neutral-900">
            Still need help?
          </h2>
          <p className="text-neutral-600 mb-8">
            Join our Discord community for real-time support from our team and other users.
          </p>
          <a
            href="https://discord.gg/TRjNfmtR"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              className="h-12 px-8 font-mono font-bold text-white rounded-lg transition-all"
              style={{ backgroundColor: "#5865F2" }}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Join Discord
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}
