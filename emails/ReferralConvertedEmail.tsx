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

interface ReferralConvertedEmailProps {
  referrerName: string;
  refereeName: string;
  referralCount: number;
  dashboardUrl: string;
}

export const ReferralConvertedEmail = ({
  referrerName = 'there',
  refereeName = 'A friend',
  referralCount = 1,
  dashboardUrl = 'https://opportuniq.app/dashboard',
}: ReferralConvertedEmailProps) => {
  const firstName = referrerName.split(' ')[0] || 'there';

  return (
    <Html>
      <Head />
      <Preview>Great news! {refereeName} just joined OpportunIQ using your referral</Preview>
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
            <Section style={celebrationSection}>
              <Text style={celebrationEmoji}>&#127881;</Text>
            </Section>
            <Heading style={heroTitle}>Referral Success!</Heading>
            <Text style={heroSubtitle}>
              Hey {firstName}, great news! <strong>{refereeName}</strong> just joined OpportunIQ using your referral code.
            </Text>
            <Section style={statsBox}>
              <Text style={statsLabel}>Your Total Referrals</Text>
              <Text style={statsNumber}>{referralCount}</Text>
              <Text style={statsSubtext}>
                {referralCount >= 5
                  ? "Amazing! You're a top referrer!"
                  : referralCount >= 3
                    ? "You're on fire! Keep it up!"
                    : "Keep sharing to unlock rewards!"}
              </Text>
            </Section>
            <Section style={rewardSection}>
              <Text style={rewardTitle}>Referral Rewards</Text>
              <div style={rewardItem}>
                <Text style={referralCount >= 3 ? rewardCheckActive : rewardCheck}>
                  {referralCount >= 3 ? '✓' : '○'}
                </Text>
                <Text style={referralCount >= 3 ? rewardTextActive : rewardText}>
                  3 referrals - Skip the waitlist
                </Text>
              </div>
              <div style={rewardItem}>
                <Text style={referralCount >= 5 ? rewardCheckActive : rewardCheck}>
                  {referralCount >= 5 ? '✓' : '○'}
                </Text>
                <Text style={referralCount >= 5 ? rewardTextActive : rewardText}>
                  5 referrals - Extended beta access
                </Text>
              </div>
              <div style={rewardItem}>
                <Text style={referralCount >= 10 ? rewardCheckActive : rewardCheck}>
                  {referralCount >= 10 ? '✓' : '○'}
                </Text>
                <Text style={referralCount >= 10 ? rewardTextActive : rewardText}>
                  10 referrals - Lifetime premium perks
                </Text>
              </div>
            </Section>
            <Section style={ctaSection}>
              <Link href={dashboardUrl} style={button}>
                View Dashboard
              </Link>
            </Section>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              Thank you for spreading the word about OpportunIQ!
            </Text>
            <Text style={footerLinks}>
              <Link href="https://opportuniq.app" style={footerLink}>OpportunIQ</Link>
              {' | '}
              <Link href="https://opportuniq.app/settings" style={footerLink}>Settings</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ReferralConvertedEmail;


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

const celebrationSection = {
  textAlign: 'center' as const,
  marginBottom: '16px',
};

const celebrationEmoji = {
  fontSize: '48px',
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

const statsBox = {
  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const statsLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: 'rgba(255, 255, 255, 0.8)',
  margin: '0 0 4px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
};

const statsNumber = {
  fontSize: '48px',
  fontWeight: '700',
  color: '#ffffff',
  margin: '0',
  lineHeight: '1',
};

const statsSubtext = {
  fontSize: '13px',
  color: 'rgba(255, 255, 255, 0.9)',
  margin: '8px 0 0 0',
};

const rewardSection = {
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  padding: '20px 24px',
  marginBottom: '32px',
};

const rewardTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#0f172a',
  margin: '0 0 16px 0',
};

const rewardItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '10px',
};

const rewardCheck = {
  fontSize: '14px',
  color: '#cbd5e1',
  margin: '0',
  width: '20px',
};

const rewardCheckActive = {
  fontSize: '14px',
  color: '#10b981',
  fontWeight: '700',
  margin: '0',
  width: '20px',
};

const rewardText = {
  fontSize: '13px',
  color: '#94a3b8',
  margin: '0',
};

const rewardTextActive = {
  fontSize: '13px',
  color: '#0f172a',
  margin: '0',
  fontWeight: '500',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '0',
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
