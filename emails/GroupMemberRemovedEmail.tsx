import {
  Body,
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

interface GroupMemberRemovedEmailProps {
  memberName: string;
  groupName: string;
  removedBy: string;
  dashboardUrl: string;
}

export const GroupMemberRemovedEmail = ({
  memberName = 'there',
  groupName = 'My Group',
  removedBy = 'A coordinator',
  dashboardUrl = 'https://opportuniq.app/dashboard',
}: GroupMemberRemovedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>You've been removed from "{groupName}"</Preview>
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
            <Heading style={heroTitle}>Group Membership Ended</Heading>
            <Text style={heroSubtitle}>
              Hi {memberName}, we wanted to let you know that you've been removed from a group.
            </Text>
            <Section style={groupBox}>
              <Text style={groupLabel}>GROUP</Text>
              <Text style={groupNameText}>{groupName}</Text>
              <Text style={removedByText}>Removed by {removedBy}</Text>
            </Section>
            <Section style={infoSection}>
              <Text style={infoTitle}>What this means:</Text>
              <Text style={infoItem}>• You no longer have access to this group's issues and expenses</Text>
              <Text style={infoItem}>• Your personal data and other groups are unaffected</Text>
              <Text style={infoItem}>• You can be invited back to this group in the future</Text>
            </Section>
            <Section style={ctaSection}>
              <Link href={dashboardUrl} style={button}>
                Go to Dashboard →
              </Link>
            </Section>
            <Hr style={divider} />
            <Text style={securityNote}>
              If you believe this was done in error, please contact the group's coordinator.
            </Text>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              Questions? Just reply—we read every email.
            </Text>
            <Text style={footerLinks}>
              <Link href="https://opportuniq.app" style={footerLink}>OpportunIQ</Link>
              {' • '}
              <Link href="https://opportuniq.app/settings" style={footerLink}>Settings</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default GroupMemberRemovedEmail;

// ==================== STYLES ====================

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

const groupBox = {
  backgroundColor: '#fef2f2',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
  border: '1px solid #fecaca',
  textAlign: 'center' as const,
};

const groupLabel = {
  fontSize: '11px',
  fontWeight: '700',
  color: '#dc2626',
  margin: '0 0 8px 0',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
};

const groupNameText = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#0f172a',
  margin: '0 0 8px 0',
};

const removedByText = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0',
};

const infoSection = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '16px 20px',
  marginBottom: '24px',
};

const infoTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#0f172a',
  margin: '0 0 12px 0',
};

const infoItem = {
  fontSize: '14px',
  color: '#475569',
  margin: '0 0 8px 0',
  lineHeight: '20px',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '0 0 24px 0',
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
};

const divider = {
  borderColor: '#e2e8f0',
  margin: '0 0 24px 0',
};

const securityNote = {
  fontSize: '13px',
  color: '#94a3b8',
  textAlign: 'center' as const,
  margin: '0',
  lineHeight: '18px',
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
