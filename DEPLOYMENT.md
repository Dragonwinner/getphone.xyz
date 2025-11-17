# Production Deployment Guide

This guide covers deploying GetPhone.xyz to production environments.

## Prerequisites

- Production PostgreSQL database (AWS RDS, Google Cloud SQL, Azure Database, etc.)
- Production Redis instance (AWS ElastiCache, Redis Cloud, etc.)
- Domain name (getphone.xyz)
- SSL/TLS certificates
- Container orchestration platform (Kubernetes, AWS ECS, Google Cloud Run, etc.) or VPS

## Deployment Options

### Option 1: Docker on VPS (Simple)

Suitable for small to medium scale deployments (up to 100k users).

#### 1. Prepare the Server

```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. Set Up the Application

```bash
# Clone repository
git clone https://github.com/Dragonwinner/getphone.xyz.git
cd getphone.xyz

# Create production environment files
cp .env.example .env
cp server/.env.example server/.env

# Edit .env files with production values
nano .env
nano server/.env
```

#### 3. Configure Environment Variables

**Frontend (.env):**
```env
VITE_API_URL=https://api.getphone.xyz/api
```

**Backend (server/.env):**
```env
NODE_ENV=production
PORT=3001
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=5432
DB_NAME=getphone_production
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DB_MAX_CONNECTIONS=50
REDIS_HOST=your-elasticache-endpoint.region.cache.amazonaws.com
REDIS_PORT=6379
CACHE_TTL=3600
API_RATE_LIMIT=100
API_RATE_WINDOW=15
CORS_ORIGIN=https://getphone.xyz
```

#### 4. Build and Deploy

```bash
# Build backend
cd server
npm install --production
npm run build

# Build frontend
cd ..
npm install
npm run build

# Start with Docker Compose (production mode)
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose exec backend npm run migrate
docker-compose exec backend node dist/config/seed.js
```

#### 5. Set Up Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/getphone.xyz
server {
    listen 80;
    server_name getphone.xyz www.getphone.xyz;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name getphone.xyz www.getphone.xyz;

    ssl_certificate /etc/letsencrypt/live/getphone.xyz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/getphone.xyz/privkey.pem;

    # Frontend
    location / {
        root /var/www/getphone.xyz/dist;
        try_files $uri $uri/ /index.html;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
    }
}
```

#### 6. Set Up SSL with Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d getphone.xyz -d www.getphone.xyz
```

### Option 2: Kubernetes Deployment (Scalable)

Suitable for large scale deployments (millions of users).

#### 1. Create Kubernetes Manifests

**namespace.yaml:**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: getphone
```

**secrets.yaml:**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: getphone-secrets
  namespace: getphone
type: Opaque
stringData:
  DB_HOST: your-db-host
  DB_PASSWORD: your-db-password
  REDIS_HOST: your-redis-host
```

**backend-deployment.yaml:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: getphone-backend
  namespace: getphone
spec:
  replicas: 3
  selector:
    matchLabels:
      app: getphone-backend
  template:
    metadata:
      labels:
        app: getphone-backend
    spec:
      containers:
      - name: backend
        image: your-registry/getphone-backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: production
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: getphone-secrets
              key: DB_HOST
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: getphone-secrets
              key: DB_PASSWORD
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: getphone-backend-service
  namespace: getphone
spec:
  selector:
    app: getphone-backend
  ports:
  - port: 3001
    targetPort: 3001
  type: ClusterIP
```

**ingress.yaml:**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: getphone-ingress
  namespace: getphone
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - getphone.xyz
    - www.getphone.xyz
    secretName: getphone-tls
  rules:
  - host: getphone.xyz
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: getphone-backend-service
            port:
              number: 3001
      - path: /health
        pathType: Prefix
        backend:
          service:
            name: getphone-backend-service
            port:
              number: 3001
```

#### 2. Deploy to Kubernetes

```bash
# Apply manifests
kubectl apply -f namespace.yaml
kubectl apply -f secrets.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f ingress.yaml

# Check status
kubectl get pods -n getphone
kubectl get services -n getphone
kubectl get ingress -n getphone

# View logs
kubectl logs -f deployment/getphone-backend -n getphone
```

### Option 3: AWS ECS with Fargate

#### 1. Create ECR Repository

```bash
aws ecr create-repository --repository-name getphone-backend
```

#### 2. Build and Push Docker Image

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build and push
docker build -t getphone-backend ./server
docker tag getphone-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/getphone-backend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/getphone-backend:latest
```

#### 3. Create ECS Task Definition

Use AWS Console or CLI to create a Fargate task definition with:
- Container image from ECR
- Environment variables from AWS Secrets Manager
- Health check on /health endpoint
- Appropriate CPU/memory allocation

#### 4. Create ECS Service

- Create Application Load Balancer
- Configure target group for backend
- Create ECS service with Fargate
- Configure auto-scaling based on CPU/memory

## Database Setup

### PostgreSQL

#### 1. Create Production Database

Using AWS RDS as an example:

