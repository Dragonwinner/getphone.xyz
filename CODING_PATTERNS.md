# GetPhone.xyz - Coding Patterns & Best Practices

## Table of Contents

1. [Introduction](#introduction)
2. [Design Patterns Used](#design-patterns-used)
3. [Best Practices](#best-practices)
4. [Code Examples](#code-examples)
5. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
6. [Testing Patterns](#testing-patterns)
7. [Performance Patterns](#performance-patterns)
8. [Security Patterns](#security-patterns)

---

## Introduction

This document catalogs the design patterns, coding practices, and architectural decisions used in GetPhone.xyz. Each pattern is explained with real examples from the codebase.

### Why Patterns Matter

- **Consistency**: Same solutions to similar problems
- **Maintainability**: Easier to understand and modify
- **Scalability**: Proven solutions for growth
- **Communication**: Common vocabulary for team

---

## Design Patterns Used

### 1. Repository Pattern

**Purpose**: Abstract data access logic from business logic

**When to Use**: 
- Separate database operations from controllers
- Easy to test (mock the repository)
- Switch databases without changing business logic

**Implementation**:

```typescript
// ❌ Bad: Database logic in controller
export async function getPhone(req: Request, res: Response) {
  const query = 'SELECT * FROM phones WHERE slug = $1';
  const result = await pool.query(query, [req.params.slug]);
  res.json(result.rows[0]);
}

// ✅ Good: Repository pattern
// Model (Repository)
export class PhoneModel {
  static async findBySlug(slug: string): Promise<Phone | null> {
    const query = 'SELECT * FROM phones WHERE slug = $1';
    const result = await pool.query(query, [slug]);
    return result.rows[0] || null;
  }
}

// Controller
export async function getPhone(req: Request, res: Response) {
  const phone = await PhoneModel.findBySlug(req.params.slug);
  if (!phone) {
    throw new ApiError(404, 'Phone not found');
  }
  res.json(phone);
}
```

**Benefits**:
- Controller doesn't know about SQL
- Easy to mock PhoneModel in tests
- Can switch from PostgreSQL to MongoDB by changing only PhoneModel

---

### 2. Middleware Pattern

**Purpose**: Chain of responsibility for request processing

**When to Use**:
- Authentication/authorization
- Logging
- Rate limiting
- Input validation
- Error handling

**Implementation**:

```typescript
// Middleware chain
app.get('/api/admin/users',
  authenticate,        // 1. Verify JWT token
  requireAdmin,        // 2. Check admin role
  rateLimiter,         // 3. Rate limit
  validateQuery,       // 4. Validate input
  adminController.listUsers  // 5. Handle request
);

// Middleware functions
function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('No token');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next(); // Continue to next middleware
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}
```

**Flow Diagram**:
```
Request → authenticate → requireAdmin → rateLimiter → validateQuery → controller → Response
           ↓ fail        ↓ fail         ↓ fail        ↓ fail         ↓ success
         401            403            429            400             200
```

---

### 3. Factory Pattern

**Purpose**: Create objects without specifying exact class

**When to Use**:
- Multiple cache implementations (Redis, Memory)
- Different database drivers
- Various email providers

**Implementation**:

```typescript
// Factory interface
interface Cache {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
}

// Implementations
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

// Factory
export class CacheFactory {
  static create(type: 'redis' | 'memory'): Cache {
    switch (type) {
      case 'redis':
        return new RedisCache();
      case 'memory':
        return new MemoryCache();
      default:
        throw new Error(`Unknown cache type: ${type}`);
    }
  }
}

// Usage
const cache = CacheFactory.create(
  process.env.NODE_ENV === 'production' ? 'redis' : 'memory'
);

await cache.set('key', 'value', 300);
const value = await cache.get('key');
```

**Benefits**:
- Easy to switch implementations
- Test with MemoryCache, production with RedisCache
- Add new cache types without changing consumer code

---

### 4. Singleton Pattern

**Purpose**: Ensure only one instance exists

**When to Use**:
- Database connection pool
- Configuration manager
- Logger

**Implementation**:

```typescript
// ❌ Bad: Multiple connections
import { Pool } from 'pg';

export const pool1 = new Pool({ /* config */ });
export const pool2 = new Pool({ /* config */ }); // Waste of resources!

// ✅ Good: Singleton
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
      max: 20,
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

// Usage
export const pool = Database.getInstance().getPool();

// Always returns same instance
const pool1 = Database.getInstance().getPool();
const pool2 = Database.getInstance().getPool();
console.log(pool1 === pool2); // true
```

---

### 5. Strategy Pattern

**Purpose**: Select algorithm at runtime

**When to Use**:
- Different sorting methods
- Multiple payment gateways
- Various authentication methods

**Implementation**:

```typescript
// Strategy interface
interface SortStrategy {
  sort(phones: Phone[]): Phone[];
}

// Concrete strategies
class PriceSortStrategy implements SortStrategy {
  sort(phones: Phone[]): Phone[] {
    return [...phones].sort((a, b) => a.price - b.price);
  }
}

class RatingSortStrategy implements SortStrategy {
  sort(phones: Phone[]): Phone[] {
    return [...phones].sort((a, b) => b.rating - a.rating);
  }
}

class ReleaseDateSortStrategy implements SortStrategy {
  sort(phones: Phone[]): Phone[] {
    return [...phones].sort((a, b) => 
      new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
    );
  }
}

// Context
class PhoneSorter {
  private strategy: SortStrategy;

  constructor(strategy: SortStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: SortStrategy): void {
    this.strategy = strategy;
  }

  sort(phones: Phone[]): Phone[] {
    return this.strategy.sort(phones);
  }
}

// Usage
const phones = await PhoneModel.findAll();

// Sort by price
const sorter = new PhoneSorter(new PriceSortStrategy());
const sortedByPrice = sorter.sort(phones);

// Switch strategy
sorter.setStrategy(new RatingSortStrategy());
const sortedByRating = sorter.sort(phones);

// Or use strategy map
const strategies = {
  price: new PriceSortStrategy(),
  rating: new RatingSortStrategy(),
  release_date: new ReleaseDateSortStrategy(),
};

const sortBy = req.query.sort || 'price';
const sorter = new PhoneSorter(strategies[sortBy]);
const sorted = sorter.sort(phones);
```

---

### 6. Observer Pattern (Pub/Sub)

**Purpose**: Notify multiple subscribers of events

**When to Use**:
- Price updates trigger multiple actions
- User actions trigger analytics
- WebSocket broadcasts

**Implementation**:

```typescript
import { EventEmitter } from 'events';

// Event emitter
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

  public notifyPriceUpdate(phoneId: string, newPrice: number): void {
    this.emit('price:update', { phoneId, price: newPrice });
  }
}

// Subscribers
const emitter = PriceUpdateEmitter.getInstance();

// Subscriber 1: Invalidate cache
emitter.on('price:update', async (data) => {
  console.log('Subscriber 1: Invalidating cache...');
  await cache.del(`phone:${data.phoneId}`);
});

// Subscriber 2: WebSocket broadcast
emitter.on('price:update', (data) => {
  console.log('Subscriber 2: Broadcasting to clients...');
  websocketService.broadcastPriceUpdate(data.phoneId, data.price);
});

// Subscriber 3: Check price alerts
emitter.on('price:update', async (data) => {
  console.log('Subscriber 3: Checking price alerts...');
  await checkPriceAlerts(data.phoneId, data.price);
});

// Publisher
async function updatePhonePrice(phoneId: string, newPrice: number) {
  await pool.query(
    'UPDATE phones SET price = $1 WHERE id = $2',
    [newPrice, phoneId]
  );
  
  // Notify all subscribers
  emitter.notifyPriceUpdate(phoneId, newPrice);
}
```

**Flow**:
```
updatePhonePrice() 
  → emit('price:update')
    → Subscriber 1: Invalidate cache
    → Subscriber 2: WebSocket broadcast
    → Subscriber 3: Check alerts
```

---

### 7. Dependency Injection

**Purpose**: Inject dependencies instead of creating them

**When to Use**:
- Testing (inject mocks)
- Flexibility (swap implementations)
- Loose coupling

**Implementation**:

```typescript
// ❌ Bad: Hard-coded dependencies
export class PhoneService {
  async getPhone(slug: string) {
    // Hard-coded pool - can't test!
    const result = await pool.query('SELECT * FROM phones WHERE slug = $1', [slug]);
    return result.rows[0];
  }
}

// ✅ Good: Dependency injection
export class PhoneService {
  constructor(private db: Database, private cache: Cache) {}

  async getPhone(slug: string): Promise<Phone> {
    // Check cache
    const cacheKey = `phone:${slug}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // Query database
    const query = 'SELECT * FROM phones WHERE slug = $1';
    const result = await this.db.query(query, [slug]);
    const phone = result.rows[0];

    // Cache result
    await this.cache.set(cacheKey, JSON.stringify(phone), 3600);

    return phone;
  }
}

// Production usage
const phoneService = new PhoneService(pool, cache);

// Test usage (with mocks)
const mockDb = {
  query: jest.fn().mockResolvedValue({ rows: [{ id: '1', name: 'iPhone' }] })
};
const mockCache = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn()
};
const phoneService = new PhoneService(mockDb, mockCache);
```

---

## Best Practices

### 1. Error Handling

**Always use try-catch in async functions:**

```typescript
// ❌ Bad: Unhandled errors crash server
export async function getPhone(req: Request, res: Response) {
  const phone = await PhoneModel.findBySlug(req.params.slug);
  res.json(phone);
}

// ✅ Good: Proper error handling
export async function getPhone(req: Request, res: Response, next: NextFunction) {
  try {
    const phone = await PhoneModel.findBySlug(req.params.slug);
    if (!phone) {
      throw new ApiError(404, 'Phone not found');
    }
    res.json(phone);
  } catch (error) {
    next(error); // Pass to error handler middleware
  }
}
```

**Custom error classes:**

```typescript
export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

// Usage
throw new ApiError(400, 'Invalid input');
throw new ApiError(404, 'Not found');
throw new ApiError(500, 'Internal error');
```

---

### 2. Input Validation

**Validate all user input:**

```typescript
// ❌ Bad: No validation
export async function createPhone(req: Request, res: Response) {
  const phone = await PhoneModel.create(req.body);
  res.json(phone);
}

// ✅ Good: Validate with express-validator
import { body, validationResult } from 'express-validator';

export const validateCreatePhone = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 3, max: 255 }),
  
  body('price')
    .notEmpty()
    .isInt({ min: 0 }).withMessage('Price must be positive'),
  
  body('amazonUrl')
    .notEmpty()
    .isURL().withMessage('Invalid URL'),
  
  handleValidationErrors
];

function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  next();
}

