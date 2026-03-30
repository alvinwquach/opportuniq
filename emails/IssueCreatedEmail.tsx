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

interface IssueCreatedEmailProps {
  memberName: string;
  issueTitle: string;
  issueDescription?: string;
  groupName: string;
  issueUrl: string;
  createdBy: string;
  category?: string;
}

export const IssueCreatedEmail = ({
  memberName = 'there',
  issueTitle = 'Kitchen faucet is leaking',
  issueDescription = 'The kitchen faucet has been dripping constantly for the past week.',
  groupName = 'Home Maintenance',
  issueUrl = 'https://opportuniq.app/groups/123/issues/456',
  createdBy = 'John Doe',
  category = 'Plumbing',
}: IssueCreatedEmailProps) => {
  const firstName = memberName.split(' ')[0] || 'there';

  return (
    <Html>
      <Head />
      <Preview>New issue reported: {issueTitle}</Preview>
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
              <Text style={issueIcon}>&#128204;</Text>
            </Section>
            <Heading style={heroTitle}>New Issue Reported</Heading>
            <Text style={heroSubtitle}>
              Hey {firstName}, a new issue has been reported in <strong>{groupName}</strong>.
            </Text>
            <Section style={issueCard}>
              <Text style={issueLabel}>Issue</Text>
              <Text style={issueTitleText}>{issueTitle}</Text>
              {issueDescription && (
                <Text style={issueDescriptionText}>{issueDescription}</Text>
              )}

              <Section style={issueMetaSection}>
                {category && (
                  <div style={metaItem}>
                    <Text style={metaLabel}>Category</Text>
                    <Text style={metaValue}>{category}</Text>
                  </div>
                )}
                <div style={metaItem}>
                  <Text style={metaLabel}>Reported by</Text>
                  <Text style={metaValue}>{createdBy}</Text>
                </div>
              </Section>
            </Section>
            <Section style={nextStepsSection}>
              <Text style={nextStepsTitle}>What happens next?</Text>
              <div style={stepItem}>
                <Text style={stepNumber}>1</Text>
                <Text style={stepText}>Group members can discuss and add context</Text>
              </div>
              <div style={stepItem}>
                <Text style={stepNumber}>2</Text>
                <Text style={stepText}>We&apos;ll analyze and suggest solutions</Text>
              </div>
              <div style={stepItem}>
                <Text style={stepNumber}>3</Text>
                <Text style={stepText}>Vote on the best decision together</Text>
              </div>
            </Section>
            <Section style={ctaSection}>
              <Link href={issueUrl} style={button}>
                View Issue Details
              </Link>
            </Section>
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

export default IssueCreatedEmail;

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

const issueIcon = {
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

const issueCard = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fcd34d',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '24px',
};

const issueLabel = {
  fontSize: '11px',
  fontWeight: '600',
  color: '#92400e',
  margin: '0 0 8px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
};

const issueTitleText = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#78350f',
  margin: '0 0 8px 0',
  lineHeight: '24px',
};

const issueDescriptionText = {
  fontSize: '14px',
  color: '#92400e',
  margin: '0 0 16px 0',
  lineHeight: '20px',
};

const issueMetaSection = {
  display: 'flex',
  gap: '24px',
  borderTop: '1px solid #fcd34d',
  paddingTop: '12px',
  marginTop: '4px',
};

const metaItem = {
  flex: '1',
};

const metaLabel = {
  fontSize: '11px',
  color: '#92400e',
  margin: '0 0 2px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
};

const metaValue = {
  fontSize: '13px',
  fontWeight: '500',
  color: '#78350f',
  margin: '0',
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
  marginBottom: '12px',
};

const stepNumber = {
  display: 'inline-block',
  width: '24px',
  height: '24px',
  lineHeight: '24px',
  backgroundColor: '#06b6d4',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: '600',
  borderRadius: '50%',
  textAlign: 'center' as const,
  margin: '0',
  flexShrink: 0,
};

const stepText = {
  fontSize: '13px',
  color: '#475569',
  margin: '0',
  lineHeight: '24px',
};

const ctaSection = {
  textAlign: 'center' as const,
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
