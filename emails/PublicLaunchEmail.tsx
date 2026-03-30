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

interface PublicLaunchEmailProps {
  name?: string;
  dashboardUrl?: string;
  referralCode?: string;
}

export const PublicLaunchEmail = ({
  name = 'there',
  dashboardUrl = 'https://opportuniq.app/dashboard',
  referralCode,
}: PublicLaunchEmailProps) => {
  const referralUrl = referralCode
    ? `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}?ref=${referralCode}`
    : undefined;

  return (
    <Html>
      <Head />
      <Preview>OpportunIQ is now public - thank you for being an early believer</Preview>
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
              <Text style={badge}>WE&apos;RE PUBLIC</Text>
            </Section>
            <Heading style={heroTitle}>We Made It</Heading>
            <Text style={heroSubtitle}>
              Hey {name}, today marks a huge milestone. OpportunIQ is officially open to the world—and you were here before it all began.
            </Text>
            <Section style={thankYouBox}>
              <Text style={thankYouLabel}>Thank You</Text>
              <Text style={thankYouText}>
                Your early support, feedback, and belief in what we&apos;re building made this possible. You&apos;re not just a user—you&apos;re part of the story.
              </Text>
            </Section>
            <Section style={statsSection}>
              <Text style={statsTitle}>What&apos;s next</Text>
              <Row style={statRow}>
                <Column style={statIconColumn}>
                  <Text style={statIcon}>1</Text>
                </Column>
                <Column>
                  <Text style={statText}>We&apos;re scaling up to welcome thousands of new users</Text>
                </Column>
              </Row>
              <Row style={statRow}>
                <Column style={statIconColumn}>
                  <Text style={statIcon}>2</Text>
                </Column>
                <Column>
                  <Text style={statText}>New features dropping based on your feedback</Text>
                </Column>
              </Row>
              <Row style={statRow}>
                <Column style={statIconColumn}>
                  <Text style={statIcon}>3</Text>
                </Column>
                <Column>
                  <Text style={statText}>Your early adopter status is locked in forever</Text>
                </Column>
              </Row>
            </Section>
            {referralUrl && (
              <Section style={referralBox}>
                <Text style={referralLabel}>Spread the Word</Text>
                <Text style={referralText}>
                  Know someone who&apos;d love OpportunIQ? Share your personal link:
                </Text>
                <Text style={referralLink}>{referralUrl}</Text>
              </Section>
            )}
            <Section style={ctaSection}>
              <Link href={dashboardUrl} style={button}>
                Go to Dashboard
              </Link>
            </Section>
            <Text style={ctaSubtext}>
              Here&apos;s to many more milestones together
            </Text>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              From the entire OpportunIQ team—thank you.
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

export default PublicLaunchEmail;

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
  backgroundColor: 'rgba(168, 85, 247, 0.15)',
  color: '#a855f7',
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '0.15em',
  padding: '8px 16px',
  borderRadius: '20px',
  margin: '0',
  border: '1px solid rgba(168, 85, 247, 0.3)',
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

const thankYouBox = {
  background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const thankYouLabel = {
  fontSize: '11px',
  fontWeight: '600',
  color: 'rgba(255, 255, 255, 0.9)',
  margin: '0 0 8px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.15em',
};

const thankYouText = {
  fontSize: '14px',
  color: '#ffffff',
  margin: '0',
  lineHeight: '22px',
};

const statsSection = {
  backgroundColor: '#222222',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
  border: '1px solid #333333',
};

const statsTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#ffffff',
  margin: '0 0 16px 0',
};

const statRow = {
  marginBottom: '14px',
};

const statIconColumn = {
  width: '32px',
  verticalAlign: 'top' as const,
};

const statIcon = {
  backgroundColor: '#a855f7',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: '700',
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  textAlign: 'center' as const,
  lineHeight: '24px',
  margin: '0',
};

const statText = {
  fontSize: '14px',
  color: '#dddddd',
  margin: '0',
  lineHeight: '24px',
};

const referralBox = {
  backgroundColor: '#222222',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '32px',
  border: '1px solid #333333',
  textAlign: 'center' as const,
};

const referralLabel = {
  fontSize: '10px',
  fontWeight: '700',
  color: '#a855f7',
  margin: '0 0 8px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.2em',
};

const referralText = {
  fontSize: '13px',
  color: '#cccccc',
  margin: '0 0 12px 0',
  lineHeight: '20px',
};

const referralLink = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#a855f7',
  margin: '0',
  wordBreak: 'break-all' as const,
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '0 0 16px 0',
};

const button = {
  display: 'inline-block',
  background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '16px 40px',
  borderRadius: '10px',
  boxShadow: '0 4px 16px rgba(168, 85, 247, 0.4)',
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
