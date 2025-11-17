# GetPhone.xyz - Enhanced Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT APPLICATIONS                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Web App    │  │  Mobile App  │  │  Admin Panel │              │
│  │  (React +    │  │  (React      │  │  (React +    │              │
│  │   Vite)      │  │   Native)    │  │   Auth)      │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                  │                  │                       │
└─────────┼──────────────────┼──────────────────┼───────────────────────┘
          │                  │                  │
          │                  │                  │
┌─────────┼──────────────────┼──────────────────┼───────────────────────┐
│         │         API GATEWAY & SERVER        │                       │
├─────────┼──────────────────┼──────────────────┼───────────────────────┤
│         │                  │                  │                       │
│  ┌──────▼──────────────────▼──────────────────▼──────┐               │
│  │        Express.js Server (Node.js 20+)             │               │
│  │                                                     │               │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐     │               │
│  │  │   REST    │  │  GraphQL  │  │ WebSocket │     │               │
│  │  │    API    │  │    API    │  │(Socket.IO)│     │               │
│  │  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘     │               │
│  └────────┼──────────────┼──────────────┼────────────┘               │
│           │              │              │                             │
└───────────┼──────────────┼──────────────┼─────────────────────────────┘
            │              │              │
            │              │              │
┌───────────┼──────────────┼──────────────┼─────────────────────────────┐
│           │     MIDDLEWARE & AUTH       │                             │
├───────────┼──────────────┼──────────────┼─────────────────────────────┤
│           │              │              │                             │
│  ┌────────▼────────┐ ┌──▼──────────┐ ┌▼────────────┐                │
│  │  Rate Limiting  │ │     JWT     │ │  Analytics  │                │
│  │   & Security    │ │    Auth     │ │  Tracking   │                │
│  └─────────────────┘ └─────────────┘ └─────────────┘                │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
            │              │              │
            │              │              │
┌───────────┼──────────────┼──────────────┼─────────────────────────────┐
│           │      BUSINESS LOGIC LAYER   │                             │
├───────────┼──────────────┼──────────────┼─────────────────────────────┤
│           │              │              │                             │
│  ┌────────▼─────────┐ ┌─▼───────────┐ ┌▼─────────────┐              │
│  │   Controllers    │ │  Services   │ │  Resolvers   │              │
│  ├──────────────────┤ ├─────────────┤ ├──────────────┤              │
│  │ • Phone         │ │ • Amazon    │ │ • GraphQL    │              │
│  │ • Auth          │ │   Product   │ │   Queries    │              │
│  │ • Admin         │ │   API       │ │ • Mutations  │              │
│  │ • Brand         │ │ • Email     │ │              │              │
│  │ • Category      │ │   Service   │ │              │              │
│  └──────────────────┘ │ • Analytics │ └──────────────┘              │
│                       │ • A/B Test  │                                │
│                       │ • WebSocket │                                │
│                       │ • Price     │                                │
│                       │   Tracking  │                                │
│                       └─────────────┘                                │
└───────────────────────────────────────────────────────────────────────┘
            │              │              │
            │              │              │
┌───────────┼──────────────┼──────────────┼─────────────────────────────┐
│           │         DATA LAYER          │                             │
├───────────┼──────────────┼──────────────┼─────────────────────────────┤
│           │              │              │                             │
│  ┌────────▼─────────┐ ┌─▼──────────┐ ┌▼──────────────┐              │
│  │     Models       │ │   Redis    │ │  External APIs │              │
│  ├──────────────────┤ │   Cache    │ ├────────────────┤              │
│  │ • User          │ │            │ │ • Amazon       │              │
│  │ • Phone         │ │ • Session  │ │   PA-API 5.0   │              │
│  │ • Brand         │ │ • Hot Data │ │ • Google       │              │
│  │ • Category      │ │            │ │   Analytics    │              │
│  │ • PriceTracking │ └────────────┘ └────────────────┘              │
│  │ • Analytics     │                                                 │
│  │ • A/B Test      │                                                 │
│  └──────┬──────────┘                                                 │
│         │                                                             │
└─────────┼─────────────────────────────────────────────────────────────┘
          │
          │
┌─────────▼─────────────────────────────────────────────────────────────┐
│                         DATABASE LAYER                                 │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │              PostgreSQL 16 Database                          │    │
│  ├──────────────────────────────────────────────────────────────┤    │
│  │                                                              │    │
│  │  Core Tables:           Enhanced Tables:                    │    │
│  │  • phones              • users                              │    │
│  │  • brands              • user_preferences                   │    │
│  │  • categories          • price_history                      │    │
│  │  • phone_specs         • price_alerts                       │    │
│  │  • phone_features      • analytics_events                   │    │
│  │  • comparisons         • experiments                        │    │
│  │  • affiliate_accounts  • variant_assignments               │    │
│  │  • product_sync_log    • experiment_conversions            │    │
│  │                        • password_reset_tokens              │    │
│  │                        • email_verification_tokens          │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────────────┘
          │
          │
