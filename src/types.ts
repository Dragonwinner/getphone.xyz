export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Phone {
  id: string;
  name: string;
  slug: string;
  brandId: string;
  categoryId: string;
  description: string;
  price: number;
  originalPrice?: number;
  amazonUrl: string;
  asin?: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  specs: {
    display?: string;
    processor?: string;
    ram?: string;
    storage?: string;
    camera?: string;
    battery?: string;
    os?: string;
  };
  features: string[];
  inStock: boolean;
  isFeatured: boolean;
  releaseDate?: string;
}

export interface AffiliateAccount {
  id: string;
  accountName: string;
  affiliateTag: string;
  region: string;
  isActive: boolean;
}

export interface ProductSyncLog {
  id: string;
  phoneId: string;
  syncStatus: 'success' | 'failed' | 'pending';
  errorMessage?: string;
  syncedAt: string;
}

export interface ComparisonData {
  id: string;
  phones: Phone[];
  createdAt: string;
}
