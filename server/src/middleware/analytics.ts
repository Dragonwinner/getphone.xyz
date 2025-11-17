import { Request, Response, NextFunction } from 'express';
import analyticsService from '../services/analytics.js';

/**
 * Generate or retrieve session ID from cookies/headers
 */
const getSessionId = (req: Request): string => {
  // Try to get from cookie first
  let sessionId = req.cookies?.sessionId;
  
  // If not in cookie, try header
  if (!sessionId) {
    sessionId = req.headers['x-session-id'] as string;
  }
  
  // Generate new if doesn't exist
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  return sessionId;
};

/**
 * Track page views automatically
 */
export const trackPageView = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionId = getSessionId(req);
    const userId = (req as any).user?.id;
    const page = req.path;

    // Track in background, don't wait
    analyticsService.trackPageView(sessionId, page, userId).catch(err => {
      console.error('Background analytics error:', err);
    });
  } catch (error) {
    // Silently fail - don't block request
  }
  
  next();
};

/**
 * Integration with Google Analytics
 */
export const sendToGoogleAnalytics = (
  measurementId: string,
  apiSecret: string,
  clientId: string,
  events: any[]
): void => {
  // Google Analytics 4 Measurement Protocol
  if (!measurementId || !apiSecret) {
    return;
  }

  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;
  
  fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      client_id: clientId,
      events: events
    })
  }).catch(error => {
    console.error('Error sending to Google Analytics:', error);
  });
};