// Route
router.post('/phones', validateCreatePhone, phoneController.createPhone);
```

---

### 3. SQL Injection Prevention

**Always use parameterized queries:**

```typescript
// ❌ DANGEROUS: SQL injection vulnerability
const query = `SELECT * FROM phones WHERE brand = '${req.query.brand}'`;
// If brand = "'; DROP TABLE phones; --" → deletes table!

// ✅ Safe: Parameterized query
const query = 'SELECT * FROM phones WHERE brand = $1';
const result = await pool.query(query, [req.query.brand]);
// Database escapes special characters automatically
```

---

### 4. Password Security

**Never store plain text passwords:**

```typescript
import bcrypt from 'bcrypt';

// ❌ Bad: Plain text password
await pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', 
  [email, password]); // NEVER!

// ✅ Good: Hash with bcrypt
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);
await pool.query('INSERT INTO users (email, password) VALUES ($1, $2)',
  [email, hashedPassword]);

// Verify password
const user = await UserModel.findByEmail(email);
const isValid = await bcrypt.compare(password, user.password);
```

---

### 5. Async/Await

**Use async/await over callbacks:**

```typescript
// ❌ Bad: Callback hell
pool.query('SELECT * FROM phones', (err, result1) => {
  if (err) return callback(err);
  
  pool.query('SELECT * FROM brands', (err, result2) => {
    if (err) return callback(err);
    
    pool.query('SELECT * FROM categories', (err, result3) => {
      if (err) return callback(err);
      
      callback(null, { result1, result2, result3 });
    });
  });
});

