import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

/**
 * WebSocket Service using Socket.IO
 * Handles real-time updates for price changes, notifications, etc.
 */
class WebSocketService {
  private io: SocketIOServer | null = null;
  private connectedClients: Map<string, Socket> = new Map();

  /**
   * Initialize WebSocket server
   */
  initialize(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.io.on('connection', (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);
      this.connectedClients.set(socket.id, socket);

      // Handle client events
      socket.on('subscribe:phone', (phoneId: string) => {
        socket.join(`phone:${phoneId}`);
        console.log(`Client ${socket.id} subscribed to phone ${phoneId}`);
      });

      socket.on('unsubscribe:phone', (phoneId: string) => {
        socket.leave(`phone:${phoneId}`);
        console.log(`Client ${socket.id} unsubscribed from phone ${phoneId}`);
      });

      socket.on('subscribe:user', (userId: string) => {
        socket.join(`user:${userId}`);
        console.log(`Client ${socket.id} subscribed to user ${userId}`);
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        this.connectedClients.delete(socket.id);
      });
    });

    console.log('WebSocket service initialized');
  }

  /**
   * Broadcast price update to clients watching a phone
   */
  broadcastPriceUpdate(phoneId: string, priceData: {
    oldPrice: number;
    newPrice: number;
    percentChange: number;
  }): void {
    if (!this.io) return;

    this.io.to(`phone:${phoneId}`).emit('price:update', {
      phoneId,
      ...priceData,
      timestamp: new Date().toISOString()
    });

    console.log(`Broadcasted price update for phone ${phoneId}`);
  }

  /**
   * Send price alert notification to specific user
   */
  sendPriceAlert(userId: string, alertData: {
    phoneId: string;
    phoneName: string;
    targetPrice: number;
    currentPrice: number;
  }): void {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit('price:alert', {
      ...alertData,
      timestamp: new Date().toISOString()
    });

    console.log(`Sent price alert to user ${userId}`);
  }

  /**
   * Broadcast stock availability update
   */
  broadcastStockUpdate(phoneId: string, inStock: boolean): void {
    if (!this.io) return;

    this.io.to(`phone:${phoneId}`).emit('stock:update', {
      phoneId,
      inStock,
      timestamp: new Date().toISOString()
    });

    console.log(`Broadcasted stock update for phone ${phoneId}`);
  }

  /**
   * Send notification to specific user
   */
  sendNotification(userId: string, notification: {
    type: string;
    title: string;
    message: string;
    data?: any;
  }): void {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });

    console.log(`Sent notification to user ${userId}`);
  }

  /**
   * Broadcast general announcement to all connected clients
   */
  broadcastAnnouncement(announcement: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
  }): void {
    if (!this.io) return;

    this.io.emit('announcement', {
      ...announcement,
      timestamp: new Date().toISOString()
    });

    console.log('Broadcasted announcement to all clients');
  }

  /**
   * Get count of connected clients
   */
  getConnectedCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId: string): boolean {
    if (!this.io) return false;
    
    const room = this.io.sockets.adapter.rooms.get(`user:${userId}`);
    return room ? room.size > 0 : false;
  }
}

export default new WebSocketService();
