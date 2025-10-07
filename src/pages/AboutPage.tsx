import { Target, Users, TrendingUp, Shield } from 'lucide-react';
import SEO from '../components/SEO';

export default function AboutPage() {
  return (
    <>
      <SEO
        title="About Us"
  description="Learn about getphone.xyz - India's trusted mobile phone comparison platform helping users find the best smartphone deals"
  canonical="https://getphone.xyz/about"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About getphone.xyz</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            India's trusted destination for finding the perfect mobile phone. We help you compare prices,
            features, and deals to make informed buying decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
            <p className="text-gray-700">
              To empower Indian consumers with comprehensive, accurate, and up-to-date information about
              mobile phones, helping them make confident purchasing decisions that best suit their needs
              and budget.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Who We Are</h2>
            <p className="text-gray-700">
              We are a team of technology enthusiasts and mobile phone experts based in India. Our passion
              for smartphones drives us to research, analyze, and present the most relevant information to
              help you find your perfect device.
            </p>
          </div>
        </div>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Price Comparison</h3>
              <p className="text-gray-700">
                We provide real-time pricing information from Amazon India, helping you find the best deals
                and save money on your next smartphone purchase.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Detailed Reviews</h3>
              <p className="text-gray-700">
                Our comprehensive reviews cover all aspects of mobile phones, from specifications and
                features to real-world performance and user experience.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Guidance</h3>
              <p className="text-gray-700">
                We curate and categorize phones to help you quickly find devices that match your specific
                needs, whether it's gaming, photography, or everyday use.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Choose getphone.xyz?</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">India-Focused Content</h3>
                <p className="text-gray-700">
                  All prices in INR, links to Amazon India, and information relevant to the Indian market.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Unbiased Information</h3>
                <p className="text-gray-700">
                  Our recommendations are based on genuine product assessment, not influenced by commission rates.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Regular Updates</h3>
                <p className="text-gray-700">
                  We continuously update our database with the latest models, prices, and offers.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                <span className="text-blue-600 font-bold">4</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Navigation</h3>
                <p className="text-gray-700">
                  Our intuitive interface makes it simple to search, filter, and compare phones based on
                  your preferences.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Affiliate Disclosure</h2>
          <p className="text-gray-700 max-w-3xl mx-auto">
            getphone.xyz participates in the Amazon Associates Program. When you purchase products through
            our affiliate links, we earn a commission at no additional cost to you. This helps us maintain
            and improve our website while keeping it free for all users. Our content and recommendations
            remain objective and unbiased.
          </p>
        </section>
      </div>
    </>
  );
}
