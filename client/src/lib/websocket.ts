/**
 * WebSocket client for real-time updates, notifications, and messaging
 */

import { AppConversation, AppMessage, AppNotification } from "@shared/types";

type WebSocketMessage = {
  type: string;
  data: any;
};

// Types for WebSocket message handlers
type NotificationHandler = (notification: AppNotification) => void;
type MessageHandler = (message: AppMessage) => void;
type TypingIndicatorHandler = (data: { conversationId: string; userId: string; isTyping: boolean }) => void;
type ConnectionStatusHandler = (connected: boolean) => void;

class WebSocketClient {
  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private messageListeners: ((message: WebSocketMessage) => void)[] = [];
  private statusListeners: ((connected: boolean) => void)[] = [];
  
  // Specific message type handlers
  private notificationHandlers: NotificationHandler[] = [];
  private messageHandlers: MessageHandler[] = [];
  private typingIndicatorHandlers: TypingIndicatorHandler[] = [];
  
  // Authentication state
  private userId: string | null = null;
  private authenticated: boolean = false;

  constructor() {
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.send = this.send.bind(this);
    this.addMessageListener = this.addMessageListener.bind(this);
    this.removeMessageListener = this.removeMessageListener.bind(this);
    this.addStatusListener = this.addStatusListener.bind(this);
    this.removeStatusListener = this.removeStatusListener.bind(this);
    this.authenticate = this.authenticate.bind(this);
    this.sendTypingIndicator = this.sendTypingIndicator.bind(this);
    this.onNotification = this.onNotification.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.onTypingIndicator = this.onTypingIndicator.bind(this);
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
      const wsUrl = `${protocol}//${host}/ws`;
      
      console.log(`Attempting WebSocket connection to: ${wsUrl}`);
      
      try {
        // Create new WebSocket without any query parameters for simplicity
        this.socket = new WebSocket(wsUrl);
        console.log('WebSocket created successfully');
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        // Fall back to relative path if needed
        try {
          const fallbackUrl = '/ws';
          console.log(`Trying fallback WebSocket connection to: ${fallbackUrl}`);
          this.socket = new WebSocket(fallbackUrl);
        } catch (fallbackError) {
          console.error('Fallback WebSocket connection failed:', fallbackError);
          throw fallbackError;
        }
      }
      
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
    // First notify general message listeners
    this.messageListeners.forEach(listener => {
      try {
        listener(message);
      } catch (error) {
        console.error('Error in WebSocket message listener:', error);
      }
    });
    
    // Then handle specific message types
    try {
      switch (message.type) {
        case 'auth_success':
          this.authenticated = true;
          this.userId = message.data.userId;
          console.log(`WebSocket authenticated for user: ${this.userId}`);
          break;
        
        case 'new_notification':
          if (message.data) {
            this.notificationHandlers.forEach(handler => {
              try {
                handler(message.data as AppNotification);
              } catch (error) {
                console.error('Error in notification handler:', error);
              }
            });
          }
          break;
        
        case 'new_message':
          if (message.data) {
            this.messageHandlers.forEach(handler => {
              try {
                handler(message.data as AppMessage);
              } catch (error) {
                console.error('Error in message handler:', error);
              }
            });
          }
          break;
        
        case 'user_typing':
          if (message.data) {
            this.typingIndicatorHandlers.forEach(handler => {
              try {
                handler(message.data);
              } catch (error) {
                console.error('Error in typing indicator handler:', error);
              }
            });
          }
          break;
        
        case 'pending_notifications':
          if (Array.isArray(message.data)) {
            message.data.forEach(notification => {
              this.notificationHandlers.forEach(handler => {
                try {
                  handler(notification as AppNotification);
                } catch (error) {
                  console.error('Error in pending notification handler:', error);
                }
              });
            });
          }
          break;
      }
    } catch (error) {
      console.error('Error processing specific message type:', error);
    }
  }

