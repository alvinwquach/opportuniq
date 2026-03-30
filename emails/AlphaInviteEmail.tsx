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

interface AlphaInviteEmailProps {
  inviteUrl: string;
  expiresIn?: string;
}

export const AlphaInviteEmail = ({
  inviteUrl = 'https://opportuniq.app/join?token=abc123',
  expiresIn = '7 days',
}: AlphaInviteEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Kevin and Alvin invite you to join OpportunIQ Alpha</Preview>
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
            <Section style={badgeSection}>
              <Text style={badge}>ALPHA ACCESS</Text>
            </Section>
            <Heading style={heroTitle}>Welcome to OpportunIQ</Heading>
            <Text style={heroSubtitle}>
              We&apos;re Kevin and Alvin, the founders of OpportunIQ. We built this because we believe everyone deserves access to better decision-making tools—not just those who can afford expensive consultants or have the right connections.
            </Text>
            <Section style={storySection}>
              <Text style={storyText}>
                OpportunIQ started from a simple observation: the best decisions come from having the right information at the right time. We&apos;ve spent years building systems that help people navigate complex choices with confidence.
              </Text>
              <Text style={storyText}>
                As an alpha member, you&apos;re joining us at the beginning. Your feedback will directly shape what OpportunIQ becomes. We read every response and take your input seriously.
              </Text>
            </Section>
            <Section style={benefitsSection}>
              <Text style={benefitsTitle}>What you&apos;ll get</Text>
              <div style={benefitItem}>
                <Text style={benefitIcon}>•</Text>
                <Text style={benefitText}>Early access to new features before public release</Text>
              </div>
              <div style={benefitItem}>
                <Text style={benefitIcon}>•</Text>
                <Text style={benefitText}>Direct communication with our founding team</Text>
              </div>
              <div style={benefitItem}>
                <Text style={benefitIcon}>•</Text>
                <Text style={benefitText}>Influence over product direction and roadmap</Text>
              </div>
            </Section>
            <Section style={ctaSection}>
              <Link href={inviteUrl} style={button}>
                Accept Invitation
              </Link>
            </Section>
            <Text style={ctaSubtext}>
              This invite expires in {expiresIn}
            </Text>
            <Section style={signatureSection}>
              <Text style={signatureText}>
                Looking forward to building this with you,
              </Text>
              <Text style={signatureNames}>
                Kevin & Alvin
              </Text>
              <Text style={signatureTitle}>
                Founders, OpportunIQ
              </Text>
            </Section>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              Questions? Reply directly to this email—it goes straight to us.
            </Text>
            <Text style={footerLinks}>
              <Link href="https://opportuniq.app" style={footerLink}>OpportunIQ</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default AlphaInviteEmail;

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

const badgeSection = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const badge = {
  display: 'inline-block',
  backgroundColor: '#fef3c7',
  color: '#d97706',
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '0.1em',
  padding: '6px 12px',
  borderRadius: '20px',
  margin: '0',
};

const heroTitle = {
  fontSize: '28px',
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
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
};

const storySection = {
  marginBottom: '24px',
};

const storyText = {
  fontSize: '15px',
  lineHeight: '26px',
  color: '#475569',
  margin: '0 0 16px 0',
};

const benefitsSection = {
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '32px',
};

const benefitsTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#0f172a',
  margin: '0 0 16px 0',
};

const benefitItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '12px',
};

const benefitIcon = {
  color: '#0891b2',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0',
  width: '20px',
  flexShrink: 0,
};

const benefitText = {
  fontSize: '14px',
  color: '#475569',
  margin: '0',
  lineHeight: '20px',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '0 0 16px 0',
};

const button = {
  display: 'inline-block',
  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
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

const signatureSection = {
  marginTop: '32px',
  paddingTop: '24px',
  borderTop: '1px solid #e2e8f0',
};

const signatureText = {
  fontSize: '15px',
  color: '#475569',
  margin: '0 0 8px 0',
  lineHeight: '24px',
};

const signatureNames = {
  fontSize: '15px',
  fontWeight: '600',
  color: '#0f172a',
  margin: '0 0 4px 0',
};

const signatureTitle = {
  fontSize: '13px',
  color: '#94a3b8',
  margin: '0',
};
