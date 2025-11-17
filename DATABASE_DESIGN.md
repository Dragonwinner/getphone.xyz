# GetPhone.xyz - Database Design

## Table of Contents

1. [Overview](#overview)
2. [Entity-Relationship Diagram](#entity-relationship-diagram)
3. [Database Schema](#database-schema)
4. [Table Specifications](#table-specifications)
5. [Relationships](#relationships)
6. [Indexing Strategy](#indexing-strategy)
7. [Normalization](#normalization)
8. [Query Patterns & Optimization](#query-patterns--optimization)
9. [Data Types Rationale](#data-types-rationale)
10. [Constraints & Data Integrity](#constraints--data-integrity)
11. [Triggers & Functions](#triggers--functions)
12. [Scaling Considerations](#scaling-considerations)

---

## Overview

### Database Management System
- **DBMS**: PostgreSQL 16
- **Reason**: ACID compliance, advanced features (JSONB, full-text search), excellent performance

### Design Philosophy
1. **Normalization**: 3NF (Third Normal Form) for most tables
2. **Denormalization**: Strategic denormalization for read-heavy operations
3. **Flexibility**: JSONB for semi-structured data (analytics, experiments)
4. **Performance**: Strategic indexes on frequently queried columns
5. **Data Integrity**: Foreign keys, check constraints, triggers

### Database Statistics
- **Total Tables**: 17
- **Core Tables**: 6 (brands, categories, phones, phone_specs, phone_features, comparisons)
- **User Tables**: 4 (users, user_preferences, price_alerts, password_reset_tokens, email_verification_tokens)
- **Analytics Tables**: 3 (analytics_events, experiments, variant_assignments, experiment_conversions)
- **Operational Tables**: 4 (price_history, product_sync_log, affiliate_accounts)

---

## Entity-Relationship Diagram

### Core Entities ERD

```
┌─────────────────┐              ┌─────────────────┐              ┌─────────────────┐
│     Brands      │              │     Phones      │              │   Categories    │
├─────────────────┤              ├─────────────────┤              ├─────────────────┤
│ id (PK)         │              │ id (PK)         │              │ id (PK)         │
│ name            │              │ name            │              │ name            │
│ slug (UNIQUE)   │◄─────────────│ brand_id (FK)   │──────────────►│ slug (UNIQUE)   │
│ logo_url        │     1:N      │ category_id(FK) │     N:1      │ description     │
│ created_at      │              │ description     │              │ created_at      │
│ updated_at      │              │ price           │              │ updated_at      │
└─────────────────┘              │ amazon_url      │              └─────────────────┘
                                 │ rating          │
                                 │ in_stock        │
                                 │ is_featured     │
                                 │ created_at      │
                                 │ updated_at      │
                                 └────────┬────────┘
                                          │
                          ┌───────────────┼───────────────┐
                          │               │               │
                   ┌──────▼──────┐ ┌─────▼──────┐ ┌─────▼──────────┐
                   │ Phone_Specs │ │Phone       │ │ Price_History  │
                   │  (1:1)      │ │Features    │ │   (1:N)        │
                   ├─────────────┤ │ (1:N)      │ ├────────────────┤
                   │ id (PK)     │ ├────────────┤ │ id (PK)        │
                   │ phone_id(FK)│ │ id (PK)    │ │ phone_id (FK)  │
                   │ display     │ │ phone_id   │ │ price          │
                   │ processor   │ │   (FK)     │ │ source         │
                   │ ram         │ │ feature    │ │ recorded_at    │
                   │ storage     │ │ created_at │ └────────────────┘
                   │ camera      │ └────────────┘
                   │ battery     │
                   │ os          │
                   └─────────────┘


┌─────────────────┐              ┌─────────────────┐              ┌─────────────────┐
│     Users       │              │  Price Alerts   │              │     Phones      │
├─────────────────┤              ├─────────────────┤              ├─────────────────┤
│ id (PK)         │              │ id (PK)         │              │ id (PK)         │
│ email (UNIQUE)  │              │ user_id (FK)    │              │ (see above)     │
│ password        │◄─────────────│ phone_id (FK)   │──────────────►└─────────────────┘
│ first_name      │     1:N      │ target_price    │     N:1
│ last_name       │              │ is_active       │
│ role            │              │ created_at      │
│ is_active       │              │ triggered_at    │
│ email_verified  │              └─────────────────┘
│ created_at      │
│ last_login_at   │
└────────┬────────┘
         │
         │ 1:1
         │
┌────────▼────────┐
│ User_Preferences│
├─────────────────┤
│ user_id (PK,FK) │
│ price_alerts    │
│ email_notifs    │
│ analytics_opt   │
└─────────────────┘


┌─────────────────┐              ┌─────────────────┐              ┌─────────────────┐
│  Experiments    │              │ Variant_        │              │ Experiment_     │
│                 │              │ Assignments     │              │ Conversions     │
├─────────────────┤              ├─────────────────┤              ├─────────────────┤
│ id (PK)         │              │ id (PK)         │              │ id (PK)         │
│ name (UNIQUE)   │◄─────────────│ experiment_id   │              │ experiment_id   │
│ description     │     1:N      │   (FK)          │              │   (FK)          │
│ variants (JSON) │              │ session_id      │              │ session_id      │
│ is_active       │              │ variant         │              │ converted_at    │
│ start_date      │              │ assigned_at     │              └─────────────────┘
│ end_date        │              └─────────────────┘
└─────────────────┘
```

### Cardinality Summary

| Relationship | Type | Description |
|--------------|------|-------------|
| Brands → Phones | 1:N | One brand has many phones |
| Categories → Phones | 1:N | One category has many phones |
| Phones → Phone_Specs | 1:1 | One phone has one specs record |
| Phones → Phone_Features | 1:N | One phone has many features |
| Phones → Price_History | 1:N | One phone has many price records |
| Users → Price_Alerts | 1:N | One user has many alerts |
| Phones → Price_Alerts | 1:N | One phone can have many alerts |
| Users → User_Preferences | 1:1 | One user has one preferences record |
| Users → Analytics_Events | 1:N | One user generates many events |
| Experiments → Variant_Assignments | 1:N | One experiment has many assignments |
| Experiments → Experiment_Conversions | 1:N | One experiment has many conversions |

---

## Database Schema

### Complete Schema Visualization

```sql
-- Core Tables
brands (id, name, slug, logo_url, created_at, updated_at)
categories (id, name, slug, description, created_at, updated_at)
phones (id, name, slug, brand_id, category_id, price, amazon_url, asin, image_url, 
        rating, review_count, in_stock, is_featured, created_at, updated_at)
phone_specs (id, phone_id, display, processor, ram, storage, camera, battery, os)
phone_features (id, phone_id, feature, created_at)

-- User & Authentication
users (id, email, password, first_name, last_name, role, is_active, 
       email_verified, created_at, updated_at, last_login_at)
user_preferences (user_id, price_alerts, email_notifications, analytics_opt_in)
password_reset_tokens (id, user_id, token, expires_at, used, created_at)
email_verification_tokens (id, user_id, token, expires_at, used, created_at)

-- Price Tracking
price_history (id, phone_id, price, source, recorded_at)
price_alerts (id, user_id, phone_id, target_price, is_active, created_at, triggered_at)

-- Analytics & Experiments
analytics_events (id, event_type, user_id, session_id, data, timestamp)
experiments (id, name, description, variants, is_active, start_date, end_date)
variant_assignments (id, experiment_id, session_id, variant, assigned_at)
experiment_conversions (id, experiment_id, session_id, conversion_type, converted_at)

-- Operations
comparisons (id, session_id, phone_ids, created_at)
affiliate_accounts (id, account_name, affiliate_tag, region, is_active, created_at)
product_sync_log (id, phone_id, sync_status, error_message, synced_at)
```

---

## Table Specifications

### 1. Brands Table

**Purpose**: Store phone manufacturer information

```sql
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_brands_slug ON brands(slug);
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Columns:**
- `id`: UUID primary key (v4 random UUID)
- `name`: Brand name (e.g., "Samsung", "Apple")
- `slug`: URL-friendly identifier (e.g., "samsung", "apple") - **UNIQUE**
- `logo_url`: Brand logo image URL (optional)
- `created_at`: Record creation timestamp
- `updated_at`: Last modification timestamp (auto-updated by trigger)

**Why UUID over INT?**
- Distributed system friendly (no central counter)
- Cannot guess next ID (security)
- Unique across databases (easy merging)
- 128-bit = 2^128 possible values (practically infinite)

**Sample Data:**
```sql
INSERT INTO brands (name, slug, logo_url) VALUES
  ('Apple', 'apple', 'https://cdn.example.com/logos/apple.png'),
  ('Samsung', 'samsung', 'https://cdn.example.com/logos/samsung.png'),
  ('OnePlus', 'oneplus', 'https://cdn.example.com/logos/oneplus.png');
```

---

### 2. Categories Table

**Purpose**: Classify phones into categories

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);
```

**Columns:**
- `id`: UUID primary key
- `name`: Category name (e.g., "Flagship", "Mid-Range")
- `slug`: URL-friendly identifier
- `description`: Category description (optional)

**Sample Data:**
```sql
INSERT INTO categories (name, slug, description) VALUES
  ('Flagship', 'flagship', 'Premium flagship smartphones with cutting-edge features'),
  ('Mid-Range', 'mid-range', 'Affordable phones with good performance'),
  ('Budget', 'budget', 'Entry-level smartphones for basic usage'),
  ('Gaming', 'gaming', 'Phones optimized for gaming performance');
```

---

### 3. Phones Table (Core)

**Purpose**: Main product catalog

```sql
CREATE TABLE phones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  description TEXT,
  price INTEGER NOT NULL,              -- Price in paise/cents
  original_price INTEGER,              -- Original price (for discount calc)
  amazon_url TEXT NOT NULL,
  asin VARCHAR(50),                    -- Amazon Standard Identification Number
  image_url TEXT,
  rating DECIMAL(3,2) DEFAULT 0.0,     -- 0.00 to 9.99
  review_count INTEGER DEFAULT 0,
  release_date DATE,
  in_stock BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX idx_phones_brand_id ON phones(brand_id);
CREATE INDEX idx_phones_category_id ON phones(category_id);
CREATE INDEX idx_phones_slug ON phones(slug);
CREATE INDEX idx_phones_in_stock ON phones(in_stock);
CREATE INDEX idx_phones_is_featured ON phones(is_featured);
CREATE INDEX idx_phones_price ON phones(price);
CREATE INDEX idx_phones_rating ON phones(rating);
```

**Columns Explained:**

1. **id**: UUID primary key
2. **name**: Full phone name (e.g., "iPhone 15 Pro Max 256GB")
3. **slug**: URL identifier (e.g., "iphone-15-pro-max-256gb")
4. **brand_id**: Foreign key to brands table
   - `ON DELETE CASCADE`: If brand deleted, delete all phones
5. **category_id**: Foreign key to categories table
6. **description**: Detailed product description (markdown supported)
7. **price**: Current price in **paise** (₹59,999 stored as 5999900)
   - **Why integer?** Avoids floating-point precision issues
   - No decimal calculations = no rounding errors
8. **original_price**: MRP for discount calculation (optional)
9. **amazon_url**: Full Amazon product URL with affiliate tag
10. **asin**: Amazon's unique product identifier (10 chars)
11. **image_url**: Primary product image
12. **rating**: Average rating (0.00 to 9.99, 2 decimal places)
13. **review_count**: Number of reviews
14. **release_date**: Official release date
15. **in_stock**: Availability status
16. **is_featured**: Show on homepage/featured section

**Sample Data:**
```sql
INSERT INTO phones (name, slug, brand_id, category_id, price, original_price, 
                    amazon_url, asin, rating, review_count) VALUES
  ('iPhone 15 Pro Max 256GB', 'iphone-15-pro-max-256gb', 
   (SELECT id FROM brands WHERE slug='apple'),
   (SELECT id FROM categories WHERE slug='flagship'),
   13999900, 15999900,  -- ₹139,999 (₹159,999 MRP)
   'https://amazon.in/dp/B0CHX1W1XY?tag=getphone-21',
   'B0CHX1W1XY', 4.8, 1523);
```

---

### 4. Phone_Specs Table (One-to-One)

**Purpose**: Store technical specifications separately

**Why separate table?**
- Keeps phones table lean
- Optional data (not all phones need all specs)
- Easy to add new spec fields without altering phones table
- Better query performance (fetch specs only when needed)

```sql
CREATE TABLE phone_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_id UUID NOT NULL REFERENCES phones(id) ON DELETE CASCADE,
  display VARCHAR(255),      -- "6.7 inch Super Retina XDR OLED, 2796 x 1290"
  processor VARCHAR(255),    -- "Apple A17 Pro (3nm)"
  ram VARCHAR(100),          -- "8GB"
  storage VARCHAR(100),      -- "256GB / 512GB / 1TB"
  camera TEXT,               -- "48MP + 12MP + 12MP, 12MP front"
  battery VARCHAR(100),      -- "4422 mAh"
  os VARCHAR(100),           -- "iOS 17"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(phone_id)          -- Enforce one-to-one relationship
);

CREATE INDEX idx_phone_specs_phone_id ON phone_specs(phone_id);
```

**Why VARCHAR for numeric specs?**
- Flexibility: "8GB" vs "8GB LPDDR5" vs "8/12/16GB"
- Human-readable display
- No need for calculations on these fields
- Can include units and additional info

**Sample Data:**
```sql
INSERT INTO phone_specs (phone_id, display, processor, ram, storage, camera, battery, os)
SELECT id, 
  '6.7" Super Retina XDR OLED (2796x1290)',
  'Apple A17 Pro (3nm)',
  '8GB',
  '256GB',
  '48MP (f/1.78) + 12MP Telephoto (5x) + 12MP Ultra-wide, 12MP Front',
  '4422 mAh',
  'iOS 17'
FROM phones WHERE slug = 'iphone-15-pro-max-256gb';
```

---

### 5. Phone_Features Table (One-to-Many)

**Purpose**: Store phone features as separate rows

**Why separate table?**
- Multiple features per phone
- Easy to query ("find phones with feature X")
- Can add/remove features without schema changes
- Normalized design (no JSON array in phones table)

```sql
CREATE TABLE phone_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_id UUID NOT NULL REFERENCES phones(id) ON DELETE CASCADE,
  feature VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_phone_features_phone_id ON phone_features(phone_id);
```

**Sample Data:**
```sql
INSERT INTO phone_features (phone_id, feature)
SELECT id, feature FROM phones, unnest(ARRAY[
  '5G',
  'Face ID',
  'Water Resistant (IP68)',
  'Wireless Charging',
  'MagSafe',
  'Action Button',
  'Dynamic Island',
  'ProRAW',
  'ProRes Video'
]) AS feature
WHERE phones.slug = 'iphone-15-pro-max-256gb';
```

---

### 6. Users Table

**Purpose**: User authentication and management

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,     -- bcrypt hash (60 chars)
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active BOOLEAN DEFAULT true,     -- Soft delete
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**Security Considerations:**

1. **Password Storage**:
   - NEVER store plain text
   - Use bcrypt (one-way hash)
   - Salt rounds: 10 (2^10 iterations)
   - Hash length: 60 characters

2. **Email Uniqueness**:
   - UNIQUE constraint enforced
   - Index for fast lookup during login

3. **Role-Based Access**:
   - CHECK constraint: only 'user' or 'admin'
   - Default: 'user'

4. **Soft Delete**:
   - `is_active = false` instead of DELETE
   - Preserve user data for audit trail
   - Can reactivate account

**Sample bcrypt hash:**
```
$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
│  │  │                       Hash (31 chars)
│  │  Salt (22 chars)
│  Cost (10 = 2^10 = 1024 iterations)
Algorithm (2b = bcrypt)
```

---

### 7. Price_History Table (Time-Series)

**Purpose**: Track price changes over time

```sql
CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_id UUID REFERENCES phones(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,      -- Price in rupees (for easy graphing)
  source VARCHAR(50) DEFAULT 'amazon',
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Composite index for time-series queries
CREATE INDEX idx_price_history_phone ON price_history(phone_id, recorded_at DESC);
```

**Design Decisions:**

1. **Append-Only**: Never UPDATE or DELETE (audit trail)
2. **DECIMAL for price**: Human-readable, charts need decimal
3. **Composite Index**: Fast time-range queries
   - Example: "Get price history for last 30 days"
   - `(phone_id, recorded_at DESC)` = perfect for this query
4. **recorded_at**: When price was recorded (not when it changed)

**Query Examples:**

```sql
-- Get latest price for a phone
SELECT price, recorded_at 
FROM price_history 
WHERE phone_id = 'abc-123'
ORDER BY recorded_at DESC 
LIMIT 1;

-- Price trend last 30 days
SELECT DATE(recorded_at) as date, MIN(price) as low, MAX(price) as high
FROM price_history
WHERE phone_id = 'abc-123' 
  AND recorded_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(recorded_at)
ORDER BY date;

-- Lowest price ever
SELECT MIN(price) as lowest_price, MIN(recorded_at) as recorded_at
FROM price_history
WHERE phone_id = 'abc-123';
```

---

### 8. Price_Alerts Table

**Purpose**: User-defined price alerts

```sql
CREATE TABLE price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  phone_id UUID REFERENCES phones(id) ON DELETE CASCADE,
  target_price DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  triggered_at TIMESTAMP,
  UNIQUE(user_id, phone_id, target_price)  -- One alert per combination
);

CREATE INDEX idx_price_alerts_user ON price_alerts(user_id);
CREATE INDEX idx_price_alerts_phone ON price_alerts(phone_id);
CREATE INDEX idx_price_alerts_active ON price_alerts(is_active);
```

**Features:**

1. **UNIQUE Constraint**: Prevent duplicate alerts
2. **is_active**: Pause/resume alerts
3. **triggered_at**: When alert was triggered (NULL if never)
4. **Composite UNIQUE**: User can have multiple alerts for same phone at different prices

**Business Logic:**

```sql
-- Check if price drops below target (Cron job)
SELECT pa.*, p.price as current_price, u.email
FROM price_alerts pa
JOIN phones p ON pa.phone_id = p.id
JOIN users u ON pa.user_id = u.id
WHERE pa.is_active = true
  AND p.price <= pa.target_price
  AND pa.triggered_at IS NULL;
```

---

### 9. Analytics_Events Table

**Purpose**: Track user actions and events

```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(100) NOT NULL,
  data JSONB,                         -- Flexible event data
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_event_type ON analytics_events(event_type, timestamp DESC);
CREATE INDEX idx_analytics_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_user ON analytics_events(user_id);
```

**Event Types:**
- `page_view`: Page loaded
- `phone_view`: Phone detail viewed
- `search`: Search performed
- `comparison`: Comparison made
- `affiliate_click`: Amazon link clicked
- `user_register`: New user registered
- `user_login`: User logged in

**JSONB Data Field:**

```json
{
  "phone_id": "abc-123",
  "search_query": "best gaming phone",
  "referrer": "https://google.com",
  "user_agent": "Mozilla/5.0...",
  "ip_address": "103.x.x.x"
}
```

**Why JSONB?**
- Flexible schema (different events have different data)
- Can index JSON fields: `CREATE INDEX ON analytics_events USING GIN (data);`
- Query JSON: `WHERE data->>'phone_id' = 'abc-123'`
- Better than JSON: Binary format, faster queries

**Query Examples:**

```sql
-- Top viewed phones (last 7 days)
SELECT data->>'phone_id' as phone_id, COUNT(*) as views
FROM analytics_events
WHERE event_type = 'phone_view'
  AND timestamp >= NOW() - INTERVAL '7 days'
GROUP BY data->>'phone_id'
ORDER BY views DESC
LIMIT 10;

-- Conversion rate (clicks / views)
SELECT 
  COUNT(*) FILTER (WHERE event_type = 'phone_view') as views,
  COUNT(*) FILTER (WHERE event_type = 'affiliate_click') as clicks,
  ROUND(100.0 * COUNT(*) FILTER (WHERE event_type = 'affiliate_click') / 
        NULLIF(COUNT(*) FILTER (WHERE event_type = 'phone_view'), 0), 2) as conversion_rate
FROM analytics_events
WHERE timestamp >= NOW() - INTERVAL '30 days';
```

---

### 10. Experiments Table (A/B Testing)

**Purpose**: Define A/B test experiments

```sql
CREATE TABLE experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  variants JSONB NOT NULL,            -- {"A": "control", "B": "variation"}
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_experiments_active ON experiments(is_active);
```

**Sample Data:**

```sql
INSERT INTO experiments (name, description, variants) VALUES
  ('button-color-test',
   'Test orange vs blue buy button',
   '{"A": "orange", "B": "blue"}'::jsonb);
```

---

## Relationships

### Foreign Key Constraints

All relationships use foreign keys for referential integrity:

```sql
-- Example: Phones → Brands
brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE
```

**ON DELETE CASCADE**: When parent deleted, delete children automatically
- **Use when**: Child has no meaning without parent
- **Example**: Phone without brand doesn't make sense

**ON DELETE SET NULL**: When parent deleted, set foreign key to NULL
- **Use when**: Child can exist independently
- **Example**: Analytics event without user (user deleted)

**ON DELETE RESTRICT**: Prevent deletion if children exist
- **Use when**: Must manually clean up children first
- **Example**: Category with phones (must reassign or delete phones first)

### Relationship Matrix

| Parent | Child | Type | On Delete | Reason |
|--------|-------|------|-----------|--------|
| brands | phones | 1:N | CASCADE | Phone meaningless without brand |
| categories | phones | 1:N | CASCADE | Phone meaningless without category |
| phones | phone_specs | 1:1 | CASCADE | Specs belong to phone |
| phones | phone_features | 1:N | CASCADE | Features belong to phone |
| phones | price_history | 1:N | CASCADE | Price history belongs to phone |
| users | price_alerts | 1:N | CASCADE | Alert belongs to user |
| phones | price_alerts | 1:N | CASCADE | Alert belongs to phone |
| users | analytics_events | 1:N | SET NULL | Events independent, user opt-out |
| experiments | variant_assignments | 1:N | CASCADE | Assignment belongs to experiment |

---

## Indexing Strategy

### Why Index?

**Without Index:**
```sql
SELECT * FROM phones WHERE brand_id = 'abc-123';
-- Seq Scan on phones (cost=0..1000 rows=100000)
-- Scans EVERY row (slow!)
```

**With Index:**
```sql
CREATE INDEX idx_phones_brand_id ON phones(brand_id);
SELECT * FROM phones WHERE brand_id = 'abc-123';
-- Index Scan using idx_phones_brand_id (cost=0..100 rows=500)
-- Jumps directly to matching rows (fast!)
```

### Indexing Rules

1. **Primary Keys**: Auto-indexed
2. **Foreign Keys**: Always index (for JOINs)
3. **WHERE Clauses**: Index frequently filtered columns
4. **ORDER BY**: Index sort columns
5. **UNIQUE**: Automatically indexed

### Index Types

#### B-Tree Index (Default)
- Use for: =, <, >, <=, >=, BETWEEN, ORDER BY
- Most common index type

```sql
CREATE INDEX idx_phones_price ON phones(price);
SELECT * FROM phones WHERE price > 50000;  -- Uses index
```

#### Composite Index
- Multiple columns in one index
- Order matters! (phone_id, recorded_at) ≠ (recorded_at, phone_id)

```sql
CREATE INDEX idx_price_history_phone 
  ON price_history(phone_id, recorded_at DESC);

-- Fast query
SELECT * FROM price_history 
WHERE phone_id = 'abc' 
ORDER BY recorded_at DESC LIMIT 10;
```

#### GIN Index (Generalized Inverted Index)
- Use for: JSONB, arrays, full-text search

```sql
CREATE INDEX idx_analytics_data ON analytics_events USING GIN (data);

-- Fast JSONB query
SELECT * FROM analytics_events 
WHERE data->>'phone_id' = 'abc-123';
```

#### Partial Index
- Index only subset of rows

```sql
CREATE INDEX idx_phones_in_stock 
  ON phones(price) 
  WHERE in_stock = true;

-- Smaller index, faster queries
SELECT * FROM phones WHERE in_stock = true ORDER BY price;
```

### Index Maintenance

**Check Index Usage:**
```sql
SELECT 
  schemaname, tablename, indexname, 
  idx_scan as scans,
  idx_tup_read as tuples_read
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;
```

**Find Unused Indexes:**
```sql
SELECT * FROM pg_stat_user_indexes 
WHERE idx_scan = 0 
AND indexrelname NOT LIKE '%_pkey';
```

**Index Size:**
```sql
SELECT 
  indexname, 
  pg_size_pretty(pg_relation_size(indexname::regclass)) as size
FROM pg_indexes 
WHERE schemaname = 'public';
```

---

## Normalization

### What is Normalization?

**Goal**: Eliminate data redundancy and ensure data integrity

### Normal Forms

#### 1NF (First Normal Form)
✅ All our tables are in 1NF
- Atomic values (no arrays in columns)
- Each column has unique name
- Order doesn't matter

**Violation Example:**
```sql
-- ❌ Bad: Multiple values in one column
phones (name, features)
  ('iPhone', '5G, Face ID, Wireless Charging')

-- ✅ Good: Separate table
phones (name)
  ('iPhone')
phone_features (phone_id, feature)
  ('abc', '5G')
  ('abc', 'Face ID')
  ('abc', 'Wireless Charging')
```

#### 2NF (Second Normal Form)
✅ All our tables are in 2NF
- Must be in 1NF
- No partial dependencies (all non-key columns depend on entire primary key)

**Applies only to composite keys:**
```sql
-- ❌ Bad: brand_name depends only on brand_id (partial dependency)
order_items (order_id, phone_id, brand_id, brand_name, quantity)
  PK: (order_id, phone_id)
  
-- ✅ Good: brand_name in separate table
order_items (order_id, phone_id, quantity)
phones (phone_id, brand_id)
brands (brand_id, brand_name)
```

#### 3NF (Third Normal Form)
✅ Most our tables are in 3NF
- Must be in 2NF
- No transitive dependencies (non-key columns depend only on primary key)

**Example in our design:**
```sql
-- phones table is in 3NF
phones (id, name, brand_id, category_id, price)

-- brand_name and category_name retrieved via JOIN, not stored in phones
SELECT p.*, b.name as brand_name, c.name as category_name
FROM phones p
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN categories c ON p.category_id = c.id;
```

### Strategic Denormalization

**When to break normalization rules?**
1. Read-heavy workload
2. Complex JOINs hurt performance
3. Data rarely changes

**Example: Comparison Table**
```sql
-- Stores phone IDs as array (denormalized)
comparisons (id, session_id, phone_ids)
  ('...', 'session-123', '{abc-1, abc-2, abc-3}')

-- Why? 
-- - Read-only (no updates)
-- - Simple storage
-- - No JOIN needed
```

---

## Query Patterns & Optimization

### Common Query Patterns

#### 1. Listing Phones with Filters

```sql
-- Optimized query with proper indexes
SELECT 
  p.id, p.name, p.slug, p.price, p.rating, p.image_url,
  b.name as brand_name, b.slug as brand_slug,
  c.name as category_name
FROM phones p
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN categories c ON p.category_id = c.id
WHERE b.slug = $1               -- Uses idx_brands_slug
  AND c.slug = $2               -- Uses idx_categories_slug
  AND p.price BETWEEN $3 AND $4 -- Uses idx_phones_price
  AND p.in_stock = true         -- Uses idx_phones_in_stock
ORDER BY p.rating DESC          -- Uses idx_phones_rating
LIMIT 20 OFFSET 0;

-- Execution Plan:
-- 1. Index scan on brands (slug)
-- 2. Index scan on categories (slug)
-- 3. Index scan on phones (brand_id, category_id, price, in_stock)
-- 4. Index scan for ORDER BY (rating)
-- 5. Nested loop joins
```

#### 2. Phone Detail with Specs

```sql
-- Single query with LEFT JOINs
SELECT 
  p.*,
  b.name as brand_name,
  c.name as category_name,
  ps.display, ps.processor, ps.ram, ps.storage, 
  ps.camera, ps.battery, ps.os,
  ARRAY_AGG(DISTINCT pf.feature) as features
FROM phones p
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN phone_specs ps ON p.id = ps.phone_id
LEFT JOIN phone_features pf ON p.id = pf.phone_id
WHERE p.slug = $1
GROUP BY p.id, b.name, c.name, ps.*;

-- Uses:
-- - idx_phones_slug (direct lookup)
-- - idx_phone_specs_phone_id (specs JOIN)
-- - idx_phone_features_phone_id (features JOIN)
```

#### 3. Price History (Time-Series)

```sql
-- Optimized with composite index
SELECT 
  price, 
  recorded_at,
  LAG(price) OVER (ORDER BY recorded_at) as previous_price
FROM price_history
WHERE phone_id = $1
  AND recorded_at >= NOW() - INTERVAL '30 days'
ORDER BY recorded_at DESC;

-- Uses idx_price_history_phone (phone_id, recorded_at DESC)
-- Extremely fast: Index contains both columns in right order
```

#### 4. Search Phones (Full-Text)

```sql
-- Add tsvector column for full-text search
ALTER TABLE phones ADD COLUMN search_vector tsvector;

-- Update function
CREATE FUNCTION phones_search_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update
CREATE TRIGGER phones_search_update
BEFORE INSERT OR UPDATE ON phones
FOR EACH ROW EXECUTE FUNCTION phones_search_update();

-- GIN index for full-text search
CREATE INDEX idx_phones_search ON phones USING GIN(search_vector);

-- Fast search query
SELECT *, ts_rank(search_vector, query) as rank
FROM phones, to_tsquery('english', 'iphone & pro') as query
WHERE search_vector @@ query
ORDER BY rank DESC
LIMIT 20;
```

### Query Optimization Tips

1. **Use EXPLAIN ANALYZE**
   ```sql
   EXPLAIN ANALYZE SELECT * FROM phones WHERE brand_id = 'abc';
   -- Shows actual execution plan and timing
   ```

2. **Avoid SELECT ***
   ```sql
   -- ❌ Bad: Fetches all columns
   SELECT * FROM phones;
   
   -- ✅ Good: Fetch only needed columns
   SELECT id, name, price FROM phones;
   ```

3. **Use JOINs instead of subqueries**
   ```sql
   -- ❌ Slower: Subquery runs for each row
   SELECT * FROM phones 
   WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Apple');
   
   -- ✅ Faster: Single JOIN
   SELECT p.* FROM phones p
   JOIN brands b ON p.brand_id = b.id
   WHERE b.name = 'Apple';
   ```

4. **Limit Result Sets**
   ```sql
   -- Always use LIMIT for listings
   SELECT * FROM phones ORDER BY created_at DESC LIMIT 20;
   ```

5. **Use Connection Pooling**
   - Don't create new connection for each query
   - Reuse connections from pool (20-50 connections)

---

## Data Types Rationale

### UUID vs BIGINT vs VARCHAR

| Type | Pros | Cons | Use Case |
|------|------|------|----------|
| UUID | Distributed-friendly, unpredictable, infinite space | 16 bytes (vs 8 for BIGINT) | Primary keys |
| BIGINT | 8 bytes, sequential, fast | Predictable, central counter needed | When UUID not needed |
| VARCHAR | Variable length | Slower than INT for lookups | Natural keys (email, slug) |

### INTEGER vs DECIMAL vs NUMERIC

| Type | Precision | Use Case |
|------|-----------|----------|
| INTEGER | Exact (whole numbers) | Counts, IDs, prices (in paise) |
| DECIMAL(p,s) | Exact (p digits, s after decimal) | Money, ratings |
| NUMERIC | Exact (same as DECIMAL) | PostgreSQL alias |
| FLOAT/REAL | Approximate | Scientific calculations (not money!) |

**Price Storage:**
```sql
-- ❌ Bad: Floating point issues
price FLOAT  -- 19.99 might become 19.989999999

-- ✅ Good: Store in paise
price INTEGER  -- 1999 (₹19.99)

-- ✅ Also good: DECIMAL
price DECIMAL(10, 2)  -- 19.99 (exact)
```

### TEXT vs VARCHAR(n)

| Type | Storage | Use Case |
|------|---------|----------|
| VARCHAR(n) | Up to n chars | Known max length (email, name) |
| TEXT | Unlimited | Unknown length (description, content) |

**Performance:** No difference in PostgreSQL! Both use same storage.

### TIMESTAMP vs DATE vs TIME

```sql
-- Full datetime
created_at TIMESTAMP  -- '2024-01-15 10:30:45'

-- Date only
release_date DATE  -- '2024-01-15'

-- Time only
opening_time TIME  -- '10:30:45'

-- With timezone
created_at TIMESTAMPTZ  -- '2024-01-15 10:30:45+00'
```

**Best Practice:** Use TIMESTAMP (without timezone) and store in UTC

### JSONB vs JSON

| Feature | JSON | JSONB |
|---------|------|-------|
| Storage | Text | Binary |
| Speed | Slower | Faster |
| Indexing | No | Yes (GIN) |
| Formatting | Preserved | Normalized |

**Always use JSONB** (unless you need exact formatting)

---

## Constraints & Data Integrity

### Primary Key
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
-- Guarantees: NOT NULL, UNIQUE
```

### Foreign Key
```sql
brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE
-- Guarantees: Value exists in parent table
-- ON DELETE: What happens when parent deleted
```

### UNIQUE
```sql
email VARCHAR(255) UNIQUE NOT NULL
-- Guarantees: No duplicate emails
-- Auto-creates index
```

### CHECK
```sql
role VARCHAR(20) CHECK (role IN ('user', 'admin'))
-- Guarantees: Only valid values
-- Database-level validation
```

### NOT NULL
```sql
name VARCHAR(255) NOT NULL
-- Guarantees: Must have value
-- Cannot be NULL
```

### DEFAULT
```sql
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- Auto-set value if not provided
```

---

## Triggers & Functions

### Auto-Update Timestamp

```sql
-- Function: Update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger: Apply to tables
CREATE TRIGGER update_brands_updated_at
BEFORE UPDATE ON brands
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Now every UPDATE automatically sets updated_at
UPDATE brands SET name = 'New Name' WHERE id = 'abc';
-- updated_at automatically set to current time
```

### Full-Text Search Vector

```sql
-- Function: Update search vector
CREATE FUNCTION phones_search_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update on INSERT/UPDATE
CREATE TRIGGER phones_search_update
BEFORE INSERT OR UPDATE ON phones
FOR EACH ROW
EXECUTE FUNCTION phones_search_update();
```

---

## Scaling Considerations

### Read Replicas

```
Write: Primary (Master)
Read:  Replica 1, Replica 2, Replica 3

Application:
  - Writes → Primary
  - Reads → Random replica (load balancing)
```

**Query Routing:**
```javascript
// Write to primary
await primaryPool.query('INSERT INTO phones ...');

// Read from replica
await replicaPool.query('SELECT * FROM phones ...');
```

### Sharding (Future)

**Vertical Sharding**: Split by table
```
DB1: phones, brands, categories
DB2: users, analytics
```

**Horizontal Sharding**: Split by row
```
Shard 1: Phones where id starts with 0-7
Shard 2: Phones where id starts with 8-f
```

### Partitioning (Time-Series Data)

```sql
-- Partition price_history by month
CREATE TABLE price_history (
  id UUID,
  phone_id UUID,
  price DECIMAL,
  recorded_at TIMESTAMP
) PARTITION BY RANGE (recorded_at);

-- Create partitions
CREATE TABLE price_history_2024_01 
  PARTITION OF price_history
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE price_history_2024_02
  PARTITION OF price_history
  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Queries automatically use correct partition
SELECT * FROM price_history 
WHERE recorded_at >= '2024-01-15';
-- Only scans price_history_2024_01
```

---

## Conclusion

This database design provides:

✅ **Data Integrity**: Foreign keys, constraints, triggers  
✅ **Performance**: Strategic indexes, query optimization  
✅ **Scalability**: Read replicas, partitioning support  
✅ **Flexibility**: JSONB for semi-structured data  
✅ **Maintainability**: Normalized design, clear relationships  

**Key Metrics:**
- **17 tables** organized logically
- **35+ indexes** for performance
- **3NF normalization** (with strategic exceptions)
- **ACID compliance** (data integrity guaranteed)
- Supports **millions of rows** per table
- **Sub-second queries** with proper indexing

For implementation details, see:
- `TUTORIAL.md` - Code walkthrough with examples
- `SYSTEM_DESIGN.md` - High-level architecture
- `LOW_LEVEL_DESIGN.md` - API and service design