  private notifyStatusListeners(connected: boolean): void {
    this.statusListeners.forEach(listener => {
      try {
        listener(connected);
      } catch (error) {
        console.error('Error in WebSocket status listener:', error);
      }
    });
    
    // If connection was just established and we have a userId, authenticate
    if (connected && this.userId && !this.authenticated) {
      this.authenticate(this.userId);
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }
    
    // Reset authentication state on disconnect
    this.authenticated = false;
    
    // Reconnect after 5 seconds
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 5000);
  }
  
  // Authentication
  public authenticate(userId: string): void {
    if (!userId) {
      console.warn('Cannot authenticate without userId');
      return;
    }
    
    this.userId = userId;
    
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.send('auth', { userId });
    } else {
      // Will authenticate after connecting
      this.connect();
    }
  }
  
  // Send typing indicator for a conversation
  public sendTypingIndicator(conversationId: string, recipientId: string, isTyping: boolean): void {
    if (!this.authenticated) {
      console.warn('Cannot send typing indicator without authentication');
      return;
    }
    
    this.send('typing', {
      conversationId,
      recipientId,
      isTyping
    });
  }
  
  // Register notification handler
  public onNotification(handler: NotificationHandler): () => void {
    this.notificationHandlers.push(handler);
    return () => {
      this.notificationHandlers = this.notificationHandlers.filter(h => h !== handler);
    };
  }
  
  // Register message handler
  public onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }
  
  // Register typing indicator handler
  public onTypingIndicator(handler: TypingIndicatorHandler): () => void {
    this.typingIndicatorHandlers.push(handler);
    return () => {
      this.typingIndicatorHandlers = this.typingIndicatorHandlers.filter(h => h !== handler);
    };
  }
  
  // Check if authenticated
  public isAuthenticated(): boolean {
    return this.authenticated;
  }
  
  // Get current user ID
  public getCurrentUserId(): string | null {
    return this.userId;
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
    console.log(`Authenticated: ${this.authenticated}`);
    console.log(`User ID: ${this.userId || 'none'}`);
  }
}

// Create singleton instance
export const webSocketClient = new WebSocketClient();

// React hook to use WebSocket
export function useWebSocket() {
  return webSocketClient;
}

