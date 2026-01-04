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

interface FeedbackRequestEmailProps {
  name?: string;
  feedbackUrl?: string;
  dashboardUrl?: string;
}

export const FeedbackRequestEmail = ({
  name = 'there',
  feedbackUrl = 'https://opportuniq.app/feedback',
  dashboardUrl = 'https://opportuniq.app/dashboard',
}: FeedbackRequestEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>We'd love your feedback - help shape OpportunIQ's future</Preview>
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
              <Text style={badge}>YOUR VOICE MATTERS</Text>
            </Section>
            <Heading style={heroTitle}>How Are We Doing?</Heading>
            <Text style={heroSubtitle}>
              Hey {name}, you've been using OpportunIQ and we'd love to hear what you think. Your feedback directly shapes what we build next.
            </Text>
            <Section style={messageBox}>
              <Text style={messageText}>
                "We read every piece of feedback personally. The best features in OpportunIQ came from users like you telling us what they needed."
              </Text>
              <Text style={messageAuthor}>— The OpportunIQ Team</Text>
            </Section>
            <Section style={questionsSection}>
              <Text style={questionsTitle}>We're curious about</Text>
              <Row style={questionRow}>
                <Column style={questionIconColumn}>
                  <Text style={questionIcon}>?</Text>
                </Column>
                <Column>
                  <Text style={questionText}>What's working well for you?</Text>
                </Column>
              </Row>
              <Row style={questionRow}>
                <Column style={questionIconColumn}>
                  <Text style={questionIcon}>?</Text>
                </Column>
                <Column>
                  <Text style={questionText}>What's frustrating or confusing?</Text>
                </Column>
              </Row>
              <Row style={questionRow}>
                <Column style={questionIconColumn}>
                  <Text style={questionIcon}>?</Text>
                </Column>
                <Column>
                  <Text style={questionText}>What feature would make the biggest difference?</Text>
                </Column>
              </Row>
            </Section>
            <Section style={ctaSection}>
              <Link href={feedbackUrl} style={button}>
                Share Feedback
              </Link>
            </Section>
            <Text style={ctaSubtext}>
              Takes less than 2 minutes
            </Text>
            <Section style={alternativeSection}>
              <Text style={alternativeText}>
                Prefer to just reply? Hit reply on this email—we read everything.
              </Text>
            </Section>
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              Thank you for helping us build something great.
            </Text>
            <Text style={footerLinks}>
              <Link href={dashboardUrl} style={footerLink}>Dashboard</Link>
              {' · '}
              <Link href="https://opportuniq.app" style={footerLink}>OpportunIQ</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default FeedbackRequestEmail;

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
  backgroundColor: 'rgba(251, 191, 36, 0.15)',
  color: '#fbbf24',
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '0.15em',
  padding: '8px 16px',
  borderRadius: '20px',
  margin: '0',
  border: '1px solid rgba(251, 191, 36, 0.3)',
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

const messageBox = {
  backgroundColor: '#222222',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
  border: '1px solid #333333',
  borderLeft: '4px solid #fbbf24',
};

const messageText = {
  fontSize: '14px',
  fontStyle: 'italic' as const,
  color: '#dddddd',
  margin: '0 0 12px 0',
  lineHeight: '22px',
};

const messageAuthor = {
  fontSize: '13px',
  color: '#999999',
  margin: '0',
};

const questionsSection = {
  backgroundColor: '#222222',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '32px',
  border: '1px solid #333333',
};

const questionsTitle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#ffffff',
  margin: '0 0 16px 0',
};

const questionRow = {
  marginBottom: '14px',
};

const questionIconColumn = {
  width: '32px',
  verticalAlign: 'top' as const,
};

const questionIcon = {
  backgroundColor: '#fbbf24',
  color: '#0a0a0a',
  fontSize: '12px',
  fontWeight: '700',
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  textAlign: 'center' as const,
  lineHeight: '24px',
  margin: '0',
};

const questionText = {
  fontSize: '14px',
  color: '#dddddd',
  margin: '0',
  lineHeight: '24px',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '0 0 16px 0',
};

const button = {
  display: 'inline-block',
  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
  color: '#0a0a0a',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  padding: '16px 40px',
  borderRadius: '10px',
  boxShadow: '0 4px 16px rgba(251, 191, 36, 0.4)',
};

const ctaSubtext = {
  fontSize: '13px',
  color: '#999999',
  textAlign: 'center' as const,
  margin: '0',
};

const alternativeSection = {
  marginTop: '24px',
  paddingTop: '24px',
  borderTop: '1px solid #333333',
};

const alternativeText = {
  fontSize: '13px',
  color: '#888888',
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
