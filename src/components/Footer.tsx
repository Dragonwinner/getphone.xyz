import { Smartphone } from 'lucide-react';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleNavigation = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Smartphone className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold">getphone.xyz</span>
            </div>
            <p className="text-gray-400 mb-4">
              India's trusted destination for finding the perfect mobile phone. We help you compare
              prices, features, and deals from Amazon India to make informed buying decisions.
            </p>
            <p className="text-sm text-gray-500">
              As an Amazon Associate, we earn from qualifying purchases.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNavigation('home')}
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('phones')}
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  All Phones
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('about')}
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('contact')}
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNavigation('privacy-policy')}
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('terms-of-service')}
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} getphone.xyz. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
