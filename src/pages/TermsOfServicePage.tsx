import SEO from '../components/SEO';

interface TermsOfServicePageProps {
  onNavigate: (page: string) => void;
}

export default function TermsOfServicePage({ onNavigate }: TermsOfServicePageProps) {
  return (
    <>
      <SEO
        title="Terms of Service"
  description="Terms of Service for getphone.xyz - Please read these terms carefully before using our website"
  canonical="https://getphone.xyz/terms-of-service"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <p className="text-gray-600 mb-6">Last Updated: October 7, 2025</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using getphone.xyz, you accept and agree to be bound by the terms and
              provision of this agreement. If you do not agree to these Terms of Service, please do not
              use our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-4">
              getphone.xyz provides information about mobile phones and smartphones, including prices,
              specifications, and affiliate links to Amazon India. We serve as an informational resource
              and comparison platform for mobile phone shoppers in India.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Use of Website</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Permitted Use</h3>
            <p className="text-gray-700 mb-4">You agree to use our website only for lawful purposes and in accordance with these Terms.</p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Prohibited Activities</h3>
            <p className="text-gray-700 mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Use the website in any way that violates any applicable law or regulation</li>
              <li>Engage in any data mining, scraping, or similar data gathering activities</li>
              <li>Attempt to gain unauthorized access to any portion of the website</li>
              <li>Interfere with or disrupt the website or servers</li>
              <li>Use automated systems to access the website without permission</li>
              <li>Impersonate any person or entity</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Affiliate Disclosure</h2>
            <p className="text-gray-700 mb-4">
              getphone.xyz participates in the Amazon Associates Program. We earn a commission when you
              purchase products through our affiliate links. This comes at no additional cost to you. Our
              recommendations and content are based on our genuine assessment of products and are not
              influenced by commission rates.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Product Information and Pricing</h2>
            <p className="text-gray-700 mb-4">
              We strive to provide accurate information about mobile phones and their prices. However:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Product information is provided for reference purposes only</li>
              <li>Prices are subject to change without notice</li>
              <li>We are not responsible for discrepancies in pricing or product details</li>
              <li>Final prices and product availability are determined by Amazon India</li>
              <li>We do not sell products directly or handle transactions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property Rights</h2>
            <p className="text-gray-700 mb-4">
              The website and its original content, features, and functionality are owned by getphone.xyz
              and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-gray-700 mb-4">
              Product images and brand names are property of their respective owners and are used for
              informational purposes only.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Third-Party Links</h2>
            <p className="text-gray-700 mb-4">
              Our website contains links to third-party websites, including Amazon India. We are not
              responsible for the content, privacy policies, or practices of third-party websites. You
              acknowledge and agree that we shall not be liable for any damage or loss caused by your
              use of third-party websites.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Disclaimer of Warranties</h2>
            <p className="text-gray-700 mb-4">
              The website is provided on an "as is" and "as available" basis without warranties of any kind,
              either express or implied. We do not warrant that:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>The website will be uninterrupted or error-free</li>
              <li>Defects will be corrected</li>
              <li>The website is free of viruses or harmful components</li>
              <li>The information provided is accurate, complete, or current</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              To the maximum extent permitted by law, getphone.xyz shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages resulting from your use of or inability
              to use the website, even if we have been advised of the possibility of such damages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Indemnification</h2>
            <p className="text-gray-700 mb-4">
              You agree to indemnify and hold harmless getphone.xyz and its affiliates from any claims,
              damages, losses, liabilities, and expenses arising from your use of the website or violation
              of these Terms of Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify these Terms of Service at any time. Changes will be effective
              immediately upon posting. Your continued use of the website after changes constitutes
              acceptance of the modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Governing Law</h2>
            <p className="text-gray-700 mb-4">
              These Terms of Service shall be governed by and construed in accordance with the laws of India.
              Any disputes relating to these terms shall be subject to the exclusive jurisdiction of the
              courts of India.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms of Service, please contact us through our{' '}
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
