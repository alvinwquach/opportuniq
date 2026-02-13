import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  description:
    "How OpportunIQ collects, uses, and protects your information. Account data, usage analytics, and your rights.",
  path: "/privacy-policy",
});

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="mx-auto max-w-4xl px-6 pt-32 pb-24">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-mono mb-6">
          Legal
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Privacy Policy</h1>
        <p className="text-sm text-neutral-500 mb-12">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        <div className="prose prose-lg prose-invert max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Introduction
            </h2>
            <p className="text-neutral-400 leading-relaxed">
              OpportunIQ (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our decision-support platform.
            </p>
          </section>
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Information We Collect
            </h2>
            <p className="text-neutral-400 mb-4">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-400">
              <li>Account information (name, email address, password)</li>
              <li>Issues and related photos/videos you upload</li>
              <li>Your time value and decision preferences</li>
              <li>Email integration data (when you connect Gmail or Outlook)</li>
              <li>Decision history and outcomes you log</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">
              How We Use Your Information
            </h2>
            <p className="text-neutral-400 mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-400">
              <li>Provide and improve our services</li>
              <li>Frame decisions and calculate opportunity costs</li>
              <li>Generate cost and time estimates</li>
              <li>Store and organize your decision history</li>
              <li>Draft emails and communications on your behalf</li>
              <li>Process household collaboration features</li>
              <li>Send you updates and notifications</li>
            </ul>
          </section>
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Email Integration
            </h2>
            <p className="text-neutral-400 leading-relaxed">
              When you connect your Gmail or Outlook account, we access your email to draft and send messages on your behalf. We only access emails related to your decision-making activities. You can revoke email access at any time from your account settings.
            </p>
          </section>
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Data Storage and Security
            </h2>
            <p className="text-neutral-400 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information. Your data is encrypted in transit and at rest. We store your information on secure servers and restrict access to authorized personnel only.
            </p>
          </section>
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Sharing Your Information
            </h2>
            <p className="text-neutral-400 mb-4">We may share your information with:</p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-400">
              <li>Service providers who assist in operating our platform</li>
              <li>Other household members you&apos;ve added to your account</li>
              <li>Law enforcement when required by law</li>
            </ul>
            <p className="mt-4 text-neutral-400">
              We do not sell your personal information to third parties.
            </p>
          </section>
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Your Rights
            </h2>
            <p className="text-neutral-400 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-neutral-400">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Revoke email integration permissions</li>
            </ul>
          </section>
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Cookies and Tracking
            </h2>
            <p className="text-neutral-400 leading-relaxed">
              We use cookies and similar technologies to improve your experience, analyze usage, and personalize content. You can control cookie settings through your browser preferences.
            </p>
          </section>
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Children&apos;s Privacy
            </h2>
            <p className="text-neutral-400 leading-relaxed">
              Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
            </p>
          </section>
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Changes to This Policy
            </h2>
            <p className="text-neutral-400 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Contact Us
            </h2>
            <p className="text-neutral-400 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-2">
              <a href="mailto:privacy@opportuniq.com" className="text-teal-400 hover:text-teal-300 transition-colors">
                privacy@opportuniq.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