// ✅ Good: Async/await
async function getData() {
  try {
    const phones = await pool.query('SELECT * FROM phones');
    const brands = await pool.query('SELECT * FROM brands');
    const categories = await pool.query('SELECT * FROM categories');
    
    return { phones, brands, categories };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

---

### 6. Environment Variables

**Never hard-code sensitive data:**

```typescript
// ❌ Bad: Hard-coded credentials
const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'mypassword123', // NEVER!
  database: 'getphone'
});

// ✅ Good: Environment variables
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// .env file (gitignored)
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=mypassword123
DB_NAME=getphone
```

---

### 7. Logging

**Use structured logging:**

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// ❌ Bad: console.log
console.log('User logged in:', userId);

// ✅ Good: Structured logging
logger.info('User logged in', { userId, email, timestamp: Date.now() });
logger.error('Database error', { error: err.message, query, params });
```

---

## Anti-Patterns to Avoid

### 1. God Objects

**❌ Bad**: One class does everything

```typescript
class PhoneManager {
  async createPhone() { /* ... */ }
  async updatePhone() { /* ... */ }
  async deletePhone() { /* ... */ }
  async sendEmail() { /* ... */ }
  async trackAnalytics() { /* ... */ }
  async processPayment() { /* ... */ }
  // 50 more methods...
}
```

**✅ Good**: Single Responsibility Principle

```typescript
class PhoneModel { /* CRUD operations */ }
class EmailService { /* Email operations */ }
class AnalyticsService { /* Analytics */ }
class PaymentService { /* Payments */ }
```

---

### 2. Callback Hell

Already covered in Best Practices #5

---

### 3. Magic Numbers

**❌ Bad**: Unexplained numbers

```typescript
await cache.set(key, value, 300); // What's 300?
if (user.age < 18) { /* ... */ }  // Magic number
```

**✅ Good**: Named constants

```typescript
const CACHE_TTL_SECONDS = 300;
const LEGAL_AGE = 18;

await cache.set(key, value, CACHE_TTL_SECONDS);
if (user.age < LEGAL_AGE) { /* ... */ }
```

---

### 4. Premature Optimization

**❌ Bad**: Optimizing before measuring

```typescript
// Spending hours optimizing this rarely-called function
function calculateDiscount(price: number): number {
  // Complex bit manipulation for 0.001ms gain
  return (price * 0x19) >> 0x04; // What does this even do?
}
```

**✅ Good**: Optimize where it matters

```typescript
// Measure first
console.time('calculateDiscount');
const discount = calculateDiscount(price);
console.timeEnd('calculateDiscount');
// If it takes milliseconds and called rarely, don't optimize

// Optimize hot paths (called thousands of times)
// Cache database queries, optimize SQL, add indexes
```

---

### 5. Not Handling Edge Cases

**❌ Bad**: Assumes happy path

```typescript
function divide(a: number, b: number): number {
  return a / b; // What if b is 0?
}
```

**✅ Good**: Handle edge cases

```typescript
function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    throw new Error('Invalid input');
  }
  return a / b;
}
```

---

## Testing Patterns

### 1. Unit Testing

**Test individual functions:**

```typescript
import { describe, it, expect } from 'vitest';

