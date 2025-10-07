import { Zap, Shield, TrendingUp, Smartphone } from 'lucide-react';
import SEO from '../components/SEO';
import PhoneCard from '../components/PhoneCard';
import { phones, categories, brands } from '../data/mockData';

interface HomePageProps {
  onNavigate: (page: string, slug?: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const featuredPhones = phones.filter((p) => p.isFeatured);

  const structuredData = {
    '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'getphone.xyz',
  url: 'https://getphone.xyz',
    logo: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg',
    description: 'Find the best mobile phones and smartphone deals on Amazon',
    sameAs: [],
  };

  return (
    <>
      <SEO
        title="Best Mobile Phone Deals"
        description="Discover the latest smartphones and best deals on mobile phones. Compare prices, features, and find your perfect phone from top brands like Apple, Samsung, and Google."
        keywords="mobile phones, smartphones, iPhone, Samsung Galaxy, phone deals, buy phones online"
  canonical="https://getphone.xyz"
        structuredData={structuredData}
      />

      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Find Your Perfect Phone
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Compare prices, features, and deals from top brands
          </p>
          <button
            onClick={() => onNavigate('phones')}
            className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-bold hover:bg-blue-50 transition-colors shadow-lg"
          >
            Browse All Phones
          </button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Latest Models</h3>
            <p className="text-gray-600">
              Access the newest smartphones from all major brands
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Best Prices</h3>
            <p className="text-gray-600">
              Compare deals and find the most competitive prices
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Trusted Reviews</h3>
            <p className="text-gray-600">
              Read authentic reviews from verified buyers
            </p>
          </div>
        </div>

        <h2 className="text-4xl font-bold text-center mb-12">Featured Phones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {featuredPhones.map((phone) => (
            <PhoneCard
              key={phone.id}
              phone={phone}
              onViewDetails={(slug) => onNavigate('phone', slug)}
            />
          ))}
        </div>

        <h2 className="text-4xl font-bold text-center mb-12">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onNavigate('phones', category.slug)}
              className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-8 rounded-xl hover:shadow-xl transition-all hover:scale-105"
            >
              <Smartphone className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
              <p className="text-blue-100">{category.description}</p>
            </button>
          ))}
        </div>

        <h2 className="text-4xl font-bold text-center mb-12">Popular Brands</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {brands.map((brand) => (
            <button
              key={brand.id}
              onClick={() => onNavigate('phones', brand.slug)}
              className="bg-white border-2 border-gray-200 p-6 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all"
            >
              <div className="aspect-square mb-3 overflow-hidden rounded-lg">
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-bold text-center">{brand.name}</h3>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
