import { Star, ShoppingCart } from 'lucide-react';
import { Phone } from '../types';

interface PhoneCardProps {
  phone: Phone;
  onViewDetails: (slug: string) => void;
  showCompareCheckbox?: boolean;
  isSelectedForCompare?: boolean;
  onToggleCompare?: (phoneId: string) => void;
}

export default function PhoneCard({
  phone,
  onViewDetails,
  showCompareCheckbox = false,
  isSelectedForCompare = false,
  onToggleCompare
}: PhoneCardProps) {
  const discount = phone.originalPrice
    ? Math.round(((phone.originalPrice - phone.price) / phone.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        <img
          src={phone.imageUrl}
          alt={phone.name}
          className="w-full h-64 object-cover"
        />
        {showCompareCheckbox && onToggleCompare && (
          <div className="absolute top-2 left-2">
            <label className="flex items-center gap-2 bg-white bg-opacity-90 px-3 py-2 rounded-lg cursor-pointer hover:bg-opacity-100 transition-all">
              <input
                type="checkbox"
                checked={isSelectedForCompare}
                onChange={() => onToggleCompare(phone.id)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-900">Compare</span>
            </label>
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            {discount}% OFF
          </div>
        )}
        {!phone.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white text-xl font-bold">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{phone.name}</h3>

        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(phone.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">
            {phone.rating} ({phone.reviewCount} reviews)
          </span>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">{phone.description}</p>

        <div className="mb-4">
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-blue-600">₹{phone.price.toLocaleString('en-IN')}</span>
            {phone.originalPrice && (
              <span className="text-lg text-gray-400 line-through">
                ₹{phone.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onViewDetails(phone.slug)}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            View Details
          </button>
          <a
            href={phone.amazonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition-colors"
            title="Buy on Amazon"
          >
            <ShoppingCart className="h-6 w-6" />
          </a>
        </div>
      </div>
    </div>
  );
}