describe('calculateDiscount', () => {
  it('should calculate 10% discount correctly', () => {
    expect(calculateDiscount(100, 10)).toBe(10);
  });

  it('should return 0 for 0% discount', () => {
    expect(calculateDiscount(100, 0)).toBe(0);
  });

  it('should handle negative discount', () => {
    expect(() => calculateDiscount(100, -10)).toThrow();
  });
});
```

---

### 2. Integration Testing

**Test API endpoints:**

```typescript
import request from 'supertest';
import app from '../index';

describe('GET /api/phones', () => {
  it('should return list of phones', async () => {
    const response = await request(app)
      .get('/api/phones')
      .expect(200);
    
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
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
```

---

### 3. Mocking

**Mock external dependencies:**

```typescript
// Mock database
jest.mock('../config/database', () => ({
  query: jest.fn()
}));

import pool from '../config/database';
const mockQuery = pool.query as jest.Mock;

describe('PhoneModel', () => {
  it('should find phone by slug', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: '1', name: 'iPhone 15', slug: 'iphone-15' }]
    });

    const phone = await PhoneModel.findBySlug('iphone-15');
    
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('WHERE slug = $1'),
      ['iphone-15']
    );
    expect(phone).toEqual({ id: '1', name: 'iPhone 15', slug: 'iphone-15' });
  });
});
```

---

## Performance Patterns

### 1. Caching

**Cache expensive operations:**

```typescript
async function getPhone(slug: string): Promise<Phone> {
  // 1. Check cache
  const cacheKey = `phone:${slug}`;
  const cached = await cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // 2. Query database
  const phone = await PhoneModel.findBySlug(slug);

  // 3. Cache result
  await cache.set(cacheKey, JSON.stringify(phone), 3600);

  return phone;
}
```

---

### 2. Database Optimization

**Use indexes:**

```sql
-- Slow without index (Seq Scan)
SELECT * FROM phones WHERE brand_id = 'abc-123';

