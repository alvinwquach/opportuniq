import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface WaitlistLaunchEmailProps {
  name?: string;
  signupUrl?: string;
  position?: number;
}

export const WaitlistLaunchEmail = ({
  name = 'there',
  signupUrl = 'https://opportuniq.app/join',
  position,
}: WaitlistLaunchEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>We&apos;re live! Your spot is ready - join OpportunIQ now</Preview>
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
              <Text style={badge}>YOU&apos;RE IN</Text>
            </Section>
            <Heading style={heroTitle}>The Wait Is Over</Heading>
            <Text style={heroSubtitle}>
              Hey {name}, you signed up for the waitlist{position ? ` as #${position}` : ''} and we haven&apos;t forgotten about you. OpportunIQ is now live and your spot is ready.
            </Text>
            <Section style={highlightBox}>
              <Text style={highlightLabel}>Your Access Is Ready</Text>
              <Text style={highlightText}>
                No more waiting. Click below to create your account and start making smarter decisions today.
              </Text>
            </Section>
            <Section style={benefitsSection}>
              <Text style={benefitsTitle}>What you&apos;ve been waiting for</Text>
              <Row style={benefitRow}>
                <Column style={benefitIconColumn}>
                  <Text style={benefitIcon}>+</Text>
                </Column>
                <Column>
                  <Text style={benefitText}>AI-powered decision support for everyday choices</Text>
                </Column>
              </Row>
              <Row style={benefitRow}>
                <Column style={benefitIconColumn}>
                  <Text style={benefitIcon}>+</Text>
                </Column>
                <Column>
                  <Text style={benefitText}>Track and learn from your past decisions</Text>
                </Column>
              </Row>
              <Row style={benefitRow}>
                <Column style={benefitIconColumn}>
                  <Text style={benefitIcon}>+</Text>
                </Column>
                <Column>
                  <Text style={benefitText}>Collaborate with family and groups</Text>
                </Column>
              </Row>
            </Section>
            <Section style={ctaSection}>
              <Link href={signupUrl} style={button}>
                Claim Your Spot
              </Link>
            </Section>
            <Text style={ctaSubtext}>
              Your waitlist position has been honored
            </Text>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              Thank you for your patience. We can&apos;t wait to see what you&apos;ll accomplish.
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

export default WaitlistLaunchEmail;

const main = {
  backgroundColor: '#111111',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: '40px 20px',
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
  backgroundColor: '#1a1a1a',
  borderRadius: '16px',
  padding: '40px 32px',
  border: '1px solid #333333',
  marginBottom: '24px',
};

const badgeSection = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const badge = {
  display: 'inline-block',
  backgroundColor: 'rgba(34, 197, 94, 0.15)',
  color: '#22c55e',
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '0.15em',
  padding: '8px 16px',
  borderRadius: '20px',
  margin: '0',
  border: '1px solid rgba(34, 197, 94, 0.3)',
};

const heroTitle = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#ffffff',
  margin: '0 0 12px 0',
  textAlign: 'center' as const,
  letterSpacing: '-0.025em',
};

const heroSubtitle = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#cccccc',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
};

const highlightBox = {
  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const highlightLabel = {
  fontSize: '11px',
  fontWeight: '600',
  color: 'rgba(255, 255, 255, 0.9)',
  margin: '0 0 8px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.15em',
};

const highlightText = {
  fontSize: '14px',
  color: '#ffffff',
  margin: '0',
  lineHeight: '22px',
};

const benefitsSection = {
  backgroundColor: '#222222',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '32px',
  border: '1px solid #333333',
};

const benefitsTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#ffffff',
  margin: '0 0 16px 0',
};

const benefitRow = {
  marginBottom: '14px',
};

const benefitIconColumn = {
  width: '24px',
  verticalAlign: 'top' as const,
};

const benefitIcon = {
  color: '#22c55e',
  fontSize: '14px',
  fontWeight: '700',
  margin: '0',
  paddingTop: '2px',
};

const benefitText = {
  fontSize: '14px',
  color: '#dddddd',
  margin: '0',
  lineHeight: '20px',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '0 0 16px 0',
};

const button = {
  display: 'inline-block',
  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '16px 40px',
  borderRadius: '10px',
  boxShadow: '0 4px 16px rgba(34, 197, 94, 0.4)',
};

const ctaSubtext = {
  fontSize: '13px',
  color: '#999999',
  textAlign: 'center' as const,
  margin: '0',
};

const footer = {
  textAlign: 'center' as const,
  padding: '0 20px',
};

const footerText = {
  fontSize: '13px',
  color: '#999999',
  margin: '0 0 12px 0',
  lineHeight: '18px',
};

const footerLinks = {
  fontSize: '12px',
  color: '#888888',
  margin: '0',
};

const footerLink = {
  color: '#999999',
  textDecoration: 'none',
};
