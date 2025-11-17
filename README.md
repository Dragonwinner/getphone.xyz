# GetPhone.xyz - Phone Comparison & Affiliate Platform

A modern **full-stack** phone comparison website with Amazon affiliate integration, built with React, TypeScript, Vite, Node.js, PostgreSQL, and Redis.

## 🚀 Features

### Full Stack Architecture
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL 16 with connection pooling
- **Cache**: Redis 7 for high-performance caching
- **Scalability**: Designed to handle millions of users

### 1. Phone Comparison Tool
- Compare up to 4 phones side by side
- Visual comparison of specifications, features, and prices
- Automatic highlighting of best values (best price, highest rating, most RAM/storage/battery)
- Easy-to-use checkbox selection from the phones listing page
- Persistent comparison state across page navigation

### 2. Amazon Affiliate Integration
- Each phone includes Amazon ASIN (Amazon Standard Identification Number)
- Direct affiliate links to Amazon India
- Product URLs formatted for affiliate tracking
- Ready for Amazon Product Advertising API integration

### 3. Backend API & Database
- RESTful API with pagination and filtering
- PostgreSQL database with optimized indexes
- Redis caching for frequently accessed data
- Rate limiting and security headers
- Health check endpoints for monitoring

#### Database Tables:
- **brands** - Phone manufacturers
- **categories** - Phone categories (Flagship, Mid-Range, Budget, Gaming)
- **phones** - Main product catalog with specs, pricing, and affiliate links
- **phone_specs** - Technical specifications
- **phone_features** - Phone features (many-to-many)
- **comparisons** - Store user comparison sessions
- **affiliate_accounts** - Manage multiple Amazon affiliate accounts
- **product_sync_log** - Track affiliate product synchronization

### 4. Key Functionalities

#### Phone Listings
- Advanced filtering by brand and category
- Sort by price (ascending/descending) or rating
- Search functionality across phone names and descriptions
- Responsive grid layout with detailed phone cards
- Pagination support

#### Comparison Features
- Select phones for comparison using checkboxes
- Compare specifications side by side
- Highlight best values automatically
- Direct links to Amazon and product detail pages
- Responsive table design

#### Navigation
- Clean header with search functionality
- Direct link to comparison tool
- Mobile-friendly menu

## 🛠 Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (icons)

### Backend
- Node.js 20+
- Express.js
- TypeScript
- PostgreSQL 16
- Redis 7
- Connection pooling
- Rate limiting
- Helmet (security headers)
- CORS support

## 📦 Getting Started

### Prerequisites
- Node.js 20 or higher
- Docker and Docker Compose (recommended)
- PostgreSQL 16+ (if not using Docker)
- Redis 7+ (if not using Docker)

### Quick Start with Docker Compose (Recommended)

This will start all services (frontend, backend, PostgreSQL, Redis):

1. Clone the repository:
```bash
git clone https://github.com/Dragonwinner/getphone.xyz.git
cd getphone.xyz
```

2. Start all services:
```bash
docker-compose up -d
```

3. Run database migrations:
```bash
docker-compose exec backend npm run migrate
```

4. Seed the database:
```bash
docker-compose exec backend node dist/config/seed.js
```

5. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

### Manual Setup

#### Backend Setup

1. Install backend dependencies:
```bash
cd server
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start PostgreSQL and Redis:
```bash
# Using Docker
docker run -d --name postgres -p 5432:5432 \
  -e POSTGRES_DB=getphone \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  postgres:16-alpine

docker run -d --name redis -p 6379:6379 redis:7-alpine
```

4. Run migrations and seed data:
```bash
npm run build
npm run migrate
node dist/config/seed.js
```

5. Start the backend server:
```bash
npm run dev
```

The API will be available at http://localhost:3001

#### Frontend Setup

1. Install frontend dependencies:
```bash
cd ..  # Back to root directory
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Default API URL is http://localhost:3001/api
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:5173

## 📚 Documentation

