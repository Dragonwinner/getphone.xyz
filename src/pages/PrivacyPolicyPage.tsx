import SEO from '../components/SEO';

interface PrivacyPolicyPageProps {
  onNavigate: (page: string) => void;
}

export default function PrivacyPolicyPage({ onNavigate }: PrivacyPolicyPageProps) {
  return (
    <>
      <SEO
        title="Privacy Policy"
  description="Privacy Policy for getphone.xyz - Learn how we collect, use, and protect your personal information"
  canonical="https://getphone.xyz/privacy-policy"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-gray-600 mb-6">Last Updated: October 7, 2025</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              Welcome to getphone.xyz. We are committed to protecting your privacy and ensuring the security
              of your personal information. This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you visit our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Information You Provide</h3>
            <p className="text-gray-700 mb-4">
              We may collect information that you voluntarily provide to us, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Contact information such as name and email address</li>
              <li>Communication preferences</li>
              <li>Feedback and correspondence</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Automatically Collected Information</h3>
            <p className="text-gray-700 mb-4">
              When you visit our website, we may automatically collect certain information, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>IP address</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website addresses</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Provide and maintain our website</li>
              <li>Improve user experience</li>
              <li>Analyze website usage and trends</li>
              <li>Respond to your inquiries and requests</li>
              <li>Send you updates and promotional materials (with your consent)</li>
              <li>Detect and prevent fraud or abuse</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 mb-4">
              We use cookies and similar tracking technologies to track activity on our website and store
              certain information. Cookies are files with a small amount of data that are stored on your device.
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Third-Party Services</h2>
            <p className="text-gray-700 mb-4">
              We may use third-party services such as analytics providers and advertising partners. These
              third parties may have access to your information only to perform tasks on our behalf and are
              obligated not to disclose or use it for any other purpose.
            </p>
            <p className="text-gray-700 mb-4">Key third-party services we use:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Google Analytics for website analytics</li>
              <li>Google AdSense for advertising</li>
              <li>Amazon Associates Program for affiliate links</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Amazon Affiliate Program</h2>
            <p className="text-gray-700 mb-4">
              getphone.xyz is a participant in the Amazon Associates Program, an affiliate advertising
              program designed to provide a means for sites to earn advertising fees by advertising and
              linking to Amazon.in. When you click on Amazon links on our website and make a purchase,
              we may earn a commission at no additional cost to you.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement appropriate technical and organizational measures to protect your personal
              information. However, no method of transmission over the Internet or electronic storage
              is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Your Rights</h2>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Object to processing of your personal information</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
            <p className="text-gray-700 mb-4">
              Our website is not intended for children under the age of 13. We do not knowingly collect
              personal information from children under 13. If you are a parent or guardian and believe
              your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by
              posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy, please contact us through our{' '}
              <button
                onClick={() => onNavigate('contact')}
                className="text-blue-600 hover:underline"
              >
                Contact page
              </button>
              .
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
