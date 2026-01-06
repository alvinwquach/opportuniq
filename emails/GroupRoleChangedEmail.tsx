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

interface GroupRoleChangedEmailProps {
  memberName: string;
  groupName: string;
  changedBy: string;
  oldRole: string;
  newRole: string;
  groupUrl: string;
}

const roleLabels: Record<string, string> = {
  coordinator: 'Coordinator',
  collaborator: 'Collaborator',
  participant: 'Participant',
  contributor: 'Contributor',
  observer: 'Observer',
};

export const GroupRoleChangedEmail = ({
  memberName = 'there',
  groupName = 'My Group',
  changedBy = 'A coordinator',
  oldRole = 'participant',
  newRole = 'collaborator',
  groupUrl = 'https://opportuniq.app/dashboard/groups/abc123',
}: GroupRoleChangedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your role in "{groupName}" has been updated</Preview>
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
            <Heading style={heroTitle}>Role Updated</Heading>
            <Text style={heroSubtitle}>
              Hi {memberName}, your role in <strong>{groupName}</strong> has been changed.
            </Text>
            <Section style={roleBox}>
              <Text style={roleLabel}>YOUR NEW ROLE</Text>
              <Text style={newRoleText}>{roleLabels[newRole] || newRole}</Text>
              <Text style={oldRoleInfo}>
                Changed from {roleLabels[oldRole] || oldRole} by {changedBy}
              </Text>
            </Section>
            <Section style={ctaSection}>
              <Link href={groupUrl} style={button}>
                View Group →
              </Link>
            </Section>
            <Hr style={divider} />
            <Text style={securityNote}>
              You're receiving this because you're a member of "{groupName}".
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

export default GroupRoleChangedEmail;

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

const roleBox = {
  backgroundColor: '#f0f9ff',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
  border: '1px solid #bae6fd',
  textAlign: 'center' as const,
};

const roleLabel = {
  fontSize: '11px',
  fontWeight: '700',
  color: '#0369a1',
  margin: '0 0 8px 0',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
};

const newRoleText = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#0f172a',
  margin: '0 0 8px 0',
};

const oldRoleInfo = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0',
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