┌─────────▼─────────────────────────────────────────────────────────────┐
│                     BACKGROUND JOBS & WORKERS                          │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐    │
│  │  Price Tracking  │  │  Email Queue     │  │  Analytics      │    │
│  │  (Cron: 6hrs)   │  │  (Async)         │  │  Aggregation    │    │
│  ├──────────────────┤  ├──────────────────┤  ├─────────────────┤    │
│  │ • Fetch Amazon  │  │ • Welcome emails │  │ • Daily reports │    │
│  │   prices        │  │ • Price alerts   │  │ • Trend         │    │
│  │ • Update DB     │  │ • Password reset │  │   analysis      │    │
│  │ • Trigger       │  │ • Verification   │  │ • Conversion    │    │
│  │   alerts        │  │                  │  │   tracking      │    │
│  └──────────────────┘  └──────────────────┘  └─────────────────┘    │
│                                                                        │
└───────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────┐
│                         DEPLOYMENT & MONITORING                        │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │   Docker     │  │  Health      │  │  Logging &   │               │
│  │   Compose    │  │  Checks      │  │  Monitoring  │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│                                                                        │
└───────────────────────────────────────────────────────────────────────┘
```

## Feature Integration Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    FEATURE IMPLEMENTATION                        │
└─────────────────────────────────────────────────────────────────┘

1. Amazon Product API ────► Services ────► Price Tracking
                                      └───► Data Sync

2. User Authentication ───► Middleware ───► All Protected Routes
                       └──► Models ───────► User Data
                       └──► JWT ──────────► Token Management

3. Admin Dashboard ───────► Controllers ──► Admin Routes
                       └──► Middleware ──► Auth + Role Check

4. Price Tracking ────────► Services ────► Cron Jobs
                       └──► Models ──────► Price History
                       └──► Email ───────► Notifications

5. Email Notifications ───► Services ────► SMTP
                       └──► Templates ───► HTML Emails

6. Analytics ─────────────► Services ────► Event Tracking
                       └──► Middleware ──► Auto Tracking
                       └──► Database ────► JSONB Storage

7. A/B Testing ───────────► Services ────► Experiments
                       └──► Hashing ─────► Consistent Assignment
                       └──► Database ────► Results Storage

8. GraphQL API ───────────► Schema ──────► Type Definitions
                       └──► Resolvers ───► Query/Mutation Logic
                       └──► GraphiQL ────► Interactive Docs

9. WebSocket ─────────────► Socket.IO ───► Real-time Events
                       └──► Rooms ───────► Subscriptions
                       └──► Broadcast ───► Notifications

10. Mobile App ───────────► React Native ► iOS/Android
                       └──► Navigation ──► Screens
                       └──► Redux ───────► State Management
```

## Data Flow Examples

### 1. Price Update Flow
```
Amazon API → Price Tracking Service → Database → WebSocket → Clients
                    ↓
              Email Service → User Alerts
```

### 2. Authentication Flow
```
Client → Login Request → Auth Controller → User Model → JWT Token
                              ↓
                        Password Verify (bcrypt)
                              ↓
                        Generate Token → Return to Client
```

### 3. Real-time Notification Flow
```
Event Trigger → WebSocket Service → Socket.IO → Connected Clients
                      ↓
                Room-based Filter → Specific Users/Phones
```

### 4. Analytics Tracking Flow
```
User Action → Middleware → Analytics Service → Database
                 ↓
            Session ID → Event Data (JSONB) → Metrics Calculation
```

## Technology Stack Summary

**Frontend:**
- React 18 + TypeScript + Vite
- Tailwind CSS
- React Navigation (Mobile)

**Backend:**
- Node.js 20+ + Express.js
- TypeScript
- Socket.IO
- GraphQL + express-graphql

**Database:**
- PostgreSQL 16
- Redis 7

**External Services:**
- Amazon Product Advertising API 5.0
- SMTP Email Service
- Google Analytics 4

**Background Jobs:**
- node-cron
- Scheduled price updates
- Email queue processing

**Mobile:**
- React Native 0.73
- Redux Toolkit
- React Navigation

## Security Layers

```
┌─────────────────────────────────────────┐
│         Security Measures               │
├─────────────────────────────────────────┤
│ 1. Helmet.js - Security Headers         │
│ 2. Rate Limiting - API Protection       │
│ 3. CORS - Origin Control                │
│ 4. JWT - Stateless Auth                 │
│ 5. bcrypt - Password Hashing            │
│ 6. Input Validation - SQL Injection     │
│ 7. Environment Variables - Secrets      │
│ 8. CodeQL - Vulnerability Scanning      │
└─────────────────────────────────────────┘
```

## Scalability Features

- **Horizontal Scaling**: Stateless backend design
- **Database**: Connection pooling, read replicas support
- **Caching**: Redis for hot data
- **WebSocket**: Room-based subscriptions for efficiency
- **Load Balancing**: Health check endpoints ready
- **Background Jobs**: Async processing with queues
