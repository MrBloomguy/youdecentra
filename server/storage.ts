import { 
  users, type User, type InsertUser,
  communities, type Community, type InsertCommunity,
  posts, type Post, type InsertPost
} from "@shared/schema";
import { AppConversation, AppMessage, AppNotification } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(address: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Community methods
  getCommunity(id: number): Promise<Community | undefined>;
  getCommunityByName(name: string): Promise<Community | undefined>;
  getAllCommunities(): Promise<Community[]>;
  createCommunity(community: InsertCommunity): Promise<Community>;
  
  // Post methods
  getPost(id: number): Promise<Post | undefined>;
  getPostByOrbisId(orbisPostId: string): Promise<Post | undefined>;
  getAllPosts(): Promise<Post[]>;
  getPostsByCommunity(communityId: number): Promise<Post[]>;
  getPostsByAuthor(authorId: string): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  
  // Notification methods
  createNotification(notification: AppNotification): Promise<AppNotification>;
  getNotifications(userId: string): Promise<AppNotification[]>;
  markNotificationAsRead(notificationId: string): Promise<boolean>;
  markAllNotificationsAsRead(userId: string): Promise<boolean>;
  deleteNotification(notificationId: string): Promise<boolean>;
  
  // Message methods
  createMessage(message: AppMessage): Promise<AppMessage>;
  getMessages(conversationId: string): Promise<AppMessage[]>;
  getConversations(userId: string): Promise<AppConversation[]>;
  getOrCreateConversation(userIds: string[]): Promise<AppConversation>;
  markMessageAsRead(messageId: string): Promise<boolean>;
  markConversationAsRead(conversationId: string, userId: string): Promise<boolean>;
  
  // Search functionality
  search(query: string): Promise<{ users: User[], communities: Community[], posts: Post[] }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private communities: Map<number, Community>;
  private posts: Map<number, Post>;
  private notifications: Map<string, AppNotification>;
  private messages: Map<string, AppMessage>;
  private conversations: Map<string, AppConversation>;
  private userIdCounter: number;
  private communityIdCounter: number;
  private postIdCounter: number;

  constructor() {
    this.users = new Map();
    this.communities = new Map();
    this.posts = new Map();
    this.notifications = new Map();
    this.messages = new Map();
    this.conversations = new Map();
    this.userIdCounter = 1;
    this.communityIdCounter = 1;
    this.postIdCounter = 1;
    
    // Initialize with default communities
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Default communities
    const defaultCommunities: InsertCommunity[] = [
      {
        name: 'web3',
        description: 'Discussions about Web3 technologies',
        avatar: '',
        banner: '',
        createdBy: 'system',
        orbisContext: 'web3',
      },
      {
        name: 'crypto',
        description: 'Cryptocurrency discussions',
        avatar: '',
        banner: '',
        createdBy: 'system',
        orbisContext: 'crypto',
      },
      {
        name: 'nft',
        description: 'NFT discussions and showcases',
        avatar: '',
        banner: '',
        createdBy: 'system',
        orbisContext: 'nft',
      }
    ];
    
    defaultCommunities.forEach(community => {
      this.createCommunity(community);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByWalletAddress(address: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress === address,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt, 
      email: insertUser.email || null,
      avatar: insertUser.avatar || null
    };
    this.users.set(id, user);
    return user;
  }

  // Community methods
  async getCommunity(id: number): Promise<Community | undefined> {
    return this.communities.get(id);
  }

  async getCommunityByName(name: string): Promise<Community | undefined> {
    return Array.from(this.communities.values()).find(
      (community) => community.name === name,
    );
  }

  async getAllCommunities(): Promise<Community[]> {
    return Array.from(this.communities.values());
  }

  async createCommunity(insertCommunity: InsertCommunity): Promise<Community> {
    const id = this.communityIdCounter++;
    const createdAt = new Date();
    const memberCount = 0;
    const community: Community = { 
      ...insertCommunity, 
      id, 
      createdAt, 
      memberCount,
      description: insertCommunity.description || null,
      avatar: insertCommunity.avatar || null,
      banner: insertCommunity.banner || null,
      orbisContext: insertCommunity.orbisContext || null
    };
    this.communities.set(id, community);
    return community;
  }

  // Post methods
  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPostByOrbisId(orbisPostId: string): Promise<Post | undefined> {
    return Array.from(this.posts.values()).find(
      (post) => post.orbisPostId === orbisPostId,
    );
  }

  async getAllPosts(): Promise<Post[]> {
    return Array.from(this.posts.values());
  }

  async getPostsByCommunity(communityId: number): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(
      (post) => post.communityId === communityId,
    );
  }

  async getPostsByAuthor(authorId: string): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(
      (post) => post.authorId === authorId,
    );
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.postIdCounter++;
    const createdAt = new Date();
    const upvotes = 0;
    const downvotes = 0;
    const commentCount = 0;
    
    const post: Post = { 
      ...insertPost, 
      id, 
      createdAt, 
      upvotes, 
      downvotes, 
      commentCount,
      content: insertPost.content || null,
      mediaUrls: insertPost.mediaUrls || null
    };
    
    this.posts.set(id, post);
    return post;
  }

  // Notification methods
  async createNotification(notification: AppNotification): Promise<AppNotification> {
    const id = notification.id || uuidv4();
    const createdAt = notification.createdAt || Date.now();
    const read = notification.read !== undefined ? notification.read : false;
    
    const newNotification: AppNotification = {
      ...notification,
      id,
      createdAt,
      read
    };
    
    this.notifications.set(id, newNotification);
    return newNotification;
  }
  
  async getNotifications(userId: string): Promise<AppNotification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.recipient === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }
  
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    const notification = this.notifications.get(notificationId);
    
    if (!notification) {
      return false;
    }
    
    notification.read = true;
    this.notifications.set(notificationId, notification);
    return true;
  }
  
  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    const userNotifications = Array.from(this.notifications.values())
      .filter(notification => notification.recipient === userId);
    
    if (userNotifications.length === 0) {
      return false;
    }
    
    userNotifications.forEach(notification => {
      notification.read = true;
      this.notifications.set(notification.id, notification);
    });
    
    return true;
  }
  
  async deleteNotification(notificationId: string): Promise<boolean> {
    return this.notifications.delete(notificationId);
  }
  
  // Message methods
  async createMessage(message: AppMessage): Promise<AppMessage> {
    const id = message.id || uuidv4();
    const createdAt = message.createdAt || Date.now();
    const read = message.read !== undefined ? message.read : false;
    
    const newMessage: AppMessage = {
      ...message,
      id,
      createdAt,
      read
    };
    
    this.messages.set(id, newMessage);
    
    // Update the conversation with the last message
    const conversation = this.conversations.get(message.conversationId);
    if (conversation) {
      conversation.lastMessage = newMessage;
      conversation.updatedAt = createdAt;
      if (message.recipient !== message.sender) {
        conversation.unreadCount += 1;
      }
      this.conversations.set(conversation.id, conversation);
    }
    
    return newMessage;
  }
  
  async getMessages(conversationId: string): Promise<AppMessage[]> {
    return Array.from(this.messages.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }
  
  async getConversations(userId: string): Promise<AppConversation[]> {
    return Array.from(this.conversations.values())
      .filter(conversation => conversation.participants.includes(userId))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }
  
  async getOrCreateConversation(userIds: string[]): Promise<AppConversation> {
    // Sort userIds to ensure consistent conversation lookup
    const sortedUserIds = [...userIds].sort();
    
    // Find existing conversation with the same participants
    const existingConversation = Array.from(this.conversations.values()).find(
      conversation => {
        const sortedParticipants = [...conversation.participants].sort();
        return JSON.stringify(sortedParticipants) === JSON.stringify(sortedUserIds);
      }
    );
    
    if (existingConversation) {
      return existingConversation;
    }
    
    // Create a new conversation
    const conversationId = uuidv4();
    const newConversation: AppConversation = {
      id: conversationId,
      participants: sortedUserIds,
      lastMessage: null,
      updatedAt: Date.now(),
      unreadCount: 0
    };
    
    this.conversations.set(conversationId, newConversation);
    return newConversation;
  }
  
  async markMessageAsRead(messageId: string): Promise<boolean> {
    const message = this.messages.get(messageId);
    
    if (!message) {
      return false;
    }
    
    message.read = true;
    this.messages.set(messageId, message);
    return true;
  }
  
  async markConversationAsRead(conversationId: string, userId: string): Promise<boolean> {
    const conversation = this.conversations.get(conversationId);
    
    if (!conversation) {
      return false;
    }
    
    // Mark all messages in the conversation as read for the specified user
    const messages = Array.from(this.messages.values())
      .filter(message => message.conversationId === conversationId && message.recipient === userId);
    
    messages.forEach(message => {
      message.read = true;
      this.messages.set(message.id, message);
    });
    
    // Reset unread count for the conversation
    conversation.unreadCount = 0;
    this.conversations.set(conversationId, conversation);
    
    return true;
  }
  
  // Search functionality
  async search(query: string): Promise<{ users: User[], communities: Community[], posts: Post[] }> {
    const lowerQuery = query.toLowerCase();
    
    // Search users
    const matchedUsers = Array.from(this.users.values()).filter(
      (user) => 
        user.username.toLowerCase().includes(lowerQuery) ||
        user.walletAddress.toLowerCase().includes(lowerQuery)
    );
    
    // Search communities
    const matchedCommunities = Array.from(this.communities.values()).filter(
      (community) => 
        community.name.toLowerCase().includes(lowerQuery) ||
        (community.description && community.description.toLowerCase().includes(lowerQuery))
    );
    
    // Search posts
    const matchedPosts = Array.from(this.posts.values()).filter(
      (post) => 
        post.title.toLowerCase().includes(lowerQuery) ||
        (post.content && post.content.toLowerCase().includes(lowerQuery))
    );
    
    return {
      users: matchedUsers,
      communities: matchedCommunities,
      posts: matchedPosts
    };
  }
}

export const storage = new MemStorage();
