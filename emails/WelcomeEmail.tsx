import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  name: string;
  postalCode: string;
  searchRadius: number;
  dashboardUrl: string;
}

export const WelcomeEmail = ({
  name = 'there',
  postalCode = '94102',
  searchRadius = 25,
  dashboardUrl = 'https://opportuniq.app/dashboard',
}: WelcomeEmailProps) => {
  const firstName = name.split(' ')[0] || 'there';

  return (
    <Html>
      <Head />
      <Preview>Your account is ready. Start making smarter decisions today.</Preview>
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
            <Heading style={heroTitle}>Welcome, {firstName}!</Heading>
            <Text style={heroSubtitle}>
              Your OpportunIQ account is ready. You&apos;re now equipped to make smarter decisions on repairs, purchases, and projects.
            </Text>
            <Section style={valueSection}>
              <div style={valueItem}>
                <Text style={valueIcon}>1</Text>
                <div>
                  <Text style={valueTitle}>Report an Issue</Text>
                  <Text style={valueDesc}>Upload a photo or describe your problem in any language</Text>
                </div>
              </div>
              <div style={valueItem}>
                <Text style={valueIcon}>2</Text>
                <div>
                  <Text style={valueTitle}>Get Options</Text>
                  <Text style={valueDesc}>DIY, hire a pro, or defer—with costs and risks explained</Text>
                </div>
              </div>
              <div style={valueItem}>
                <Text style={valueIcon}>3</Text>
                <div>
                  <Text style={valueTitle}>Decide with Confidence</Text>
                  <Text style={valueDesc}>Make informed choices backed by data, not guesswork</Text>
                </div>
              </div>
            </Section>
            <Section style={ctaSection}>
              <Link href={dashboardUrl} style={button}>
                Go to Dashboard
              </Link>
            </Section>
            <Text style={ctaSubtext}>
              Your search area: {searchRadius} miles from {postalCode}
            </Text>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              Questions? Reply to this email—we read every message.
            </Text>
            <Text style={footerLinks}>
              <Link href="https://opportuniq.app" style={footerLink}>OpportunIQ</Link>
              {' • '}
              <Link href="https://opportuniq.app/help" style={footerLink}>Help</Link>
              {' • '}
              <Link href="https://opportuniq.app/settings" style={footerLink}>Settings</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;


const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: '40px 0',
};

const container = {
  margin: '0 auto',
  maxWidth: '480px',
};

const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const logoImage = {
  margin: '0 auto',
  display: 'block',
};

const contentCard = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  padding: '40px 32px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  marginBottom: '24px',
};

const heroTitle = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#0f172a',
  margin: '0 0 12px 0',
  textAlign: 'center' as const,
  letterSpacing: '-0.025em',
};

const heroSubtitle = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#64748b',
  margin: '0 0 32px 0',
  textAlign: 'center' as const,
};

const valueSection = {
  marginBottom: '32px',
};

const valueItem = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '16px',
  marginBottom: '20px',
};

const valueIcon = {
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  backgroundColor: '#06b6d4',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '700',
  textAlign: 'center' as const,
  lineHeight: '28px',
  margin: '0',
  flexShrink: 0,
};

const valueTitle = {
  fontSize: '15px',
  fontWeight: '600',
  color: '#0f172a',
  margin: '0 0 4px 0',
};

const valueDesc = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0',
  lineHeight: '20px',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '0 0 16px 0',
};

const button = {
  display: 'inline-block',
  background: '#06b6d4',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '14px 32px',
  borderRadius: '10px',
  boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)',
};

const ctaSubtext = {
  fontSize: '13px',
  color: '#94a3b8',
  textAlign: 'center' as const,
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
