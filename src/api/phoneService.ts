import { apiClient } from './client';
import { Phone } from '../types';

export interface PhonesResponse {
  phones: Phone[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PhoneFilters {
  brandId?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  inStock?: boolean;
  isFeatured?: boolean;
}

export const phoneService = {
  async getPhones(
    page: number = 1,
    limit: number = 50,
    filters?: PhoneFilters,
    sortBy?: string,
    sortOrder: 'ASC' | 'DESC' = 'DESC'
  ): Promise<PhonesResponse> {
    return apiClient.get<PhonesResponse>('/phones', {
      page,
      limit,
      ...filters,
      sortBy,
      sortOrder,
    });
  },

  async getPhoneBySlug(slug: string): Promise<Phone> {
    return apiClient.get<Phone>(`/phones/${slug}`);
  },

  async comparePhones(phoneIds: string[]): Promise<Phone[]> {
    return apiClient.get<Phone[]>('/phones/compare', {
      ids: phoneIds.join(','),
    });
  },
};
