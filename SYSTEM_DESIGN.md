# GetPhone.xyz - System Design (High-Level Design)

## Table of Contents

1. [System Overview](#system-overview)
2. [System Requirements](#system-requirements)
3. [Architecture Design](#architecture-design)
4. [Component Design](#component-design)
5. [Data Flow](#data-flow)
6. [API Design](#api-design)
7. [Database Design Summary](#database-design-summary)
8. [Scalability Strategy](#scalability-strategy)
9. [Security Architecture](#security-architecture)
10. [Monitoring and Observability](#monitoring-and-observability)
11. [Disaster Recovery](#disaster-recovery)
12. [Technology Choices & Rationale](#technology-choices--rationale)

---

## System Overview

### Business Context

GetPhone.xyz is a **phone comparison and affiliate marketing platform** designed to help users make informed purchasing decisions while generating revenue through Amazon affiliate commissions.

### Problem Statement

Users face challenges when comparing smartphones:
- Too many options in the market
- Difficult to compare specifications side-by-side
- Price tracking across multiple sources
- Lack of real-time price updates

### Solution

A comprehensive platform that provides:
1. **Centralized Database** of smartphone specifications
2. **Side-by-Side Comparison** tool for up to 4 phones
3. **Price Tracking** with historical data and alerts
4. **Real-Time Updates** via WebSocket
5. **Multi-Platform Access** (Web + Mobile)

### Target Users

1. **Regular Users**: Browse, compare, and purchase phones
2. **Price-Conscious Shoppers**: Track prices and set alerts
3. **Tech Enthusiasts**: Deep-dive into specifications
4. **Administrators**: Manage catalog and analytics

---

## System Requirements

### Functional Requirements

#### User-Facing Features (P0 - Must Have)
- ✅ Browse phone catalog with filtering and sorting
- ✅ Search phones by name, brand, or specs
- ✅ Compare up to 4 phones side-by-side
- ✅ View detailed specifications
- ✅ Click affiliate links to Amazon
- ✅ User registration and authentication
- ✅ Price history visualization
- ✅ Set price alerts

#### User-Facing Features (P1 - Should Have)
- ✅ Real-time price updates via WebSocket
- ✅ Mobile app (iOS & Android)
- ✅ User preferences and saved comparisons
- ✅ Email notifications for price drops

#### Admin Features (P0)
- ✅ Phone catalog management (CRUD)
- ✅ User management
- ✅ Analytics dashboard
- ✅ Sync product data from Amazon API

#### Admin Features (P1)
- ✅ A/B testing framework
- ✅ Experiment tracking and results

### Non-Functional Requirements

#### Performance
- **Response Time**: API responses < 200ms (p95)
- **Page Load**: Initial page load < 2 seconds
- **Concurrent Users**: Support 10,000 concurrent users per instance
- **Throughput**: 1,000 requests/second with caching

#### Scalability
- **Horizontal Scaling**: Stateless design for easy scaling
- **Database**: Support for read replicas
- **Cache**: Distributed Redis cluster
- **Load Balancer**: Support for multiple backend instances

#### Availability
- **Uptime**: 99.9% (< 9 hours downtime per year)
- **Redundancy**: Multi-AZ deployment
- **Failover**: Automatic failover for database
- **Graceful Degradation**: System remains functional with degraded features

#### Security
- **Authentication**: JWT-based with secure password hashing
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Encryption in transit (TLS) and at rest
- **API Security**: Rate limiting and input validation
- **Compliance**: GDPR-ready (user data export/deletion)

#### Maintainability
- **Code Quality**: TypeScript for type safety
- **Documentation**: Comprehensive API and system docs
- **Logging**: Structured logging for debugging
- **Monitoring**: Health checks and performance metrics

---

## Architecture Design

### High-Level Architecture Diagram

```
                                    ┌──────────────────────────┐
                                    │    USERS / CLIENTS       │
                                    ├──────────────────────────┤
                                    │  Web Browser             │
                                    │  Mobile App (iOS)        │
                                    │  Mobile App (Android)    │
                                    │  Admin Dashboard         │
                                    └────────────┬─────────────┘
                                                 │
                                                 │ HTTPS
                                                 │
                    ┌────────────────────────────▼───────────────────────────────┐
                    │                    CDN (CloudFront)                        │
                    │              Static Assets (JS, CSS, Images)               │
                    └────────────────────────────────────────────────────────────┘
                                                 │
                                                 │
                    ┌────────────────────────────▼───────────────────────────────┐
                    │                   LOAD BALANCER (ALB)                      │
                    │               SSL Termination, Health Checks               │
                    └────────────────────────────┬───────────────────────────────┘
                                                 │
                            ┌────────────────────┼────────────────────┐
                            │                    │                    │
                    ┌───────▼────────┐  ┌────────▼──────┐  ┌────────▼──────┐
                    │  App Server 1  │  │ App Server 2  │  │ App Server 3  │
                    │  (Node.js)     │  │  (Node.js)    │  │  (Node.js)    │
                    └───────┬────────┘  └────────┬──────┘  └────────┬──────┘
                            │                    │                    │
            ┌───────────────┼────────────────────┼────────────────────┼───────────────┐
            │               │                    │                    │               │
    ┌───────▼──────┐  ┌────▼────────┐  ┌────────▼──────┐  ┌─────────▼──────────┐ ┌─▼──────────┐
    │   Redis      │  │ PostgreSQL  │  │  Amazon       │  │   Email Service    │ │ Analytics  │
    │   Cluster    │  │   Primary   │  │  PA-API       │  │      (SMTP)        │ │ (GA4)      │
    │              │  │             │  │               │  │                    │ │            │
    │ • Cache      │  │ • Master    │  │ • Product     │  │ • Transactional   │ │ • Events   │
    │ • Sessions   │  │ • Write     │  │   Data        │  │   Emails          │ │ • Tracking │
    │ • Pub/Sub    │  │             │  │ • Pricing     │  │ • Notifications   │ │            │
    └──────────────┘  └──────┬──────┘  └───────────────┘  └────────────────────┘ └────────────┘
                             │
                    ┌────────┴─────────┐
              ┌─────▼────┐       ┌─────▼────┐
              │ PG Read  │       │ PG Read  │
              │ Replica 1│       │ Replica 2│
              │          │       │          │
              │ • Read   │       │ • Read   │
              │   Only   │       │   Only   │
              └──────────┘       └──────────┘


                    ┌────────────────────────────────────────┐
                    │      BACKGROUND WORKERS / CRON JOBS     │
                    ├────────────────────────────────────────┤
                    │ • Price Sync (Every 6 hours)           │
                    │ • Email Queue Processing               │
                    │ • Analytics Aggregation (Daily)        │
                    │ • Cache Warming                        │
                    │ • Database Cleanup                     │
                    └────────────────────────────────────────┘
```

### Architecture Layers

#### 1. **Presentation Layer**
- **Web Frontend**: React 18 + TypeScript + Vite
- **Mobile Apps**: React Native (iOS & Android)
- **Admin Dashboard**: React with authentication

**Responsibilities:**
- User interface rendering
- Client-side validation
- State management
- API communication

#### 2. **API Gateway / Load Balancer**
- **Technology**: AWS ALB / NGINX
- **Features**:
  - SSL/TLS termination
  - Request routing
  - Health checks
  - Rate limiting (L7)

#### 3. **Application Layer**
- **Technology**: Node.js 20 + Express.js + TypeScript
- **Instances**: Multiple stateless servers
- **Features**:
  - RESTful API endpoints
  - GraphQL API
  - WebSocket server (Socket.IO)
  - Business logic
  - Authentication & Authorization

#### 4. **Service Layer**
- **External Integrations**:
  - Amazon Product Advertising API
  - Email service (SMTP/SendGrid)
  - Analytics (Google Analytics 4)
  - Payment gateway (future)

#### 5. **Data Layer**
- **Primary Database**: PostgreSQL 16 (Master)
- **Read Replicas**: PostgreSQL (2+ replicas)
- **Cache**: Redis 7 (Cluster mode)
- **Object Storage**: AWS S3 (images, backups)

#### 6. **Background Jobs**
- **Technology**: node-cron / Bull Queue
- **Jobs**:
  - Price synchronization
  - Email queue processing
  - Analytics aggregation
  - Cache warming

---

## Component Design

### 1. Authentication Service

```
┌─────────────────────────────────────────────────────────┐
│              Authentication Service                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐      ┌──────────────┐                │
│  │   Register   │      │    Login     │                │
│  │              │      │              │                │
│  │ 1. Validate  │      │ 1. Find User │                │
│  │ 2. Hash pwd  │      │ 2. Verify    │                │
│  │ 3. Save DB   │      │    Password  │                │
│  │ 4. Send JWT  │      │ 3. Gen JWT   │                │
│  └──────────────┘      └──────────────┘                │
│                                                          │
│  ┌──────────────┐      ┌──────────────┐                │
│  │   Refresh    │      │    Logout    │                │
│  │   Token      │      │              │                │
│  │              │      │ 1. Blacklist │                │
│  │ 1. Verify RT │      │    Token     │                │
│  │ 2. Gen new AT│      │ 2. Clear     │                │
│  │ 3. Return    │      │    Session   │                │
│  └──────────────┘      └──────────────┘                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Key Decisions:**
- **JWT over Session**: Stateless, scales horizontally
- **Refresh Tokens**: Separate short-lived access tokens (15 min) and long-lived refresh tokens (7 days)
- **bcrypt**: Industry standard for password hashing (10 rounds)
- **Token Blacklist**: Redis for logout (optional, usually tokens expire naturally)

### 2. Phone Catalog Service

```
┌─────────────────────────────────────────────────────────┐
│              Phone Catalog Service                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐      ┌──────────────┐                │
│  │ List Phones  │      │  Get Phone   │                │
│  │              │      │              │                │
│  │ 1. Parse     │      │ 1. Check     │                │
│  │    filters   │      │    cache     │                │
│  │ 2. Check     │      │ 2. Query DB  │                │
│  │    cache     │      │ 3. Join      │                │
│  │ 3. Query DB  │      │    specs     │                │
│  │ 4. Cache     │      │ 4. Cache     │                │
│  │ 5. Return    │      │ 5. Return    │                │
│  └──────────────┘      └──────────────┘                │
│                                                          │
│  ┌──────────────┐      ┌──────────────┐                │
│  │  Compare     │      │   Search     │                │
│  │   Phones     │      │              │                │
│  │              │      │ 1. Parse     │                │
│  │ 1. Get by    │      │    query     │                │
│  │    IDs       │      │ 2. Full-text │                │
│  │ 2. Format    │      │    search    │                │
│  │    table     │      │ 3. Filter    │                │
│  │ 3. Highlight │      │ 4. Return    │                │
│  │    best      │      │              │                │
│  └──────────────┘      └──────────────┘                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Key Decisions:**
- **Caching Strategy**: Cache-aside pattern with 5-minute TTL
- **Pagination**: Limit 20-100 items per page
- **Filtering**: Database-level filtering (not application)
- **Search**: PostgreSQL full-text search with tsvector

### 3. Price Tracking Service

```
┌─────────────────────────────────────────────────────────┐
│              Price Tracking Service                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────┐        │
│  │        Cron Job (Every 6 hours)            │        │
│  ├────────────────────────────────────────────┤        │
│  │                                            │        │
│  │  1. Fetch all active phones                │        │
│  │  2. For each phone:                        │        │
│  │     a. Call Amazon PA-API                  │        │
│  │     b. Get current price                   │        │
│  │     c. Compare with DB price               │        │
│  │     d. If changed:                         │        │
│  │        • Insert price_history              │        │
│  │        • Update phones.price               │        │
│  │        • Invalidate cache                  │        │
│  │        • Broadcast WebSocket event         │        │
│  │        • Check price alerts                │        │
│  │  3. Log sync status                        │        │
│  │                                            │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
│  ┌────────────────────────────────────────────┐        │
│  │           Price Alert Checker              │        │
│  ├────────────────────────────────────────────┤        │
│  │                                            │        │
│  │  1. Query active alerts                    │        │
│  │  2. For each alert:                        │        │
│  │     a. Check if price <= target            │        │
│  │     b. If yes:                             │        │
│  │        • Queue email                       │        │
│  │        • Mark alert as triggered           │        │
│  │        • Send push notification            │        │
│  │                                            │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Key Decisions:**
- **Polling Interval**: 6 hours (balance between freshness and API costs)
- **Batch Processing**: Process phones in batches of 10
- **Rate Limiting**: Respect Amazon API rate limits (1 request/second)
- **Error Handling**: Retry with exponential backoff

### 4. Real-Time Notification Service

```
┌─────────────────────────────────────────────────────────┐
│          Real-Time Notification Service                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  WebSocket Server (Socket.IO)                           │
│  ┌────────────────────────────────────────────┐        │
│  │                                            │        │
│  │  Rooms:                                    │        │
│  │  • phone:${phoneId}  - Phone updates      │        │
│  │  • user:${userId}    - User notifications │        │
│  │  • global            - Announcements      │        │
│  │                                            │        │
│  │  Events:                                   │        │
│  │  • price:update      - Price changed      │        │
│  │  • stock:update      - Stock status       │        │
│  │  • announcement      - System message     │        │
│  │  • alert:triggered   - Price alert hit    │        │
│  │                                            │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
│  Event Flow:                                             │
│  1. Client connects → socket.io handshake               │
│  2. Client subscribes → join room(s)                    │
│  3. Server emits event → to specific room               │
│  4. Clients receive → update UI                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Key Decisions:**
- **Room-Based Architecture**: Reduces unnecessary broadcasts
- **Heartbeat**: Keep-alive every 30 seconds
- **Reconnection**: Auto-reconnect with exponential backoff
- **Load Balancing**: Sticky sessions for WebSocket

### 5. Analytics Service

```
┌─────────────────────────────────────────────────────────┐
│               Analytics Service                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Event Tracking:                                         │
│  ┌────────────────────────────────────────────┐        │
│  │ • page_view      - Page loaded             │        │
│  │ • phone_view     - Phone detail viewed     │        │
│  │ • search         - Search performed        │        │
│  │ • comparison     - Comparison made         │        │
│  │ • affiliate_click - Amazon link clicked    │        │
│  │ • user_register  - New user signed up      │        │
│  │ • user_login     - User logged in          │        │
│  │ • alert_created  - Price alert set         │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
│  Data Storage:                                           │
│  • PostgreSQL (analytics_events table - JSONB)          │
│  • Google Analytics 4 (external)                        │
│                                                          │
│  Aggregations (Daily Cron):                             │
│  • Top viewed phones                                     │
│  • Search term frequency                                 │
│  • Conversion rate (clicks / views)                     │
│  • User activity heatmap                                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Key Decisions:**
- **Dual Storage**: Internal DB + Google Analytics
- **JSONB**: Flexible schema for event data
- **Async Processing**: Events queued, processed in background
- **Privacy**: GDPR-compliant (anonymize IP, user consent)

---

## Data Flow

### 1. User Registration Flow

```
┌────────┐     ┌─────────┐     ┌─────────┐     ┌──────────┐     ┌─────┐
│ Client │────▶│   API   │────▶│  Auth   │────▶│   User   │────▶│ DB  │
│        │     │ Gateway │     │Controller│     │  Model   │     │     │
└────────┘     └─────────┘     └─────────┘     └──────────┘     └─────┘
    │               │               │                │              │
    │  POST /register              │                │              │
    │ {email,pwd}   │               │                │              │
    │───────────────▶               │                │              │
    │               │  Validate     │                │              │
    │               │──────────────▶                │              │
    │               │               │ Check exists   │              │
    │               │               │───────────────▶              │
    │               │               │                │ SELECT email│
    │               │               │                │─────────────▶
    │               │               │                │ (not found) │
    │               │               │                │◀─────────────
    │               │               │ Hash password  │              │
    │               │               │ (bcrypt)       │              │
    │               │               │                │              │
    │               │               │  Create user   │              │
    │               │               │───────────────▶              │
    │               │               │                │ INSERT users│
    │               │               │                │─────────────▶
    │               │               │                │ Return ID   │
    │               │               │                │◀─────────────
    │               │  Generate JWT │                │              │
    │               │  (sign token) │                │              │
    │               │◀──────────────                │              │
    │  201 Created  │               │                │              │
    │  {token,user} │               │                │              │
    │◀───────────────               │                │              │
    │               │               │                │              │
    │  Store token  │               │                │              │
    │  (localStorage)               │                │              │
    │               │               │                │              │
```

### 2. Phone Listing with Cache Flow

```
┌────────┐   ┌─────┐   ┌──────────┐   ┌───────┐   ┌──────┐
│ Client │   │ API │   │Controller│   │ Redis │   │  DB  │
└────────┘   └─────┘   └──────────┘   └───────┘   └──────┘
    │           │           │             │           │
    │ GET /api/phones?brand=samsung&sort=price       │
    │──────────▶           │             │           │
    │           │  Route   │             │           │
    │           │─────────▶              │           │
    │           │           │ Check cache│           │
    │           │           │───────────▶           │
    │           │           │             │           │
    │           │           │  Cache MISS│           │
    │           │           │◀───────────           │
    │           │           │             │           │
    │           │           │  Query DB  │           │
    │           │           │───────────────────────▶
    │           │           │             │  SELECT phones
    │           │           │             │  JOIN brands
    │           │           │             │  WHERE...
    │           │           │             │  ORDER BY
    │           │           │             │◀──────────
    │           │           │  Result    │           │
    │           │           │             │           │
    │           │           │  Store cache (5 min)  │
    │           │           │───────────▶           │
    │           │           │             │           │
    │           │  200 OK   │             │           │
    │           │  {phones} │             │           │
    │◀──────────           │             │           │
    │           │           │             │           │
    │           │           │             │           │
    │ GET (again, same params)           │           │
    │──────────▶           │             │           │
    │           │           │ Check cache│           │
    │           │           │───────────▶           │
    │           │           │ Cache HIT  │           │
    │           │           │◀───────────           │
    │           │  200 OK   │             │           │
    │           │  {phones} │ (no DB hit!)           │
    │◀──────────           │             │           │
```

### 3. Price Update with Real-Time Notification Flow

```
┌──────────┐   ┌────────┐   ┌─────┐   ┌────────┐   ┌──────────┐
│Cron Job  │   │  DB    │   │Redis│   │WebSocket│   │ Clients  │
└──────────┘   └────────┘   └─────┘   └────────┘   └──────────┘
    │              │          │          │              │
    │ (Every 6hr)  │          │          │              │
    │ Fetch phones │          │          │              │
    │─────────────▶          │          │              │
    │              │          │          │              │
    │ Call Amazon  │          │          │              │
    │ PA-API       │          │          │              │
    │              │          │          │              │
    │ Get new price│          │          │              │
    │              │          │          │              │
    │ UPDATE phones│          │          │              │
    │ SET price=$1 │          │          │              │
    │─────────────▶          │          │              │
    │              │          │          │              │
    │ INSERT       │          │          │              │
    │ price_history│          │          │              │
    │─────────────▶          │          │              │
    │              │          │          │              │
    │ Invalidate   │          │          │              │
    │ cache        │          │          │              │
    │──────────────────────▶│          │              │
    │              │          │          │              │
    │ Broadcast    │          │          │              │
    │ WebSocket    │          │          │              │
    │──────────────────────────────────▶              │
    │              │          │          │              │
    │              │          │          │ Emit to room │
    │              │          │          │ phone:${id}  │
    │              │          │          │─────────────▶
    │              │          │          │              │
    │              │          │          │  Update UI   │
    │              │          │          │  (new price) │
```

---

## API Design

### RESTful API Endpoints

#### Authentication
```
POST   /api/auth/register     - Register new user
POST   /api/auth/login        - Login user
POST   /api/auth/refresh      - Refresh access token
POST   /api/auth/logout       - Logout user
GET    /api/auth/me           - Get current user
```

#### Phones
```
GET    /api/phones                      - List phones (paginated)
  Query Params:
    - brand: string (filter by brand slug)
    - category: string (filter by category slug)
    - minPrice: number (filter by min price)
    - maxPrice: number (filter by max price)
    - inStock: boolean (only in-stock phones)
    - featured: boolean (only featured phones)
    - sort: 'price'|'rating'|'release_date' (sort field)
    - order: 'asc'|'desc' (sort order)
    - page: number (page number, default 1)
    - limit: number (items per page, default 20, max 100)
  
GET    /api/phones/:slug                - Get single phone by slug
GET    /api/phones/compare?ids=1,2,3    - Compare phones
POST   /api/phones                      - Create phone (admin only)
PUT    /api/phones/:id                  - Update phone (admin only)
DELETE /api/phones/:id                  - Delete phone (admin only)
```

#### Brands & Categories
```
GET    /api/brands              - List all brands
GET    /api/brands/:slug        - Get brand by slug
GET    /api/categories          - List all categories
GET    /api/categories/:slug    - Get category by slug
```

#### Price Tracking
```
GET    /api/price-history/:phoneId     - Get price history
POST   /api/price-alerts               - Create price alert (auth required)
GET    /api/price-alerts               - Get user's alerts (auth required)
DELETE /api/price-alerts/:id           - Delete alert (auth required)
```

#### Admin
```
GET    /api/admin/stats         - Get dashboard stats (admin only)
GET    /api/admin/users         - List users (admin only)
PUT    /api/admin/users/:id     - Update user (admin only)
POST   /api/admin/sync          - Trigger price sync (admin only)
```

### GraphQL API

```graphql
type Query {
  # Phones
  phones(
    brand: String
    category: String
    minPrice: Int
    maxPrice: Int
    sort: String
    page: Int
    limit: Int
  ): PhoneConnection!
  
  phone(slug: String!): Phone
  
  comparePhones(ids: [ID!]!): [Phone!]!
  
  # Brands
  brands: [Brand!]!
  brand(slug: String!): Brand
  
  # Categories
  categories: [Category!]!
  category(slug: String!): Category
  
  # Price History
  priceHistory(phoneId: ID!): [PricePoint!]!
  
  # User (requires authentication)
  me: User
  myAlerts: [PriceAlert!]!
}

type Mutation {
  # Auth
  register(input: RegisterInput!): AuthPayload!
  login(email: String!, password: String!): AuthPayload!
  
  # Price Alerts
  createPriceAlert(input: PriceAlertInput!): PriceAlert!
  deletePriceAlert(id: ID!): Boolean!
  
  # Admin
  createPhone(input: PhoneInput!): Phone!
  updatePhone(id: ID!, input: PhoneInput!): Phone!
  deletePhone(id: ID!): Boolean!
}

type Phone {
  id: ID!
  name: String!
  slug: String!
  brand: Brand!
  category: Category!
  description: String
  price: Int!
  originalPrice: Int
  amazonUrl: String!
  imageUrl: String
  rating: Float!
  reviewCount: Int!
  specs: PhoneSpecs
  features: [String!]!
  inStock: Boolean!
  isFeatured: Boolean!
  createdAt: String!
}

type Brand {
  id: ID!
  name: String!
  slug: String!
  logoUrl: String
  phones: [Phone!]!
}

type Category {
  id: ID!
  name: String!
  slug: String!
  description: String
  phones: [Phone!]!
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

type PricePoint {
  price: Int!
  recordedAt: String!
}

type User {
  id: ID!
  email: String!
  firstName: String!
  lastName: String!
  role: String!
  createdAt: String!
}

type AuthPayload {
  token: String!
  user: User!
}
```

### API Response Format

**Success Response:**
```json
{
  "data": {
    // Response data
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

**Error Response:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

---

## Database Design Summary

### Entity-Relationship Diagram

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Brands    │◀───────│   Phones    │────────▶│ Categories  │
│             │  1:N    │             │  N:1    │             │
│ • id (PK)   │         │ • id (PK)   │         │ • id (PK)   │
│ • name      │         │ • name      │         │ • name      │
│ • slug      │         │ • slug      │         │ • slug      │
│ • logo_url  │         │ • brand_id  │         │ • desc      │
└─────────────┘         │ • category_id        └─────────────┘
                        │ • price     │
                        │ • asin      │
                        └──────┬──────┘
                               │
                    ┌──────────┼──────────┐
                    │          │          │
            ┌───────▼──┐  ┌────▼────┐  ┌─▼────────┐
            │ Phone    │  │ Phone   │  │ Price    │
            │ Specs    │  │ Features│  │ History  │
            │ (1:1)    │  │ (1:N)   │  │ (1:N)    │
            └──────────┘  └─────────┘  └──────────┘


┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    Users    │◀───────│ Price Alerts│────────▶│   Phones    │
│             │  1:N    │             │  N:1    │             │
│ • id (PK)   │         │ • id (PK)   │         │ • id (PK)   │
│ • email     │         │ • user_id   │         └─────────────┘
│ • password  │         │ • phone_id  │
│ • role      │         │ • target    │
└─────────────┘         │ • active    │
                        └─────────────┘
```

### Key Tables

1. **brands** - Phone manufacturers
2. **categories** - Phone categories
3. **phones** - Main product catalog
4. **phone_specs** - Technical specifications (1:1 with phones)
5. **phone_features** - Phone features (1:N with phones)
6. **users** - User accounts
7. **price_history** - Historical pricing data (time-series)
8. **price_alerts** - User-defined price alerts
9. **analytics_events** - Event tracking (JSONB)
10. **experiments** - A/B testing experiments

For detailed database design, see `DATABASE_DESIGN.md`.

---

## Scalability Strategy

### Horizontal Scaling (Application Layer)

```
                        ┌─────────────────┐
                        │  Load Balancer  │
                        └────────┬────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            │                    │                    │
      ┌─────▼─────┐        ┌─────▼─────┐      ┌─────▼─────┐
      │  Server 1 │        │  Server 2 │      │  Server 3 │
      │           │        │           │      │           │
      │ Node.js   │        │ Node.js   │      │ Node.js   │
      │ Stateless │        │ Stateless │      │ Stateless │
      └─────┬─────┘        └─────┬─────┘      └─────┬─────┘
            │                    │                    │
            └────────────────────┼────────────────────┘
                                 │
                          ┌──────▼──────┐
                          │   Redis     │
                          │  (Shared)   │
                          └─────────────┘
```

**Key Points:**
- **Stateless Servers**: No session state stored in memory
- **Shared Redis**: All servers connect to same Redis cluster
- **Load Balancer**: Round-robin or least-connections algorithm
- **Auto-Scaling**: Add/remove servers based on CPU/memory

### Database Scaling (Read Replicas)

```
                    ┌──────────────────┐
                    │   Application    │
                    └────────┬─────────┘
                             │
                    ┌────────┴─────────┐
                    │                  │
              ┌─────▼─────┐      ┌────▼────┐
              │ PostgreSQL│      │ Redis   │
              │  Primary  │      │ Cache   │
              │  (Write)  │      └─────────┘
              └─────┬─────┘
                    │ Replication
        ┌───────────┼───────────┐
        │           │           │
   ┌────▼────┐ ┌────▼────┐ ┌───▼─────┐
   │ Replica │ │ Replica │ │ Replica │
   │  (Read) │ │  (Read) │ │  (Read) │
   └─────────┘ └─────────┘ └─────────┘
```

**Read/Write Split:**
- **Writes**: Always go to primary
- **Reads**: Distributed across replicas
- **Replication Lag**: Monitor lag, typically < 1 second

### Caching Strategy

**Multi-Level Cache:**
```
Browser Cache (Client-side)
       ↓
CDN Cache (CloudFront)
       ↓
Application Cache (Redis)
       ↓
Database Query Cache
       ↓
Database (PostgreSQL)
```

**Cache Invalidation:**
- **TTL-Based**: Automatic expiry (5 min for dynamic, 1 hour for static)
- **Event-Based**: Invalidate on data change
- **LRU Policy**: Least Recently Used when memory full

### Performance Targets

| Metric | Target | Current | Scaling Action |
|--------|--------|---------|----------------|
| Response Time (p95) | < 200ms | ~150ms | ✅ Good |
| Throughput | 1000 req/s | ~500 req/s | Add servers |
| Cache Hit Rate | > 80% | ~75% | Optimize TTL |
| Database Connections | < 80% pool | ~60% | ✅ Good |
| Error Rate | < 0.1% | ~0.05% | ✅ Good |

---

## Security Architecture

### Authentication Flow

```
┌──────────────────────────────────────────────────────────┐
│                   Security Layers                         │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  1. Network Security                                      │
│     • HTTPS/TLS 1.3 (encryption in transit)              │
│     • DDoS protection (AWS Shield)                       │
│     • WAF (Web Application Firewall)                     │
│                                                           │
│  2. API Security                                          │
│     • Rate Limiting (100 req/15min per IP)               │
│     • Input Validation (express-validator)               │
│     • SQL Injection Prevention (parameterized queries)   │
│     • XSS Protection (helmet.js)                         │
│     • CSRF Protection (SameSite cookies)                 │
│                                                           │
│  3. Authentication                                        │
│     • JWT tokens (HS256 algorithm)                       │
│     • bcrypt password hashing (10 rounds)                │
│     • Refresh token rotation                             │
│     • Token expiry (15 min access, 7 day refresh)        │
│                                                           │
│  4. Authorization                                         │
│     • Role-based access control (RBAC)                   │
│     • Resource-level permissions                         │
│     • Admin-only routes protected                        │
│                                                           │
│  5. Data Security                                         │
│     • Encryption at rest (AWS RDS encryption)            │
│     • Sensitive data hashing (passwords, tokens)         │
│     • PII handling (GDPR compliance)                     │
│     • Secure environment variables                       │
│                                                           │
│  6. Monitoring                                            │
│     • Audit logs (user actions)                          │
│     • Security event tracking                            │
│     • Anomaly detection                                  │
│     • Automated alerts                                   │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Security Checklist

- [x] HTTPS enforced
- [x] Rate limiting implemented
- [x] Input validation on all endpoints
- [x] SQL injection prevention
- [x] XSS protection
- [x] CSRF protection
- [x] Password hashing (bcrypt)
- [x] JWT token authentication
- [x] Role-based authorization
- [x] Security headers (helmet.js)
- [x] Environment variable protection
- [x] Database encryption at rest
- [x] Audit logging
- [ ] Penetration testing
- [ ] Security audit (periodic)

---

## Monitoring and Observability

### Monitoring Stack

```
┌──────────────────────────────────────────────────────────┐
│              Monitoring & Observability                   │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Application Metrics:                                     │
│  • Request rate                                           │
│  • Response time (p50, p95, p99)                         │
│  • Error rate                                             │
│  • Cache hit rate                                         │
│                                                           │
│  Infrastructure Metrics:                                  │
│  • CPU usage                                              │
│  • Memory usage                                           │
│  • Disk I/O                                               │
│  • Network traffic                                        │
│                                                           │
│  Database Metrics:                                        │
│  • Connection pool usage                                  │
│  • Query execution time                                   │
│  • Slow query log                                         │
│  • Replication lag                                        │
│                                                           │
│  Business Metrics:                                        │
│  • User registrations                                     │
│  • Affiliate clicks                                       │
│  • Conversion rate                                        │
│  • Active users                                           │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Health Check Endpoint

```typescript
GET /health

Response:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 86400,
  "services": {
    "database": {
      "status": "connected",
      "latency": 5
    },
    "redis": {
      "status": "connected",
      "latency": 2
    },
    "amazonAPI": {
      "status": "available",
      "lastCheck": "2024-01-15T10:25:00Z"
    }
  },
  "metrics": {
    "activeConnections": 42,
    "requestsPerSecond": 150,
    "cacheHitRate": 0.85
  }
}
```

### Alerting Rules

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| High Error Rate | > 1% | Critical | Page on-call |
| Slow Response | p95 > 1s | Warning | Investigate |
| Database Down | No connection | Critical | Auto-failover |
| High CPU | > 80% for 5min | Warning | Scale up |
| Low Cache Hit | < 60% | Info | Review cache strategy |
| Disk Full | > 85% | Warning | Clean up logs |

---

## Disaster Recovery

### Backup Strategy

**Database:**
- **Full Backup**: Daily at 2 AM UTC
- **Incremental Backup**: Every 4 hours
- **WAL Archiving**: Continuous
- **Retention**: 30 days
- **Storage**: AWS S3 (cross-region replication)

**Recovery Time Objective (RTO):** 1 hour  
**Recovery Point Objective (RPO):** 4 hours

### Failover Strategy

**Database Failover:**
```
Primary fails → Automatic promotion of replica → Update DNS → ~60s downtime
```

**Application Failover:**
```
Server fails → Load balancer detects (health check) → Route to healthy servers → ~0s downtime
```

**Multi-Region Deployment (Future):**
```
┌──────────────┐         ┌──────────────┐
│  Region A    │         │  Region B    │
│  (Primary)   │◀───────▶│  (Standby)   │
│              │         │              │
│ App + DB     │  Sync   │ App + DB     │
└──────────────┘         └──────────────┘
```

---

## Technology Choices & Rationale

### Frontend: React

**Why React?**
- ✅ Component-based architecture (reusability)
- ✅ Large ecosystem and community
- ✅ Virtual DOM (performance)
- ✅ Easy to learn
- ✅ Good TypeScript support

**Alternatives Considered:**
- Vue.js: Simpler but smaller ecosystem
- Angular: Too heavy for this use case
- Svelte: Less mature ecosystem

### Backend: Node.js + Express

**Why Node.js?**
- ✅ JavaScript everywhere (frontend + backend)
- ✅ Non-blocking I/O (good for I/O-heavy apps)
- ✅ Large npm ecosystem
- ✅ Easy to scale horizontally

**Why Express?**
- ✅ Minimalist and flexible
- ✅ Large middleware ecosystem
- ✅ Industry standard

**Alternatives Considered:**
- Fastify: Faster but less mature
- NestJS: More opinionated, overkill for this project
- Python/Django: Different language, slower for I/O

### Database: PostgreSQL

**Why PostgreSQL?**
- ✅ ACID compliance (data integrity)
- ✅ Complex queries with JOINs
- ✅ JSONB for flexible data
- ✅ Full-text search
- ✅ Mature and reliable

**Alternatives Considered:**
- MySQL: Less features (no JSONB, weaker full-text search)
- MongoDB: Not suitable for relational data
- DynamoDB: More expensive, vendor lock-in

### Cache: Redis

**Why Redis?**
- ✅ In-memory (extremely fast)
- ✅ Data structures (strings, lists, sets, hashes)
- ✅ Pub/Sub for real-time
- ✅ TTL support

**Alternatives Considered:**
- Memcached: Simpler but less features
- In-memory cache (node-cache): Doesn't scale across instances

### Language: TypeScript

**Why TypeScript?**
- ✅ Type safety (catch errors early)
- ✅ Better IDE support
- ✅ Self-documenting code
- ✅ Easier refactoring

**Trade-offs:**
- ❌ Learning curve
- ❌ Build step required
- ✅ Worth it for large projects

---

## Conclusion

This system design provides a solid foundation for a scalable, performant, and maintainable phone comparison platform. Key highlights:

1. **Scalable Architecture**: Horizontal scaling with stateless servers
2. **Performance**: Multi-level caching strategy
3. **Security**: Multiple layers of protection
4. **Reliability**: Automatic failover and backups
5. **Observability**: Comprehensive monitoring and alerting

The design can handle:
- **10,000+ concurrent users** per instance
- **1000+ requests/second** with caching
- **Millions of products** in the database
- **Real-time updates** to thousands of connected clients

**Next Steps:**
1. Review `LOW_LEVEL_DESIGN.md` for implementation details
2. Review `DATABASE_DESIGN.md` for schema details
3. Review `TUTORIAL.md` for code walkthrough
4. Review `DEPLOYMENT.md` for deployment guide
