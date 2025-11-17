# GetPhone.xyz Backend API

Scalable backend API for GetPhone.xyz built with Node.js, Express, PostgreSQL, and Redis.

## Features

- **RESTful API** - Clean and well-documented API endpoints
- **PostgreSQL Database** - Relational database with proper indexing for performance
- **Redis Caching** - In-memory caching for frequently accessed data
- **Connection Pooling** - Efficient database connection management
- **Rate Limiting** - Protection against abuse and DDoS attacks
- **CORS Support** - Secure cross-origin resource sharing
- **Compression** - Gzip compression for responses
- **Health Checks** - Monitoring endpoints for service status
- **Graceful Shutdown** - Proper cleanup of resources
- **TypeScript** - Type-safe code with full TypeScript support

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Language**: TypeScript
- **Process Manager**: PM2 (production)

## Prerequisites

- Node.js 20 or higher
- PostgreSQL 16 or higher
- Redis 7 or higher
- Docker and Docker Compose (optional, for containerized setup)

## Quick Start

### Option 1: Docker Compose (Recommended for Development)

1. Start all services:
```bash
cd /path/to/getphone.xyz
docker-compose up -d
```

2. Run database migrations:
```bash
docker-compose exec backend npm run migrate
```

3. Seed the database:
```bash
docker-compose exec backend node dist/config/seed.js
```

### Option 2: Manual Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Start PostgreSQL and Redis (locally or via Docker):
```bash
# PostgreSQL
docker run -d --name postgres -p 5432:5432 \
  -e POSTGRES_DB=getphone \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  postgres:16-alpine

# Redis
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

4. Run database migrations:
```bash
npm run build
npm run migrate
```

5. Seed the database:
```bash
node dist/config/seed.js
```

6. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Health Check
```
GET /health
```
Returns service health status and dependencies.

### Phones
```
GET /api/phones
Query parameters:
  - page: Page number (default: 1)
  - limit: Items per page (default: 50, max: 100)
  - brandId: Filter by brand UUID
  - categoryId: Filter by category UUID
  - minPrice: Minimum price filter
  - maxPrice: Maximum price filter
  - search: Search in name and description
  - inStock: Filter by stock status (true/false)
  - isFeatured: Filter featured phones (true)
  - sortBy: Sort field (price, rating, review_count, release_date)
  - sortOrder: ASC or DESC (default: DESC)

GET /api/phones/:slug
Get phone details by slug.

GET /api/phones/compare?ids=id1,id2,id3
Compare 2-4 phones by their IDs.
```

### Brands
```
GET /api/brands
Get all brands.

GET /api/brands/:slug
Get brand by slug.
```

### Categories
```
GET /api/categories
Get all categories.

GET /api/categories/:slug
Get category by slug.
```

## Database Schema

### Tables

- **brands** - Phone manufacturers
- **categories** - Phone categories (Flagship, Mid-Range, Budget, Gaming)
- **phones** - Main phone data
- **phone_specs** - Technical specifications
- **phone_features** - Phone features (many-to-many)
- **comparisons** - User comparison history
- **affiliate_accounts** - Amazon affiliate account management
- **product_sync_log** - Sync logs for affiliate products

### Indexes

Optimized indexes on:
- Foreign keys (brand_id, category_id)
- Frequently queried fields (slug, price, rating, in_stock, is_featured)
- Search fields (for full-text search capability)

## Scalability Features

### Database
- **Connection Pooling**: Max 20 connections per instance
- **Indexes**: Strategic indexes on frequently queried columns
- **Read Replicas**: Architecture supports read replicas (configure additional DB_READ_HOST)
- **Query Optimization**: Efficient JOIN queries with selective column fetching

### Caching
- **Redis**: In-memory caching for hot data
- **TTL Strategy**: 
  - Static data (brands, categories): 1 hour
  - Phone details: 10 minutes
  - Phone listings: 5 minutes
- **Cache Invalidation**: Pattern-based cache clearing

### Rate Limiting
- Default: 100 requests per 15 minutes per IP
- Configurable via environment variables
- Can be adjusted based on load patterns

### Horizontal Scaling
- **Stateless Design**: No session storage in app
- **Health Checks**: `/health` endpoint for load balancers
- **Graceful Shutdown**: Proper cleanup on SIGTERM/SIGINT
- **Ready for Kubernetes/ECS**: Containerized with health checks

## Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/getphone
DB_HOST=localhost
DB_PORT=5432
DB_NAME=getphone
DB_USER=postgres
DB_PASSWORD=password
DB_MAX_CONNECTIONS=20

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_TTL=3600

# API Configuration
API_RATE_LIMIT=100
API_RATE_WINDOW=15

# CORS
CORS_ORIGIN=http://localhost:5173
```

