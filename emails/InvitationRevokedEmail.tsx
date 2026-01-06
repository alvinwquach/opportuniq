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

interface InvitationRevokedEmailProps {
  groupName: string;
  revokedBy: string;
}

export const InvitationRevokedEmail = ({
  groupName = 'My Group',
  revokedBy = 'A coordinator',
}: InvitationRevokedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your invitation to join "{groupName}" has been revoked</Preview>
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
            <Heading style={heroTitle}>Invitation Revoked</Heading>
            <Text style={heroSubtitle}>
              Your pending invitation to join <strong>{groupName}</strong> has been revoked by {revokedBy}.
            </Text>
            <Section style={infoBox}>
              <Text style={infoText}>
                This means you will no longer be able to join this group using the previous invitation link.
              </Text>
            </Section>
            <Text style={noteText}>
              If you believe this was a mistake, please reach out to the group coordinator directly.
            </Text>
            <Hr style={divider} />
            <Text style={securityNote}>
              You're receiving this because you had a pending invitation to join "{groupName}".
            </Text>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              Questions? Just reply—we read every email.
            </Text>
            <Text style={footerLinks}>
              <Link href="https://opportuniq.app" style={footerLink}>OpportunIQ</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default InvitationRevokedEmail;

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

const infoBox = {
  backgroundColor: '#fef2f2',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
  border: '1px solid #fecaca',
};

const infoText = {
  fontSize: '15px',
  color: '#991b1b',
  margin: '0',
  lineHeight: '22px',
  textAlign: 'center' as const,
};

const noteText = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0 0 24px 0',
  lineHeight: '20px',
  textAlign: 'center' as const,
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
