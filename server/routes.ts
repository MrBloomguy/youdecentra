import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertCommunitySchema, insertPostSchema } from "@shared/schema";
import { WebSocketServer, WebSocket } from "ws";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time updates
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws',
    // Allow connections from any origin
    verifyClient: (info: { origin: string; secure: boolean; req: any }) => {
      console.log('WebSocket connection attempt from:', info.origin);
      return true; // Accept all connections
    }
  });

  // Track connected clients
  const clients = new Set();

  wss.on('connection', (ws, req) => {
    console.log(`WebSocket client connected from ${req.socket.remoteAddress}`);
    clients.add(ws);
    
    // Send initial connection message
    ws.send(JSON.stringify({
      type: 'connection_established',
      data: {
        timestamp: new Date().toISOString(),
        message: 'Connected to web3-reddit WebSocket server'
      }
    }));
    
    ws.on('message', (message) => {
      try {
        console.log('Received message:', message.toString());
        const parsed = JSON.parse(message.toString());
        
        // Handle different message types
        if (parsed.type === 'ping') {
          ws.send(JSON.stringify({
            type: 'pong',
            data: { timestamp: new Date().toISOString() }
          }));
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
      clients.delete(ws);
    });
  });
  
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

  return httpServer;
}