// React hook for notifications
import { useState, useEffect } from 'react';

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Initialize WebSocket and load existing notifications
  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }
    
    // Connect to WebSocket
    webSocketClient.connect();
    
    // Authenticate with user ID
    webSocketClient.authenticate(userId);
    
    // Load existing notifications
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/notifications/user/${userId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch notifications: ${response.status}`);
        }
        
        const data = await response.json() as AppNotification[];
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
    
    // Listen for new notifications
    const removeListener = webSocketClient.onNotification((notification) => {
      if (notification.recipient === userId) {
        setNotifications(prev => {
          // Check if notification already exists
          const exists = prev.some(n => n.id === notification.id);
          if (exists) {
            return prev;
          }
          
          // Add new notification at the beginning
          const updated = [notification, ...prev];
          
          // Update unread count
          if (!notification.read) {
            setUnreadCount(count => count + 1);
          }
          
          return updated;
        });
      }
    });
    
    return () => {
      removeListener();
    };
  }, [userId]);
  
  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.status}`);
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read: true } 
            : n
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!userId) return false;
    
    try {
      const response = await fetch(`/api/notifications/user/${userId}/read-all`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to mark all notifications as read: ${response.status}`);
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
      
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  };
  
  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead
  };
}

// React hook for messaging
export function useMessages(userId: string | null, conversationId?: string) {
  const [messages, setMessages] = useState<AppMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  
  // Load messages and setup real-time updates
  useEffect(() => {
    if (!userId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    
    // Connect to WebSocket for real-time updates
    webSocketClient.connect();
    webSocketClient.authenticate(userId);
    
    // If we have a conversationId, load messages
    if (conversationId) {
      const fetchMessages = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/messages/conversation/${conversationId}`);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch messages: ${response.status}`);
          }
          
          const data = await response.json() as AppMessage[];
          setMessages(data);
        } catch (err) {
          setError(err instanceof Error ? err : new Error(String(err)));
          console.error('Error fetching messages:', err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchMessages();
      
      // Mark conversation as read
      fetch(`/api/conversations/${conversationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      }).catch(error => {
        console.error('Error marking conversation as read:', error);
      });
    }
    
    // Listen for new messages
    const messageListener = webSocketClient.onMessage((message) => {
      if (
        (message.recipient === userId || message.sender === userId) && 
        (!conversationId || message.conversationId === conversationId)
      ) {
        setMessages(prev => {
          // Check if message already exists
          const exists = prev.some(m => m.id === message.id);
          if (exists) {
            return prev;
          }
          
          return [...prev, message];
        });
        
        // If this is a received message in the current conversation, mark it as read
        if (conversationId && message.conversationId === conversationId && message.recipient === userId) {
          fetch(`/api/messages/${message.id}/read`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            }
          }).catch(error => {
            console.error('Error marking message as read:', error);
          });
        }
      }
    });
    
    // Listen for typing indicators
    const typingListener = webSocketClient.onTypingIndicator((data) => {
      if (conversationId && data.conversationId === conversationId) {
        if (data.isTyping) {
          setTypingUsers(prev => ({ ...prev, [data.userId]: true }));
          
          // Auto-clear typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUsers(prev => {
              const updated = { ...prev };
              delete updated[data.userId];
              return updated;
            });
          }, 3000);
        } else {
          setTypingUsers(prev => {
            const updated = { ...prev };
            delete updated[data.userId];
            return updated;
          });
        }
      }
    });
    
    return () => {
      messageListener();
      typingListener();
    };
  }, [userId, conversationId]);
  
  // Send a message
  const sendMessage = async (content: string, recipientId: string): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      // Get or create conversation
      let conversation: AppConversation;
      
      if (conversationId) {
        // Use existing conversation
        conversation = { id: conversationId } as AppConversation;
      } else {
        // Create new conversation
        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userIds: [userId, recipientId]
          })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to create conversation: ${response.status}`);
        }
        
        conversation = await response.json();
      }
      
      // Create the message
      const message: Partial<AppMessage> = {
        conversationId: conversation.id,
        sender: userId,
        recipient: recipientId,
        type: 'text',
        content,
        read: false
      };
      
      // Send to server
      const msgResponse = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      });
      
      if (!msgResponse.ok) {
        throw new Error(`Failed to send message: ${msgResponse.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  };
  
  // Send typing indicator
  const sendTypingIndicator = (isTyping: boolean, recipientId: string) => {
    if (!userId || !conversationId) return;
    
    webSocketClient.sendTypingIndicator(conversationId, recipientId, isTyping);
  };
  
  return {
    messages,
    loading,
    error,
    typingUsers,
    sendMessage,
    sendTypingIndicator
  };
}

// React hook for conversations
export function useConversations(userId: string | null) {
  const [conversations, setConversations] = useState<AppConversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Load conversations
  useEffect(() => {
    if (!userId) {
      setConversations([]);
      setLoading(false);
      return;
    }
    
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/conversations/user/${userId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch conversations: ${response.status}`);
        }
        
        const data = await response.json() as AppConversation[];
        setConversations(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        console.error('Error fetching conversations:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConversations();
    
    // Connect to WebSocket for real-time updates
    webSocketClient.connect();
    webSocketClient.authenticate(userId);
    
    // Listen for new messages to update conversations
    const messageListener = webSocketClient.onMessage((message) => {
      if (message.recipient === userId || message.sender === userId) {
        // Refresh conversations
        fetchConversations().catch(console.error);
      }
    });
    
    return () => {
      messageListener();
    };
  }, [userId]);
  
  return {
    conversations,
    loading,
    error
  };
}