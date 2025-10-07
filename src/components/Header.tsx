import { Smartphone, Search, Menu, ArrowLeftRight } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onNavigate?: (page: string) => void;
}

export default function Header({ onSearch, onNavigate }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const navigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => navigate('home')}
            className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
          >
            <Smartphone className="h-8 w-8" />
            <span className="text-2xl font-bold">getphone.xyz</span>
          </button>

          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => navigate('home')}
              className="hover:text-blue-200 transition-colors font-medium"
            >
              Home
            </button>
            <button
              onClick={() => navigate('phones')}
              className="hover:text-blue-200 transition-colors font-medium"
            >
              All Phones
            </button>
            <button
              onClick={() => navigate('compare')}
              className="flex items-center gap-2 hover:text-blue-200 transition-colors font-medium"
            >
              <ArrowLeftRight className="h-4 w-4" />
              Compare
            </button>
          </nav>

          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search phones..."
                className="w-64 px-4 py-2 pr-10 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-blue-600"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </form>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-blue-700">
            <nav className="flex flex-col space-y-4">
              <button
                onClick={() => navigate('home')}
                className="text-left hover:text-blue-200 transition-colors font-medium"
              >
                Home
              </button>
              <button
                onClick={() => navigate('phones')}
                className="text-left hover:text-blue-200 transition-colors font-medium"
              >
                All Phones
              </button>
              <button
                onClick={() => navigate('compare')}
                className="flex items-center gap-2 hover:text-blue-200 transition-colors font-medium"
              >
                <ArrowLeftRight className="h-4 w-4" />
                Compare Phones
              </button>
              <form onSubmit={handleSearch} className="pt-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search phones..."
                    className="w-full px-4 py-2 pr-10 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-blue-600"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
