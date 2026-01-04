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

interface DecisionApprovedEmailProps {
  memberName: string;
  issueTitle: string;
  approvedOption: string;
  groupName: string;
  decisionUrl: string;
  totalVotes: number;
  winningPercentage: number;
  nextSteps?: string[];
}

export const DecisionApprovedEmail = ({
  memberName = 'there',
  issueTitle = 'Kitchen faucet repair options',
  approvedOption = 'Replace with standard faucet',
  groupName = 'Home Maintenance',
  decisionUrl = 'https://opportuniq.app/groups/123/decisions/789',
  totalVotes = 5,
  winningPercentage = 60,
  nextSteps = [
    'Research recommended vendors in your area',
    'Get quotes from 2-3 providers',
    'Schedule the repair at a convenient time',
  ],
}: DecisionApprovedEmailProps) => {
  const firstName = memberName.split(' ')[0] || 'there';

  return (
    <Html>
      <Head />
      <Preview>Decision made: {approvedOption}</Preview>
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
              <Text style={successIcon}>&#10003;</Text>
            </Section>
            <Heading style={heroTitle}>Decision Made!</Heading>
            <Text style={heroSubtitle}>
              Hey {firstName}, your group has reached a decision on <strong>{issueTitle}</strong>.
            </Text>
            <Section style={approvedBox}>
              <Text style={approvedLabel}>Approved Decision</Text>
              <Text style={approvedText}>{approvedOption}</Text>
              <Section style={statsRow}>
                <div style={statItem}>
                  <Text style={statNumber}>{totalVotes}</Text>
                  <Text style={statLabel}>Total Votes</Text>
                </div>
                <div style={statDivider}></div>
                <div style={statItem}>
                  <Text style={statNumber}>{winningPercentage}%</Text>
                  <Text style={statLabel}>Approval</Text>
                </div>
              </Section>
            </Section>
            {nextSteps && nextSteps.length > 0 && (
              <Section style={nextStepsSection}>
                <Text style={nextStepsTitle}>Suggested Next Steps</Text>
                {nextSteps.map((step, index) => (
                  <div key={index} style={stepItem}>
                    <Text style={stepCheckbox}>&#9744;</Text>
                    <Text style={stepText}>{step}</Text>
                  </div>
                ))}
              </Section>
            )}
            <Section style={ctaSection}>
              <Link href={decisionUrl} style={button}>
                View Decision Details
              </Link>
            </Section>

            <Text style={ctaSubtext}>
              Track progress and coordinate next steps with your group
            </Text>
          </Section>
          <Section style={congratsSection}>
            <Text style={congratsEmoji}>&#127881;</Text>
            <Text style={congratsText}>
              Great teamwork! Collaborative decisions lead to better outcomes.
            </Text>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this because you're a member of "{groupName}".
            </Text>
            <Text style={footerLinks}>
              <Link href="https://opportuniq.app/settings/notifications" style={footerLink}>
                Notification Settings
              </Link>
              {' | '}
              <Link href="https://opportuniq.app" style={footerLink}>OpportunIQ</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default DecisionApprovedEmail;


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
  marginBottom: '16px',
};

const iconSection = {
  textAlign: 'center' as const,
  marginBottom: '16px',
};

const successIcon = {
  display: 'inline-block',
  width: '56px',
  height: '56px',
  lineHeight: '56px',
  backgroundColor: '#10b981',
  color: '#ffffff',
  fontSize: '28px',
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

const approvedBox = {
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const approvedLabel = {
  fontSize: '11px',
  fontWeight: '600',
  color: 'rgba(255, 255, 255, 0.8)',
  margin: '0 0 8px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
};

const approvedText = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#ffffff',
  margin: '0 0 20px 0',
  lineHeight: '28px',
};

const statsRow = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '24px',
  borderTop: '1px solid rgba(255, 255, 255, 0.2)',
  paddingTop: '16px',
};

const statItem = {
  textAlign: 'center' as const,
};

const statNumber = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#ffffff',
  margin: '0',
  lineHeight: '1',
};

const statLabel = {
  fontSize: '11px',
  color: 'rgba(255, 255, 255, 0.8)',
  margin: '4px 0 0 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
};

const statDivider = {
  width: '1px',
  height: '32px',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
};

const nextStepsSection = {
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '24px',
};

const nextStepsTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#0f172a',
  margin: '0 0 16px 0',
};

const stepItem = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  marginBottom: '10px',
};

const stepCheckbox = {
  fontSize: '16px',
  color: '#94a3b8',
  margin: '0',
  width: '20px',
  flexShrink: 0,
};

const stepText = {
  fontSize: '13px',
  color: '#475569',
  margin: '0',
  lineHeight: '20px',
};

const ctaSection = {
  textAlign: 'center' as const,
  marginBottom: '12px',
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

const congratsSection = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '20px',
  textAlign: 'center' as const,
  marginBottom: '24px',
  border: '1px solid #e2e8f0',
};

const congratsEmoji = {
  fontSize: '24px',
  margin: '0 0 8px 0',
};

const congratsText = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0',
  lineHeight: '20px',
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
