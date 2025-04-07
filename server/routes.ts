import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertCommunitySchema, insertPostSchema } from "@shared/schema";
import { WebSocketServer } from "ws";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time updates
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws'
  });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      console.log('Received message:', message.toString());
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

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
