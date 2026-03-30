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

interface BulkInvitationConfirmationEmailProps {
  inviterName: string;
  groupName: string;
  successCount: number;
  failedCount: number;
  successEmails: string[];
  groupUrl: string;
}

export const BulkInvitationConfirmationEmail = ({
  inviterName = 'You',
  groupName = 'My Group',
  successCount = 5,
  failedCount = 0,
  successEmails = ['email1@example.com', 'email2@example.com'],
  groupUrl = 'https://opportuniq.app/dashboard/groups/abc123',
}: BulkInvitationConfirmationEmailProps) => {
  const totalCount = successCount + failedCount;
  const allSucceeded = failedCount === 0;

  return (
    <Html>
      <Head />
      <Preview>
        {allSucceeded
          ? `${successCount} invitations sent for "${groupName}"`
          : `${successCount} of ${totalCount} invitations sent for "${groupName}"`}
      </Preview>
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
            <Heading style={heroTitle}>
              {allSucceeded ? 'All Invitations Sent!' : 'Invitations Sent'}
            </Heading>
            <Text style={heroSubtitle}>
              Hey {inviterName}, your bulk invitation has been processed.
            </Text>
            <Section style={statsBox}>
              <Text style={statsLabel}>SUMMARY</Text>
              <Section style={statsGrid}>
                <Section style={statItem}>
                  <Text style={statNumber}>{successCount}</Text>
                  <Text style={statLabel}>Sent</Text>
                </Section>
                {failedCount > 0 && (
                  <Section style={statItemFailed}>
                    <Text style={statNumberFailed}>{failedCount}</Text>
                    <Text style={statLabelFailed}>Failed</Text>
                  </Section>
                )}
                <Section style={statItem}>
                  <Text style={statNumber}>{totalCount}</Text>
                  <Text style={statLabel}>Total</Text>
                </Section>
              </Section>
            </Section>
            <Section style={detailsBox}>
              <Text style={detailsLabel}>INVITATIONS SENT TO</Text>
              <Text style={detailItem}>
                <strong>Group:</strong> {groupName}
              </Text>
              <Section style={emailList}>
                {successEmails.slice(0, 10).map((email, index) => (
                  <Text key={index} style={emailItem}>• {email}</Text>
                ))}
                {successEmails.length > 10 && (
                  <Text style={emailItemMore}>
                    ...and {successEmails.length - 10} more
                  </Text>
                )}
              </Section>
            </Section>
            <Section style={infoSection}>
              <Text style={infoTitle}>What happens next?</Text>
              <Text style={infoItem}>1. Each invitee will receive an email with their invitation</Text>
              <Text style={infoItem}>2. They have 7 days to accept their invitation</Text>
              <Text style={infoItem}>3. Once accepted, they&apos;ll appear in your group members list</Text>
            </Section>
            <Section style={ctaSection}>
              <Link href={groupUrl} style={button}>
                View Group →
              </Link>
            </Section>
            <Hr style={divider} />
            <Text style={securityNote}>
              You can manage pending invitations from your group dashboard.
            </Text>
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

export default BulkInvitationConfirmationEmail;

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

// Logo
const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const logoImage = {
  margin: '0 auto',
  display: 'block',
};

// Content Card
const contentCard = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  padding: '48px 40px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  marginBottom: '24px',
};

// Hero
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

// Stats Box
const statsBox = {
  backgroundColor: '#f0f9ff',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
  border: '1px solid #bae6fd',
};

const statsLabel = {
  fontSize: '11px',
  fontWeight: '700',
  color: '#0284c7',
  margin: '0 0 16px 0',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  textAlign: 'center' as const,
};

const statsGrid = {
  display: 'flex',
  justifyContent: 'center',
  gap: '32px',
};

const statItem = {
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '0 16px',
};

const statItemFailed = {
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '0 16px',
};

const statNumber = {
  fontSize: '32px',
  fontWeight: '700',
  color: '#0284c7',
  margin: '0',
  lineHeight: '1',
};

const statNumberFailed = {
  fontSize: '32px',
  fontWeight: '700',
  color: '#dc2626',
  margin: '0',
  lineHeight: '1',
};

const statLabel = {
  fontSize: '12px',
  color: '#64748b',
  margin: '8px 0 0 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
};

const statLabelFailed = {
  fontSize: '12px',
  color: '#dc2626',
  margin: '8px 0 0 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
};

// Details Box
const detailsBox = {
  backgroundColor: '#f0fdfa',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
  border: '1px solid #99f6e4',
};

const detailsLabel = {
  fontSize: '11px',
  fontWeight: '700',
  color: '#0d9488',
  margin: '0 0 16px 0',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
};

const detailItem = {
  fontSize: '15px',
  color: '#1e293b',
  margin: '0 0 16px 0',
  lineHeight: '22px',
};

const emailList = {
  borderTop: '1px solid #99f6e4',
  paddingTop: '16px',
};

const emailItem = {
  fontSize: '14px',
  color: '#475569',
  margin: '0 0 6px 0',
  lineHeight: '20px',
};

const emailItemMore = {
  fontSize: '14px',
  color: '#0d9488',
  fontStyle: 'italic',
  margin: '8px 0 0 0',
};

// Info Section
const infoSection = {
  marginBottom: '32px',
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

// CTA Button
const ctaSection = {
  textAlign: 'center' as const,
  margin: '0 0 16px 0',
};

const button = {
  display: 'inline-block',
  background: '#06b6d4',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '14px 36px',
  borderRadius: '12px',
  boxShadow: '0 10px 25px -5px rgba(6, 182, 212, 0.4), 0 8px 10px -6px rgba(6, 182, 212, 0.4)',
};

const divider = {
  borderColor: '#e2e8f0',
  margin: '24px 0',
};

const securityNote = {
  fontSize: '13px',
  color: '#94a3b8',
  textAlign: 'center' as const,
  margin: '0',
  lineHeight: '18px',
};

// Footer
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