-- Fast with index (Index Scan)
CREATE INDEX idx_phones_brand_id ON phones(brand_id);
```

**Avoid N+1 queries:**

```typescript
// ❌ Bad: N+1 queries
const phones = await pool.query('SELECT * FROM phones');
for (const phone of phones.rows) {
  const brand = await pool.query('SELECT * FROM brands WHERE id = $1', [phone.brand_id]);
  phone.brand_name = brand.rows[0].name;
}

// ✅ Good: Single JOIN query
const query = `
  SELECT p.*, b.name as brand_name
  FROM phones p
  LEFT JOIN brands b ON p.brand_id = b.id
`;
const phones = await pool.query(query);
```

---

### 3. Pagination

**Limit result sets:**

```typescript
// ❌ Bad: Fetch all (millions of rows)
const phones = await pool.query('SELECT * FROM phones');

// ✅ Good: Paginate
const limit = 20;
const offset = (page - 1) * limit;
const phones = await pool.query(
  'SELECT * FROM phones LIMIT $1 OFFSET $2',
  [limit, offset]
);
```

---

## Security Patterns

### 1. Rate Limiting

**Prevent abuse:**

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window
  message: 'Too many requests, please try again later'
});

app.use('/api/', limiter);
```

---

### 2. CORS Configuration

**Restrict origins:**

```typescript
import cors from 'cors';

// ❌ Bad: Allow all origins
app.use(cors());

// ✅ Good: Whitelist specific origins
app.use(cors({
  origin: ['https://getphone.xyz', 'https://www.getphone.xyz'],
  credentials: true
}));
```

---

### 3. Security Headers

**Use helmet.js:**

```typescript
import helmet from 'helmet';

app.use(helmet());
// Adds security headers:
// - X-Content-Type-Options: nosniff
// - X-Frame-Options: DENY
// - X-XSS-Protection: 1; mode=block
// - Strict-Transport-Security
```

---

## Conclusion

These patterns and practices are battle-tested solutions used in production systems. Apply them consistently to build maintainable, scalable, and secure applications.

**Key Takeaways:**
- ✅ Use design patterns to solve common problems
- ✅ Follow best practices for security and performance
- ✅ Avoid anti-patterns that lead to technical debt
- ✅ Write tests to ensure correctness
- ✅ Optimize based on measurement, not assumptions

**Remember**: Code is read more than it's written. Prioritize clarity and maintainability over cleverness.

---

**Related Documentation:**
- `TUTORIAL.md` - Code walkthrough with examples
- `LOW_LEVEL_DESIGN.md` - Detailed design specifications
- `SYSTEM_DESIGN.md` - High-level architecture
