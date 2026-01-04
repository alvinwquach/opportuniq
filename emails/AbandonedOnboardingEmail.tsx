import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface AbandonedOnboardingEmailProps {
  name: string;
  onboardingUrl: string;
}

export const AbandonedOnboardingEmail = ({
  name = 'there',
  onboardingUrl = 'https://opportuniq.app/onboarding',
}: AbandonedOnboardingEmailProps) => {
  const firstName = name.split(' ')[0] || 'there';

  return (
    <Html>
      <Head />
      <Preview>You're one step away from instant home repair guidance</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Img
              src={`${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}/opportuniq-logo.png`}
              width="48"
              height="48"
              alt="OpportunIQ"
              style={logoImage}
            />
          </Section>
          <Section style={contentCard}>
            <Heading style={heroTitle}>You're almost there, {firstName}</Heading>
            <Text style={heroSubtitle}>
              You started setting up OpportunIQ, but didn't finish. Just add your ZIP code (takes 20 seconds) to unlock:
            </Text>
            <Section style={valueSection}>
              <div style={valueItem}>
                <Text style={valueText}>✓ Local contractors and accurate pricing for your area</Text>
              </div>
              <div style={valueItem}>
                <Text style={valueText}>✓ Instant cost comparisons: DIY vs. hire a pro</Text>
              </div>
              <div style={valueItem}>
                <Text style={valueText}>✓ Step-by-step repair guides personalized to your location</Text>
              </div>
            </Section>
            <Section style={ctaSection}>
              <Link href={onboardingUrl} style={button}>
                Finish setup →
              </Link>
            </Section>
            <Text style={ctaSubtext}>
              20 seconds to complete • No payment required
            </Text>
            <Section style={socialProof}>
              <Text style={socialProofText}>
                "30 seconds to finish setup. Got 3 contractor quotes for my roof repair within 2 hours. Worth it."
              </Text>
              <Text style={socialProofAuthor}>— Roy, Sacramento</Text>
            </Section>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              Need help? Just reply to this email.
            </Text>
            <Text style={footerLinks}>
              <Link href="https://opportuniq.app" style={footerLink}>OpportunIQ</Link>
              {' • '}
              <Link href="https://opportuniq.app/help" style={footerLink}>Help</Link>
              {' • '}
              <Link href="https://opportuniq.app/unsubscribe" style={footerLink}>Unsubscribe</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default AbandonedOnboardingEmail;

const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: '40px 0',
};

const container = {
  margin: '0 auto',
  maxWidth: '560px',
};
const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const logoImage = {
  margin: '0 auto',
  display: 'block',
};

const contentCard = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  padding: '48px 40px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  marginBottom: '24px',
};

const heroTitle = {
  fontSize: '26px',
  fontWeight: '700',
  color: '#0f172a',
  margin: '0 0 12px 0',
  textAlign: 'center' as const,
  letterSpacing: '-0.025em',
  lineHeight: '1.2',
};

const heroSubtitle = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#64748b',
  margin: '0 0 28px 0',
  textAlign: 'center' as const,
};

const valueSection = {
  marginBottom: '32px',
};

const valueItem = {
  marginBottom: '12px',
};

const valueText = {
  fontSize: '15px',
  color: '#475569',
  margin: '0',
  lineHeight: '22px',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '0 0 16px 0',
};

const button = {
  display: 'inline-block',
  background: '#06b6d4',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '18px 48px',
  borderRadius: '12px',
  boxShadow: '0 10px 25px -5px rgba(6, 182, 212, 0.4), 0 8px 10px -6px rgba(6, 182, 212, 0.4)',
};

const ctaSubtext = {
  fontSize: '13px',
  color: '#94a3b8',
  textAlign: 'center' as const,
  margin: '0 0 32px 0',
  lineHeight: '18px',
};

const socialProof = {
  backgroundColor: '#f8fafc',
  borderLeft: '3px solid #06b6d4',
  padding: '20px 24px',
  borderRadius: '0 8px 8px 0',
};

const socialProofText = {
  fontSize: '15px',
  fontStyle: 'italic',
  color: '#1e293b',
  margin: '0 0 8px 0',
  lineHeight: '22px',
};

const socialProofAuthor = {
  fontSize: '13px',
  color: '#64748b',
  margin: '0',
};

const footer = {
  textAlign: 'center' as const,
  padding: '0 20px',
};

const footerText = {
  fontSize: '13px',
  color: '#94a3b8',
  margin: '0 0 12px 0',
  lineHeight: '18px',
};

const footerLinks = {
  fontSize: '12px',
  color: '#cbd5e1',
  margin: '0',
};

const footerLink = {
  color: '#94a3b8',
  textDecoration: 'none',
};
