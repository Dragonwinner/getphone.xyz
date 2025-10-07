import { useState, useMemo } from 'react';
import { SlidersHorizontal, ArrowLeftRight } from 'lucide-react';
import SEO from '../components/SEO';
import PhoneCard from '../components/PhoneCard';
import { phones, categories, brands } from '../data/mockData';

interface PhonesPageProps {
  onNavigate: (page: string, slug?: string, phoneIds?: string[]) => void;
  initialFilter?: string;
  searchQuery?: string;
}

export default function PhonesPage({ onNavigate, initialFilter, searchQuery }: PhonesPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialFilter || 'all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'rating'>('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const filteredAndSortedPhones = useMemo(() => {
    let filtered = [...phones];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (phone) =>
          phone.name.toLowerCase().includes(query) ||
          phone.description.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      const category = categories.find((c) => c.slug === selectedCategory);
      if (category) {
        filtered = filtered.filter((phone) => phone.categoryId === category.id);
      }
    }

    if (selectedBrand !== 'all') {
      const brand = brands.find((b) => b.slug === selectedBrand);
      if (brand) {
        filtered = filtered.filter((phone) => phone.brandId === brand.id);
      }
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return filtered;
  }, [selectedCategory, selectedBrand, sortBy, searchQuery]);

  const toggleCompareSelection = (phoneId: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(phoneId)) {
        return prev.filter(id => id !== phoneId);
      } else if (prev.length < 4) {
        return [...prev, phoneId];
      }
      return prev;
    });
  };

  const handleCompare = () => {
    if (selectedForCompare.length >= 2) {
      onNavigate('compare', undefined, selectedForCompare);
    }
  };

  return (
    <>
      <SEO
        title="Browse All Mobile Phones"
        description="Explore our complete collection of smartphones from top brands. Filter by category, brand, and price to find your ideal phone."
        keywords="all phones, smartphone catalog, phone comparison, mobile phone deals"
        canonical="https://getphone.xyz/phones"
      />

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'All Mobile Phones'}
          </h1>
          <p className="text-xl text-blue-100">
            {filteredAndSortedPhones.length} phone{filteredAndSortedPhones.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-3">Category</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === 'all'}
                      onChange={() => setSelectedCategory('all')}
                      className="mr-2"
                    />
                    All Categories
                  </label>
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category.slug}
                        onChange={() => setSelectedCategory(category.slug)}
                        className="mr-2"
                      />
                      {category.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-3">Brand</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="brand"
                      checked={selectedBrand === 'all'}
                      onChange={() => setSelectedBrand('all')}
                      className="mr-2"
                    />
                    All Brands
                  </label>
                  {brands.map((brand) => (
                    <label key={brand.id} className="flex items-center">
                      <input
                        type="radio"
                        name="brand"
                        checked={selectedBrand === brand.slug}
                        onChange={() => setSelectedBrand(brand.slug)}
                        className="mr-2"
                      />
                      {brand.name}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <SlidersHorizontal className="h-5 w-5" />
                <span>Show Filters</span>
              </button>

              {selectedForCompare.length > 0 && (
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedForCompare.length} phone{selectedForCompare.length !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={handleCompare}
                    disabled={selectedForCompare.length < 2}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                      selectedForCompare.length >= 2
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                    Compare
                  </button>
                  <button
                    onClick={() => setSelectedForCompare([])}
                    className="text-sm text-gray-600 hover:text-gray-900 underline"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {filteredAndSortedPhones.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-2xl text-gray-600">No phones found matching your criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedPhones.map((phone) => (
                  <PhoneCard
                    key={phone.id}
                    phone={phone}
                    onViewDetails={(slug) => onNavigate('phone', slug)}
                    showCompareCheckbox={true}
                    isSelectedForCompare={selectedForCompare.includes(phone.id)}
                    onToggleCompare={toggleCompareSelection}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