```bash
aws rds create-db-instance \
  --db-instance-identifier getphone-production \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --master-username admin \
  --master-user-password YOUR_SECURE_PASSWORD \
  --allocated-storage 100 \
  --storage-type gp3 \
  --backup-retention-period 7 \
  --publicly-accessible false \
  --vpc-security-group-ids sg-xxxxx
```

#### 2. Run Migrations

```bash
# From your local machine or CI/CD pipeline
export DATABASE_URL="postgresql://admin:password@your-rds-endpoint/getphone"
cd server
npm run build
npm run migrate
node dist/config/seed.js
```

### Redis

#### 1. Create Redis Cluster

Using AWS ElastiCache:

```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id getphone-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1 \
  --security-group-ids sg-xxxxx
```

## Monitoring & Observability

### Health Checks

- Set up monitoring on `/health` endpoint
- Configure alerts for service downtime
- Monitor response times

### Logging

```bash
# For Docker deployments
docker-compose logs -f backend

# For Kubernetes
kubectl logs -f deployment/getphone-backend -n getphone

# For AWS ECS
aws logs tail /ecs/getphone-backend --follow
```

### Metrics

Monitor:
- API response times
- Database connection pool usage
- Redis cache hit rates
- Error rates
- Request rates per endpoint

### Recommended Tools

- **Application Monitoring**: New Relic, Datadog, or AWS CloudWatch
- **Error Tracking**: Sentry
- **Log Aggregation**: ELK Stack, CloudWatch Logs, or Datadog
- **Uptime Monitoring**: UptimeRobot, Pingdom

## Scaling Considerations

### Horizontal Scaling

1. **Backend**: Scale to multiple instances
   - Use load balancer
   - Each instance connects to shared PostgreSQL and Redis
   - Stateless design allows unlimited horizontal scaling

2. **Database**: Use read replicas for read-heavy workloads
   ```sql
   -- Configure read replica endpoint in application
   DB_READ_HOST=read-replica-endpoint
   ```

3. **Redis**: Use Redis Cluster for high availability
   - Multiple Redis nodes
   - Automatic failover
   - Sharding for large datasets

### Vertical Scaling

- Increase database instance size (CPU, RAM)
- Increase Redis instance size
- Adjust connection pool sizes accordingly

### CDN Setup

Use CloudFront, Cloudflare, or similar:

1. Configure CDN to cache static frontend assets
2. Set appropriate cache headers
3. Configure API pass-through without caching (except for cacheable endpoints)

## Security Checklist

- [ ] Enable SSL/TLS for all connections
- [ ] Use environment variables for secrets
- [ ] Enable database SSL connections
- [ ] Configure security groups/firewalls
- [ ] Enable DDoS protection
- [ ] Set up WAF (Web Application Firewall)
- [ ] Enable database backups
- [ ] Implement secret rotation
- [ ] Enable audit logging
- [ ] Configure CORS properly
- [ ] Keep dependencies updated
- [ ] Regular security scans

## Backup & Recovery

### Database Backups

```bash
# Manual backup
pg_dump -h your-db-host -U admin -d getphone > backup_$(date +%Y%m%d).sql

# Automated backups (AWS RDS)
aws rds create-db-snapshot \
  --db-instance-identifier getphone-production \
  --db-snapshot-identifier getphone-backup-$(date +%Y%m%d)
```

### Recovery

```bash
# Restore from backup
psql -h your-db-host -U admin -d getphone < backup_20240101.sql
```

## Performance Optimization

1. **Enable Gzip Compression** (already configured)
2. **Database Query Optimization**
   - Regular VACUUM ANALYZE
   - Monitor slow queries
   - Add indexes as needed

3. **Redis Caching Strategy**
   - Cache frequently accessed data
   - Implement cache warming
   - Monitor cache hit rates

4. **Frontend Optimization**
   - Use CDN for static assets
   - Enable browser caching
   - Minimize bundle size

## Cost Optimization

### AWS Example Monthly Costs

- **RDS (db.t3.medium)**: ~$50
- **ElastiCache (cache.t3.micro)**: ~$15
- **ECS Fargate (3 tasks, 0.5 vCPU, 1GB RAM)**: ~$25
- **Application Load Balancer**: ~$20
- **CloudFront**: ~$10 (depending on traffic)
- **Total**: ~$120/month (excluding data transfer)

### Optimization Tips

- Use reserved instances for predictable workloads
- Implement auto-scaling to scale down during low traffic
- Use spot instances for non-critical tasks
- Configure database read replicas only when needed
- Use S3 for static asset storage

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check security group rules
   - Verify credentials
   - Check connection pool settings

2. **High CPU Usage**
   - Scale horizontally (add more instances)
   - Optimize database queries
   - Increase cache TTL

3. **Memory Issues**
   - Increase container memory limits
   - Monitor memory leaks
   - Adjust connection pool sizes

4. **Slow Response Times**
   - Check database query performance
   - Verify Redis cache is working
   - Monitor network latency
   - Add database indexes

## Support

For issues and questions:
- GitHub Issues: https://github.com/Dragonwinner/getphone.xyz/issues
- Documentation: See README.md and server/README.md
