import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  description:
    "How OpportunIQ collects, uses, and protects your information.",
  path: "/privacy-policy",
});

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 pt-28 pb-24">
        {/* Header */}
        <p className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-4">Privacy Policy</p>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-12">Last updated: April 3, 2026</p>

        <div className="space-y-10 text-sm leading-relaxed text-gray-600">

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Introduction</h2>
            <p>
              OpportunIQ (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our AI-powered home and auto assistant.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Information We Collect</h2>
            <p className="mb-3">We collect information you provide directly, including:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Account information — name, email address, and password</li>
              <li>Issue descriptions, photos, videos, and voice notes you submit</li>
              <li>Diagnosis history and outcomes you log</li>
              <li>Google Calendar and Gmail data when you connect those integrations</li>
              <li>Group and household member information</li>
              <li>Usage data and analytics (via PostHog)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">How We Use Your Information</h2>
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Diagnose home and auto issues and assess safety, urgency, and cost</li>
              <li>Generate DIY guides and connect you with local contractors</li>
              <li>Send contractor quote requests on your behalf via Gmail integration</li>
              <li>Sync maintenance reminders with Google Calendar</li>
              <li>Store and organize your diagnosis and repair history</li>
              <li>Track household group activity and shared issues</li>
              <li>Improve our AI models using anonymized, aggregated data</li>
              <li>Send transactional notifications and service updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Google Integrations</h2>
            <p className="mb-3">
              When you connect Google Calendar or Gmail, we access only the data necessary to provide those features:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><span className="font-medium text-gray-800">Gmail</span> — used to draft and send contractor quote request emails on your behalf. We do not read your existing inbox.</li>
              <li><span className="font-medium text-gray-800">Google Calendar</span> — used to create maintenance reminders and follow-up events. We do not read existing calendar events.</li>
            </ul>
            <p className="mt-3">
              You can revoke either integration at any time from Settings &rarr; Integrations.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Data Sources We Query</h2>
            <p>
              To provide diagnosis results, we query third-party data sources including HomeAdvisor, Angi, Home Depot, Reddit, YouTube, iFixit, Stack Exchange, Instructables, Yelp, Foursquare, CPSC, and NHTSA. We do not share your personal information with these sources — queries are made server-side without identifying you to them.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Data Storage and Security</h2>
            <p>
              All data is encrypted in transit (TLS) and at rest. We use Neon (PostgreSQL) for primary storage and Vercel infrastructure for compute. Access to your data is restricted to authorized personnel only. We do not sell your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Sharing Your Information</h2>
            <p className="mb-3">We may share your information with:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Infrastructure and service providers who help us operate the platform (Vercel, Neon, Resend, PostHog, Anthropic)</li>
              <li>Other members of groups or households you have explicitly joined</li>
              <li>Law enforcement when required by law</li>
            </ul>
            <p className="mt-3">We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Access and download your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and all associated data</li>
              <li>Revoke Google integration permissions at any time</li>
              <li>Opt out of non-transactional communications</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, contact us at{" "}
              <a href="mailto:privacy@opportuniq.app" className="text-blue-600 hover:text-blue-700 transition-colors">
                privacy@opportuniq.app
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Cookies and Analytics</h2>
            <p>
              We use cookies for authentication and session management. We use PostHog for product analytics, which tracks usage patterns in an anonymized, aggregated form. You can control cookie behavior through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Children&apos;s Privacy</h2>
            <p>
              OpportunIQ is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Material changes will be communicated by email or through the app. Continued use of OpportunIQ after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Contact</h2>
            <p>
              Questions about this Privacy Policy?{" "}
              <a href="mailto:privacy@opportuniq.app" className="text-blue-600 hover:text-blue-700 transition-colors">
                privacy@opportuniq.app
              </a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
