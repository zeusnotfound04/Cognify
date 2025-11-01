import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Cognify',
  description: 'Privacy Policy for Cognify AI Platform and Third-Party Integrations',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <p className="text-lg text-muted-foreground mb-8">
          Last updated: November 2, 2025
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p>
            Cognify ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
            explains how we collect, use, disclose, and safeguard your information when you use our AI-powered 
            platform and integrate with third-party services like Slack, Notion, Google Drive, and Google Calendar.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          
          <h3 className="text-xl font-medium mb-3">2.1 Personal Information</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Name and email address</li>
            <li>Account credentials and authentication information</li>
            <li>Profile information and preferences</li>
            <li>Usage patterns and interaction data</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">2.2 Third-Party Integration Data</h3>
          <p className="mb-3">When you connect third-party services, we may access:</p>
          
          <h4 className="text-lg font-medium mb-2">Slack Integration</h4>
          <ul className="list-disc pl-6 mb-4">
            <li>Workspace information and channel lists</li>
            <li>Message content (only when explicitly requested)</li>
            <li>User profiles and team member information</li>
            <li>File sharing permissions and metadata</li>
          </ul>

          <h4 className="text-lg font-medium mb-2">Notion Integration</h4>
          <ul className="list-disc pl-6 mb-4">
            <li>Database structures and page content</li>
            <li>Block-level content and formatting</li>
            <li>Workspace and page sharing permissions</li>
            <li>Comments and collaboration data</li>
          </ul>

          <h4 className="text-lg font-medium mb-2">Google Drive Integration</h4>
          <ul className="list-disc pl-6 mb-4">
            <li>File and folder metadata</li>
            <li>Document content (with your permission)</li>
            <li>Sharing settings and permissions</li>
            <li>File modification history</li>
          </ul>

          <h4 className="text-lg font-medium mb-2">Google Calendar Integration</h4>
          <ul className="list-disc pl-6 mb-4">
            <li>Calendar metadata and settings</li>
            <li>Event details, dates, and times</li>
            <li>Attendee information and responses</li>
            <li>Meeting locations and descriptions</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
          <ul className="list-disc pl-6">
            <li>Provide and maintain our AI-powered services</li>
            <li>Process and analyze data to improve AI responses</li>
            <li>Enable seamless integration with third-party platforms</li>
            <li>Personalize your experience and recommendations</li>
            <li>Communicate with you about service updates</li>
            <li>Ensure security and prevent unauthorized access</li>
            <li>Comply with legal obligations and resolve disputes</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Data Storage and Security</h2>
          <p className="mb-4">
            We implement industry-standard security measures to protect your data:
          </p>
          <ul className="list-disc pl-6">
            <li>Encryption in transit and at rest using AES-256</li>
            <li>Secure OAuth 2.0 authentication flows</li>
            <li>Regular security audits and penetration testing</li>
            <li>Limited access controls and employee training</li>
            <li>Secure cloud infrastructure with redundancy</li>
            <li>Token refresh mechanisms with minimal scope</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Third-Party Service Integration</h2>
          <p className="mb-4">
            When you connect third-party services, we:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Only request the minimum necessary permissions</li>
            <li>Store OAuth tokens securely with encryption</li>
            <li>Never share your data with other third parties</li>
            <li>Allow you to revoke access at any time</li>
            <li>Respect the privacy policies of integrated services</li>
          </ul>
          
          <p>
            You can disconnect any integration at any time through your dashboard settings. 
            Upon disconnection, we will delete associated OAuth tokens and stop accessing your data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Data Sharing and Disclosure</h2>
          <p className="mb-4">We do not sell, trade, or otherwise transfer your personal information to third parties except:</p>
          <ul className="list-disc pl-6">
            <li>With your explicit consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and safety</li>
            <li>In connection with a business transfer</li>
            <li>To trusted service providers under strict confidentiality</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Your Rights and Choices</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc pl-6">
            <li>Access, update, or delete your personal information</li>
            <li>Revoke OAuth permissions for connected services</li>
            <li>Export your data in a portable format</li>
            <li>Opt-out of certain data processing activities</li>
            <li>Request data deletion (right to be forgotten)</li>
            <li>File complaints with data protection authorities</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
          <p>
            We retain your information only as long as necessary to provide our services and comply 
            with legal obligations. OAuth tokens are automatically refreshed or deleted based on 
            service requirements and your usage patterns.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own. 
            We ensure appropriate safeguards are in place to protect your privacy rights.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
          <p>
            Our services are not intended for children under 13. We do not knowingly collect 
            personal information from children under 13 years of age.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically. We will notify you of significant 
            changes via email or through our platform. Your continued use constitutes acceptance 
            of the updated policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
          <p>
            For questions about this Privacy Policy or your data, please contact us at:
          </p>
          <div className="bg-muted p-4 rounded-lg mt-4">
            <p><strong>Email:</strong> privacy@cognify.ai</p>
            <p><strong>Address:</strong> [Your Company Address]</p>
            <p><strong>Data Protection Officer:</strong> dpo@cognify.ai</p>
          </div>
        </section>

        <div className="border-t pt-8 mt-12">
          <p className="text-sm text-muted-foreground">
            This Privacy Policy is designed to be transparent about our data practices while ensuring 
            compliance with GDPR, CCPA, and other applicable privacy regulations.
          </p>
        </div>
      </div>
    </div>
  )
}