- [Backend API Documentation](./server/README.md) - Comprehensive backend setup and API docs
- [API Endpoints](#api-endpoints) - Quick reference for API routes

## 🔌 API Endpoints

### Health Check
```
GET /health
```

### Phones
```
GET /api/phones
GET /api/phones/:slug
GET /api/phones/compare?ids=id1,id2,id3
```

### Brands
```
GET /api/brands
GET /api/brands/:slug
```

### Categories
```
GET /api/categories
GET /api/categories/:slug
```

For detailed API documentation, see [server/README.md](./server/README.md).

## 🚀 Deployment

### Production Build

#### Frontend
```bash
npm run build
```

#### Backend
```bash
cd server
npm run build
npm start
```

### Docker Deployment

Build and run with Docker:
```bash
docker build -t getphone-api ./server
docker run -p 3001:3001 getphone-api
```

### Environment Configuration

**Development:**
- Uses local PostgreSQL and Redis
- Hot reload enabled
- Verbose logging

**Production:**
- Use managed database services (AWS RDS, Google Cloud SQL)
- Use managed Redis (AWS ElastiCache, Redis Cloud)
- Enable SSL/TLS
- Configure proper CORS origins
- Use environment-based secrets management

## ⚡ Performance & Scalability

### Database Optimization
- Connection pooling (max 20 connections per instance)
- Strategic indexes on frequently queried columns
- Efficient JOIN queries
- Support for read replicas

### Caching Strategy
- Redis caching for hot data
- TTL-based cache invalidation
- Static data cached for 1 hour
- Dynamic data cached for 5-10 minutes

### Horizontal Scaling
- Stateless backend design
- Health check endpoints for load balancers
- Graceful shutdown handling
- Ready for Kubernetes/ECS deployment

### Handling Millions of Users
- Database sharding support
- Read replica configuration
- CDN integration for static assets
- API Gateway for rate limiting
- Multiple backend instances behind load balancer

## Domain
Website configured for: **getphone.xyz** / **getphones.xyz**

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## 🔒 Security

- Input validation on all API endpoints
- Rate limiting to prevent abuse
- CORS configuration
- Security headers via Helmet
- Parameterized database queries to prevent SQL injection
- Environment-based configuration management

## 📊 Monitoring

- Health check endpoint: `/health`
- Database connection monitoring
- Redis connection monitoring  
- Query execution time logging
- Application logs to stdout/stderr

## Amazon Affiliate Setup

To enable full Amazon affiliate functionality:

1. Sign up for Amazon Associates program
2. Get your affiliate tag
3. Update the affiliate links in the database or via API
4. For auto-fetch functionality, configure Amazon Product Advertising API credentials

## 🔄 Enhanced Features (Newly Implemented!)

### ✅ Amazon Product API Integration
- Real-time product data synchronization from Amazon PA-API 5.0
- Automatic price updates and availability tracking
- Product details including reviews, ratings, and images
- Batch processing for efficient API usage

### ✅ User Authentication System
- JWT-based authentication with secure password hashing
- User registration and login
- Profile management and preferences
- Role-based access control (user/admin)
- Password reset and email verification (infrastructure ready)

### ✅ Admin Dashboard
- Comprehensive statistics and metrics
- User management (view, activate/deactivate)
- Phone catalog management (create, update, delete)
- Real-time monitoring of system health

### ✅ Price Tracking & Alerts
- Historical price tracking with database storage
- User-configurable price alerts
- Automated price checking (scheduled every 6 hours)
- Email notifications when target prices are reached
- Price history visualization support

### ✅ Email Notifications
- Welcome emails for new users
- Price drop alerts
- Password reset emails
- Email verification
- Configurable SMTP integration

### ✅ Analytics Integration
- Event tracking (page views, phone views, comparisons)
- Search analytics with query tracking
- Affiliate click tracking
- Conversion rate calculation
- Top viewed phones analytics
- Google Analytics 4 integration ready

### ✅ A/B Testing Framework
- Create and manage experiments
- Consistent variant assignment using hashing
- Conversion tracking
- Experiment results and statistics
- Session-based variant persistence

### ✅ GraphQL API
- Full GraphQL schema for phones, brands, categories
- Query support with filtering and pagination
- Mutations for authentication and user actions
- GraphiQL interface in development mode
- Alongside existing REST API

### ✅ WebSocket Real-time Updates
- Live price change notifications
- Stock availability updates
- User-specific notifications
- Price alert triggers
- Announcement broadcasting
- Room-based subscriptions (per phone, per user)

### ✅ Mobile App (React Native) Structure
- Complete project scaffolding
- Navigation setup (Stack + Tab navigators)
- Redux store configuration
- API service integration
- Push notification support ready
- iOS and Android build configurations

### 🚀 Additional Future Enhancements
- SEO optimizations for individual product pages
- Blog/content section for phone reviews
- Affiliate earnings dashboard
- Machine learning price predictions
- Social sharing features
- Wishlist functionality

## File Structure

```
getphone.xyz/
├── src/                    # Frontend source
│   ├── api/               # API client and services
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   ├── data/             # Data service layer
│   ├── types.ts          # TypeScript interfaces
│   └── App.tsx           # Main app component
├── server/               # Backend source
│   ├── src/
│   │   ├── config/       # Database, Redis, migrations
│   │   ├── controllers/  # Request handlers
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Express middleware
│   │   └── index.ts      # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml    # Multi-container setup
├── package.json          # Frontend dependencies
└── README.md
```

## 🤝 Contributing

This is a production-ready phone comparison and affiliate marketing platform. Feel free to customize the data, styling, and features to match your needs.

## 📄 License

MIT License

## 🙋 Support

For issues and questions:
- Check the [Backend README](./server/README.md) for API documentation
- Review the [API Endpoints](#api-endpoints) section
- Examine the health check endpoint for service status
