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

interface DecisionReadyEmailProps {
  memberName: string;
  issueTitle: string;
  groupName: string;
  decisionUrl: string;
  options: Array<{
    title: string;
    votes?: number;
  }>;
  votingDeadline?: string;
}

export const DecisionReadyEmail = ({
  memberName = 'there',
  issueTitle = 'Kitchen faucet repair options',
  groupName = 'Home Maintenance',
  decisionUrl = 'https://opportuniq.app/groups/123/decisions/789',
  options = [
    { title: 'Replace with standard faucet', votes: 2 },
    { title: 'Repair existing faucet', votes: 1 },
    { title: 'Upgrade to touchless faucet', votes: 0 },
  ],
  votingDeadline = '3 days',
}: DecisionReadyEmailProps) => {
  const firstName = memberName.split(' ')[0] || 'there';

  return (
    <Html>
      <Head />
      <Preview>Decision ready for voting: {issueTitle}</Preview>
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
              <Text style={voteIcon}>&#128499;</Text>
            </Section>
            <Heading style={heroTitle}>Time to Vote!</Heading>
            <Text style={heroSubtitle}>
              Hey {firstName}, a decision is ready for voting in <strong>{groupName}</strong>. Your input matters!
            </Text>
            <Section style={issueBox}>
              <Text style={issueLabel}>Decision for</Text>
              <Text style={issueTitleText}>{issueTitle}</Text>
            </Section>
            <Section style={optionsSection}>
              <Text style={optionsTitle}>Available Options</Text>
              {options.map((option, index) => (
                <div key={index} style={optionItem}>
                  <div style={optionBullet}>{index + 1}</div>
                  <div style={optionContent}>
                    <Text style={optionText}>{option.title}</Text>
                    {option.votes !== undefined && option.votes > 0 && (
                      <Text style={optionVotes}>
                        {option.votes} vote{option.votes !== 1 ? 's' : ''}
                      </Text>
                    )}
                  </div>
                </div>
              ))}
            </Section>
            {votingDeadline && (
              <Section style={deadlineBox}>
                <Text style={deadlineIcon}>&#9200;</Text>
                <Text style={deadlineText}>
                  Voting closes in <strong>{votingDeadline}</strong>
                </Text>
              </Section>
            )}
            <Section style={ctaSection}>
              <Link href={decisionUrl} style={button}>
                Cast Your Vote
              </Link>
            </Section>
            <Text style={ctaSubtext}>
              Every vote helps your group make better decisions together
            </Text>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              You&apos;re receiving this because you&apos;re a member of &quot;{groupName}&quot;.
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

export default DecisionReadyEmail;

// ==================== STYLES ====================

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

const voteIcon = {
  fontSize: '40px',
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

const issueBox = {
  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  borderRadius: '12px',
  padding: '20px',
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const issueLabel = {
  fontSize: '11px',
  fontWeight: '600',
  color: 'rgba(255, 255, 255, 0.8)',
  margin: '0 0 8px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
};

const issueTitleText = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#ffffff',
  margin: '0',
  lineHeight: '24px',
};

const optionsSection = {
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '20px',
};

const optionsTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#0f172a',
  margin: '0 0 16px 0',
};

const optionItem = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  marginBottom: '12px',
  padding: '12px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
};

const optionBullet = {
  width: '24px',
  height: '24px',
  lineHeight: '24px',
  backgroundColor: '#e2e8f0',
  color: '#64748b',
  fontSize: '12px',
  fontWeight: '600',
  borderRadius: '50%',
  textAlign: 'center' as const,
  flexShrink: 0,
};

const optionContent = {
  flex: 1,
};

const optionText = {
  fontSize: '14px',
  color: '#0f172a',
  margin: '0',
  lineHeight: '24px',
};

const optionVotes = {
  fontSize: '12px',
  color: '#06b6d4',
  margin: '4px 0 0 0',
  fontWeight: '500',
};

const deadlineBox = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  backgroundColor: '#fef3c7',
  border: '1px solid #fcd34d',
  borderRadius: '8px',
  padding: '12px 16px',
  marginBottom: '24px',
};

const deadlineIcon = {
  fontSize: '16px',
  margin: '0',
};

const deadlineText = {
  fontSize: '14px',
  color: '#92400e',
  margin: '0',
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
