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

interface BetaLaunchWeekendEmailProps {
  name?: string;
  dashboardUrl?: string;
}

export const BetaLaunchWeekendEmail = ({
  name = 'there',
  dashboardUrl = 'https://opportuniq.app/dashboard',
}: BetaLaunchWeekendEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Beta Launch Weekend: Live Q&A with the founders - Jan 3-4</Preview>
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
              <Text style={badge}>BETA LAUNCH WEEKEND</Text>
            </Section>
            <Heading style={heroTitle}>You're In!</Heading>
            <Text style={heroSubtitle}>
              Welcome to OpportunIQ, {name}. You've joined during our beta launch weekend—and that means something special.
            </Text>
            <Section style={highlightBox}>
              <Text style={highlightLabel}>Live Q&A with the Founders</Text>
              <Text style={highlightText}>
                From now until <strong>January 4th at 11:59 PM PST</strong>, one of our two founders will be online to answer any questions you have via live chat.
              </Text>
            </Section>
            <Section style={detailsSection}>
              <Text style={detailsTitle}>How it works</Text>
              <Row style={detailRow}>
                <Column style={detailIconColumn}>
                  <Text style={detailIcon}>1</Text>
                </Column>
                <Column>
                  <Text style={detailText}>Head to your dashboard and look for the chat icon</Text>
                </Column>
              </Row>
              <Row style={detailRow}>
                <Column style={detailIconColumn}>
                  <Text style={detailIcon}>2</Text>
                </Column>
                <Column>
                  <Text style={detailText}>Ask us anything—product questions, feature requests, feedback</Text>
                </Column>
              </Row>
              <Row style={detailRow}>
                <Column style={detailIconColumn}>
                  <Text style={detailIcon}>3</Text>
                </Column>
                <Column>
                  <Text style={detailText}>Get a real response from a real founder, not a bot</Text>
                </Column>
              </Row>
            </Section>
            <Section style={timeframeBox}>
              <Text style={timeframeLabel}>Launch Weekend Window</Text>
              <Text style={timeframeText}>
                January 3rd (all day) – January 4th, 11:59 PM PST
              </Text>
            </Section>
            <Section style={ctaSection}>
              <Link href={dashboardUrl} style={button}>
                Open Dashboard
              </Link>
            </Section>
            <Text style={ctaSubtext}>
              We're excited to hear from you
            </Text>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              This is a limited-time opportunity during beta launch weekend only.
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

export default BetaLaunchWeekendEmail;

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
  backgroundColor: 'rgba(94, 234, 212, 0.15)',
  color: '#5eead4',
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '0.15em',
  padding: '8px 16px',
  borderRadius: '20px',
  margin: '0',
  border: '1px solid rgba(94, 234, 212, 0.3)',
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
  background: 'linear-gradient(135deg, #5eead4 0%, #2dd4bf 100%)',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const highlightLabel = {
  fontSize: '11px',
  fontWeight: '600',
  color: 'rgba(0, 0, 0, 0.7)',
  margin: '0 0 8px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.15em',
};

const highlightText = {
  fontSize: '14px',
  color: '#0a0a0a',
  margin: '0',
  lineHeight: '22px',
};

const detailsSection = {
  backgroundColor: '#222222',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
  border: '1px solid #333333',
};

const detailsTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#ffffff',
  margin: '0 0 16px 0',
};

const detailRow = {
  marginBottom: '14px',
};

const detailIconColumn = {
  width: '32px',
  verticalAlign: 'top' as const,
};

const detailIcon = {
  backgroundColor: '#5eead4',
  color: '#0a0a0a',
  fontSize: '12px',
  fontWeight: '700',
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  textAlign: 'center' as const,
  lineHeight: '24px',
  margin: '0',
};

const detailText = {
  fontSize: '14px',
  color: '#dddddd',
  margin: '0',
  lineHeight: '24px',
};

const timeframeBox = {
  backgroundColor: '#222222',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '32px',
  border: '1px solid #333333',
  textAlign: 'center' as const,
};

const timeframeLabel = {
  fontSize: '10px',
  fontWeight: '700',
  color: '#5eead4',
  margin: '0 0 8px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.2em',
};

const timeframeText = {
  fontSize: '15px',
  fontWeight: '600',
  color: '#ffffff',
  margin: '0',
  lineHeight: '20px',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '0 0 16px 0',
};

const button = {
  display: 'inline-block',
  background: 'linear-gradient(135deg, #5eead4 0%, #2dd4bf 100%)',
  color: '#0a0a0a',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '16px 40px',
  borderRadius: '10px',
  boxShadow: '0 4px 16px rgba(94, 234, 212, 0.4)',
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
