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

interface WaitlistConfirmationEmailProps {
  name?: string;
  position?: number;
  referralCode?: string;
  referralUrl?: string;
}

export const WaitlistConfirmationEmail = ({
  name = 'there',
  position = 1,
  referralCode = 'ABC123',
  referralUrl = 'https://opportuniq.app?ref=ABC123',
}: WaitlistConfirmationEmailProps) => {
  const firstName = name?.split(' ')[0] || 'there';

  return (
    <Html>
      <Head />
      <Preview>You&apos;re on the OpportunIQ waitlist! Here&apos;s how to move up</Preview>
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
            <Section style={iconSection}>
              <Text style={checkIcon}>&#10003;</Text>
            </Section>
            <Heading style={heroTitle}>You&apos;re on the List!</Heading>
            <Text style={heroSubtitle}>
              Hey {firstName}, thanks for joining the OpportunIQ waitlist. We&apos;re building something special and can&apos;t wait to have you on board.
            </Text>
            <Section style={positionBox}>
              <Text style={positionLabel}>Your Waitlist Position</Text>
              <Text style={positionNumber}>#{position}</Text>
              <Text style={positionSubtext}>
                We&apos;re letting people in on a rolling basis
              </Text>
            </Section>
            <Section style={referralSection}>
              <Text style={referralTitle}>Want to skip the line?</Text>
              <Text style={referralDescription}>
                Share your unique referral link. For each friend who joins, you&apos;ll move up the waitlist and unlock exclusive rewards.
              </Text>
              <Section style={referralCodeBox}>
                <Text style={referralCodeLabel}>Your Referral Code</Text>
                <Text style={referralCodeValue}>{referralCode}</Text>
              </Section>
              <Section style={ctaSection}>
                <Link href={referralUrl} style={button}>
                  Share Your Link
                </Link>
              </Section>
            </Section>
            <Section style={expectSection}>
              <Text style={expectTitle}>What to Expect</Text>
              <div style={expectItem}>
                <Text style={expectIcon}>&#128231;</Text>
                <Text style={expectText}>We&apos;ll email you when it&apos;s your turn</Text>
              </div>
              <div style={expectItem}>
                <Text style={expectIcon}>&#9889;</Text>
                <Text style={expectText}>Early access to smart decision making tools</Text>
              </div>
              <div style={expectItem}>
                <Text style={expectIcon}>&#127873;</Text>
                <Text style={expectText}>Exclusive perks for early supporters</Text>
              </div>
            </Section>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              Have questions? Reply to this email - we read every message.
            </Text>
            <Text style={footerLinks}>
              <Link href="https://opportuniq.app" style={footerLink}>OpportunIQ</Link>
              {' | '}
              <Link href="https://twitter.com/opportuniq" style={footerLink}>Twitter</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WaitlistConfirmationEmail;

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

const iconSection = {
  textAlign: 'center' as const,
  marginBottom: '16px',
};

const checkIcon = {
  display: 'inline-block',
  width: '48px',
  height: '48px',
  lineHeight: '48px',
  backgroundColor: '#10b981',
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '700',
  borderRadius: '50%',
  margin: '0',
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

const positionBox = {
  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const positionLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: 'rgba(255, 255, 255, 0.8)',
  margin: '0 0 4px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
};

const positionNumber = {
  fontSize: '48px',
  fontWeight: '700',
  color: '#ffffff',
  margin: '0',
  lineHeight: '1',
};

const positionSubtext = {
  fontSize: '13px',
  color: 'rgba(255, 255, 255, 0.9)',
  margin: '8px 0 0 0',
};

const referralSection = {
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
};

const referralTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#0f172a',
  margin: '0 0 8px 0',
  textAlign: 'center' as const,
};

const referralDescription = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0 0 20px 0',
  textAlign: 'center' as const,
  lineHeight: '20px',
};

const referralCodeBox = {
  backgroundColor: '#ffffff',
  border: '2px dashed #e2e8f0',
  borderRadius: '8px',
  padding: '16px',
  textAlign: 'center' as const,
  marginBottom: '16px',
};

const referralCodeLabel = {
  fontSize: '11px',
  fontWeight: '600',
  color: '#94a3b8',
  margin: '0 0 4px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
};

const referralCodeValue = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#06b6d4',
  margin: '0',
  letterSpacing: '0.1em',
};

const ctaSection = {
  textAlign: 'center' as const,
};

const button = {
  display: 'inline-block',
  background: '#06b6d4',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '12px 24px',
  borderRadius: '8px',
};

const expectSection = {
  borderTop: '1px solid #e2e8f0',
  paddingTop: '24px',
};

const expectTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#0f172a',
  margin: '0 0 16px 0',
};

const expectItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '10px',
};

const expectIcon = {
  fontSize: '16px',
  margin: '0',
  width: '24px',
};

const expectText = {
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
