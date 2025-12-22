export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-6 py-24">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-8">Terms of Use</h1>
        <div className="prose prose-lg max-w-none space-y-6 [&_p]:text-foreground [&_li]:text-foreground [&_ul]:text-foreground [&_h2]:text-foreground [&_strong]:text-foreground">
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              Acceptance of Terms
            </h2>
            <p>
              By accessing or using Opportuniq ("the Service"), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              Description of Service
            </h2>
            <p>
              Opportuniq is a home maintenance decision-making platform that helps homeowners diagnose issues, find contractors, manage budgets, and make collaborative household decisions. Our service includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>AI-powered diagnostics for home maintenance issues</li>
              <li>Cost analysis and budget management</li>
              <li>DIY vs. hire recommendations</li>
              <li>Contractor search and outreach</li>
              <li>Email integration with Gmail and Outlook</li>
              <li>Household member collaboration and voting</li>
              <li>Tariff and pricing intelligence</li>
            </ul>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              User Accounts
            </h2>
            <p>
              You must create an account to use the Service. You are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
              <li>Providing accurate and complete information</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              Disclaimers and Limitations
            </h2>
            <p className="font-semibold text-foreground">
              IMPORTANT: Please read this section carefully.
            </p>
            <p className="mt-4">
              Opportuniq provides information and recommendations, but we are not licensed contractors, electricians, plumbers, or other professionals. Our AI-powered diagnostics and recommendations are for informational purposes only and should not replace professional advice.
            </p>
            <p className="mt-4">
              <strong>You acknowledge and agree that:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>We do not guarantee the accuracy of our AI diagnostics or cost estimates</li>
              <li>You should always consult licensed professionals for safety-critical issues</li>
              <li>We are not responsible for the quality of work performed by contractors</li>
              <li>Tariff and pricing information may not be current or accurate</li>
              <li>You assume all risk when acting on our recommendations</li>
              <li>We are not liable for any damages resulting from your use of the Service</li>
            </ul>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              Contractor Relationships
            </h2>
            <p>
              Opportuniq facilitates connections with contractors but does not employ, endorse, or guarantee any contractor. We are not responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The quality of contractor work</li>
              <li>Contractor licensing or insurance</li>
              <li>Disputes between you and contractors</li>
              <li>Contractor pricing or availability</li>
              <li>Any damages caused by contractor work</li>
            </ul>
            <p className="mt-4">
              You should verify contractor credentials, licenses, and insurance before hiring.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              Email Integration
            </h2>
            <p>
              When you connect your Gmail or Outlook account, you authorize us to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Draft and send emails on your behalf to contractors</li>
              <li>Access emails related to home maintenance communications</li>
              <li>Store email content necessary for service functionality</li>
            </ul>
            <p className="mt-4">
              You can revoke this authorization at any time from your account settings.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              Acceptable Use
            </h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Service for any illegal purpose</li>
              <li>Upload malicious content or viruses</li>
              <li>Harass or spam contractors or other users</li>
              <li>Attempt to hack or compromise the Service</li>
              <li>Scrape or copy content without permission</li>
              <li>Create multiple accounts to abuse the free tier</li>
              <li>Impersonate others or provide false information</li>
            </ul>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              Intellectual Property
            </h2>
            <p>
              The Service and its content (including text, graphics, logos, and software) are owned by Opportuniq and protected by copyright and other intellectual property laws. You may not copy, modify, or distribute our content without permission.
            </p>
            <p className="mt-4">
              You retain ownership of content you upload, but grant us a license to use it to provide the Service.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              Termination
            </h2>
            <p>
              We may suspend or terminate your account at any time for violations of these Terms or for any other reason. You may delete your account at any time from your account settings.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              Payment and Subscriptions
            </h2>
            <p>
              Opportuniq offers a free tier and paid subscription plans. By subscribing to a paid plan:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You agree to pay the fees displayed at the time of purchase</li>
              <li>Subscriptions automatically renew unless cancelled</li>
              <li>Refunds are provided only as required by law</li>
              <li>We may change pricing with 30 days notice</li>
            </ul>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              Limitation of Liability
            </h2>
            <p className="font-semibold text-foreground">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </p>
            <p className="mt-4">
              Opportuniq and its affiliates will not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Your use or inability to use the Service</li>
              <li>Any inaccurate AI diagnostics or recommendations</li>
              <li>Actions taken by contractors you hire</li>
              <li>Unauthorized access to your account or data</li>
              <li>Errors, mistakes, or inaccuracies in content</li>
            </ul>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              Indemnification
            </h2>
            <p>
              You agree to indemnify and hold Opportuniq harmless from any claims, damages, or expenses arising from your use of the Service, your violation of these Terms, or your violation of any rights of another.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              Governing Law
            </h2>
            <p>
              These Terms are governed by the laws of the State of California, without regard to its conflict of law provisions. Any disputes will be resolved in the courts of San Francisco County, California.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              Changes to Terms
            </h2>
            <p>
              We may modify these Terms at any time. We will notify you of material changes by email or through the Service. Your continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              Contact Us
            </h2>
            <p>
              If you have questions about these Terms, please contact us at:
            </p>
            <p className="mt-2">
              Email: legal@opportuniq.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