## Production Deployment

### Using PM2

1. Build the application:
```bash
npm run build
```

2. Start with PM2:
```bash
pm2 start dist/index.js --name getphone-api -i max
```

### Using Docker

1. Build the image:
```bash
docker build -t getphone-api ./server
```

2. Run the container:
```bash
docker run -d -p 3001:3001 \
  -e DB_HOST=your-db-host \
  -e REDIS_HOST=your-redis-host \
  --name getphone-api \
  getphone-api
```

### Environment Recommendations

**Development**
- DB_MAX_CONNECTIONS=10
- CACHE_TTL=300
- API_RATE_LIMIT=1000

**Production**
- DB_MAX_CONNECTIONS=20-50 (based on instance size)
- CACHE_TTL=3600
- API_RATE_LIMIT=100
- Use managed PostgreSQL (AWS RDS, Google Cloud SQL, Azure Database)
- Use managed Redis (AWS ElastiCache, Redis Cloud)
- Enable SSL/TLS for database connections
- Use environment-based configuration management

## Monitoring

### Health Check
```bash
curl http://localhost:3001/health
```

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

### Logs
- Application logs are written to stdout/stderr
- Use log aggregation services (CloudWatch, Datadog, etc.)
- Database query logs include execution time

## Performance Optimization

### For Millions of Users

1. **Database Optimization**
   - Use read replicas for read-heavy workloads
   - Implement database sharding for horizontal scaling
   - Regular VACUUM and ANALYZE operations
   - Monitor slow queries and add indexes as needed

2. **Caching Strategy**
   - Cache frequently accessed data
   - Implement cache warming for popular items
   - Use Redis Cluster for high availability

3. **Load Balancing**
   - Deploy multiple API instances behind load balancer
   - Use sticky sessions if needed
   - Health check integration

4. **CDN Integration**
   - Serve static assets via CDN
   - Cache API responses at edge locations
   - Use API Gateway for rate limiting and throttling

5. **Database Connection Management**
   - One connection pool per application instance
   - Monitor connection pool usage
   - Adjust pool size based on load

## Maintenance

### Database Migrations
```bash
npm run migrate
```

### Database Seeding
```bash
node dist/config/seed.js
```

### Cache Clearing
Connect to Redis and run:
```bash
redis-cli FLUSHALL
```

## Troubleshooting

### Connection Issues

**PostgreSQL connection failed**
- Check database credentials in `.env`
- Ensure PostgreSQL is running
- Verify network connectivity
- Check firewall rules

**Redis connection failed**
- Check Redis host and port in `.env`
- Ensure Redis is running
- Application will continue without cache (degraded performance)

### Performance Issues

**Slow queries**
- Check database indexes
- Monitor query execution times in logs
- Consider adding compound indexes

**High memory usage**
- Adjust connection pool size
- Monitor Redis memory usage
- Implement cache eviction policies

## Security

- **Input Validation**: All inputs are validated
- **Rate Limiting**: Protection against abuse
- **CORS**: Configured for specific origins
- **Helmet**: Security headers enabled
- **SQL Injection**: Parameterized queries
- **No Sensitive Data**: Never log passwords or tokens

## License

MIT
