import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Use - Cognify',
  description: 'Terms of Use for Cognify AI Platform and Third-Party Integrations',
}

export default function TermsOfUsePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-8">Terms of Use</h1>
        
        <p className="text-lg text-muted-foreground mb-8">
          Last updated: November 2, 2025
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using Cognify ("the Service," "our platform," "we," "us," or "our"), 
            you accept and agree to be bound by the terms and provision of this agreement. 
            If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
          <p className="mb-4">
            Cognify is an AI-powered platform that provides intelligent assistance through:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>AI-powered conversation and analysis capabilities</li>
            <li>Memory storage and retrieval for personalized experiences</li>
            <li>Integration with third-party services (Slack, Notion, Google Drive, Google Calendar)</li>
            <li>Data processing and insights generation</li>
            <li>Collaborative AI tools and workflows</li>
          </ul>
          <p>
            We reserve the right to modify, suspend, or discontinue any part of the service 
            at any time without notice.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Accounts and Registration</h2>
          
          <h3 className="text-xl font-medium mb-3">3.1 Account Creation</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>You must provide accurate and complete information during registration</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>You must be at least 13 years old to create an account</li>
            <li>One person may not create multiple accounts</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">3.2 Account Security</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>You are responsible for all activities under your account</li>
            <li>Notify us immediately of any unauthorized use</li>
            <li>We are not liable for losses due to unauthorized account access</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Third-Party Integrations</h2>
          
          <h3 className="text-xl font-medium mb-3">4.1 OAuth Integrations</h3>
          <p className="mb-3">When you connect third-party services to Cognify:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>You grant us permission to access data from connected services</li>
            <li>You represent that you have the right to authorize such access</li>
            <li>You can revoke access at any time through your dashboard</li>
            <li>We will only access data within the scope of granted permissions</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">4.2 Supported Integrations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Slack</h4>
              <ul className="text-sm space-y-1">
                <li>• Channel and message access</li>
                <li>• User profile information</li>
                <li>• File sharing data</li>
                <li>• Team workspace details</li>
              </ul>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Notion</h4>
              <ul className="text-sm space-y-1">
                <li>• Database content access</li>
                <li>• Page and block content</li>
                <li>• Workspace information</li>
                <li>• Collaboration data</li>
              </ul>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Google Drive</h4>
              <ul className="text-sm space-y-1">
                <li>• File and folder access</li>
                <li>• Document content reading</li>
                <li>• Metadata and sharing info</li>
                <li>• File modification history</li>
              </ul>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Google Calendar</h4>
              <ul className="text-sm space-y-1">
                <li>• Calendar event access</li>
                <li>• Meeting details and times</li>
                <li>• Attendee information</li>
                <li>• Scheduling patterns</li>
              </ul>
            </div>
          </div>

          <h3 className="text-xl font-medium mb-3">4.3 Third-Party Terms</h3>
          <p>
            Your use of integrated third-party services is also governed by their respective 
            terms of service and privacy policies. We are not responsible for the practices 
            or content of third-party services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Acceptable Use Policy</h2>
          
          <h3 className="text-xl font-medium mb-3">5.1 Permitted Uses</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Personal and professional productivity enhancement</li>
            <li>Data analysis and insights generation</li>
            <li>Collaborative work and team coordination</li>
            <li>Educational and research purposes</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">5.2 Prohibited Uses</h3>
          <p className="mb-3">You may not use Cognify to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Transmit harmful, abusive, or inappropriate content</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Reverse engineer or attempt to extract source code</li>
            <li>Use the service to spam or send unsolicited communications</li>
            <li>Upload malicious code, viruses, or harmful software</li>
            <li>Impersonate others or provide false information</li>
            <li>Use the service for illegal activities or fraud</li>
            <li>Overload our systems through excessive API calls or automation</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. AI and Data Processing</h2>
          
          <h3 className="text-xl font-medium mb-3">6.1 AI-Generated Content</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>AI responses are generated based on patterns in training data</li>
            <li>We do not guarantee the accuracy of AI-generated content</li>
            <li>You should verify important information independently</li>
            <li>AI outputs should not be considered professional advice</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">6.2 Data Processing</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>We process your data to provide and improve our services</li>
            <li>Data may be used for AI training and model improvement</li>
            <li>We implement security measures to protect your data</li>
            <li>You retain ownership of your original content and data</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
          
          <h3 className="text-xl font-medium mb-3">7.1 Our Rights</h3>
          <p className="mb-4">
            Cognify, its features, functionality, and all related intellectual property 
            are owned by us and protected by copyright, trademark, and other laws.
          </p>

          <h3 className="text-xl font-medium mb-3">7.2 Your Rights</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>You retain ownership of content you upload or create</li>
            <li>You grant us a license to use your content to provide our services</li>
            <li>You can delete your content or terminate your account at any time</li>
            <li>AI-generated content may not be exclusively owned by you</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">7.3 Respect for Others' Rights</h3>
          <p>
            You must respect the intellectual property rights of others and not upload 
            or share content that infringes on copyrights, trademarks, or other rights.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Privacy and Data Protection</h2>
          <p className="mb-4">
            Your privacy is important to us. Our collection and use of personal information 
            is governed by our Privacy Policy, which is incorporated into these terms by reference.
          </p>
          <ul className="list-disc pl-6">
            <li>We comply with applicable data protection laws</li>
            <li>We implement security measures to protect your data</li>
            <li>You have rights regarding your personal data</li>
            <li>We may process data for legitimate business interests</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Service Availability</h2>
          
          <h3 className="text-xl font-medium mb-3">9.1 Uptime</h3>
          <p className="mb-4">
            While we strive to maintain high availability, we do not guarantee uninterrupted 
            access to our services. Maintenance, updates, and technical issues may cause 
            temporary service disruptions.
          </p>

          <h3 className="text-xl font-medium mb-3">9.2 Usage Limits</h3>
          <ul className="list-disc pl-6">
            <li>API rate limits may apply to prevent abuse</li>
            <li>Storage limits may be imposed based on your plan</li>
            <li>We may throttle or suspend accounts that exceed reasonable usage</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Payment and Subscription Terms</h2>
          
          <h3 className="text-xl font-medium mb-3">10.1 Billing</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>Subscription fees are charged in advance on a recurring basis</li>
            <li>All fees are non-refundable unless required by law</li>
            <li>Price changes will be communicated with reasonable notice</li>
            <li>Failed payments may result in service suspension</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">10.2 Cancellation</h3>
          <p>
            You may cancel your subscription at any time. Cancellation will take effect 
            at the end of your current billing period.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Disclaimers and Limitations</h2>
          
          <h3 className="text-xl font-medium mb-3">11.1 Service Disclaimers</h3>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg mb-4">
            <p className="text-sm">
              <strong>IMPORTANT:</strong> Our services are provided "AS IS" without warranties 
              of any kind, either express or implied.
            </p>
          </div>
          <ul className="list-disc pl-6 mb-4">
            <li>We do not warrant that the service will be error-free or uninterrupted</li>
            <li>AI-generated content may be inaccurate or inappropriate</li>
            <li>Third-party integrations may fail or be discontinued</li>
            <li>Data loss, though unlikely, is possible</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">11.2 Limitation of Liability</h3>
          <p className="mb-4">
            To the maximum extent permitted by law, we shall not be liable for any indirect, 
            incidental, special, or consequential damages arising from your use of our services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Termination</h2>
          
          <h3 className="text-xl font-medium mb-3">12.1 Termination by You</h3>
          <ul className="list-disc pl-6 mb-4">
            <li>You may terminate your account at any time</li>
            <li>Termination does not entitle you to a refund</li>
            <li>You remain responsible for any outstanding charges</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">12.2 Termination by Us</h3>
          <p className="mb-3">We may terminate or suspend your account if:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>You violate these terms of use</li>
            <li>Your account is inactive for an extended period</li>
            <li>We discontinue the service</li>
            <li>Required by law or regulatory action</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">12.3 Effect of Termination</h3>
          <p>
            Upon termination, your access will cease, and we may delete your data after 
            a reasonable period, unless required to retain it by law.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">13. Governing Law and Disputes</h2>
          
          <h3 className="text-xl font-medium mb-3">13.1 Governing Law</h3>
          <p className="mb-4">
            These terms are governed by the laws of [Your Jurisdiction], without regard 
            to conflict of law principles.
          </p>

          <h3 className="text-xl font-medium mb-3">13.2 Dispute Resolution</h3>
          <ul className="list-disc pl-6">
            <li>We encourage resolving disputes through direct communication</li>
            <li>Disputes may be subject to binding arbitration</li>
            <li>You may have rights under applicable consumer protection laws</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">14. Changes to Terms</h2>
          <p className="mb-4">
            We may update these terms from time to time. Material changes will be 
            communicated through:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Email notification to registered users</li>
            <li>Prominent notice on our platform</li>
            <li>Updated "Last modified" date on this page</li>
          </ul>
          <p>
            Continued use of our services after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">15. Contact Information</h2>
          <p className="mb-4">
            For questions about these Terms of Use, please contact us:
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p><strong>Email:</strong> legal@cognify.ai</p>
            <p><strong>Support:</strong> support@cognify.ai</p>
            <p><strong>Address:</strong> [Your Company Address]</p>
            <p><strong>Legal Department:</strong> terms@cognify.ai</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">16. Miscellaneous</h2>
          
          <h3 className="text-xl font-medium mb-3">16.1 Entire Agreement</h3>
          <p className="mb-4">
            These terms, together with our Privacy Policy, constitute the entire agreement 
            between you and Cognify regarding the use of our services.
          </p>

          <h3 className="text-xl font-medium mb-3">16.2 Severability</h3>
          <p className="mb-4">
            If any provision of these terms is found to be unenforceable, the remaining 
            provisions will remain in full force and effect.
          </p>

          <h3 className="text-xl font-medium mb-3">16.3 No Waiver</h3>
          <p className="mb-4">
            Our failure to enforce any provision of these terms does not constitute a 
            waiver of that provision or any other provision.
          </p>

          <h3 className="text-xl font-medium mb-3">16.4 Assignment</h3>
          <p>
            You may not assign your rights under these terms without our prior written consent. 
            We may assign our rights and obligations under these terms without restriction.
          </p>
        </section>

        <div className="border-t pt-8 mt-12">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Summary</h3>
            <p className="text-sm">
              By using Cognify, you agree to use our AI-powered platform responsibly, 
              respect others' rights, and follow our guidelines. We'll protect your data, 
              provide reliable service, and continuously improve your experience. 
              Questions? We're here to help!
            </p>
          </div>
        </div>

        <div className="text-center mt-8 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Thank you for choosing Cognify. We're committed to providing you with 
            powerful AI tools while maintaining transparency and protecting your rights.
          </p>
        </div>
      </div>
    </div>
  )
}