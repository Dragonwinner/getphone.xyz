import { buildSchema } from 'graphql';

/**
 * GraphQL Schema Definition
 */
export const schema = buildSchema(`
  type Brand {
    id: ID!
    name: String!
    slug: String!
    logoUrl: String
  }

  type Category {
    id: ID!
    name: String!
    slug: String!
    description: String
  }

  type PhoneSpecs {
    display: String
    processor: String
    ram: String
    storage: String
    camera: String
    battery: String
    os: String
  }

  type Phone {
    id: ID!
    name: String!
    slug: String!
    brand: Brand!
    category: Category!
    description: String
    price: Float!
    originalPrice: Float
    amazonUrl: String!
    asin: String
    imageUrl: String
    rating: Float!
    reviewCount: Int!
    specs: PhoneSpecs
    features: [String!]!
    inStock: Boolean!
    isFeatured: Boolean!
    releaseDate: String
    createdAt: String!
    updatedAt: String!
  }

  type PriceHistory {
    id: ID!
    phoneId: ID!
    price: Float!
    source: String!
    recordedAt: String!
  }

  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    role: String!
    emailVerified: Boolean!
    createdAt: String!
  }

  type PaginationInfo {
    page: Int!
    limit: Int!
    total: Int!
    totalPages: Int!
  }

  type PhoneConnection {
    phones: [Phone!]!
    pagination: PaginationInfo!
  }

  type Query {
    # Phones
    phone(id: ID, slug: String): Phone
    phones(
      page: Int
      limit: Int
      brandId: ID
      categoryId: ID
      minPrice: Float
      maxPrice: Float
      search: String
      sort: String
    ): PhoneConnection!
    comparePhones(ids: [ID!]!): [Phone!]!
    
    # Brands
    brand(id: ID, slug: String): Brand
    brands: [Brand!]!
    
    # Categories
    category(id: ID, slug: String): Category
    categories: [Category!]!
    
    # Price Tracking
    priceHistory(phoneId: ID!, days: Int): [PriceHistory!]!
    
    # User (requires authentication)
    me: User
  }

  type Mutation {
    # Authentication
    register(
      email: String!
      password: String!
      firstName: String!
      lastName: String!
    ): AuthPayload!
    
    login(email: String!, password: String!): AuthPayload!
    
    # Price Alerts
    createPriceAlert(phoneId: ID!, targetPrice: Float!): PriceAlert!
    deletePriceAlert(alertId: ID!): Boolean!
    
    # Analytics
    trackEvent(
      eventType: String!
      sessionId: String!
      data: String
    ): Boolean!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type PriceAlert {
    id: ID!
    phoneId: ID!
    targetPrice: Float!
    isActive: Boolean!
    createdAt: String!
  }
`);
