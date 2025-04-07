import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertCommunitySchema, insertPostSchema } from "@shared/schema";
import { WebSocketServer, WebSocket } from "ws";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time updates
  console.log('Setting up WebSocket server on path: /ws');
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws',
    // Allow connections from any origin without verification
    verifyClient: (_info: { origin: string; secure: boolean; req: any }) => true
  });
  
  // Log when the WebSocket server is ready
  console.log('WebSocket server initialized');

  // Track connected clients with their user IDs
  const clients = new Map<string, WebSocket[]>();

  wss.on('connection', (ws, req) => {
    console.log(`WebSocket client connected from ${req.socket.remoteAddress}`);
    
    // Send initial connection message
    ws.send(JSON.stringify({
      type: 'connection_established',
      data: {
        timestamp: new Date().toISOString(),
        message: 'Connected to web3-reddit WebSocket server'
      }
    }));
    
    // Store user connection information
    let userId: string | null = null;
    
    ws.on('message', (message) => {
      try {
        const parsed = JSON.parse(message.toString());
        
        // Handle different message types
        if (parsed.type === 'ping') {
          ws.send(JSON.stringify({
            type: 'pong',
            data: { timestamp: new Date().toISOString() }
          }));
        } 
        // Handle authentication and store user ID
        else if (parsed.type === 'auth' && parsed.data && parsed.data.userId) {
          userId = parsed.data.userId;
          
          // Add this connection to the user's connections
          if (userId) {
            if (!clients.has(userId)) {
              clients.set(userId, []);
            }
            clients.get(userId)?.push(ws);
          }
          
          console.log(`User ${userId} authenticated via WebSocket`);
          
          // Send acknowledgment
          ws.send(JSON.stringify({
            type: 'auth_success',
            data: { 
              userId,
              timestamp: new Date().toISOString() 
            }
          }));
          
          // Send any pending notifications
          if (userId) {
            storage.getNotifications(userId)
              .then(notifications => {
                const unreadNotifications = notifications.filter(n => !n.read);
                if (unreadNotifications.length > 0) {
                  ws.send(JSON.stringify({
                    type: 'pending_notifications',
                    data: unreadNotifications
                  }));
                }
              })
              .catch(error => {
                console.error('Error fetching pending notifications:', error);
              });
          }
        }
        // Typing indicator for messages
        else if (parsed.type === 'typing' && parsed.data && parsed.data.conversationId && userId) {
          const { conversationId, isTyping } = parsed.data;
          
          // Find the conversation
          storage.getOrCreateConversation([userId, parsed.data.recipientId])
            .then(conversation => {
              // Notify the other participants that this user is typing
              conversation.participants
                .filter(pid => pid !== userId)
                .forEach(participantId => {
                  sendToUser(participantId, {
                    type: 'user_typing',
                    data: {
                      conversationId,
                      userId,
                      isTyping,
                      timestamp: Date.now()
                    }
                  });
                });
            })
            .catch(error => {
              console.error('Error handling typing indicator:', error);
            });
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      
      // Remove this connection from the user's connections
      if (userId && clients.has(userId)) {
        const userConnections = clients.get(userId) || [];
        const filteredConnections = userConnections.filter(conn => conn !== ws);
        
        if (filteredConnections.length === 0) {
          clients.delete(userId);
        } else {
          clients.set(userId, filteredConnections);
        }
      }
    });
  });
  
  // Function to send a message to a specific user via all their active connections
  const sendToUser = (userId: string, message: { type: string; data: any }) => {
    const userConnections = clients.get(userId) || [];
    userConnections.forEach(connection => {
      if (connection.readyState === WebSocket.OPEN) {
        connection.send(JSON.stringify(message));
      }
    });
  };
  
  // Broadcast function for sending messages to all clients
  const broadcast = (message: { type: string; data: any }) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  };

  // Users endpoints
  app.post('/api/users', async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(400).json({ error: 'Invalid user data' });
    }
  });

  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/users/wallet/:address', async (req, res) => {
    try {
      const user = await storage.getUserByWalletAddress(req.params.address);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error getting user by wallet address:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Communities endpoints
  app.post('/api/communities', async (req, res) => {
    try {
      const validatedData = insertCommunitySchema.parse(req.body);
      const community = await storage.createCommunity(validatedData);
      res.status(201).json(community);
    } catch (error) {
      console.error('Error creating community:', error);
      res.status(400).json({ error: 'Invalid community data' });
    }
  });

  app.get('/api/communities', async (req, res) => {
    try {
      const communities = await storage.getAllCommunities();
      res.json(communities);
    } catch (error) {
      console.error('Error getting communities:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/communities/:id', async (req, res) => {
    try {
      const community = await storage.getCommunity(parseInt(req.params.id));
      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }
      res.json(community);
    } catch (error) {
      console.error('Error getting community:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/communities/name/:name', async (req, res) => {
    try {
      const community = await storage.getCommunityByName(req.params.name);
      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }
      res.json(community);
    } catch (error) {
      console.error('Error getting community by name:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Posts endpoints
  app.post('/api/posts', async (req, res) => {
    try {
      const validatedData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(400).json({ error: 'Invalid post data' });
    }
  });

  app.get('/api/posts', async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      res.json(posts);
    } catch (error) {
      console.error('Error getting posts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/posts/:id', async (req, res) => {
    try {
      const post = await storage.getPost(parseInt(req.params.id));
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.json(post);
    } catch (error) {
      console.error('Error getting post:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/posts/community/:id', async (req, res) => {
    try {
      const posts = await storage.getPostsByCommunity(parseInt(req.params.id));
      res.json(posts);
    } catch (error) {
      console.error('Error getting posts by community:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/posts/author/:id', async (req, res) => {
    try {
      const posts = await storage.getPostsByAuthor(req.params.id);
      res.json(posts);
    } catch (error) {
      console.error('Error getting posts by author:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Orbis identifiers endpoint
  app.get('/api/orbis/post/:id', async (req, res) => {
    try {
      const post = await storage.getPostByOrbisId(req.params.id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.json(post);
    } catch (error) {
      console.error('Error getting post by Orbis ID:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Search endpoint
  app.get('/api/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.trim().length === 0) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      
      const results = await storage.search(query);
      res.json(results);
    } catch (error) {
      console.error('Error searching:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'web3-reddit'
    });
  });
  
  // WebSocket test endpoint
  app.get('/api/websocket-test', (req, res) => {
    // Count active WebSocket connections
    const activeConnections = wss.clients.size;
    
    // Check if the WebSocket server is running
    const wsStatus = {
      active: true,
      connections: activeConnections,
      path: '/ws',
      serverUrl: `${req.protocol === 'https' ? 'wss' : 'ws'}://${req.headers.host}/ws`
    };
    
    res.status(200).json(wsStatus);
  });

  // Notification endpoints
  app.post('/api/notifications', async (req, res) => {
    try {
      const notification = await storage.createNotification(req.body);
      
      // Send notification directly to the recipient
      if (notification.recipient) {
        sendToUser(notification.recipient, {
          type: 'new_notification',
          data: notification
        });
      }
      
      res.status(201).json(notification);
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(400).json({ error: 'Invalid notification data' });
    }
  });

  app.get('/api/notifications/user/:userId', async (req, res) => {
    try {
      const notifications = await storage.getNotifications(req.params.userId);
      res.json(notifications);
    } catch (error) {
      console.error('Error getting notifications:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/notifications/:id/read', async (req, res) => {
    try {
      const success = await storage.markNotificationAsRead(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/notifications/user/:userId/read-all', async (req, res) => {
    try {
      const success = await storage.markAllNotificationsAsRead(req.params.userId);
      res.json({ success });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/notifications/:id', async (req, res) => {
    try {
      const success = await storage.deleteNotification(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Message endpoints
  app.post('/api/messages', async (req, res) => {
    try {
      const message = await storage.createMessage(req.body);
      
      // Send message directly to the recipient
      if (message.recipient) {
        sendToUser(message.recipient, {
          type: 'new_message',
          data: message
        });
        
        // Also notify sender about successful delivery
        if (message.sender && message.sender !== message.recipient) {
          sendToUser(message.sender, {
            type: 'message_sent',
            data: {
              messageId: message.id,
              timestamp: Date.now(),
              status: 'delivered'
            }
          });
        }
      }
      
      res.status(201).json(message);
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(400).json({ error: 'Invalid message data' });
    }
  });

  app.get('/api/messages/conversation/:conversationId', async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.conversationId);
      res.json(messages);
    } catch (error) {
      console.error('Error getting messages:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/conversations/user/:userId', async (req, res) => {
    try {
      const conversations = await storage.getConversations(req.params.userId);
      res.json(conversations);
    } catch (error) {
      console.error('Error getting conversations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/conversations', async (req, res) => {
    try {
      if (!req.body.userIds || !Array.isArray(req.body.userIds) || req.body.userIds.length < 2) {
        return res.status(400).json({ error: 'Invalid participants data. Need at least 2 user IDs.' });
      }
      
      const conversation = await storage.getOrCreateConversation(req.body.userIds);
      res.status(201).json(conversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
      res.status(400).json({ error: 'Invalid conversation data' });
    }
  });

  app.put('/api/messages/:id/read', async (req, res) => {
    try {
      const success = await storage.markMessageAsRead(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Message not found' });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking message as read:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/conversations/:conversationId/read', async (req, res) => {
    try {
      if (!req.body.userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      const success = await storage.markConversationAsRead(req.params.conversationId, req.body.userId);
      if (!success) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return httpServer;
}
