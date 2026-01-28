import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface PasswordResetEmailProps {
  resetLink: string;
  userEmail: string;
  requestTime?: string;
}

export const PasswordResetEmail = ({
  resetLink,
  userEmail,
  requestTime = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }),
}: PasswordResetEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Confirm your identity and set a new password securely</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Branding */}
          <Section style={header}>
            <Heading style={logo}>Set Life Casting</Heading>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Reset Your Password</Heading>

            <Text style={text}>
              You requested to reset your password for your Set Life Casting account.
            </Text>

            <Text style={text}>
              Click the button below to create a new password:
            </Text>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={resetLink}>
                Reset Password
              </Button>
            </Section>

            <Text style={text}>
              Or copy and paste this URL into your browser:
            </Text>
            <Text style={linkText}>{resetLink}</Text>

            {/* Security Information */}
            <Section style={securityBox}>
              <Text style={securityText}>
                <strong>Security Information:</strong>
              </Text>
              <Text style={securityText}>
                • This link expires in 1 hour
              </Text>
              <Text style={securityText}>
                • Request made on {requestTime}
              </Text>
              <Text style={securityText}>
                • This link can only be used once
              </Text>
            </Section>

            <Text style={text}>
              If you didn&apos;t request this password reset, please ignore this email or{" "}
              <Link href="mailto:support@setlifecasting.com" style={link}>
                contact our support team
              </Link>{" "}
              if you have concerns about your account security.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <strong>Set Life Casting</strong>
            </Text>
            <Text style={footerText}>
              Atlanta Film & TV Background Casting Agency
            </Text>
            <Text style={footerText}>
              Email: support@setlifecasting.com
            </Text>
            <Text style={footerText}>
              This is a transactional email. You received this because a password reset was requested for {userEmail}.
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} Set Life Casting. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default PasswordResetEmail;

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "600px",
};

const header = {
  padding: "32px 48px",
  backgroundColor: "#5F65C4",
  textAlign: "center" as const,
};

const logo = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#ffffff",
  margin: "0",
  fontFamily: "Georgia, serif",
};

const content = {
  padding: "0 48px",
};

const h1 = {
  color: "#1A1D2E",
  fontSize: "24px",
  fontWeight: "700",
  lineHeight: "1.3",
  margin: "32px 0 16px",
};

const text = {
  color: "#2C2F3E",
  fontSize: "16px",
  lineHeight: "1.5",
  margin: "16px 0",
};

const linkText = {
  color: "#5F65C4",
  fontSize: "14px",
  lineHeight: "1.5",
  wordBreak: "break-all" as const,
  margin: "8px 0",
};

const buttonContainer = {
  margin: "32px 0",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#5F65C4",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "700",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "15px 40px",
  lineHeight: "1",
};

const link = {
  color: "#5F65C4",
  textDecoration: "underline",
};

const securityBox = {
  backgroundColor: "#f3f4f6",
  borderLeft: "4px solid #5F65C4",
  padding: "16px 20px",
  margin: "24px 0",
  borderRadius: "4px",
};

const securityText = {
  color: "#2C2F3E",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "4px 0",
};

const footer = {
  padding: "32px 48px 0",
  borderTop: "1px solid #e5e7eb",
  marginTop: "32px",
};

const footerText = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "4px 0",
  textAlign: "center" as const,
};
