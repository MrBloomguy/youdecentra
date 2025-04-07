import { 
  users, type User, type InsertUser,
  communities, type Community, type InsertCommunity,
  posts, type Post, type InsertPost
} from "@shared/schema";

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
  
  // Search functionality
  search(query: string): Promise<{ users: User[], communities: Community[], posts: Post[] }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private communities: Map<number, Community>;
  private posts: Map<number, Post>;
  private userIdCounter: number;
  private communityIdCounter: number;
  private postIdCounter: number;

  constructor() {
    this.users = new Map();
    this.communities = new Map();
    this.posts = new Map();
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
    const user: User = { ...insertUser, id, createdAt };
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
    const community: Community = { ...insertCommunity, id, createdAt, memberCount };
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
      commentCount 
    };
    
    this.posts.set(id, post);
    return post;
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
