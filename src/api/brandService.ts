import { apiClient } from './client';
import { Brand } from '../types';

export const brandService = {
  async getAllBrands(): Promise<Brand[]> {
    return apiClient.get<Brand[]>('/brands');
  },

  async getBrandBySlug(slug: string): Promise<Brand> {
    return apiClient.get<Brand>(`/brands/${slug}`);
  },
};
