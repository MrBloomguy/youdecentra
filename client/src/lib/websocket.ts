/**
 * WebSocket client for real-time updates
 */

type WebSocketMessage = {
  type: string;
  data: any;
};

class WebSocketClient {
  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private messageListeners: ((message: WebSocketMessage) => void)[] = [];
  private statusListeners: ((connected: boolean) => void)[] = [];

  constructor() {
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.send = this.send.bind(this);
    this.addMessageListener = this.addMessageListener.bind(this);
    this.removeMessageListener = this.removeMessageListener.bind(this);
    this.addStatusListener = this.addStatusListener.bind(this);
    this.removeStatusListener = this.removeStatusListener.bind(this);
  }

  connect(): void {
    if (this.socket) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    try {
      // Determine base URL for WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      
      // Always use the same host as the page to avoid CORS issues
      const baseUrl = `${protocol}//${host}`;
      const wsUrl = `${baseUrl}/ws`;
      
      console.log(`Attempting WebSocket connection to: ${wsUrl}`);
      
      // Create new WebSocket without any query parameters for simplicity
      this.socket = new WebSocket(wsUrl);
      
      console.log('WebSocket object created, waiting for connection...');

      this.socket.onopen = () => {
        console.log('WebSocket connection established');
        this.notifyStatusListeners(true);
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          this.notifyMessageListeners(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket connection closed, attempting to reconnect...');
        this.socket = null;
        this.notifyStatusListeners(false);
        this.scheduleReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.socket?.close();
      };
    } catch (error) {
      console.error('Error connecting to WebSocket server:', error);
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  send(type: string, data: any): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('Cannot send message, WebSocket is not connected');
      return;
    }

    try {
      const message: WebSocketMessage = { type, data };
      this.socket.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
    }
  }

  addMessageListener(listener: (message: WebSocketMessage) => void): void {
    this.messageListeners.push(listener);
  }

  removeMessageListener(listener: (message: WebSocketMessage) => void): void {
    this.messageListeners = this.messageListeners.filter(l => l !== listener);
  }

  addStatusListener(listener: (connected: boolean) => void): void {
    this.statusListeners.push(listener);
    // Notify the new listener of current status
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      listener(true);
    } else {
      listener(false);
    }
  }

  removeStatusListener(listener: (connected: boolean) => void): void {
    this.statusListeners = this.statusListeners.filter(l => l !== listener);
  }

  private notifyMessageListeners(message: WebSocketMessage): void {
    this.messageListeners.forEach(listener => {
      try {
        listener(message);
      } catch (error) {
        console.error('Error in WebSocket message listener:', error);
      }
    });
  }

  private notifyStatusListeners(connected: boolean): void {
    this.statusListeners.forEach(listener => {
      try {
        listener(connected);
      } catch (error) {
        console.error('Error in WebSocket status listener:', error);
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }
    
    // Reconnect after 5 seconds
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 5000);
  }
  
  // Ping the server to check connection
  public ping(): void {
    this.send('ping', { timestamp: new Date().toISOString() });
  }
  
  // Debug method to log current connection state
  public debugConnectionState(): void {
    const states = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
    if (!this.socket) {
      console.log('WebSocket status: Not initialized');
      return;
    }
    
    console.log(`WebSocket status: ${states[this.socket.readyState]}`);
    console.log(`WebSocket URL: ${this.socket.url}`);
  }
}

// Create singleton instance
export const webSocketClient = new WebSocketClient();

// React hook to use WebSocket
export function useWebSocket() {
  return webSocketClient;
}