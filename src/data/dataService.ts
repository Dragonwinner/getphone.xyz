import { Brand, Category, Phone } from '../types';
import { phoneService, PhoneFilters } from '../api/phoneService';
import { brandService } from '../api/brandService';
import { categoryService } from '../api/categoryService';

// Flag to determine if we should use API or mock data
const USE_API = import.meta.env.VITE_USE_API !== 'false';

// Import mock data as fallback
import { brands as mockBrands, categories as mockCategories, phones as mockPhones } from './mockData';

// Data service that can use either API or mock data
export const dataService = {
  async getBrands(): Promise<Brand[]> {
    if (USE_API) {
      try {
        return await brandService.getAllBrands();
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error);
        return mockBrands;
      }
    }
    return mockBrands;
  },

  async getBrandBySlug(slug: string): Promise<Brand | null> {
    if (USE_API) {
      try {
        return await brandService.getBrandBySlug(slug);
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error);
        return mockBrands.find(b => b.slug === slug) || null;
      }
    }
    return mockBrands.find(b => b.slug === slug) || null;
  },

  async getCategories(): Promise<Category[]> {
    if (USE_API) {
      try {
        return await categoryService.getAllCategories();
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error);
        return mockCategories;
      }
    }
    return mockCategories;
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    if (USE_API) {
      try {
        return await categoryService.getCategoryBySlug(slug);
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error);
        return mockCategories.find(c => c.slug === slug) || null;
      }
    }
    return mockCategories.find(c => c.slug === slug) || null;
  },

  async getPhones(
    filters?: PhoneFilters,
    sortBy?: string,
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): Promise<Phone[]> {
    if (USE_API) {
      try {
        const response = await phoneService.getPhones(1, 100, filters, sortBy, sortOrder);
        return response.phones;
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error);
        return this.getFilteredMockPhones(filters, sortBy, sortOrder);
      }
    }
    return this.getFilteredMockPhones(filters, sortBy, sortOrder);
  },

  async getPhoneBySlug(slug: string): Promise<Phone | null> {
    if (USE_API) {
      try {
        return await phoneService.getPhoneBySlug(slug);
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error);
        return mockPhones.find(p => p.slug === slug) || null;
      }
    }
    return mockPhones.find(p => p.slug === slug) || null;
  },

  async comparePhones(phoneIds: string[]): Promise<Phone[]> {
    if (USE_API) {
      try {
        return await phoneService.comparePhones(phoneIds);
      } catch (error) {
        console.warn('API call failed, falling back to mock data:', error);
        return mockPhones.filter(p => phoneIds.includes(p.id));
      }
    }
    return mockPhones.filter(p => phoneIds.includes(p.id));
  },

  // Helper method to filter mock phones (used as fallback)
  getFilteredMockPhones(
    filters?: PhoneFilters,
    sortBy?: string,
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): Phone[] {
    let filtered = [...mockPhones];

    if (filters?.brandId) {
      filtered = filtered.filter(p => p.brandId === filters.brandId);
    }

    if (filters?.categoryId) {
      filtered = filtered.filter(p => p.categoryId === filters.categoryId);
    }

    if (filters?.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price >= filters.minPrice!);
    }

    if (filters?.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= filters.maxPrice!);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.inStock !== undefined) {
      filtered = filtered.filter(p => p.inStock === filters.inStock);
    }

    if (filters?.isFeatured !== undefined) {
      filtered = filtered.filter(p => p.isFeatured === filters.isFeatured);
    }

    // Sort
    if (sortBy) {
      filtered.sort((a, b) => {
        let aVal: any, bVal: any;
        
        switch (sortBy) {
          case 'price':
            aVal = a.price;
            bVal = b.price;
            break;
          case 'rating':
            aVal = a.rating;
            bVal = b.rating;
            break;
          case 'review_count':
            aVal = a.reviewCount;
            bVal = b.reviewCount;
            break;
          default:
            return 0;
        }

        if (sortOrder === 'ASC') {
          return aVal - bVal;
        } else {
          return bVal - aVal;
        }
      });
    }

    return filtered;
  },
};
