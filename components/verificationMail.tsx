import * as React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Button,
  Link,
  Tailwind,
} from '@react-email/components';

interface VerificationEmailProps {
  username: string;
  verificationLink: string;
}

const VerificationEmail = (props: VerificationEmailProps) => {
  const { username, verificationLink } = props;

  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Preview>Verify your email address to start using askSudo</Preview>
        <Body className="bg-gray-50 font-sans py-10">
          <Container className="bg-white rounded-xl shadow-lg max-w-[600px] mx-auto p-12 border border-gray-100">
            {/* Header Section */}
            <Section className="text-center mb-10">
              <Text className="text-[32px] font-bold text-gray-900 m-0 mb-2">
                askSudo
              </Text>
              <Text className="text-[16px] text-gray-600 m-0">
                Welcome to the platform
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="mb-10">
              <Text className="text-[18px] text-gray-800 font-semibold mb-4">
                Hello {username},
              </Text>
              
              <Text className="text-[16px] text-gray-700 leading-[26px] mb-5">
                Welcome to <strong>askSudo</strong>! We're excited to have you join our community of developers and tech enthusiasts.
              </Text>

              <Text className="text-[16px] text-gray-700 leading-[26px] mb-5">
                To ensure the security of your account and get full access to all askSudo features, please verify your email address by clicking the button below.
              </Text>

              <Text className="text-[14px] text-gray-600 leading-[22px] mb-8">
                ⏱️ This verification link will expire in 24 hours for security purposes.
              </Text>
            </Section>

            {/* CTA Button */}
            <Section className="text-center mb-10">
              <Button
                href={verificationLink}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-[18px] rounded-[10px] text-[16px] font-semibold no-underline box-border shadow-md"
              >
                Verify Email Address
              </Button>
            </Section>

            {/* Fallback Link */}
            <Section className="mb-10 p-5 bg-gray-50 rounded-lg border border-gray-200">
              <Text className="text-[14px] text-gray-700 leading-[22px] mb-3 font-medium">
                Having trouble with the button?
              </Text>
              <Text className="text-[14px] text-gray-600 leading-[22px] mb-2">
                If the button doesn't work, copy and paste this link into your browser:
              </Text>
              <Link
                href={verificationLink}
                className="text-indigo-600 text-[14px] underline break-all font-mono bg-white p-2 rounded-sm border border-gray-200 inline-block"
              >
                {verificationLink}
              </Link>
            </Section>

            {/* Security Note */}
            <Section className="border-t border-gray-200 pt-8 mb-8">
              <Text className="text-[14px] text-gray-500 leading-[22px] mb-4 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                🔒 <strong>Security Notice:</strong> If you did not create an account on askSudo, no further action is required. You can safely ignore this email.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="text-center mb-6">
              <Text className="text-[16px] text-gray-700 leading-6 m-0">
                Happy coding!<br />
                <strong>The askSudo Team</strong>
              </Text>
            </Section>

            {/* Company Footer */}
            <Section className="text-center pt-6 border-t border-gray-200">
              <Text className="text-[12px] text-gray-400 leading-[18px] m-0 mb-2">
                © 2024 askSudo. All rights reserved.
              </Text>
              <Text className="text-[12px] text-gray-400 leading-[18px] m-0">
                Questions? Contact us at support@asksudo.com
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

VerificationEmail.PreviewProps = {
  username: "Alex Developer",
  verificationLink: "https://asksudo.com/verify?token=abc123xyz789",
};

export default VerificationEmail;