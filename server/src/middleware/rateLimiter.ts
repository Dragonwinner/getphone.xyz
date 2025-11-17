import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.API_RATE_WINDOW || '15') * 60 * 1000,
  max: parseInt(process.env.API_RATE_LIMIT || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
