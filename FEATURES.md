# GetPhone.xyz - Feature Documentation

This document provides detailed information about all implemented features and enhancements.

## Table of Contents

1. [Amazon Product API Integration](#1-amazon-product-api-integration)
2. [User Authentication System](#2-user-authentication-system)
3. [Admin Dashboard](#3-admin-dashboard)
4. [Price Tracking & Alerts](#4-price-tracking--alerts)
5. [Email Notifications](#5-email-notifications)
6. [Analytics Integration](#6-analytics-integration)
7. [A/B Testing Framework](#7-ab-testing-framework)
8. [GraphQL API](#8-graphql-api)
9. [WebSocket Real-time Updates](#9-websocket-real-time-updates)
10. [Mobile App (React Native)](#10-mobile-app-react-native)

---

## 1. Amazon Product API Integration

### Overview
Integration with Amazon Product Advertising API 5.0 for real-time product data synchronization.

### Features
- **Product Details Fetching**: Retrieve comprehensive product information including price, availability, ratings, and reviews
- **Batch Processing**: Efficiently sync multiple products (up to 10 per batch)
- **AWS Signature V4**: Secure authentication with Amazon API
- **Automatic Updates**: Scheduled price synchronization

### Configuration
Set the following environment variables:
```env
AMAZON_ACCESS_KEY=your_access_key
AMAZON_SECRET_KEY=your_secret_key
AMAZON_PARTNER_TAG=your_partner_tag
AMAZON_REGION=us-east-1
AMAZON_API_HOST=webservices.amazon.com
```

### Usage
```typescript
import amazonProductAPI from './services/amazonProductAPI';

// Fetch single product
const product = await amazonProductAPI.getProductDetails('B08N5WRWNW');

// Batch sync multiple products
const results = await amazonProductAPI.batchSyncProducts(['ASIN1', 'ASIN2', 'ASIN3']);
```

### API Endpoints
- None directly exposed (used internally by price tracking service)

---

## 2. User Authentication System

### Overview
JWT-based authentication system with secure password hashing and role-based access control.

### Features
- **User Registration**: Create new user accounts with email validation
- **Login/Logout**: Secure authentication with JWT tokens
- **Profile Management**: View and update user profiles
- **Preferences**: Customizable user settings
- **Role-Based Access**: User and Admin roles
- **Password Security**: bcrypt hashing with salt rounds

### API Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Get Profile (Protected)
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update Preferences (Protected)
```http
PUT /api/auth/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "priceAlerts": true,
  "emailNotifications": true,
  "analyticsOptIn": false
}
```

### Database Schema
- `users` - User accounts
- `user_preferences` - User settings
- `password_reset_tokens` - Password reset tokens
- `email_verification_tokens` - Email verification tokens

---

## 3. Admin Dashboard

### Overview
Comprehensive admin panel for managing users, phones, and viewing statistics.

### Features
- **Dashboard Statistics**: View counts for users, phones, brands, and categories
- **User Management**: List, view, and manage user accounts
- **Phone Management**: Create, update, and delete phones
- **Status Control**: Activate/deactivate users and products

### API Endpoints (All require Admin role)

#### Get Dashboard Stats
```http
GET /api/admin/stats
Authorization: Bearer <admin_token>
```

#### List All Users
```http
GET /api/admin/users?page=1&limit=20
Authorization: Bearer <admin_token>
```

#### Update User Status
```http
PUT /api/admin/users/:userId/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "isActive": false
}
```

#### Create Phone
```http
POST /api/admin/phones
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "iPhone 15 Pro",
  "slug": "iphone-15-pro",
  "brandId": "uuid",
  "categoryId": "uuid",
  "description": "Latest iPhone",
  "price": 999,
  "amazonUrl": "https://amazon.com/...",
  "asin": "B0XXXXXX",
  "imageUrl": "https://...",
  "specs": {
    "display": "6.1 inch",
    "processor": "A17 Pro"
  }
}
```

---

## 4. Price Tracking & Alerts

### Overview
Automated price monitoring system with user alerts and historical tracking.

### Features
- **Price History**: Track price changes over time
- **User Alerts**: Set target prices and get notified
- **Scheduled Updates**: Automatic price checks every 6 hours
- **Email Notifications**: Instant alerts when prices drop
- **Historical Data**: View price trends

### Database Schema
- `price_history` - Historical price records
- `price_alerts` - User price alert subscriptions

### API Integration
Integrates with Amazon Product API and Email Service for automated updates.

### Scheduled Job
Runs via node-cron: `0 */6 * * *` (every 6 hours)

---

## 5. Email Notifications

### Overview
SMTP-based email service for transactional emails and notifications.

### Features
- **Welcome Emails**: Sent upon user registration
- **Price Alerts**: Notify users of price drops
- **Password Reset**: Secure password reset emails
- **Email Verification**: Verify user email addresses

### Configuration
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@example.com
SMTP_PASS=your_password
SMTP_FROM=noreply@getphone.xyz
FRONTEND_URL=http://localhost:5173
```

### Usage
```typescript
import emailService from './services/emailService';

// Send welcome email
await emailService.sendWelcomeEmail('user@example.com', 'John');

// Send price alert
await emailService.sendPriceAlert('user@example.com', {
  phoneId: 'uuid',
  alertPrice: 500,
  currentPrice: 450
});
```

---

## 6. Analytics Integration

### Overview
Comprehensive event tracking and analytics system.

### Features
- **Event Tracking**: Page views, phone views, comparisons, searches
- **Conversion Tracking**: Affiliate click tracking
- **Analytics Dashboard**: View metrics and insights
- **Google Analytics Integration**: Ready for GA4

### Tracked Events
- `page_view` - Page navigation
- `phone_view` - Phone detail views
- `comparison` - Phone comparisons
- `affiliate_click` - Clicks to Amazon
- `search` - Search queries

### Database Schema
- `analytics_events` - All tracked events with JSONB data

### Usage
```typescript
import analyticsService from './services/analytics';

// Track event
await analyticsService.trackEvent('phone_view', sessionId, { phoneId }, userId);

// Get analytics summary
const summary = await analyticsService.getSummary(startDate, endDate);

// Get top viewed phones
const topPhones = await analyticsService.getTopViewedPhones(10);
```

---

## 7. A/B Testing Framework

### Overview
Complete A/B testing system for running experiments and measuring results.

### Features
- **Experiment Management**: Create and manage experiments
- **Variant Assignment**: Consistent session-based assignment
- **Conversion Tracking**: Track experiment conversions
- **Results Analysis**: View conversion rates per variant

### Database Schema
- `experiments` - Experiment definitions
- `variant_assignments` - User-variant mappings
- `experiment_conversions` - Conversion events

### Usage
```typescript
import abTestingService from './services/abTesting';

// Create experiment
const experiment = await abTestingService.createExperiment(
  'Homepage Layout Test',
  'Testing new homepage design',
  ['control', 'variant_a', 'variant_b']
);

// Get variant for user
const variant = await abTestingService.getVariant(experimentId, sessionId);

// Track conversion
await abTestingService.trackConversion(experimentId, sessionId);

// Get results
const results = await abTestingService.getExperimentResults(experimentId);
```

---

## 8. GraphQL API

### Overview
GraphQL API alongside REST API for flexible data querying.

### Features
- **Flexible Queries**: Request exactly what you need
- **Type Safety**: Strongly typed schema
- **GraphiQL Interface**: Interactive API explorer (dev mode)
- **Mutations**: Authentication and data modifications

### Endpoint
```
http://localhost:3001/graphql
```

### Example Queries

#### Get Phones with Filtering
```graphql
query {
  phones(page: 1, limit: 10, brandId: "uuid", minPrice: 200, maxPrice: 1000) {
    phones {
      id
      name
      price
      brand {
        name
      }
      specs {
        display
        processor
      }
    }
    pagination {
      page
      total
      totalPages
    }
  }
}
```

#### User Login
```graphql
mutation {
  login(email: "user@example.com", password: "password") {
    token
    user {
      id
      email
      firstName
    }
  }
}
```

---

## 9. WebSocket Real-time Updates

### Overview
Socket.IO-based WebSocket service for real-time bidirectional communication.

### Features
- **Price Updates**: Live price change notifications
- **Stock Updates**: Real-time availability changes
- **User Notifications**: Personal alerts and messages
- **Announcements**: Broadcast messages to all users
- **Room Subscriptions**: Subscribe to specific phones or users

### Connection
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

// Subscribe to phone updates
socket.emit('subscribe:phone', phoneId);

// Listen for price updates
socket.on('price:update', (data) => {
  console.log('Price updated:', data);
});

// Listen for price alerts
socket.on('price:alert', (data) => {
  console.log('Price alert:', data);
});
```

### Events

#### Client to Server
- `subscribe:phone` - Subscribe to phone updates
- `unsubscribe:phone` - Unsubscribe from phone
- `subscribe:user` - Subscribe to user notifications

#### Server to Client
- `price:update` - Price changed
- `stock:update` - Stock availability changed
- `price:alert` - User price alert triggered
- `notification` - User notification
- `announcement` - Global announcement

---

## 10. Mobile App (React Native)

### Overview
Cross-platform mobile application structure for iOS and Android.

### Features
- **React Native**: Cross-platform development
- **Navigation**: React Navigation (Stack + Tabs)
- **State Management**: Redux Toolkit
- **API Integration**: Axios with API client
- **Push Notifications**: Infrastructure ready
- **Offline Support**: AsyncStorage ready

### Structure
```
mobile/
├── src/
│   ├── components/      # Reusable components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation config
│   ├── services/        # API services
│   ├── store/           # Redux store
│   ├── types/           # TypeScript types
│   └── utils/           # Utilities
├── android/             # Android native
├── ios/                 # iOS native
└── package.json
```

### Setup
```bash
cd mobile
npm install

# iOS
cd ios && pod install && cd ..
npm run ios

# Android
npm run android
```

### Development
```bash
# Start Metro bundler
npm start

# Run on device/simulator
npm run ios
npm run android

# Build production
npm run build:ios
npm run build:android
```

---

## Database Migrations

All new features are supported by database migrations in:
- `server/migrations/002_add_enhancements.sql`

Run migrations:
```bash
cd server
npm run migrate
```

## Environment Variables

See `server/.env.example` for all configuration options.

## Security Considerations

1. **JWT Tokens**: Change default JWT secret in production
2. **Password Hashing**: bcrypt with 10 salt rounds
3. **Rate Limiting**: Configured per endpoint
4. **CORS**: Configure allowed origins
5. **HTTPS**: Use SSL/TLS in production
6. **Environment Variables**: Never commit secrets

## Testing

Each service includes error handling and logging. Test configurations:
- Development: Full logging enabled
- Production: Optimized for performance

## Support

For questions or issues:
- Check the main README.md
- Review API documentation
- Examine example code in controllers
