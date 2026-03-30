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

interface InvitationDeclinedEmailProps {
  inviterName: string;
  inviteeEmail: string;
  groupName: string;
  groupUrl: string;
}

export const InvitationDeclinedEmail = ({
  inviterName = 'You',
  inviteeEmail = 'invitee@example.com',
  groupName = 'My Group',
  groupUrl = 'https://opportuniq.app/dashboard/groups/abc123',
}: InvitationDeclinedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{inviteeEmail} declined your invitation to join &quot;{groupName}&quot;</Preview>
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
            <Heading style={heroTitle}>Invitation Declined</Heading>
            <Text style={heroSubtitle}>
              Hey {inviterName}, your invitation has been declined.
            </Text>
            <Section style={detailsBox}>
              <Text style={detailsLabel}>DETAILS</Text>
              <Text style={detailItem}>
                <strong>Invitee:</strong> {inviteeEmail}
              </Text>
              <Text style={detailItem}>
                <strong>Group:</strong> {groupName}
              </Text>
            </Section>
            <Section style={infoSection}>
              <Text style={infoTitle}>What can you do?</Text>
              <Text style={infoItem}>1. The person may not be ready to join right now</Text>
              <Text style={infoItem}>2. Consider reaching out to them directly if appropriate</Text>
              <Text style={infoItem}>3. You can invite other members to your group</Text>
            </Section>
            <Section style={ctaSection}>
              <Link href={groupUrl} style={button}>
                View Group →
              </Link>
            </Section>
            <Hr style={divider} />
            <Text style={securityNote}>
              You can manage group members and send new invitations from your group dashboard.
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

export default InvitationDeclinedEmail;

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

const detailsBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
  border: '1px solid #fcd34d',
};

const detailsLabel = {
  fontSize: '11px',
  fontWeight: '700',
  color: '#92400e',
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
