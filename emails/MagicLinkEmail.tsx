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
} from "@react-email/components";
import { parseUserAgent, getLocationFromIP } from "../lib/user-agent-parser";

interface MagicLinkEmailProps {
  magicLink: string;
  ipAddress?: string;
  userAgent?: string;
}

export default function MagicLinkEmail({
  magicLink,
  ipAddress,
  userAgent,
}: MagicLinkEmailProps) {
  const parsedUA = parseUserAgent(userAgent);
  const location = getLocationFromIP(ipAddress);
  return (
    <Html>
      <Head />
      <Preview>Sign in to OpportunIQ</Preview>
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
            <Heading style={heroTitle}>Sign in to OpportunIQ</Heading>
            <Text style={heroSubtitle}>
              Click the button below to securely access your account.
            </Text>
            <Section style={ctaSection}>
              <Link href={magicLink} style={button}>
                Access your account →
              </Link>
            </Section>
            <Text style={expiryText}>
              This link expires in <strong>15 minutes</strong> and works only once.
            </Text>
            {(parsedUA || location) && (
              <Section style={securityDetails}>
                <Text style={securityLabel}>Request details:</Text>
                {location && (
                  <Text style={securityItem}>
                    {location}
                  </Text>
                )}
                {parsedUA && (
                  <Text style={securityItem}>
                    {parsedUA.device}
                  </Text>
                )}
              </Section>
            )}
          </Section>
          <Section style={footer}>
            <Text style={footerText}>
              Didn&apos;t request this? You can safely ignore this email.
            </Text>
            <Text style={footerLinks}>
              <Link href="https://opportuniq.app" style={footerLink}>
                OpportunIQ
              </Link>
              {" • "}
              <Link href="mailto:security@opportuniq.app" style={footerLink}>
                Report issue
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}


const main = {
  backgroundColor: "#f8fafc",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: "40px 0",
};

const container = {
  margin: "0 auto",
  maxWidth: "560px",
};

const logoSection = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const logoImage = {
  margin: "0 auto",
  display: "block",
};

const contentCard = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: "48px 40px",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  marginBottom: "24px",
};

const heroTitle = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#0f172a",
  margin: "0 0 8px 0",
  textAlign: "center" as const,
  letterSpacing: "-0.025em",
};

const heroSubtitle = {
  fontSize: "15px",
  lineHeight: "22px",
  color: "#64748b",
  margin: "0 0 32px 0",
  textAlign: "center" as const,
};

const ctaSection = {
  textAlign: "center" as const,
  margin: "0 0 24px 0",
};

const button = {
  display: "inline-block",
  background: "#06b6d4",  
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "18px 48px",
  borderRadius: "12px",
  boxShadow: "0 10px 25px -5px rgba(6, 182, 212, 0.4), 0 8px 10px -6px rgba(6, 182, 212, 0.4)",
  transition: "all 0.2s ease",
};

const expiryText = {
  fontSize: "13px",
  color: "#64748b",
  textAlign: "center" as const,
  margin: "0 0 32px 0",
  lineHeight: "18px",
};

const securityDetails = {
  borderTop: "1px solid #e2e8f0",
  paddingTop: "24px",
  marginTop: "8px",
};

const securityLabel = {
  fontSize: "11px",
  color: "#94a3b8",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  margin: "0 0 8px 0",
  fontWeight: "600",
};

const securityItem = {
  fontSize: "13px",
  color: "#64748b",
  margin: "4px 0",
  lineHeight: "18px",
};

const footer = {
  textAlign: "center" as const,
  padding: "0 20px",
};

const footerText = {
  fontSize: "13px",
  color: "#94a3b8",
  margin: "0 0 12px 0",
  lineHeight: "18px",
};

const footerLinks = {
  fontSize: "12px",
  color: "#cbd5e1",
  margin: "0",
};

const footerLink = {
  color: "#94a3b8",
  textDecoration: "none",
};
