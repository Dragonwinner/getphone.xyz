import pool, { getClient } from './database.js';

const brands = [
  { name: 'Apple', slug: 'apple', logoUrl: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg' },
  { name: 'Samsung', slug: 'samsung', logoUrl: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg' },
  { name: 'Google', slug: 'google', logoUrl: 'https://images.pexels.com/photos/2582928/pexels-photo-2582928.jpeg' },
  { name: 'OnePlus', slug: 'oneplus', logoUrl: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg' },
  { name: 'Xiaomi', slug: 'xiaomi', logoUrl: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg' },
];

const categories = [
  { name: 'Flagship', slug: 'flagship', description: 'Premium flagship smartphones with cutting-edge technology' },
  { name: 'Mid-Range', slug: 'mid-range', description: 'Best value mid-range phones with great performance' },
  { name: 'Budget', slug: 'budget', description: 'Affordable smartphones perfect for everyday use' },
  { name: 'Gaming', slug: 'gaming', description: 'High-performance gaming smartphones' },
];

const phones = [
  {
    name: 'iPhone 15 Pro Max',
    slug: 'iphone-15-pro-max',
    brandSlug: 'apple',
    categorySlug: 'flagship',
    description: 'The ultimate iPhone with titanium design, A17 Pro chip, and advanced camera system. Experience the power of the most advanced iPhone ever made.',
    price: 99499,
    originalPrice: 107817,
    amazonUrl: 'https://www.amazon.in/dp/B0CHX1W1XY',
    asin: 'B0CHX1W1XY',
    imageUrl: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg',
    rating: 4.8,
    reviewCount: 2453,
    releaseDate: '2023-09-22',
    specs: {
      display: '6.7" Super Retina XDR',
      processor: 'A17 Pro',
      ram: '8GB',
      storage: '256GB',
      camera: '48MP Main + 12MP Ultra Wide + 12MP Telephoto',
      battery: '4422mAh',
      os: 'iOS 17',
    },
    features: ['Titanium Design', 'Action Button', 'USB-C', 'Dynamic Island', 'ProRAW & ProRes'],
    inStock: true,
    isFeatured: true,
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    slug: 'samsung-galaxy-s24-ultra',
    brandSlug: 'samsung',
    categorySlug: 'flagship',
    description: 'Samsung\'s most powerful flagship with S Pen, 200MP camera, and AI features. The pinnacle of Android innovation.',
    price: 107817,
    amazonUrl: 'https://www.amazon.in/dp/B0CMDRCX7K',
    asin: 'B0CMDRCX7K',
    imageUrl: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg',
    rating: 4.7,
    reviewCount: 1876,
    releaseDate: '2024-01-17',
    specs: {
      display: '6.8" Dynamic AMOLED 2X',
      processor: 'Snapdragon 8 Gen 3',
      ram: '12GB',
      storage: '256GB',
      camera: '200MP Main + 50MP Periscope + 12MP Ultra Wide',
      battery: '5000mAh',
      os: 'Android 14',
    },
    features: ['S Pen Included', 'Galaxy AI', '100x Space Zoom', 'Titanium Frame', 'Ray Tracing'],
    inStock: true,
    isFeatured: true,
  },
  {
    name: 'Google Pixel 8 Pro',
    slug: 'google-pixel-8-pro',
    brandSlug: 'google',
    categorySlug: 'flagship',
    description: 'Google\'s flagship with AI-powered camera, Tensor G3 chip, and pure Android experience. The smartest phone camera.',
    price: 82917,
    originalPrice: 91217,
    amazonUrl: 'https://www.amazon.in/dp/B0CGTD5KVT',
    asin: 'B0CGTD5KVT',
    imageUrl: 'https://images.pexels.com/photos/2582928/pexels-photo-2582928.jpeg',
    rating: 4.6,
    reviewCount: 1342,
    releaseDate: '2023-10-04',
    specs: {
      display: '6.7" LTPO OLED',
      processor: 'Google Tensor G3',
      ram: '12GB',
      storage: '128GB',
      camera: '50MP Main + 48MP Ultra Wide + 48MP Telephoto',
      battery: '5050mAh',
      os: 'Android 14',
    },
    features: ['Magic Eraser', 'Best Take', '7 Years Updates', 'Temperature Sensor', 'Night Sight'],
    inStock: true,
    isFeatured: true,
  },
  {
    name: 'OnePlus 12',
    slug: 'oneplus-12',
    brandSlug: 'oneplus',
    categorySlug: 'flagship',
    description: 'Flagship killer with Snapdragon 8 Gen 3, ultra-fast charging, and stunning display. Premium performance at a great price.',
    price: 66317,
    amazonUrl: 'https://www.amazon.in/dp/B0CS59WQTY',
    asin: 'B0CS59WQTY',
    imageUrl: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg',
    rating: 4.5,
    reviewCount: 892,
    releaseDate: '2024-01-23',
    specs: {
      display: '6.82" LTPO AMOLED',
      processor: 'Snapdragon 8 Gen 3',
      ram: '12GB',
      storage: '256GB',
      camera: '50MP Main + 64MP Periscope + 48MP Ultra Wide',
      battery: '5400mAh',
      os: 'OxygenOS 14',
    },
    features: ['100W Fast Charging', 'Hasselblad Camera', 'Alert Slider', 'Dolby Atmos', '120Hz Display'],
    inStock: true,
    isFeatured: true,
  },
  {
    name: 'Samsung Galaxy S24',
    slug: 'samsung-galaxy-s24',
    brandSlug: 'samsung',
    categorySlug: 'mid-range',
    description: 'Compact flagship with AI features and powerful performance. Perfect size with flagship capabilities.',
    price: 66317,
    originalPrice: 74617,
    amazonUrl: 'https://www.amazon.in/dp/B0CMDQX4JB',
    asin: 'B0CMDQX4JB',
    imageUrl: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg',
    rating: 4.6,
    reviewCount: 1523,
    releaseDate: '2024-01-17',
    specs: {
      display: '6.2" Dynamic AMOLED 2X',
      processor: 'Snapdragon 8 Gen 3',
      ram: '8GB',
      storage: '128GB',
      camera: '50MP Main + 12MP Ultra Wide + 10MP Telephoto',
      battery: '4000mAh',
      os: 'Android 14',
    },
    features: ['Galaxy AI', 'Armor Aluminum Frame', '3x Optical Zoom', 'Wireless Charging', 'IP68'],
    inStock: true,
    isFeatured: false,
  },
  {
    name: 'Google Pixel 8',
    slug: 'google-pixel-8',
    brandSlug: 'google',
    categorySlug: 'mid-range',
    description: 'Compact Pixel with excellent camera and AI features. The best Android experience in a smaller package.',
    price: 58017,
    amazonUrl: 'https://www.amazon.in/dp/B0CGTJ31Z5',
    asin: 'B0CGTJ31Z5',
    imageUrl: 'https://images.pexels.com/photos/2582928/pexels-photo-2582928.jpeg',
    rating: 4.5,
    reviewCount: 967,
    releaseDate: '2023-10-04',
    specs: {
      display: '6.2" OLED',
      processor: 'Google Tensor G3',
      ram: '8GB',
      storage: '128GB',
      camera: '50MP Main + 12MP Ultra Wide',
      battery: '4575mAh',
      os: 'Android 14',
    },
    features: ['Magic Eraser', '7 Years Updates', 'Face Unlock', 'Wireless Charging', 'IP68'],
    inStock: true,
    isFeatured: false,
  },
  {
    name: 'Xiaomi Redmi Note 13 Pro',
    slug: 'xiaomi-redmi-note-13-pro',
    brandSlug: 'xiaomi',
    categorySlug: 'budget',
    description: 'Budget champion with 200MP camera and AMOLED display. Incredible value for money.',
    price: 27307,
    amazonUrl: 'https://www.amazon.in/dp/B0CQV34F8M',
    asin: 'B0CQV34F8M',
    imageUrl: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg',
    rating: 4.4,
    reviewCount: 2134,
    releaseDate: '2024-01-04',
    specs: {
      display: '6.67" AMOLED',
      processor: 'Snapdragon 7s Gen 2',
      ram: '8GB',
      storage: '256GB',
      camera: '200MP Main + 8MP Ultra Wide + 2MP Macro',
      battery: '5000mAh',
      os: 'MIUI 14',
    },
    features: ['200MP Camera', '67W Fast Charging', 'AMOLED Display', 'Stereo Speakers', 'IP54'],
    inStock: true,
    isFeatured: false,
  },
  {
    name: 'OnePlus Nord CE 3',
    slug: 'oneplus-nord-ce-3',
    brandSlug: 'oneplus',
    categorySlug: 'budget',
    description: 'Budget-friendly OnePlus with fast charging and smooth performance. OnePlus experience at an affordable price.',
    price: 24817,
    originalPrice: 28967,
    amazonUrl: 'https://www.amazon.in/dp/B0C3SLWSKC',
    asin: 'B0C3SLWSKC',
    imageUrl: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg',
    rating: 4.3,
    reviewCount: 756,
    releaseDate: '2023-07-05',
    specs: {
      display: '6.7" AMOLED',
      processor: 'Snapdragon 782G',
      ram: '8GB',
      storage: '128GB',
      camera: '50MP Main + 8MP Ultra Wide + 2MP Macro',
      battery: '5000mAh',
      os: 'OxygenOS 13',
    },
    features: ['80W Fast Charging', 'AMOLED 120Hz', 'RAM Expansion', 'Stereo Speakers', 'Alert Slider'],
    inStock: true,
    isFeatured: false,
  },
];

async function seed() {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    console.log('Seeding brands...');
    const brandMap = new Map();
    for (const brand of brands) {
      const result = await client.query(
        `INSERT INTO brands (name, slug, logo_url) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (slug) DO UPDATE SET name = $1, logo_url = $3
         RETURNING id`,
        [brand.name, brand.slug, brand.logoUrl]
      );
      brandMap.set(brand.slug, result.rows[0].id);
    }
    
    console.log('Seeding categories...');
    const categoryMap = new Map();
    for (const category of categories) {
      const result = await client.query(
        `INSERT INTO categories (name, slug, description) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (slug) DO UPDATE SET name = $1, description = $3
         RETURNING id`,
        [category.name, category.slug, category.description]
      );
      categoryMap.set(category.slug, result.rows[0].id);
    }
    
    console.log('Seeding phones...');
    for (const phone of phones) {
      const brandId = brandMap.get(phone.brandSlug);
      const categoryId = categoryMap.get(phone.categorySlug);
      
      const phoneResult = await client.query(
        `INSERT INTO phones (name, slug, brand_id, category_id, description, price, original_price, 
                            amazon_url, asin, image_url, rating, review_count, release_date, 
                            in_stock, is_featured)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         ON CONFLICT (slug) DO UPDATE SET 
           name = $1, description = $5, price = $6, original_price = $7,
           amazon_url = $8, asin = $9, image_url = $10, rating = $11,
           review_count = $12, in_stock = $14, is_featured = $15
         RETURNING id`,
        [
          phone.name, phone.slug, brandId, categoryId, phone.description,
          phone.price, phone.originalPrice || null, phone.amazonUrl, phone.asin || null,
          phone.imageUrl, phone.rating, phone.reviewCount, phone.releaseDate,
          phone.inStock, phone.isFeatured
        ]
      );
      
      const phoneId = phoneResult.rows[0].id;
      
      await client.query(
        `INSERT INTO phone_specs (phone_id, display, processor, ram, storage, camera, battery, os)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (phone_id) DO UPDATE SET
           display = $2, processor = $3, ram = $4, storage = $5,
           camera = $6, battery = $7, os = $8`,
        [
          phoneId, phone.specs.display, phone.specs.processor, phone.specs.ram,
          phone.specs.storage, phone.specs.camera, phone.specs.battery, phone.specs.os
        ]
      );
      
      await client.query('DELETE FROM phone_features WHERE phone_id = $1', [phoneId]);
      for (const feature of phone.features) {
        await client.query(
          'INSERT INTO phone_features (phone_id, feature) VALUES ($1, $2)',
          [phoneId, feature]
        );
      }
    }
    
    await client.query('COMMIT');
    console.log('Database seeded successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((error) => {
  console.error('Seed script failed:', error);
  process.exit(1);
});
