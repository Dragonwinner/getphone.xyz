# GetPhone.xyz - Low-Level Design (LLD)

## Table of Contents

1. [Introduction](#introduction)
2. [Module Architecture](#module-architecture)
3. [Class Diagrams](#class-diagrams)
4. [Design Patterns](#design-patterns)
5. [API Layer Design](#api-layer-design)
6. [Data Access Layer](#data-access-layer)
7. [Service Layer](#service-layer)
8. [Authentication & Authorization](#authentication--authorization)
9. [Caching Strategy](#caching-strategy)
10. [Error Handling](#error-handling)
11. [Validation & Sanitization](#validation--sanitization)
12. [Testing Strategy](#testing-strategy)

---

## Introduction

This document provides detailed low-level design specifications for the GetPhone.xyz platform. It covers module organization, class structures, design patterns, and implementation details for each component.

### Design Principles

1. **SOLID Principles**
   - Single Responsibility: Each module has one responsibility
   - Open/Closed: Open for extension, closed for modification
   - Liskov Substitution: Subtypes must be substitutable
   - Interface Segregation: Many specific interfaces over one general
   - Dependency Inversion: Depend on abstractions, not concretions

2. **DRY (Don't Repeat Yourself)**
   - Reusable components and utilities
   - Shared validation logic
   - Common error handling

3. **KISS (Keep It Simple, Stupid)**
   - Simple, readable code over clever solutions
   - Clear naming conventions
   - Minimal abstractions

4. **Separation of Concerns**
   - Routes → Controllers → Services → Models
   - Clear boundaries between layers

---

## Module Architecture

### Project Structure

```
getphone.xyz/
├── src/                          # Frontend source
│   ├── api/                      # API client layer
│   │   ├── client.ts             # HTTP client configuration
│   │   ├── phoneService.ts       # Phone API methods
│   │   ├── authService.ts        # Authentication API
│   │   ├── brandService.ts       # Brand API methods
│   │   └── categoryService.ts    # Category API methods
│   │
│   ├── components/               # Reusable UI components
│   │   ├── common/               # Generic components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Card.tsx
│   │   ├── phone/                # Phone-related components
│   │   │   ├── PhoneCard.tsx
│   │   │   ├── PhoneList.tsx
│   │   │   ├── PhoneDetail.tsx
│   │   │   └── ComparisonTable.tsx
│   │   ├── layout/               # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   └── form/                 # Form components
│   │       ├── FilterBar.tsx
│   │       └── SearchBox.tsx
│   │
│   ├── pages/                    # Page components (routes)
│   │   ├── HomePage.tsx
│   │   ├── PhoneListPage.tsx
│   │   ├── PhoneDetailPage.tsx
│   │   ├── ComparisonPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── usePhones.ts
│   │   ├── useDebounce.ts
│   │   └── useLocalStorage.ts
│   │
│   ├── utils/                    # Utility functions
│   │   ├── formatters.ts         # Number, date formatters
│   │   ├── validators.ts         # Input validation
│   │   └── helpers.ts            # Helper functions
│   │
│   ├── types.ts                  # TypeScript interfaces
│   ├── App.tsx                   # Root component
│   └── main.tsx                  # Entry point
│
├── server/                       # Backend source
│   ├── src/
│   │   ├── config/               # Configuration
│   │   │   ├── database.ts       # PostgreSQL connection pool
│   │   │   ├── redis.ts          # Redis client
│   │   │   ├── environment.ts    # Environment variables
│   │   │   └── schema.sql        # Database schema
│   │   │
│   │   ├── models/               # Data access layer
│   │   │   ├── Phone.ts          # Phone model (CRUD)
│   │   │   ├── User.ts           # User model
│   │   │   ├── Brand.ts          # Brand model
│   │   │   ├── Category.ts       # Category model
│   │   │   └── PriceTracking.ts  # Price tracking model
│   │   │
│   │   ├── controllers/          # Request handlers
│   │   │   ├── phoneController.ts
│   │   │   ├── authController.ts
│   │   │   ├── adminController.ts
│   │   │   ├── brandController.ts
│   │   │   └── categoryController.ts
│   │   │
│   │   ├── services/             # Business logic & external services
│   │   │   ├── amazonProductAPI.ts
│   │   │   ├── emailService.ts
│   │   │   ├── analyticsService.ts
│   │   │   ├── priceTrackingService.ts
│   │   │   ├── websocketService.ts
│   │   │   └── abTestingService.ts
│   │   │
│   │   ├── middleware/           # Express middleware
│   │   │   ├── auth.ts           # JWT authentication
│   │   │   ├── rateLimiter.ts    # Rate limiting
│   │   │   ├── errorHandler.ts   # Error handling
│   │   │   ├── validator.ts      # Input validation
│   │   │   └── analytics.ts      # Analytics tracking
│   │   │
│   │   ├── routes/               # API routes
│   │   │   ├── phones.ts
│   │   │   ├── auth.ts
│   │   │   ├── admin.ts
│   │   │   ├── brands.ts
│   │   │   └── categories.ts
│   │   │
│   │   ├── graphql/              # GraphQL layer
│   │   │   ├── schema.ts         # GraphQL schema
│   │   │   └── resolvers.ts      # GraphQL resolvers
│   │   │
│   │   ├── utils/                # Utility functions
│   │   │   ├── logger.ts         # Logging utility
│   │   │   ├── cache.ts          # Cache helpers
│   │   │   └── validators.ts     # Validation helpers
│   │   │
│   │   └── index.ts              # Server entry point
│   │
│   ├── migrations/               # Database migrations
│   ├── package.json
│   └── tsconfig.json
│
└── mobile/                       # React Native app
    ├── src/
    │   ├── screens/
    │   ├── components/
    │   ├── navigation/
    │   ├── store/
    │   └── services/
    └── package.json
```

---

## Class Diagrams

### Backend Models

#### Phone Model

```typescript
/**
 * Phone Model - Data Access Layer
 * Handles all database operations for phones
 */
export class PhoneModel {
  /**
   * Find all phones with filters
   * @param filters - Filter criteria (brand, category, price range, etc.)
   * @param options - Sorting and pagination options
   * @returns Array of phones with metadata
   */
  static async findAll(
    filters: PhoneFilters,
    options: QueryOptions
  ): Promise<PaginatedResult<Phone>> {
    // Implementation details below
  }

  /**
   * Find phone by slug
   * @param slug - URL-friendly phone identifier
   * @returns Phone with specs and features, or null
   */
  static async findBySlug(slug: string): Promise<PhoneWithDetails | null> {
    // Implementation details below
  }

  /**
   * Find multiple phones by IDs
   * @param ids - Array of phone IDs
   * @returns Array of phones
   */
  static async findByIds(ids: string[]): Promise<Phone[]> {
    // Implementation details below
  }

  /**
   * Create new phone
   * @param data - Phone data
   * @returns Created phone with generated ID
   */
  static async create(data: CreatePhoneInput): Promise<Phone> {
    // Implementation details below
  }

  /**
   * Update existing phone
   * @param id - Phone ID
   * @param data - Updated phone data
   * @returns Updated phone
   */
  static async update(id: string, data: UpdatePhoneInput): Promise<Phone> {
    // Implementation details below
  }

  /**
   * Delete phone
   * @param id - Phone ID
   * @returns Success boolean
   */
  static async delete(id: string): Promise<boolean> {
    // Implementation details below
  }

  /**
   * Search phones by text
   * @param query - Search query
   * @returns Array of matching phones
   */
  static async search(query: string): Promise<Phone[]> {
    // Implementation details below
  }
}

/**
 * Type Definitions
 */
interface Phone {
  id: string;
  name: string;
  slug: string;
  brand_id: string;
  category_id: string;
  description: string | null;
  price: number;
  original_price: number | null;
  amazon_url: string;
  asin: string | null;
  image_url: string | null;
  rating: number;
  review_count: number;
  release_date: Date | null;
  in_stock: boolean;
  is_featured: boolean;
  created_at: Date;
  updated_at: Date;
}

interface PhoneWithDetails extends Phone {
  brand_name: string;
  category_name: string;
  specs: PhoneSpecs | null;
  features: string[];
}

interface PhoneSpecs {
  display: string | null;
  processor: string | null;
  ram: string | null;
  storage: string | null;
  camera: string | null;
  battery: string | null;
  os: string | null;
}

interface PhoneFilters {
  brand?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
}

interface QueryOptions {
  sort?: 'price' | 'rating' | 'release_date' | 'review_count';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

#### User Model

```typescript
/**
 * User Model - Authentication & User Management
 */
export class UserModel {
  /**
   * Create new user
   * @param data - User registration data
   * @returns Created user (without password)
   */
  static async create(data: CreateUserInput): Promise<User> {
    const query = `
      INSERT INTO users (email, password, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, first_name, last_name, role, created_at
    `;
    
    const result = await pool.query(query, [
      data.email,
      data.password, // Already hashed by controller
      data.firstName,
      data.lastName,
      data.role || 'user'
    ]);
    
    return result.rows[0];
  }

  /**
   * Find user by email
   * @param email - User email
   * @returns User with password hash, or null
   */
  static async findByEmail(email: string): Promise<UserWithPassword | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  /**
   * Find user by ID
   * @param id - User ID
   * @returns User (without password), or null
   */
  static async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, email, first_name, last_name, role, 
             is_active, email_verified, created_at, last_login_at
      FROM users 
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Update last login timestamp
   * @param id - User ID
   */
  static async updateLastLogin(id: string): Promise<void> {
    const query = 'UPDATE users SET last_login_at = NOW() WHERE id = $1';
    await pool.query(query, [id]);
  }

  /**
   * Update user data
   * @param id - User ID
   * @param data - Updated user data
   * @returns Updated user
   */
  static async update(id: string, data: UpdateUserInput): Promise<User> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.firstName) {
      fields.push(`first_name = $${paramIndex++}`);
      values.push(data.firstName);
    }
    if (data.lastName) {
      fields.push(`last_name = $${paramIndex++}`);
      values.push(data.lastName);
    }
    if (data.isActive !== undefined) {
      fields.push(`is_active = $${paramIndex++}`);
      values.push(data.isActive);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE users 
      SET ${fields.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING id, email, first_name, last_name, role, 
                is_active, email_verified, created_at
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'user' | 'admin';
  is_active: boolean;
  email_verified: boolean;
  created_at: Date;
  last_login_at: Date | null;
}

interface UserWithPassword extends User {
  password: string; // bcrypt hash
}

interface CreateUserInput {
  email: string;
  password: string; // hashed
  firstName: string;
  lastName: string;
  role?: 'user' | 'admin';
}

interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}
```

---

## Design Patterns

### 1. Repository Pattern (Data Access Layer)

**Purpose:** Separate data access logic from business logic

**Implementation:**
```typescript
// Model acts as repository
export class PhoneModel {
  static async findAll(filters: PhoneFilters): Promise<Phone[]> {
    // Database query logic isolated here
  }
}

// Controller uses repository
export async function listPhones(req: Request, res: Response) {
  const phones = await PhoneModel.findAll(req.query);
  res.json(phones);
}
```

**Benefits:**
- Easy to test (mock the model)
- Easy to switch databases
- Single source of truth for queries

### 2. Middleware Pattern

**Purpose:** Chain of responsibility for request processing

**Implementation:**
```typescript
// app.ts
app.get('/api/admin/users',
  authenticate,      // 1. Check JWT token
  requireAdmin,      // 2. Check admin role
  validateQuery,     // 3. Validate query params
  adminController.listUsers  // 4. Handle request
);
```

**Flow:**
```
Request → authenticate → requireAdmin → validateQuery → controller → Response
           ↓ fail          ↓ fail          ↓ fail         ↓ success
         401 Unauthorized  403 Forbidden  400 Bad Request  200 OK
```

### 3. Factory Pattern

**Purpose:** Create objects without specifying exact class

**Implementation:**
```typescript
/**
 * Cache Factory - Create appropriate cache based on config
 */
export class CacheFactory {
  static create(type: 'redis' | 'memory'): Cache {
    if (type === 'redis') {
      return new RedisCache();
    } else {
      return new MemoryCache();
    }
  }
}

interface Cache {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
}

class RedisCache implements Cache {
  async get(key: string): Promise<string | null> {
    return await redis.get(key);
  }
  
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await redis.set(key, value, 'EX', ttl);
    } else {
      await redis.set(key, value);
    }
  }
  
  async del(key: string): Promise<void> {
    await redis.del(key);
  }
}

class MemoryCache implements Cache {
  private cache = new Map<string, { value: string; expires?: number }>();
  
  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    if (item.expires && Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }
  
  async set(key: string, value: string, ttl?: number): Promise<void> {
    this.cache.set(key, {
      value,
      expires: ttl ? Date.now() + ttl * 1000 : undefined
    });
  }
  
  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }
}
```

### 4. Singleton Pattern

**Purpose:** Ensure only one instance exists

**Implementation:**
```typescript
/**
 * Database Connection Pool (Singleton)
 */
import { Pool } from 'pg';

class Database {
  private static instance: Database;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 20, // Maximum connections
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public getPool(): Pool {
    return this.pool;
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}

export const pool = Database.getInstance().getPool();
```

### 5. Strategy Pattern

**Purpose:** Select algorithm at runtime

**Implementation:**
```typescript
/**
 * Sorting Strategy
 */
interface SortStrategy {
  sort(phones: Phone[]): Phone[];
}

class PriceSortStrategy implements SortStrategy {
  sort(phones: Phone[]): Phone[] {
    return phones.sort((a, b) => a.price - b.price);
  }
}

class RatingSortStrategy implements SortStrategy {
  sort(phones: Phone[]): Phone[] {
    return phones.sort((a, b) => b.rating - a.rating);
  }
}

class ReleaseDateSortStrategy implements SortStrategy {
  sort(phones: Phone[]): Phone[] {
    return phones.sort((a, b) => 
      new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
    );
  }
}

class PhoneSorter {
  private strategy: SortStrategy;

  constructor(strategy: SortStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: SortStrategy) {
    this.strategy = strategy;
  }

  sort(phones: Phone[]): Phone[] {
    return this.strategy.sort(phones);
  }
}

// Usage
const sorter = new PhoneSorter(new PriceSortStrategy());
const sortedPhones = sorter.sort(phones);
```

### 6. Observer Pattern (Pub/Sub)

**Purpose:** Notify multiple components of events

**Implementation:**
```typescript
/**
 * Event Emitter for Price Updates
 */
import { EventEmitter } from 'events';

class PriceUpdateEmitter extends EventEmitter {
  private static instance: PriceUpdateEmitter;

  private constructor() {
    super();
  }

  public static getInstance(): PriceUpdateEmitter {
    if (!PriceUpdateEmitter.instance) {
      PriceUpdateEmitter.instance = new PriceUpdateEmitter();
    }
    return PriceUpdateEmitter.instance;
  }

  public notifyPriceUpdate(phoneId: string, newPrice: number) {
    this.emit('price:update', { phoneId, price: newPrice });
  }
}

// Usage

// Subscribe to price updates
const emitter = PriceUpdateEmitter.getInstance();

emitter.on('price:update', async (data) => {
  // 1. Invalidate cache
  await redis.del(`phone:${data.phoneId}`);
  
  // 2. Notify WebSocket clients
  websocketService.broadcastPriceUpdate(data.phoneId, data.price);
  
  // 3. Check price alerts
  await checkPriceAlerts(data.phoneId, data.price);
});

// Publish price update
emitter.notifyPriceUpdate('phone-123', 59999);
```

---

## API Layer Design

### Controller Pattern

**Responsibilities:**
1. Parse and validate request
2. Call appropriate service/model
3. Format and return response
4. Handle errors

**Example: Phone Controller**

```typescript
/**
 * Phone Controller
 * Handles HTTP requests for phone-related operations
 */
import { Request, Response, NextFunction } from 'express';
import * as PhoneModel from '../models/Phone.js';
import { cache } from '../utils/cache.js';
import { ApiError } from '../utils/errors.js';

/**
 * List phones with filters and pagination
 * GET /api/phones
 */
export async function listPhones(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // 1. Parse and validate query parameters
    const filters: PhoneFilters = {
      brand: req.query.brand as string,
      category: req.query.category as string,
      minPrice: req.query.minPrice ? parseInt(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined,
      inStock: req.query.inStock === 'true',
      isFeatured: req.query.isFeatured === 'true',
    };

    const options: QueryOptions = {
      sort: (req.query.sort as any) || 'created_at',
      order: (req.query.order as any) || 'desc',
      page: parseInt(req.query.page as string) || 1,
      limit: Math.min(parseInt(req.query.limit as string) || 20, 100),
    };

    // 2. Generate cache key
    const cacheKey = `phones:${JSON.stringify(filters)}:${JSON.stringify(options)}`;

    // 3. Check cache
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // 4. Query database
    const result = await PhoneModel.findAll(filters, options);

    // 5. Cache result (5 minutes)
    await cache.set(cacheKey, JSON.stringify(result), 300);

    // 6. Return response
    res.json(result);
  } catch (error) {
    next(error); // Pass to error handler middleware
  }
}

/**
 * Get single phone by slug
 * GET /api/phones/:slug
 */
export async function getPhone(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { slug } = req.params;

    // Check cache
    const cacheKey = `phone:${slug}`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // Query database
    const phone = await PhoneModel.findBySlug(slug);

    if (!phone) {
      throw new ApiError(404, 'Phone not found');
    }

    // Cache result (1 hour)
    await cache.set(cacheKey, JSON.stringify(phone), 3600);

    res.json(phone);
  } catch (error) {
    next(error);
  }
}

/**
 * Compare multiple phones
 * GET /api/phones/compare?ids=id1,id2,id3
 */
export async function comparePhones(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const idsParam = req.query.ids as string;
    
    if (!idsParam) {
      throw new ApiError(400, 'Phone IDs are required');
    }

    const ids = idsParam.split(',').slice(0, 4); // Max 4 phones

    if (ids.length < 2) {
      throw new ApiError(400, 'At least 2 phones are required for comparison');
    }

    const phones = await PhoneModel.findByIds(ids);

    if (phones.length !== ids.length) {
      throw new ApiError(404, 'One or more phones not found');
    }

    // Format comparison data
    const comparison = formatComparisonData(phones);

    res.json(comparison);
  } catch (error) {
    next(error);
  }
}

/**
 * Create new phone (Admin only)
 * POST /api/phones
 */
export async function createPhone(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Validation already done by middleware
    const data: CreatePhoneInput = req.body;

    // Generate slug from name
    data.slug = generateSlug(data.name);

    // Check if slug already exists
    const existing = await PhoneModel.findBySlug(data.slug);
    if (existing) {
      throw new ApiError(409, 'Phone with this name already exists');
    }

    // Create phone
    const phone = await PhoneModel.create(data);

    // Invalidate list cache
    await cache.invalidatePattern('phones:*');

    res.status(201).json(phone);
  } catch (error) {
    next(error);
  }
}

/**
 * Update phone (Admin only)
 * PUT /api/phones/:id
 */
export async function updatePhone(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const data: UpdatePhoneInput = req.body;

    const phone = await PhoneModel.update(id, data);

    // Invalidate caches
    await cache.invalidatePattern(`phone:*`);
    await cache.invalidatePattern('phones:*');

    res.json(phone);
  } catch (error) {
    next(error);
  }
}

/**
 * Delete phone (Admin only)
 * DELETE /api/phones/:id
 */
export async function deletePhone(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;

    await PhoneModel.delete(id);

    // Invalidate caches
    await cache.invalidatePattern(`phone:*`);
    await cache.invalidatePattern('phones:*');

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

/**
 * Helper: Format comparison data
 */
function formatComparisonData(phones: PhoneWithDetails[]) {
  return {
    phones: phones.map(phone => ({
      ...phone,
      isBestPrice: false,
      isBestRating: false,
      // Will be set below
    })),
    bestPrice: Math.min(...phones.map(p => p.price)),
    bestRating: Math.max(...phones.map(p => p.rating)),
  };
}

/**
 * Helper: Generate URL-friendly slug
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
```

---

## Data Access Layer

### Query Builder Pattern

**Purpose:** Build dynamic SQL queries safely

**Implementation:**

```typescript
/**
 * Query Builder for dynamic SQL construction
 */
export class QueryBuilder {
  private query: string;
  private params: any[];
  private paramIndex: number;

  constructor(baseQuery: string) {
    this.query = baseQuery;
    this.params = [];
    this.paramIndex = 1;
  }

  /**
   * Add WHERE condition
   */
  where(condition: string, value: any): this {
    if (this.query.includes('WHERE')) {
      this.query += ' AND ';
    } else {
      this.query += ' WHERE ';
    }
    this.query += condition.replace('?', `$${this.paramIndex}`);
    this.params.push(value);
    this.paramIndex++;
    return this;
  }

  /**
   * Add WHERE IN condition
   */
  whereIn(column: string, values: any[]): this {
    if (values.length === 0) return this;

    if (this.query.includes('WHERE')) {
      this.query += ' AND ';
    } else {
      this.query += ' WHERE ';
    }

    const placeholders = values.map(() => `$${this.paramIndex++}`).join(', ');
    this.query += `${column} IN (${placeholders})`;
    this.params.push(...values);
    return this;
  }

  /**
   * Add ORDER BY clause
   */
  orderBy(column: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.query += ` ORDER BY ${column} ${direction}`;
    return this;
  }

  /**
   * Add LIMIT clause
   */
  limit(count: number): this {
    this.query += ` LIMIT $${this.paramIndex}`;
    this.params.push(count);
    this.paramIndex++;
    return this;
  }

  /**
   * Add OFFSET clause
   */
  offset(count: number): this {
    this.query += ` OFFSET $${this.paramIndex}`;
    this.params.push(count);
    this.paramIndex++;
    return this;
  }

  /**
   * Build final query
   */
  build(): { query: string; params: any[] } {
    return {
      query: this.query,
      params: this.params,
    };
  }
}

// Usage Example
export async function findAll(
  filters: PhoneFilters,
  options: QueryOptions
): Promise<PaginatedResult<Phone>> {
  const builder = new QueryBuilder(`
    SELECT p.*, b.name as brand_name, c.name as category_name
    FROM phones p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
  `);

  // Add filters dynamically
  if (filters.brand) {
    builder.where('b.slug = ?', filters.brand);
  }
  if (filters.category) {
    builder.where('c.slug = ?', filters.category);
  }
  if (filters.minPrice) {
    builder.where('p.price >= ?', filters.minPrice);
  }
  if (filters.maxPrice) {
    builder.where('p.price <= ?', filters.maxPrice);
  }
  if (filters.inStock) {
    builder.where('p.in_stock = ?', true);
  }
  if (filters.isFeatured) {
    builder.where('p.is_featured = ?', true);
  }

  // Add sorting
  const sortColumn = {
    price: 'p.price',
    rating: 'p.rating',
    release_date: 'p.release_date',
    review_count: 'p.review_count',
  }[options.sort || 'price'] || 'p.created_at';

  builder.orderBy(sortColumn, options.order?.toUpperCase() as any);

  // Add pagination
  const limit = options.limit || 20;
  const offset = ((options.page || 1) - 1) * limit;
  builder.limit(limit).offset(offset);

  // Execute query
  const { query, params } = builder.build();
  const result = await pool.query(query, params);

  // Get total count
  const countQuery = `
    SELECT COUNT(*) FROM phones p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
  `;
  const countBuilder = new QueryBuilder(countQuery);
  // Apply same filters for count...
  const countResult = await pool.query(countBuilder.build().query, countBuilder.build().params);
  const total = parseInt(countResult.rows[0].count);

  return {
    data: result.rows,
    meta: {
      page: options.page || 1,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}
```

---

## Service Layer

### Amazon Product API Service

```typescript
/**
 * Amazon Product API Service
 * Syncs product data from Amazon PA-API 5.0
 */
import crypto from 'crypto';
import axios from 'axios';

export class AmazonProductAPIService {
  private accessKey: string;
  private secretKey: string;
  private partnerTag: string;
  private host: string;
  private region: string;

  constructor() {
    this.accessKey = process.env.AMAZON_ACCESS_KEY!;
    this.secretKey = process.env.AMAZON_SECRET_KEY!;
    this.partnerTag = process.env.AMAZON_PARTNER_TAG!;
    this.host = 'webservices.amazon.in';
    this.region = 'eu-west-1';
  }

  /**
   * Get product details by ASIN
   */
  async getProductDetails(asin: string): Promise<AmazonProduct> {
    const endpoint = '/paapi5/getitems';
    const payload = {
      ItemIds: [asin],
      Resources: [
        'Images.Primary.Large',
        'ItemInfo.Title',
        'Offers.Listings.Price',
        'CustomerReviews.StarRating',
        'CustomerReviews.Count',
      ],
      PartnerTag: this.partnerTag,
      PartnerType: 'Associates',
      Marketplace: 'www.amazon.in',
    };

    const headers = this.signRequest(endpoint, JSON.stringify(payload));

    const response = await axios.post(
      `https://${this.host}${endpoint}`,
      payload,
      { headers }
    );

    return this.parseProduct(response.data.ItemsResult.Items[0]);
  }

  /**
   * Sign request with AWS Signature Version 4
   */
  private signRequest(endpoint: string, payload: string): Record<string, string> {
    const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
    const date = timestamp.substring(0, 8);

    // Create canonical request
    const canonicalRequest = [
      'POST',
      endpoint,
      '',
      `content-encoding:amz-1.0\ncontent-type:application/json; charset=utf-8\nhost:${this.host}\nx-amz-date:${timestamp}\n`,
      'content-encoding;content-type;host;x-amz-date',
      crypto.createHash('sha256').update(payload).digest('hex'),
    ].join('\n');

    // Create string to sign
    const credentialScope = `${date}/${this.region}/ProductAdvertisingAPI/aws4_request`;
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      timestamp,
      credentialScope,
      crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
    ].join('\n');

    // Calculate signature
    const signingKey = this.getSigningKey(date);
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

    // Return headers
    return {
      'content-encoding': 'amz-1.0',
      'content-type': 'application/json; charset=utf-8',
      'host': this.host,
      'x-amz-date': timestamp,
      'x-amz-target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems',
      'Authorization': `AWS4-HMAC-SHA256 Credential=${this.accessKey}/${credentialScope}, SignedHeaders=content-encoding;content-type;host;x-amz-date, Signature=${signature}`,
    };
  }

  /**
   * Get AWS signing key
   */
  private getSigningKey(date: string): Buffer {
    const kDate = crypto.createHmac('sha256', `AWS4${this.secretKey}`).update(date).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(this.region).digest();
    const kService = crypto.createHmac('sha256', kRegion).update('ProductAdvertisingAPI').digest();
    return crypto.createHmac('sha256', kService).update('aws4_request').digest();
  }

  /**
   * Parse Amazon API response
   */
  private parseProduct(item: any): AmazonProduct {
    return {
      asin: item.ASIN,
      title: item.ItemInfo?.Title?.DisplayValue,
      price: item.Offers?.Listings?.[0]?.Price?.Amount,
      imageUrl: item.Images?.Primary?.Large?.URL,
      rating: item.CustomerReviews?.StarRating?.Value,
      reviewCount: item.CustomerReviews?.Count,
      url: item.DetailPageURL,
    };
  }

  /**
   * Sync all phones with Amazon
   */
  async syncAllPhones(): Promise<SyncResult> {
    const phones = await PhoneModel.findAll({}, { limit: 1000 });
    let updated = 0;
    let failed = 0;

    for (const phone of phones.data) {
      if (!phone.asin) continue;

      try {
        const product = await this.getProductDetails(phone.asin);
        
        if (product.price && product.price !== phone.price) {
          // Update price
          await PhoneModel.update(phone.id, { price: product.price });
          
          // Record price history
          await PriceTracking.recordPrice(phone.id, product.price);
          
          updated++;
        }

        // Rate limiting: 1 request per second
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to sync phone ${phone.id}:`, error);
        failed++;
      }
    }

    return { updated, failed, total: phones.data.length };
  }
}

interface AmazonProduct {
  asin: string;
  title: string;
  price: number;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  url: string;
}

interface SyncResult {
  updated: number;
  failed: number;
  total: number;
}
```

---

## Authentication & Authorization

### JWT Service

```typescript
/**
 * JWT Token Service
 */
import jwt from 'jsonwebtoken';

export class TokenService {
  private accessTokenSecret: string;
  private refreshTokenSecret: string;
  private accessTokenExpiry: string;
  private refreshTokenExpiry: string;

  constructor() {
    this.accessTokenSecret = process.env.JWT_SECRET!;
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET!;
    this.accessTokenExpiry = '15m';
    this.refreshTokenExpiry = '7d';
  }

  /**
   * Generate access token (short-lived)
   */
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
    });
  }

  /**
   * Generate refresh token (long-lived)
   */
  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiry,
    });
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, this.accessTokenSecret) as TokenPayload;
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, this.refreshTokenSecret) as TokenPayload;
  }

  /**
   * Generate token pair
   */
  generateTokenPair(payload: TokenPayload): TokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }
}

interface TokenPayload {
  userId: string;
  role: 'user' | 'admin';
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const tokenService = new TokenService();
```

---

## Caching Strategy

### Cache Service

```typescript
/**
 * Cache Service with pattern-based invalidation
 */
import redis from '../config/redis';

export class CacheService {
  /**
   * Get cached value
   */
  async get(key: string): Promise<string | null> {
    return await redis.get(key);
  }

  /**
   * Set cached value with TTL
   */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await redis.set(key, value, 'EX', ttl);
    } else {
      await redis.set(key, value);
    }
  }

  /**
   * Delete cached value
   */
  async del(key: string): Promise<void> {
    await redis.del(key);
  }

  /**
   * Invalidate all keys matching pattern
   */
  async invalidatePattern(pattern: string): Promise<number> {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;
    return await redis.del(...keys);
  }

  /**
   * Get or set (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    // Not in cache, get from source
    const value = await factory();

    // Store in cache
    await this.set(key, JSON.stringify(value), ttl);

    return value;
  }
}

export const cache = new CacheService();
```

---

## Error Handling

### Custom Error Classes

```typescript
/**
 * Custom Error Classes
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends ApiError {
  errors: ValidationErrorDetail[];

  constructor(message: string, errors: ValidationErrorDetail[]) {
    super(400, message);
    this.errors = errors;
  }
}

interface ValidationErrorDetail {
  field: string;
  message: string;
}

/**
 * Error Handler Middleware
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        ...(err instanceof ValidationError && { errors: err.errors }),
      },
    });
  }

  // Log unexpected errors
  console.error('Unexpected error:', err);

  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(500).json({
    error: { message },
  });
}
```

---

## Validation & Sanitization

```typescript
/**
 * Input Validation using express-validator
 */
import { body, query, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';

/**
 * Phone creation validation
 */
export const validateCreatePhone = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 3, max: 255 }).withMessage('Name must be 3-255 characters'),
  
  body('brandId')
    .notEmpty().withMessage('Brand ID is required')
    .isUUID().withMessage('Invalid brand ID'),
  
  body('categoryId')
    .notEmpty().withMessage('Category ID is required')
    .isUUID().withMessage('Invalid category ID'),
  
  body('price')
    .notEmpty().withMessage('Price is required')
    .isInt({ min: 0 }).withMessage('Price must be a positive integer'),
  
  body('amazonUrl')
    .notEmpty().withMessage('Amazon URL is required')
    .isURL().withMessage('Invalid URL'),
  
  body('asin')
    .optional()
    .isLength({ min: 10, max: 10 }).withMessage('ASIN must be 10 characters'),
  
  body('imageUrl')
    .optional()
    .isURL().withMessage('Invalid image URL'),
  
  handleValidationErrors,
];

/**
 * Query parameter validation
 */
export const validateListPhones = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  query('minPrice')
    .optional()
    .isInt({ min: 0 }).withMessage('Min price must be a positive integer'),
  
  query('maxPrice')
    .optional()
    .isInt({ min: 0 }).withMessage('Max price must be a positive integer'),
  
  query('sort')
    .optional()
    .isIn(['price', 'rating', 'release_date', 'review_count'])
    .withMessage('Invalid sort field'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
  
  handleValidationErrors,
];

/**
 * Handle validation errors
 */
function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg,
    }));
    
    throw new ValidationError('Validation failed', formattedErrors);
  }
  
  next();
}
```

---

## Testing Strategy

### Unit Tests

```typescript
/**
 * Unit Test Example - Phone Model
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as PhoneModel from '../models/Phone';
import pool from '../config/database';

describe('PhoneModel', () => {
  beforeEach(async () => {
    // Setup test data
    await pool.query('BEGIN');
  });

  afterEach(async () => {
    // Cleanup
    await pool.query('ROLLBACK');
  });

  describe('findAll', () => {
    it('should return paginated phones', async () => {
      const result = await PhoneModel.findAll({}, { page: 1, limit: 10 });
      
      expect(result.data).toBeInstanceOf(Array);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.data.length).toBeLessThanOrEqual(10);
    });

    it('should filter by brand', async () => {
      const result = await PhoneModel.findAll(
        { brand: 'samsung' },
        { page: 1, limit: 10 }
      );
      
      result.data.forEach(phone => {
        expect(phone.brand_name.toLowerCase()).toBe('samsung');
      });
    });

    it('should filter by price range', async () => {
      const result = await PhoneModel.findAll(
        { minPrice: 20000, maxPrice: 50000 },
        { page: 1, limit: 10 }
      );
      
      result.data.forEach(phone => {
        expect(phone.price).toBeGreaterThanOrEqual(20000);
        expect(phone.price).toBeLessThanOrEqual(50000);
      });
    });
  });

  describe('findBySlug', () => {
    it('should return phone with details', async () => {
      const phone = await PhoneModel.findBySlug('iphone-15');
      
      expect(phone).toBeDefined();
      expect(phone?.slug).toBe('iphone-15');
      expect(phone).toHaveProperty('specs');
      expect(phone).toHaveProperty('features');
    });

    it('should return null for non-existent phone', async () => {
      const phone = await PhoneModel.findBySlug('non-existent');
      expect(phone).toBeNull();
    });
  });
});
```

### Integration Tests

```typescript
/**
 * Integration Test Example - Phone API
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index';
import pool from '../config/database';

describe('Phone API', () => {
  let authToken: string;

  beforeAll(async () => {
    // Login as admin
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123',
      });
    
    authToken = response.body.token;
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('GET /api/phones', () => {
    it('should return list of phones', async () => {
      const response = await request(app)
        .get('/api/phones')
        .expect(200);
      
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('total');
    });

    it('should filter by brand', async () => {
      const response = await request(app)
        .get('/api/phones?brand=samsung')
        .expect(200);
      
      response.body.data.forEach((phone: any) => {
        expect(phone.brand_name.toLowerCase()).toBe('samsung');
      });
    });
  });

  describe('POST /api/phones', () => {
    it('should create phone with valid data (admin)', async () => {
      const phoneData = {
        name: 'Test Phone',
        brandId: 'brand-uuid',
        categoryId: 'category-uuid',
        price: 29999,
        amazonUrl: 'https://amazon.in/test',
      };

      const response = await request(app)
        .post('/api/phones')
        .set('Authorization', `Bearer ${authToken}`)
        .send(phoneData)
        .expect(201);
      
      expect(response.body.name).toBe('Test Phone');
      expect(response.body.price).toBe(29999);
    });

    it('should reject without authentication', async () => {
      await request(app)
        .post('/api/phones')
        .send({})
        .expect(401);
    });

    it('should reject invalid data', async () => {
      const response = await request(app)
        .post('/api/phones')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'X' }) // Too short
        .expect(400);
      
      expect(response.body.error).toBeDefined();
    });
  });
});
```

---

## Conclusion

This low-level design document provides detailed implementation specifications for the GetPhone.xyz platform. Key takeaways:

1. **Layered Architecture**: Clear separation between routes, controllers, services, and models
2. **Design Patterns**: Repository, Middleware, Factory, Singleton, Strategy, Observer
3. **Type Safety**: TypeScript interfaces and types throughout
4. **Error Handling**: Custom error classes and centralized error handler
5. **Validation**: Input validation at API boundary
6. **Caching**: Strategic caching with invalidation
7. **Testing**: Unit and integration test examples

For complete implementation details, refer to:
- `TUTORIAL.md` - Step-by-step code walkthrough
- `SYSTEM_DESIGN.md` - High-level system architecture
- `DATABASE_DESIGN.md` - Database schema details
- Source code in `/src` and `/server/src` directories
