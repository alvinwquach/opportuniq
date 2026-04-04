import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Terms of Service",
  description:
    "Terms and conditions for using OpportunIQ.",
  path: "/terms-of-service",
});

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 pt-28 pb-24">
        {/* Header */}
        <p className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-4">Legal</p>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-12">Last updated: April 3, 2026</p>

        <div className="space-y-10 text-sm leading-relaxed text-gray-600">

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Acceptance of Terms</h2>
            <p>
              By accessing or using OpportunIQ (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Description of Service</h2>
            <p className="mb-3">
              OpportunIQ is an AI-powered assistant for home and auto issues. The Service includes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>AI diagnosis of home and auto issues via text, photo, video, or voice</li>
              <li>Safety and urgency assessment</li>
              <li>DIY feasibility guidance and step-by-step repair guides</li>
              <li>Cost estimates sourced from HomeAdvisor, Angi, and Home Depot</li>
              <li>Local contractor discovery and quote request drafting</li>
              <li>Maintenance reminders via Google Calendar integration</li>
              <li>Contractor outreach via Gmail integration</li>
              <li>Group and household collaboration</li>
              <li>Diagnosis history and expense tracking</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">User Accounts</h2>
            <p className="mb-3">You must create an account to use the Service. You are responsible for:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activity that occurs under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
              <li>Providing accurate and complete information</li>
            </ul>
          </section>

          <section className="p-5 bg-amber-50 border border-amber-200 rounded-xl">
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              Disclaimers — Please Read Carefully
            </h2>
            <p className="font-medium text-amber-700 mb-3">
              OpportunIQ provides AI-generated guidance for informational purposes only. We are not licensed contractors, electricians, plumbers, or any other type of trade professional.
            </p>
            <p className="mb-3">You acknowledge and agree that:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>AI diagnoses are not a substitute for professional inspection or advice</li>
              <li>Cost estimates are reference points, not guarantees</li>
              <li>You should always consult a licensed professional for safety-critical issues</li>
              <li>We are not responsible for the quality or outcome of work performed by contractors you hire</li>
              <li>You assume all risk when acting on information from the Service</li>
              <li>You are responsible for verifying any information before taking action</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Google Integrations</h2>
            <p className="mb-3">
              When you connect Google Calendar or Gmail, you authorize OpportunIQ to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Create calendar events for maintenance reminders and follow-ups</li>
              <li>Draft and send contractor quote request emails on your behalf</li>
            </ul>
            <p className="mt-3">
              You can revoke these permissions at any time from Settings &rarr; Integrations. We do not access your existing emails or calendar events.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Use the Service for any unlawful purpose</li>
              <li>Upload malicious content, viruses, or harmful files</li>
              <li>Abuse, harass, or impersonate other users</li>
              <li>Attempt to access, compromise, or reverse-engineer the Service</li>
              <li>Scrape or reproduce content without permission</li>
              <li>Create multiple accounts to circumvent usage limits</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Intellectual Property</h2>
            <p className="mb-3">
              The Service and its content — including the AI models, UI, text, and branding — are owned by OpportunIQ and protected by applicable intellectual property law. You may not copy, modify, or distribute our content without permission.
            </p>
            <p>
              You retain ownership of content you upload (photos, descriptions, etc.), but grant us a limited license to use it to provide and improve the Service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Beta Service</h2>
            <p>
              OpportunIQ is currently in beta. The Service is provided as-is during this period. Features may change, and we make no guarantees of uptime, data retention, or feature availability. We will make reasonable efforts to preserve your data but cannot guarantee continuity during beta.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Pricing</h2>
            <p>
              OpportunIQ is currently free to use. If we introduce paid plans in the future, we will provide at least 30 days&apos; notice. Any pricing changes will not apply retroactively to active users without consent.
            </p>
          </section>

          <section className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Limitation of Liability</h2>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              To the maximum extent permitted by law:
            </p>
            <p className="mb-3">
              OpportunIQ and its affiliates will not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of data, revenue, or goodwill, resulting from:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Your use of or inability to use the Service</li>
              <li>Decisions made based on AI-generated guidance</li>
              <li>Actions taken by contractors you hire through or outside the Service</li>
              <li>Unauthorized access to your account or data</li>
              <li>Errors or inaccuracies in diagnosis, cost estimates, or guides</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Indemnification</h2>
            <p>
              You agree to indemnify and hold OpportunIQ harmless from any claims, damages, or expenses arising from your use of the Service, your violation of these Terms, or your violation of any rights of a third party.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Termination</h2>
            <p>
              We may suspend or terminate your account for violations of these Terms or for any other reason with reasonable notice. You may delete your account at any time from Settings &rarr; Account.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Governing Law</h2>
            <p>
              These Terms are governed by the laws of the State of California, without regard to conflict of law provisions. Disputes will be resolved in the courts of San Francisco County, California.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. Material changes will be communicated by email or in-app notification. Continued use of the Service after changes constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Contact</h2>
            <p>
              Questions about these Terms?{" "}
              <a href="mailto:legal@opportuniq.app" className="text-blue-600 hover:text-blue-700 transition-colors">
                legal@opportuniq.app
              </a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
