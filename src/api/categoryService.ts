import { apiClient } from './client';
import { Category } from '../types';

export const categoryService = {
  async getAllCategories(): Promise<Category[]> {
    return apiClient.get<Category[]>('/categories');
  },

  async getCategoryBySlug(slug: string): Promise<Category> {
    return apiClient.get<Category>(`/categories/${slug}`);
  },
};
