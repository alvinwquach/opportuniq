import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 pt-32 pb-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-teal-600 mb-8 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-neutral-900">Terms of Service</h1>
        <p className="text-sm text-neutral-500 mb-12">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        <div className="prose prose-lg prose-neutral max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
              Acceptance of Terms
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              By accessing or using OpportunIQ (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
              Description of Service
            </h2>
            <p className="text-neutral-600 mb-4">
              OpportunIQ is a decision-support platform that helps you frame real-world decisions—repairs, purchases, and projects. Our service includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-600">
              <li>Decision framing for DIY, outsource, or defer choices</li>
              <li>Opportunity cost calculations based on your time value</li>
              <li>Safety and risk assessment guidance</li>
              <li>Decision logging and history tracking</li>
              <li>Email integration with Gmail and Outlook</li>
              <li>Household member collaboration</li>
            </ul>
          </section>
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
              User Accounts
            </h2>
            <p className="text-neutral-600 mb-4">
              You must create an account to use the Service. You are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-600">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
              <li>Providing accurate and complete information</li>
            </ul>
          </section>
          <section className="mb-10 p-6 bg-amber-50 border border-amber-200 rounded-xl">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
              Disclaimers and Limitations
            </h2>
            <p className="font-semibold text-amber-800 mb-4">
              IMPORTANT: Please read this section carefully.
            </p>
            <p className="text-neutral-700 mb-4">
              OpportunIQ provides decision-framing tools and information, but we are not licensed contractors, electricians, plumbers, or other professionals. Our guidance is for informational purposes only and should not replace professional advice.
            </p>
            <p className="text-neutral-700 font-medium mb-2">
              You acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-700">
              <li>We do not guarantee the accuracy of cost estimates or time calculations</li>
              <li>You should always consult licensed professionals for safety-critical issues</li>
              <li>We are not responsible for the quality of work performed by contractors</li>
              <li>You are responsible for verifying any information before making decisions</li>
              <li>You assume all risk when acting on information from the Service</li>
              <li>We are not liable for any damages resulting from your use of the Service</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
              Email Integration
            </h2>
            <p className="text-neutral-600 mb-4">
              When you connect your Gmail or Outlook account, you authorize us to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-600">
              <li>Draft and send emails on your behalf</li>
              <li>Access emails related to your decision-making activities</li>
              <li>Store email content necessary for service functionality</li>
            </ul>
            <p className="mt-4 text-neutral-600">
              You can revoke this authorization at any time from your account settings.
            </p>
          </section>
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
              Acceptable Use
            </h2>
            <p className="text-neutral-600 mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-600">
              <li>Use the Service for any illegal purpose</li>
              <li>Upload malicious content or viruses</li>
              <li>Harass or spam other users</li>
              <li>Attempt to hack or compromise the Service</li>
              <li>Scrape or copy content without permission</li>
              <li>Create multiple accounts to abuse the free tier</li>
              <li>Impersonate others or provide false information</li>
            </ul>
          </section>
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
              Intellectual Property
            </h2>
            <p className="text-neutral-600 mb-4">
              The Service and its content (including text, graphics, logos, and software) are owned by OpportunIQ and protected by copyright and other intellectual property laws. You may not copy, modify, or distribute our content without permission.
            </p>
            <p className="text-neutral-600">
              You retain ownership of content you upload, but grant us a license to use it to provide the Service.
            </p>
          </section>
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
              Termination
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              We may suspend or terminate your account at any time for violations of these Terms or for any other reason. You may delete your account at any time from your account settings.
            </p>
          </section>
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
              Payment and Subscriptions
            </h2>
            <p className="text-neutral-600 mb-4">
              OpportunIQ offers a free tier and paid subscription plans. By subscribing to a paid plan:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-600">
              <li>You agree to pay the fees displayed at the time of purchase</li>
              <li>Subscriptions automatically renew unless cancelled</li>
              <li>Refunds are provided only as required by law</li>
              <li>We may change pricing with 30 days notice</li>
            </ul>
          </section>
          <section className="mb-10 p-6 bg-neutral-50 border border-neutral-200 rounded-xl">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
              Limitation of Liability
            </h2>
            <p className="font-semibold text-neutral-800 mb-4 uppercase text-sm tracking-wide">
              To the maximum extent permitted by law:
            </p>
            <p className="text-neutral-600 mb-4">
              OpportunIQ and its affiliates will not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-600">
              <li>Your use or inability to use the Service</li>
              <li>Decisions you make based on information from the Service</li>
              <li>Actions taken by contractors you hire</li>
              <li>Unauthorized access to your account or data</li>
              <li>Errors, mistakes, or inaccuracies in content</li>
            </ul>
          </section>
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
              Indemnification
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              You agree to indemnify and hold OpportunIQ harmless from any claims, damages, or expenses arising from your use of the Service, your violation of these Terms, or your violation of any rights of another.
            </p>
          </section>
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
              Governing Law
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              These Terms are governed by the laws of the State of California, without regard to its conflict of law provisions. Any disputes will be resolved in the courts of San Francisco County, California.
            </p>
          </section>
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
              Changes to Terms
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              We may modify these Terms at any time. We will notify you of material changes by email or through the Service. Your continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
              Contact Us
            </h2>
            <p className="text-neutral-600 leading-relaxed">
              If you have questions about these Terms, please contact us at:
            </p>
            <p className="mt-2">
              <a href="mailto:legal@opportuniq.app" className="text-teal-600 hover:text-teal-700 transition-colors">
                legal@opportuniq.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
