import { useState, useEffect } from 'react';
import { Phone } from '../types';
import { phones as mockPhones } from '../data/mockData';
import { Check, X, ArrowLeft, Plus, Trash2 } from 'lucide-react';

interface ComparePageProps {
  onNavigate: (page: string, slug?: string) => void;
  initialPhoneIds?: string[];
}

export default function ComparePage({ onNavigate, initialPhoneIds = [] }: ComparePageProps) {
  const [selectedPhones, setSelectedPhones] = useState<Phone[]>([]);
  const [availablePhones, setAvailablePhones] = useState<Phone[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (initialPhoneIds.length > 0) {
      const phones = mockPhones.filter(p => initialPhoneIds.includes(p.id));
      setSelectedPhones(phones);
    }
    setAvailablePhones(mockPhones);
  }, [initialPhoneIds]);

  const addPhone = (phone: Phone) => {
    if (selectedPhones.length < 4 && !selectedPhones.find(p => p.id === phone.id)) {
      setSelectedPhones([...selectedPhones, phone]);
      setShowAddModal(false);
    }
  };

  const removePhone = (phoneId: string) => {
    setSelectedPhones(selectedPhones.filter(p => p.id !== phoneId));
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const getBadge = (value: string | number | undefined, type: 'price' | 'rating' | 'storage' | 'ram' | 'battery' = 'price') => {
    if (!value) return 'neutral';

    if (type === 'price') {
      const prices = selectedPhones.map(p => p.price).filter(Boolean);
      const min = Math.min(...prices);
      return value === min ? 'best' : 'neutral';
    }

    if (type === 'rating') {
      const ratings = selectedPhones.map(p => p.rating).filter(Boolean);
      const max = Math.max(...ratings);
      return value === max ? 'best' : 'neutral';
    }

    if (type === 'storage' || type === 'ram') {
      const values = selectedPhones.map(p => {
        const spec = type === 'storage' ? p.specs.storage : p.specs.ram;
        return spec ? parseInt(spec) : 0;
      });
      const max = Math.max(...values);
      const current = typeof value === 'string' ? parseInt(value) : 0;
      return current === max ? 'best' : 'neutral';
    }

    if (type === 'battery') {
      const values = selectedPhones.map(p => {
        const spec = p.specs.battery;
        return spec ? parseInt(spec) : 0;
      });
      const max = Math.max(...values);
      const current = typeof value === 'string' ? parseInt(value) : 0;
      return current === max ? 'best' : 'neutral';
    }

    return 'neutral';
  };

  const specRows = [
    { label: 'Display', key: 'display' as const },
    { label: 'Processor', key: 'processor' as const },
    { label: 'RAM', key: 'ram' as const, type: 'ram' as const },
    { label: 'Storage', key: 'storage' as const, type: 'storage' as const },
    { label: 'Camera', key: 'camera' as const },
    { label: 'Battery', key: 'battery' as const, type: 'battery' as const },
    { label: 'OS', key: 'os' as const },
  ];

  if (selectedPhones.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => onNavigate('phones')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Phones
        </button>

        <div className="text-center py-20">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Compare Phones</h1>
          <p className="text-xl text-gray-600 mb-8">
            Select phones to compare their specifications side by side
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
          >
            <Plus className="w-6 h-6" />
            Add Phones to Compare
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={() => onNavigate('phones')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Phones
      </button>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Phone Comparison</h1>
        <p className="text-lg text-gray-600">
          Compare up to 4 phones side by side
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-48">
                  Specification
                </th>
                {selectedPhones.map(phone => (
                  <th key={phone.id} className="px-6 py-4 text-center border-l border-gray-200 min-w-64">
                    <div className="relative">
                      <button
                        onClick={() => removePhone(phone.id)}
                        className="absolute top-0 right-0 p-1 text-red-500 hover:text-red-700 transition-colors"
                        title="Remove from comparison"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <img
                        src={phone.imageUrl}
                        alt={phone.name}
                        className="w-32 h-32 object-cover rounded-lg mx-auto mb-4"
                      />
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{phone.name}</h3>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {formatPrice(phone.price)}
                        </span>
                        {getBadge(phone.price, 'price') === 'best' && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                            Best Price
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-1 text-yellow-500">
                        <span className="font-semibold">{phone.rating}</span>
                        <span className="text-gray-500 text-sm">({phone.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </th>
                ))}
                {selectedPhones.length < 4 && (
                  <th className="px-6 py-4 border-l border-gray-200 min-w-64">
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="w-full h-full flex flex-col items-center justify-center gap-2 text-blue-600 hover:text-blue-700 transition-colors py-8"
                    >
                      <Plus className="w-12 h-12" />
                      <span className="font-medium">Add Phone</span>
                    </button>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">Price</td>
                {selectedPhones.map(phone => (
                  <td key={phone.id} className="px-6 py-4 text-center border-l border-gray-200">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(phone.price)}
                      </span>
                      {phone.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(phone.originalPrice)}
                        </span>
                      )}
                    </div>
                  </td>
                ))}
                {selectedPhones.length < 4 && <td className="border-l border-gray-200"></td>}
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">Rating</td>
                {selectedPhones.map(phone => (
                  <td key={phone.id} className="px-6 py-4 text-center border-l border-gray-200">
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-semibold text-gray-900">{phone.rating} / 5</span>
                      <span className="text-sm text-gray-500">({phone.reviewCount} reviews)</span>
                    </div>
                  </td>
                ))}
                {selectedPhones.length < 4 && <td className="border-l border-gray-200"></td>}
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">Availability</td>
                {selectedPhones.map(phone => (
                  <td key={phone.id} className="px-6 py-4 text-center border-l border-gray-200">
                    <div className="flex items-center justify-center gap-2">
                      {phone.inStock ? (
                        <>
                          <Check className="w-5 h-5 text-green-500" />
                          <span className="text-green-700 font-medium">In Stock</span>
                        </>
                      ) : (
                        <>
                          <X className="w-5 h-5 text-red-500" />
                          <span className="text-red-700 font-medium">Out of Stock</span>
                        </>
                      )}
                    </div>
                  </td>
                ))}
                {selectedPhones.length < 4 && <td className="border-l border-gray-200"></td>}
              </tr>

              <tr className="bg-gray-50">
                <td colSpan={selectedPhones.length + (selectedPhones.length < 4 ? 2 : 1)} className="px-6 py-3">
                  <h3 className="text-lg font-bold text-gray-900">Specifications</h3>
                </td>
              </tr>

              {specRows.map(row => (
                <tr key={row.key} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{row.label}</td>
                  {selectedPhones.map(phone => {
                    const value = phone.specs[row.key];
                    const badge = row.type ? getBadge(value, row.type) : 'neutral';
                    return (
                      <td key={phone.id} className="px-6 py-4 text-center border-l border-gray-200">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-gray-900">{value || 'N/A'}</span>
                          {badge === 'best' && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                              Best
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  {selectedPhones.length < 4 && <td className="border-l border-gray-200"></td>}
                </tr>
              ))}

              <tr className="bg-gray-50">
                <td colSpan={selectedPhones.length + (selectedPhones.length < 4 ? 2 : 1)} className="px-6 py-3">
                  <h3 className="text-lg font-bold text-gray-900">Key Features</h3>
                </td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">Features</td>
                {selectedPhones.map(phone => (
                  <td key={phone.id} className="px-6 py-4 border-l border-gray-200">
                    <ul className="space-y-2">
                      {phone.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
                {selectedPhones.length < 4 && <td className="border-l border-gray-200"></td>}
              </tr>

              <tr className="bg-gray-50">
                <td colSpan={selectedPhones.length + (selectedPhones.length < 4 ? 2 : 1)} className="px-6 py-3">
                  <h3 className="text-lg font-bold text-gray-900">Purchase Options</h3>
                </td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">Buy Now</td>
                {selectedPhones.map(phone => (
                  <td key={phone.id} className="px-6 py-4 text-center border-l border-gray-200">
                    <div className="space-y-2">
                      <a
                        href={phone.amazonUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block w-full bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                      >
                        Buy on Amazon
                      </a>
                      <button
                        onClick={() => onNavigate('phone', phone.slug)}
                        className="inline-block w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </td>
                ))}
                {selectedPhones.length < 4 && <td className="border-l border-gray-200"></td>}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Add Phone to Compare</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availablePhones
                  .filter(phone => !selectedPhones.find(p => p.id === phone.id))
                  .map(phone => (
                    <div
                      key={phone.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-all cursor-pointer"
                      onClick={() => addPhone(phone)}
                    >
                      <img
                        src={phone.imageUrl}
                        alt={phone.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                      <h3 className="font-bold text-gray-900 mb-2">{phone.name}</h3>
                      <p className="text-lg font-bold text-blue-600 mb-2">
                        {formatPrice(phone.price)}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <span className="text-yellow-500 font-semibold">{phone.rating}</span>
                        <span>({phone.reviewCount})</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
