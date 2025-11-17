import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import phonesRouter from './routes/phones.js';
import brandsRouter from './routes/brands.js';
import categoriesRouter from './routes/categories.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import pool from './config/database.js';
import redis from './config/redis.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', apiLimiter);

// Health check endpoint (with lenient rate limiting)
app.get('/health', apiLimiter, async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    const redisStatus = redis.status === 'ready' ? 'connected' : 'disconnected';
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: redisStatus,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service unavailable',
    });
  }
});

// API routes
app.use('/api/phones', phonesRouter);
app.use('/api/brands', brandsRouter);
app.use('/api/categories', categoriesRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Received shutdown signal, closing server...');
  
  server.close(async () => {
    console.log('HTTP server closed');
    
    try {
      await pool.end();
      console.log('Database connection closed');
      
      await redis.quit();
      console.log('Redis connection closed');
      
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;
