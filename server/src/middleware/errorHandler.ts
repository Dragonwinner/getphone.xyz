import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
};

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
};
