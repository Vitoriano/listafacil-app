import { io, Socket } from 'socket.io-client';
import { WS_URL } from './constants';
import { logger } from '@/shared/utils/logger';

type Listener = (...args: any[]) => void;

class SocketService {
  private socket: Socket | null = null;
  private listeners = new Map<string, Set<Listener>>();
  private rooms = new Set<string>();

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
      this.resubscribe();
    });

    this.socket.on('disconnect', (reason) => {
      logger.info('Socket', 'Disconnected', reason);
    });

    this.socket.on('connect_error', (error) => {
      logger.error('Socket', 'Connection error', error.message);
    });

    // Attach any listeners registered before connect
    this.resubscribe();
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
    this.listeners.clear();
    this.rooms.clear();
    logger.info('Socket', 'Disconnected manually');
  }

  emit(event: string, payload: Record<string, string>) {
    this.socket?.emit(event, payload);
  }

  on(event: string, callback: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: Listener) {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
      this.socket?.off(event, callback);
    } else {
      this.listeners.delete(event);
      this.socket?.off(event);
    }
  }

  get isConnected() {
    return this.socket?.connected ?? false;
  }

  // ── Room commands ──

  joinList(listId: string) {
    this.rooms.add(`list:${listId}`);
    this.emit('join:list', { listId });
  }

  leaveList(listId: string) {
    this.rooms.delete(`list:${listId}`);
    this.emit('leave:list', { listId });
  }

  joinPurchase(purchaseId: string) {
    this.rooms.add(`purchase:${purchaseId}`);
    this.emit('join:purchase', { purchaseId });
  }

  leavePurchase(purchaseId: string) {
    this.rooms.delete(`purchase:${purchaseId}`);
    this.emit('leave:purchase', { purchaseId });
  }

  /** Re-attach all listeners and rejoin rooms after reconnect */
  private resubscribe() {
    if (!this.socket) return;

    // Re-attach listeners
    for (const [event, callbacks] of this.listeners) {
      for (const cb of callbacks) {
        this.socket.off(event, cb);
        this.socket.on(event, cb);
      }
    }

    // Rejoin rooms
    for (const room of this.rooms) {
      if (room.startsWith('list:')) {
        this.emit('join:list', { listId: room.slice(5) });
      } else if (room.startsWith('purchase:')) {
        this.emit('join:purchase', { purchaseId: room.slice(9) });
      }
    }
  }
}

export const socketService = new SocketService();
