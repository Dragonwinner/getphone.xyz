import axios from 'axios';
import crypto from 'crypto-js';

interface AmazonProductAPIConfig {
  accessKey: string;
  secretKey: string;
  partnerTag: string;
  region: string;
  host: string;
}

interface ProductDetails {
  asin: string;
  title: string;
  price?: number;
  availability?: string;
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;
  features?: string[];
}

/**
 * Amazon Product Advertising API Service
 * Handles interactions with Amazon PA-API 5.0
 */
class AmazonProductAPIService {
  private config: AmazonProductAPIConfig;

  constructor() {
    this.config = {
      accessKey: process.env.AMAZON_ACCESS_KEY || '',
      secretKey: process.env.AMAZON_SECRET_KEY || '',
      partnerTag: process.env.AMAZON_PARTNER_TAG || '',
      region: process.env.AMAZON_REGION || 'us-east-1',
      host: process.env.AMAZON_API_HOST || 'webservices.amazon.com'
    };
  }

  /**
   * Generate AWS Signature Version 4
   */
  private generateSignature(
    method: string,
    uri: string,
    queryString: string,
    headers: Record<string, string>,
    payload: string,
    timestamp: string
  ): string {
    const dateStamp = timestamp.slice(0, 8);
    const credentialScope = `${dateStamp}/${this.config.region}/ProductAdvertisingAPI/aws4_request`;

    // Create canonical request
    const canonicalHeaders = Object.keys(headers)
      .sort()
      .map(key => `${key.toLowerCase()}:${headers[key]}\n`)
      .join('');
    
    const signedHeaders = Object.keys(headers)
      .sort()
      .map(key => key.toLowerCase())
      .join(';');

    const payloadHash = crypto.SHA256(payload).toString();
    const canonicalRequest = `${method}\n${uri}\n${queryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

    // Create string to sign
    const canonicalRequestHash = crypto.SHA256(canonicalRequest).toString();
    const stringToSign = `AWS4-HMAC-SHA256\n${timestamp}\n${credentialScope}\n${canonicalRequestHash}`;

    // Calculate signature
    const kDate = crypto.HmacSHA256(dateStamp, `AWS4${this.config.secretKey}`);
    const kRegion = crypto.HmacSHA256(this.config.region, kDate);
    const kService = crypto.HmacSHA256('ProductAdvertisingAPI', kRegion);
    const kSigning = crypto.HmacSHA256('aws4_request', kService);
    const signature = crypto.HmacSHA256(stringToSign, kSigning).toString();

    return `AWS4-HMAC-SHA256 Credential=${this.config.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  }

  /**
   * Fetch product details from Amazon PA-API
   */
  async getProductDetails(asin: string): Promise<ProductDetails | null> {
    if (!this.config.accessKey || !this.config.secretKey) {
      console.warn('Amazon API credentials not configured');
      return null;
    }

    try {
      const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
      const payload = JSON.stringify({
        ItemIds: [asin],
        Resources: [
          'ItemInfo.Title',
          'Offers.Listings.Price',
          'Offers.Listings.Availability.Message',
          'Images.Primary.Large',
          'ItemInfo.Features',
          'CustomerReviews.StarRating',
          'CustomerReviews.Count'
        ],
        PartnerTag: this.config.partnerTag,
        PartnerType: 'Associates',
        Marketplace: 'www.amazon.com'
      });

      const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems',
        'X-Amz-Date': timestamp,
        'Host': this.config.host
      };

      const authorization = this.generateSignature(
        'POST',
        '/paapi5/getitems',
        '',
        headers,
        payload,
        timestamp
      );

      const response = await axios.post(
        `https://${this.config.host}/paapi5/getitems`,
        payload,
        {
          headers: {
            ...headers,
            'Authorization': authorization
          }
        }
      );

      const item = response.data.ItemsResult?.Items?.[0];
      if (!item) {
        return null;
      }

      return {
        asin: item.ASIN,
        title: item.ItemInfo?.Title?.DisplayValue || '',
        price: item.Offers?.Listings?.[0]?.Price?.Amount || undefined,
        availability: item.Offers?.Listings?.[0]?.Availability?.Message || undefined,
        rating: item.CustomerReviews?.StarRating?.Value || undefined,
        reviewCount: item.CustomerReviews?.Count || undefined,
        imageUrl: item.Images?.Primary?.Large?.URL || undefined,
        features: item.ItemInfo?.Features?.DisplayValues || undefined
      };
    } catch (error) {
      console.error('Error fetching product from Amazon API:', error);
      return null;
    }
  }

  /**
   * Sync product details for a phone
   */
  async syncProduct(asin: string): Promise<ProductDetails | null> {
    return this.getProductDetails(asin);
  }

  /**
   * Batch sync multiple products
   */
  async batchSyncProducts(asins: string[]): Promise<Map<string, ProductDetails | null>> {
    const results = new Map<string, ProductDetails | null>();
    
    // Process in batches of 10 (API limit)
    const batchSize = 10;
    for (let i = 0; i < asins.length; i += batchSize) {
      const batch = asins.slice(i, i + batchSize);
      const promises = batch.map(asin => this.getProductDetails(asin));
      const batchResults = await Promise.all(promises);
      
      batch.forEach((asin, index) => {
        results.set(asin, batchResults[index]);
      });
    }
    
    return results;
  }
}

export default new AmazonProductAPIService();
