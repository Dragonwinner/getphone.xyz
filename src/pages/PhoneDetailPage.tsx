import { Star, ShoppingCart, Check } from 'lucide-react';
import SEO from '../components/SEO';
import PhoneCard from '../components/PhoneCard';
import { phones, brands, categories } from '../data/mockData';

interface PhoneDetailPageProps {
  slug: string;
  onNavigate: (page: string, slug?: string) => void;
}

export default function PhoneDetailPage({ slug, onNavigate }: PhoneDetailPageProps) {
  const phone = phones.find((p) => p.slug === slug);

  if (!phone) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Phone Not Found</h1>
        <button
          onClick={() => onNavigate('home')}
          className="text-blue-600 hover:underline"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const brand = brands.find((b) => b.id === phone.brandId);
  const category = categories.find((c) => c.id === phone.categoryId);
  const relatedPhones = phones
    .filter((p) => p.id !== phone.id && (p.categoryId === phone.categoryId || p.brandId === phone.brandId))
    .slice(0, 4);

  const discount = phone.originalPrice
    ? Math.round(((phone.originalPrice - phone.price) / phone.originalPrice) * 100)
    : 0;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: phone.name,
    image: phone.imageUrl,
    description: phone.description,
    brand: {
      '@type': 'Brand',
      name: brand?.name,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: phone.rating,
      reviewCount: phone.reviewCount,
    },
    offers: {
      '@type': 'Offer',
      url: phone.amazonUrl,
      priceCurrency: 'INR',
      price: phone.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: phone.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <SEO
        title={phone.name}
        description={phone.description}
        keywords={`${phone.name}, ${brand?.name}, ${category?.name}, buy ${phone.name}, ${phone.name} price`}
        ogImage={phone.imageUrl}
        ogType="product"
  canonical={`https://getphone.xyz/phone/${phone.slug}`}
        structuredData={structuredData}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            <div>
              <div className="relative">
                <img
                  src={phone.imageUrl}
                  alt={phone.name}
                  className="w-full rounded-lg"
                />
                {discount > 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-lg font-bold">
                    {discount}% OFF
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="mb-4">
                <span className="text-sm text-blue-600 font-semibold">
                  {brand?.name} • {category?.name}
                </span>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">{phone.name}</h1>

              <div className="flex items-center mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(phone.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-lg text-gray-600">
                  {phone.rating} ({phone.reviewCount} reviews)
                </span>
              </div>

              <p className="text-gray-700 text-lg mb-6">{phone.description}</p>

              <div className="mb-6">
                <div className="flex items-baseline space-x-3">
                  <span className="text-5xl font-bold text-blue-600">₹{phone.price.toLocaleString('en-IN')}</span>
                  {phone.originalPrice && (
                    <span className="text-2xl text-gray-400 line-through">
                      ₹{phone.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                {phone.inStock ? (
                  <p className="text-green-600 font-semibold mt-2">✓ In Stock</p>
                ) : (
                  <p className="text-red-600 font-semibold mt-2">Out of Stock</p>
                )}
              </div>

              <a
                href={phone.amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-orange-500 text-white px-8 py-4 rounded-lg hover:bg-orange-600 transition-colors text-lg font-bold mb-6"
              >
                <ShoppingCart className="h-6 w-6" />
                <span>Buy on Amazon</span>
              </a>

              <div className="border-t pt-6">
                <h3 className="text-xl font-bold mb-4">Key Features</h3>
                <ul className="space-y-3">
                  {phone.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t p-8">
            <h2 className="text-3xl font-bold mb-6">Technical Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(phone.specs).map(([key, value]) => (
                <div key={key} className="flex justify-between py-3 border-b">
                  <span className="font-semibold text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-gray-600">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {relatedPhones.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Related Phones</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedPhones.map((relatedPhone) => (
                <PhoneCard
                  key={relatedPhone.id}
                  phone={relatedPhone}
                  onViewDetails={(slug) => onNavigate('phone', slug)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
