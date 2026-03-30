import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface MemberApprovalEmailProps {
  memberName: string;
  groupName: string;
  groupUrl: string;
  approvalDate?: string;
}

export const MemberApprovalEmail = ({
  memberName = 'there',
  groupName = 'My Group',
  groupUrl = 'https://opportuniq.app/groups/abc123',
  approvalDate,
}: MemberApprovalEmailProps) => {
  const firstName = memberName.split(' ')[0] || 'there';
  const formattedDate = approvalDate
    ? new Date(approvalDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

  return (
    <Html>
      <Head />
      <Preview>You&apos;ve been approved! You now have access to &quot;{groupName}&quot;</Preview>
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
            <Section style={successIconSection}>
              <Text style={successIcon}>✓</Text>
            </Section>
            <Heading style={heroTitle}>You&apos;re In, {firstName}!</Heading>
            <Text style={heroSubtitle}>
              Great news! Your request to join <strong>{groupName}</strong> has been approved.
            </Text>
            <Section style={detailsBox}>
              <div style={detailRow}>
                <Text style={detailLabel}>Group</Text>
                <Text style={detailValue}>{groupName}</Text>
              </div>
              <div style={detailRow}>
                <Text style={detailLabel}>Approved on</Text>
                <Text style={detailValue}>{formattedDate}</Text>
              </div>
              <div style={detailRow}>
                <Text style={detailLabel}>Status</Text>
                <Text style={statusBadge}>Active Member</Text>
              </div>
            </Section>
            <Section style={actionsSection}>
              <Text style={actionsTitle}>What you can do now:</Text>
              <Text style={actionItem}>📊 View the group&apos;s budget and expenses</Text>
              <Text style={actionItem}>🏠 Track shared home projects and repairs</Text>
              <Text style={actionItem}>💡 Get smart recommendations for decisions</Text>
              <Text style={actionItem}>📝 Add your own issues and projects</Text>
            </Section>
            <Section style={ctaSection}>
              <Link href={groupUrl} style={button}>
                Go to {groupName} →
              </Link>
            </Section>
            <Text style={ctaSubtext}>
              Start collaborating with your group right away.
            </Text>
            <Hr style={divider} />
            <Section style={tipBox}>
              <Text style={tipTitle}>💡 Pro tip</Text>
              <Text style={tipText}>
                Upload a photo of any home issue to get instant DIY vs. hire-a-pro recommendations with cost estimates.
              </Text>
            </Section>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              Questions? Just reply—we read every email.
            </Text>
            <Text style={footerLinks}>
              <Link href="https://opportuniq.app" style={footerLink}>OpportunIQ</Link>
              {' • '}
              <Link href="https://opportuniq.app/help" style={footerLink}>Help</Link>
              {' • '}
              <Link href="https://opportuniq.app/settings" style={footerLink}>Settings</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default MemberApprovalEmail;

const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: '40px 0',
};

const container = {
  margin: '0 auto',
  maxWidth: '560px',
};

const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const logoImage = {
  margin: '0 auto',
  display: 'block',
};

const contentCard = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  padding: '48px 40px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  marginBottom: '24px',
};

const successIconSection = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const successIcon = {
  display: 'inline-block',
  width: '64px',
  height: '64px',
  lineHeight: '64px',
  backgroundColor: '#10b981',
  borderRadius: '50%',
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: '700',
  textAlign: 'center' as const,
  margin: '0 auto',
};

const heroTitle = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#0f172a',
  margin: '0 0 12px 0',
  textAlign: 'center' as const,
  letterSpacing: '-0.025em',
  lineHeight: '1.2',
};

const heroSubtitle = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#475569',
  margin: '0 0 32px 0',
  textAlign: 'center' as const,
};

const detailsBox = {
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  padding: '20px 24px',
  marginBottom: '24px',
  border: '1px solid #e2e8f0',
};

const detailRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
};

const detailLabel = {
  fontSize: '13px',
  color: '#64748b',
  margin: '0',
};

const detailValue = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#0f172a',
  margin: '0',
};

const statusBadge = {
  display: 'inline-block',
  fontSize: '12px',
  fontWeight: '600',
  color: '#10b981',
  backgroundColor: '#ecfdf5',
  padding: '4px 12px',
  borderRadius: '9999px',
  margin: '0',
};

const actionsSection = {
  marginBottom: '32px',
};

const actionsTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#0f172a',
  margin: '0 0 12px 0',
};

const actionItem = {
  fontSize: '14px',
  color: '#475569',
  margin: '0 0 8px 0',
  lineHeight: '20px',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '0 0 16px 0',
};

const button = {
  display: 'inline-block',
  background: '#06b6d4',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '18px 48px',
  borderRadius: '12px',
  boxShadow: '0 10px 25px -5px rgba(6, 182, 212, 0.4), 0 8px 10px -6px rgba(6, 182, 212, 0.4)',
};

const ctaSubtext = {
  fontSize: '13px',
  color: '#94a3b8',
  textAlign: 'center' as const,
  margin: '0 0 24px 0',
  lineHeight: '18px',
};

const divider = {
  borderColor: '#e2e8f0',
  margin: '0 0 24px 0',
};

const tipBox = {
  backgroundColor: '#fffbeb',
  borderRadius: '8px',
  padding: '16px 20px',
  border: '1px solid #fde68a',
};

const tipTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#92400e',
  margin: '0 0 8px 0',
};

const tipText = {
  fontSize: '14px',
  color: '#78350f',
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
