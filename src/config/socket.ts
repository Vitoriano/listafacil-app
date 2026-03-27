import { io, Socket } from 'socket.io-client';
import { WS_URL } from './constants';
import { logger } from '@/shared/utils/logger';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      logger.info('Socket', 'Connected', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      logger.info('Socket', 'Disconnected', reason);
    });

    this.socket.on('connect_error', (error) => {
      logger.error('Socket', 'Connection error', error.message);
    });
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
    logger.info('Socket', 'Disconnected manually');
  }

  emit(event: string, payload: Record<string, string>) {
    this.socket?.emit(event, payload);
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }

  get isConnected() {
    return this.socket?.connected ?? false;
  }

  // ── Room commands ──

  joinList(listId: string) {
    this.emit('join:list', { listId });
  }

  leaveList(listId: string) {
    this.emit('leave:list', { listId });
  }

  joinPurchase(purchaseId: string) {
    this.emit('join:purchase', { purchaseId });
  }

  leavePurchase(purchaseId: string) {
    this.emit('leave:purchase', { purchaseId });
  }
}

export const socketService = new SocketService();
