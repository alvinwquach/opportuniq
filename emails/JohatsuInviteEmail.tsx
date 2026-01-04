import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface JohatsuInviteEmailProps {
  inviteUrl: string;
  expiresIn?: string;
}

export const JohatsuInviteEmail = ({
  inviteUrl = 'https://opportuniq.app/join?token=johatsu123',
  expiresIn = '7 days',
}: JohatsuInviteEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>You've been selected for Johatsu - OpportunIQ's most exclusive tier</Preview>
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
            <Section style={badgeSection}>
              <Text style={badge}>JOHATSU</Text>
            </Section>
            <Heading style={heroTitle}>You've Been Selected</Heading>
            <Text style={heroSubtitle}>
              You are one of only <strong>10 people</strong> invited to Johatsu. This is an invitation that cannot be earned—only granted.
            </Text>
            <Section style={exclusiveBox}>
              <Text style={exclusiveLabel}>Founding Member Access</Text>
              <Text style={exclusiveSubtext}>
                As a Johatsu member, you receive lifetime access to <Link href="https://johatsu.vercel.app" style={exclusiveLink}>johatsu.vercel.app</Link> and every future OpportunIQ product—forever free. Your input shapes our roadmap.
              </Text>
            </Section>
            <Section style={benefitsSection}>
              <Text style={benefitsTitle}>What sets Johatsu apart</Text>
              <Row style={benefitRow}>
                <Column style={benefitIconColumn}>
                  <Text style={benefitIcon}>◆</Text>
                </Column>
                <Column>
                  <Text style={benefitText}>Permanent free access to all OpportunIQ products</Text>
                </Column>
              </Row>
              <Row style={benefitRow}>
                <Column style={benefitIconColumn}>
                  <Text style={benefitIcon}>◆</Text>
                </Column>
                <Column>
                  <Text style={benefitText}>Exclusive johatsu.vercel.app access</Text>
                </Column>
              </Row>
              <Row style={benefitRow}>
                <Column style={benefitIconColumn}>
                  <Text style={benefitIcon}>◆</Text>
                </Column>
                <Column>
                  <Text style={benefitText}>Direct communication channel with the founders directly</Text>
                </Column>
              </Row>
              <Row style={benefitRow}>
                <Column style={benefitIconColumn}>
                  <Text style={benefitIcon}>◆</Text>
                </Column>
                <Column>
                  <Text style={benefitText}>First access to every new feature before anyone else</Text>
                </Column>
              </Row>
            </Section>
            <Section style={confidentialBox}>
              <Text style={confidentialLabel}>Top Secret</Text>
              <Text style={confidentialText}>
                "Every passing minute is another chance to turn it all around."
              </Text>
              <Text style={confidentialSubtext}>
                Everything you learn through Johatsu—including my whereabouts, plans, and movements—is strictly classified.
                This information is entrusted to you with your life. You will learn more inside. Never share any details about this program or what you discover with anyone outside the founding circle.
              </Text>
            </Section>
            <Section style={ctaSection}>
              <Link href={inviteUrl} style={button}>
                Accept Invitation
              </Link>
            </Section>
            <Text style={ctaSubtext}>
              This invite expires in {expiresIn}
            </Text>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              Questions? Reply directly to this email—it goes straight to the founder.
            </Text>
            <Text style={footerLinks}>
              <Link href="https://opportuniq.app" style={footerLink}>OpportunIQ</Link>
              {' · '}
              <Link href="https://johatsu.vercel.app" style={footerLink}>Johatsu</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default JohatsuInviteEmail;

const main = {
  backgroundColor: '#111111',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: '40px 20px',
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
  backgroundColor: '#1a1a1a',
  borderRadius: '16px',
  padding: '40px 32px',
  border: '1px solid #333333',
  marginBottom: '24px',
};

const badgeSection = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const badge = {
  display: 'inline-block',
  backgroundColor: 'rgba(99, 102, 241, 0.15)',
  color: '#a5b4fc',
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '0.15em',
  padding: '8px 16px',
  borderRadius: '20px',
  margin: '0',
  border: '1px solid rgba(99, 102, 241, 0.3)',
};

const heroTitle = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#ffffff',
  margin: '0 0 12px 0',
  textAlign: 'center' as const,
  letterSpacing: '-0.025em',
};

const heroSubtitle = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#cccccc',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
};

const exclusiveBox = {
  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const exclusiveLabel = {
  fontSize: '11px',
  fontWeight: '600',
  color: 'rgba(255, 255, 255, 0.9)',
  margin: '0 0 8px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.15em',
};

const exclusiveSubtext = {
  fontSize: '14px',
  color: 'rgba(255, 255, 255, 0.95)',
  margin: '0',
  lineHeight: '22px',
};

const exclusiveLink = {
  color: '#ffffff',
  fontWeight: '600',
  textDecoration: 'underline',
};

const benefitsSection = {
  backgroundColor: '#222222',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '32px',
  border: '1px solid #333333',
};

const benefitsTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#ffffff',
  margin: '0 0 16px 0',
};

const benefitRow = {
  marginBottom: '14px',
};

const benefitIconColumn = {
  width: '24px',
  verticalAlign: 'top' as const,
};

const benefitIcon = {
  color: '#a5b4fc',
  fontSize: '12px',
  fontWeight: '700',
  margin: '0',
  paddingTop: '2px',
};

const benefitText = {
  fontSize: '14px',
  color: '#dddddd',
  margin: '0',
  lineHeight: '20px',
};

const confidentialBox = {
  backgroundColor: '#222222',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '32px',
  border: '1px solid #333333',
  textAlign: 'center' as const,
};

const confidentialLabel = {
  fontSize: '10px',
  fontWeight: '700',
  color: '#a5b4fc',
  margin: '0 0 8px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.2em',
};

const confidentialText = {
  fontSize: '14px',
  fontStyle: 'italic' as const,
  color: '#ffffff',
  margin: '0 0 12px 0',
  lineHeight: '20px',
};

const confidentialSubtext = {
  fontSize: '13px',
  color: '#cccccc',
  margin: '0',
  lineHeight: '20px',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '0 0 16px 0',
};

const button = {
  display: 'inline-block',
  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '16px 40px',
  borderRadius: '10px',
  boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
};

const ctaSubtext = {
  fontSize: '13px',
  color: '#999999',
  textAlign: 'center' as const,
  margin: '0',
};

const footer = {
  textAlign: 'center' as const,
  padding: '0 20px',
};

const footerText = {
  fontSize: '13px',
  color: '#999999',
  margin: '0 0 12px 0',
  lineHeight: '18px',
};

const footerLinks = {
  fontSize: '12px',
  color: '#888888',
  margin: '0',
};

const footerLink = {
  color: '#999999',
  textDecoration: 'none',
};
