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

interface InvitationSentConfirmationEmailProps {
  inviterName: string;
  inviteeEmail: string;
  groupName: string;
  role: string;
  groupUrl: string;
  message?: string;
}

export const InvitationSentConfirmationEmail = ({
  inviterName = 'You',
  inviteeEmail = 'invitee@example.com',
  groupName = 'My Group',
  role = 'participant',
  groupUrl = 'https://opportuniq.app/dashboard/groups/abc123',
  message,
}: InvitationSentConfirmationEmailProps) => {
  const roleLabel = getRoleLabel(role);

  return (
    <Html>
      <Head />
      <Preview>Invitation sent to {inviteeEmail} for &quot;{groupName}&quot;</Preview>
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
            <Heading style={heroTitle}>Invitation Sent!</Heading>
            <Text style={heroSubtitle}>
              Hey {inviterName}, your invitation has been sent successfully.
            </Text>
            <Section style={detailsBox}>
              <Text style={detailsLabel}>INVITATION DETAILS</Text>
              <Text style={detailItem}>
                <strong>Sent to:</strong> {inviteeEmail}
              </Text>
              <Text style={detailItem}>
                <strong>Group:</strong> {groupName}
              </Text>
              <Text style={detailItem}>
                <strong>Role:</strong> {roleLabel}
              </Text>
            </Section>
            {message && (
              <Section style={messageBox}>
                <Text style={messageLabel}>Your personal message:</Text>
                <Text style={messageText}>&quot;{message}&quot;</Text>
              </Section>
            )}
            <Section style={infoSection}>
              <Text style={infoTitle}>What happens next?</Text>
              <Text style={infoItem}>1. The invitee will receive an email with your invitation</Text>
              <Text style={infoItem}>2. They have 7 days to accept the invitation</Text>
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

function getRoleLabel(role: string): string {
  const roleLabels: Record<string, string> = {
    coordinator: 'Coordinator',
    collaborator: 'Collaborator',
    participant: 'Participant',
    contributor: 'Contributor',
    observer: 'Observer',
  };
  return roleLabels[role] || 'Member';
}

export default InvitationSentConfirmationEmail;

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
  margin: '0 0 8px 0',
  lineHeight: '22px',
};

// Personal Message
const messageBox = {
  backgroundColor: '#f8fafc',
  borderLeft: '3px solid #06b6d4',
  padding: '16px 20px',
  marginBottom: '24px',
  borderRadius: '0 8px 8px 0',
};

const messageLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#64748b',
  margin: '0 0 8px 0',
};

const messageText = {
  fontSize: '15px',
  fontStyle: 'italic',
  color: '#1e293b',
  margin: '0',
  lineHeight: '22px',
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
