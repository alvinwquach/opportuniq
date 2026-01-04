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

interface ReferralReminderEmailProps {
  name?: string;
  referralCode: string;
  referralCount?: number;
  dashboardUrl?: string;
}

export const ReferralReminderEmail = ({
  name = 'there',
  referralCode,
  referralCount = 0,
  dashboardUrl = 'https://opportuniq.app/dashboard',
}: ReferralReminderEmailProps) => {
  const referralUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://opportuniq.app"}?ref=${referralCode}`;

  return (
    <Html>
      <Head />
      <Preview>Share OpportunIQ with friends - they'll thank you later</Preview>
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
              <Text style={badge}>INVITE FRIENDS</Text>
            </Section>
            <Heading style={heroTitle}>Share the Love</Heading>
            <Text style={heroSubtitle}>
              Hey {name}, know someone who could use OpportunIQ? You have the power to get them in.
            </Text>
            {referralCount > 0 && (
              <Section style={statsBox}>
                <Text style={statsNumber}>{referralCount}</Text>
                <Text style={statsLabel}>
                  {referralCount === 1 ? 'friend has joined' : 'friends have joined'} through your link
                </Text>
              </Section>
            )}
            <Section style={linkBox}>
              <Text style={linkLabel}>Your Personal Invite Link</Text>
              <Text style={linkUrl}>{referralUrl}</Text>
              <Text style={linkHint}>Share this link anywhere—social, text, email</Text>
            </Section>
            <Section style={benefitsSection}>
              <Text style={benefitsTitle}>Why invite friends?</Text>
              <Row style={benefitRow}>
                <Column style={benefitIconColumn}>
                  <Text style={benefitIcon}>+</Text>
                </Column>
                <Column>
                  <Text style={benefitText}>Help people you care about make better decisions</Text>
                </Column>
              </Row>
              <Row style={benefitRow}>
                <Column style={benefitIconColumn}>
                  <Text style={benefitIcon}>+</Text>
                </Column>
                <Column>
                  <Text style={benefitText}>Collaborate with them on shared decisions</Text>
                </Column>
              </Row>
              <Row style={benefitRow}>
                <Column style={benefitIconColumn}>
                  <Text style={benefitIcon}>+</Text>
                </Column>
                <Column>
                  <Text style={benefitText}>Build a community of smart decision-makers</Text>
                </Column>
              </Row>
            </Section>
            <Section style={ctaSection}>
              <Link href={dashboardUrl} style={button}>
                View Your Referrals
              </Link>
            </Section>
            <Text style={ctaSubtext}>
              Every referral helps us grow
            </Text>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              Thank you for spreading the word about OpportunIQ.
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

export default ReferralReminderEmail;

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
  backgroundColor: 'rgba(59, 130, 246, 0.15)',
  color: '#3b82f6',
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '0.15em',
  padding: '8px 16px',
  borderRadius: '20px',
  margin: '0',
  border: '1px solid rgba(59, 130, 246, 0.3)',
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

const statsBox = {
  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const statsNumber = {
  fontSize: '36px',
  fontWeight: '700',
  color: '#ffffff',
  margin: '0 0 4px 0',
};

const statsLabel = {
  fontSize: '14px',
  color: 'rgba(255, 255, 255, 0.9)',
  margin: '0',
};

const linkBox = {
  backgroundColor: '#222222',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
  border: '1px solid #333333',
  textAlign: 'center' as const,
};

const linkLabel = {
  fontSize: '10px',
  fontWeight: '700',
  color: '#3b82f6',
  margin: '0 0 12px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.2em',
};

const linkUrl = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#ffffff',
  margin: '0 0 8px 0',
  wordBreak: 'break-all' as const,
  backgroundColor: '#1a1a1a',
  padding: '12px 16px',
  borderRadius: '8px',
  border: '1px solid #333333',
};

const linkHint = {
  fontSize: '12px',
  color: '#888888',
  margin: '12px 0 0 0',
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
  color: '#3b82f6',
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
  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '16px 40px',
  borderRadius: '10px',
  boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)',
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
