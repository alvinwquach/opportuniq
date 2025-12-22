export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-6 py-24">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-lg max-w-none space-y-6 [&_p]:text-foreground [&_li]:text-foreground [&_ul]:text-foreground [&_h2]:text-foreground [&_strong]:text-foreground">
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">
              Introduction
            </h2>
            <p>
              Opportuniq ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our home maintenance decision-making platform.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              Information We Collect
            </h2>
            <p>We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account information (name, email address, password)</li>
              <li>Home maintenance issues and related photos/videos you upload</li>
              <li>Budget and household member information</li>
              <li>Email integration data (when you connect Gmail or Outlook)</li>
              <li>Communication with contractors through our platform</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              How We Use Your Information
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and improve our services</li>
              <li>Diagnose home maintenance issues using AI</li>
              <li>Generate cost estimates and recommendations</li>
              <li>Connect you with qualified contractors</li>
              <li>Draft emails and communications on your behalf</li>
              <li>Process household voting and decision-making</li>
              <li>Provide tariff and pricing intelligence</li>
              <li>Send you updates and notifications</li>
            </ul>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              Email Integration
            </h2>
            <p>
              When you connect your Gmail or Outlook account, we access your email to draft and send messages to contractors on your behalf. We only access emails related to home maintenance and contractor communications. You can revoke email access at any time from your account settings.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              Data Storage and Security
            </h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information. Your data is encrypted in transit and at rest. We store your information on secure servers and restrict access to authorized personnel only.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              Sharing Your Information
            </h2>
            <p>We may share your information with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Contractors you choose to contact</li>
              <li>Service providers who assist in operating our platform</li>
              <li>Other household members you've added to your account</li>
              <li>Law enforcement when required by law</li>
            </ul>
            <p className="mt-4">
              We do not sell your personal information to third parties.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Revoke email integration permissions</li>
            </ul>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              Cookies and Tracking
            </h2>
            <p>
              We use cookies and similar technologies to improve your experience, analyze usage, and personalize content. You can control cookie settings through your browser preferences.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              Children's Privacy
            </h2>
            <p>
              Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>
          <section>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-2">
              Email: privacy@opportuniq.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
