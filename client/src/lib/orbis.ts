import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Orbis } from "@orbisclub/orbis-sdk";
import { OrbisPost, OrbisComment, OrbisProfile, OrbisContext, AppPost, AppCommunity } from "@shared/types";
import { useAuthStore } from "./store";
import { useToast } from "@/hooks/use-toast";
import { formatAddress } from "./utils";

interface OrbisContextType {
  orbis: Orbis | null;
  isConnected: boolean;
  connect: (address: string) => Promise<boolean>;
  disconnect: () => Promise<void>;
  createPost: (title: string, content: string, media: string[], context: string) => Promise<string | null>;
  createComment: (content: string, postId: string, parentId?: string) => Promise<string | null>;
  getPosts: (context?: string, page?: number) => Promise<AppPost[]>;
  getComments: (postId: string) => Promise<OrbisComment[]>;
  getProfile: (did: string) => Promise<OrbisProfile | null>;
  createContext: (name: string, description: string) => Promise<string | null>;
  votePost: (postId: string, type: 'upvote' | 'downvote') => Promise<boolean>;
  getUserPosts: (did: string) => Promise<AppPost[]>;
  getUserVotes: (postIds: string[]) => Promise<Record<string, 'upvote' | 'downvote' | null>>;
  getCredentials: (did: string) => Promise<any[]>;
}

// Create context with default values
const OrbisContext = createContext<OrbisContextType>({
  orbis: null,
  isConnected: false,
  connect: async () => false,
  disconnect: async () => {},
  createPost: async () => null,
  createComment: async () => null,
  getPosts: async () => [],
  getComments: async () => [],
  getProfile: async () => null,
  createContext: async () => null,
  votePost: async () => false,
  getUserPosts: async () => [],
  getUserVotes: async () => ({}),
});

export const OrbisContextProvider = ({ children }: { children: ReactNode }) => {
  const [orbis, setOrbis] = useState<Orbis | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuthStore();
  const { toast } = useToast();

  // Initialize Orbis on component mount
  useEffect(() => {
    const orbisInstance = new Orbis({
      PINATA_API_KEY: import.meta.env.VITE_PINATA_API_KEY || "381adc182d6baea2d2ed",
      PINATA_SECRET_API_KEY: import.meta.env.VITE_PINATA_SECRET_KEY || "c6ed142b8482529dc365069c06382605b82be0255d913eb2285a6d0a94e9f442",
    });
    setOrbis(orbisInstance);
  }, []);

  // Connect to Orbis with wallet address
  const connect = async (address: string): Promise<boolean> => {
    if (!orbis) return false;

    try {
      const res = await orbis.connect_v2({
        provider: window.ethereum,
        chain: "ethereum",
        lit: false,
      });

      setIsConnected(res.status === 200);
      return res.status === 200;
    } catch (error) {
      console.error("Failed to connect to Orbis:", error);
      return false;
    }
  };

  // Disconnect from Orbis
  const disconnect = async (): Promise<void> => {
    if (!orbis) return;

    try {
      await orbis.logout();
      setIsConnected(false);
    } catch (error) {
      console.error("Failed to disconnect from Orbis:", error);
    }
  };

  // Create a new post
  const createPost = async (
    title: string, 
    content: string, 
    media: string[] = [], 
    context: string
  ): Promise<string | null> => {
    if (!orbis || !isConnected) {
      toast({
        title: "Not connected",
        description: "Please connect your wallet to create a post",
        variant: "destructive",
      });
      return null;
    }

    try {
      const res = await orbis.createPost({
        title,
        body: content,
        context,
        media: media.length > 0 ? media : undefined,
      });

      if (res.status === 200) {
        return res.doc;
      } else {
        toast({
          title: "Error creating post",
          description: res.error || "Something went wrong",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      toast({
        title: "Failed to create post",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    }
  };

  // Create a new comment
  const createComment = async (
    content: string, 
    postId: string,
    parentId?: string
  ): Promise<string | null> => {
    if (!orbis || !isConnected) {
      toast({
        title: "Not connected",
        description: "Please connect your wallet to comment",
        variant: "destructive",
      });
      return null;
    }

    try {
      const res = await orbis.createPost({
        body: content,
        master: postId,
        reply_to: parentId,
      });

      if (res.status === 200) {
        return res.doc;
      } else {
        toast({
          title: "Error creating comment",
          description: res.error || "Something went wrong",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error("Failed to create comment:", error);
      toast({
        title: "Failed to create comment",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    }
  };

  // Get posts for a specific context
  const getPosts = async (context?: string, page: number = 0): Promise<AppPost[]> => {
    if (!orbis) return [];

    try {
      // Add a timeout to the fetch operation.  This is a mock, Orbis SDK likely doesn't directly support timeouts.
      const timeout = 30000; // Increased timeout to 30 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const options: any = {
        only_master: true,
        signal: controller.signal, // Add signal to orbis.getPosts if supported
      };

      if (context) {
        options.context = context;
      }

      const data = await orbis.getPosts(options, page);
      clearTimeout(timeoutId);

      // Transform Orbis posts to app posts
      const transformedPosts = data.map((post: OrbisPost) => {
        return {
          id: post.stream_id,
          title: post.content.title || 'Untitled Post',
          content: post.content.body || '',
          community: {
            id: post.content.context || "default",
            name: post.content.context ? post.content.context.split(':')[2] || 'unknown' : "web3",
            avatar: "",
          },
          author: {
            id: post.creator,
            name: formatAddress(post.creator),
            avatar: "",
          },
          createdAt: post.content.timestamp,
          upvotes: post.count_likes,
          downvotes: post.count_downvotes,
          commentCount: post.count_replies,
          mediaUrls: post.content.media || [],
        };
      });

      // Cache the transformed posts in localStorage for fallback
      localStorage.setItem('cached_posts', JSON.stringify(transformedPosts));

      return transformedPosts;
    } catch (error) {
      console.error("Failed to fetch posts:", error);

      // Fall back to local storage cache if available
      const cachedPosts = localStorage.getItem('cached_posts');
      if (cachedPosts) {
        console.log("Using cached posts data due to fetch error");
        return JSON.parse(cachedPosts);
      }

      return [];
    }
  };

  // Get comments for a specific post
  const getComments = async (postId: string): Promise<OrbisComment[]> => {
    if (!orbis) return [];

    const cacheKey = `post_comments_${postId}`;

    try {
      const timeout = 30000; // Increased timeout to 30 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const data = await orbis.getPosts({ master: postId, signal: controller.signal }); // Add signal if supported
      clearTimeout(timeoutId);

      // Cache the comments in localStorage for fallback
      localStorage.setItem(cacheKey, JSON.stringify(data));

      return data;
    } catch (error) {
      console.error("Failed to fetch comments:", error);

      // Fall back to local storage cache if available
      const cachedComments = localStorage.getItem(cacheKey);
      if (cachedComments) {
        console.log("Using cached comments data due to fetch error");
        return JSON.parse(cachedComments);
      }

      return [];
    }
  };

  // Get a user's profile
  const getProfile = async (did: string): Promise<OrbisProfile | null> => {
    if (!orbis) return null;

    const cacheKey = `user_profile_${did}`;

    try {
      // First try to get cached data
      const cachedProfile = localStorage.getItem(cacheKey);
      let profile = cachedProfile ? JSON.parse(cachedProfile) : null;

      const timeout = 30000; // Increased timeout to 30 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const data = await orbis.getProfile(did, { signal: controller.signal }); // Add signal if supported
      clearTimeout(timeoutId);

      if (!data) {
        console.error("Error fetching profile:", "No data received");
        if (profile) {
          return profile; // Return cached data if fresh fetch failed
        }
        // Create minimal profile if no cached data
        return {
          did: did,
          details: {
            profile: {
              username: undefined,
              description: undefined,
              pfp: undefined
            }
          }
        };
      }

      // Cache the new profile data
      profile = data;
      localStorage.setItem(cacheKey, JSON.stringify(profile));

      return profile;
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      // Return cached data if available, otherwise create minimal profile
      const cachedProfile = localStorage.getItem(cacheKey);
      if (cachedProfile) {
        return JSON.parse(cachedProfile);
      }
      return {
        did: did,
        details: {
          profile: {
            username: undefined,
            description: undefined,
            pfp: undefined
          }
        }
      };
    }
  };

  // Create a new context (community)
  const createContext = async (name: string, description: string): Promise<string | null> => {
    if (!orbis || !isConnected) {
      toast({
        title: "Not connected",
        description: "Please connect your wallet to create a community",
        variant: "destructive",
      });
      return null;
    }

    try {
      const res = await orbis.createContext({
        name,
        description,
      });

      if (res.status === 200) {
        return res.doc;
      } else {
        toast({
          title: "Error creating community",
          description: res.error || "Something went wrong",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error("Failed to create context:", error);
      toast({
        title: "Failed to create community",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    }
  };

  // Vote on a post
  const votePost = async (postId: string, type: 'upvote' | 'downvote'): Promise<boolean> => {
    if (!orbis || !isConnected) {
      toast({
        title: "Not connected",
        description: "Please connect your wallet to vote",
        variant: "destructive",
      });
      return false;
    }

    try {
      const reaction = type === 'upvote' ? 'like' : 'downvote';
      const res = await orbis.react(postId, reaction);

      if (res.status === 200) {
        return true;
      } else {
        toast({
          title: "Error voting",
          description: res.error || "Something went wrong",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Failed to vote:", error);
      toast({
        title: "Failed to vote",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  // Get a user's posts
  const getUserPosts = async (did: string): Promise<AppPost[]> => {
    if (!orbis) return [];

    const cacheKey = `user_posts_${did}`;

    try {
      const timeout = 30000; // Increased timeout to 30 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const data = await orbis.getPosts({ did, only_master: true, signal: controller.signal }); // Add signal if supported
      clearTimeout(timeoutId);


      // Transform Orbis posts to app posts
      const transformedPosts = data.map((post: OrbisPost) => {
        return {
          id: post.stream_id,
          title: post.content.title || 'Untitled Post',
          content: post.content.body || '',
          community: {
            id: post.content.context || "default",
            name: post.content.context ? post.content.context.split(':')[2] || 'unknown' : "web3",
            avatar: "",
          },
          author: {
            id: post.creator,
            name: formatAddress(post.creator),
            avatar: "",
          },
          createdAt: post.content.timestamp,
          upvotes: post.count_likes,
          downvotes: post.count_downvotes,
          commentCount: post.count_replies,
          mediaUrls: post.content.media || [],
        };
      });

      // Cache the transformed posts in localStorage for fallback
      localStorage.setItem(cacheKey, JSON.stringify(transformedPosts));

      return transformedPosts;
    } catch (error) {
      console.error("Failed to fetch user posts:", error);

      // Fall back to local storage cache if available
      const cachedPosts = localStorage.getItem(cacheKey);
      if (cachedPosts) {
        console.log("Using cached user posts data due to fetch error");
        return JSON.parse(cachedPosts);
      }

      return [];
    }
  };

  // Get a user's votes on posts
  const getUserVotes = async (postIds: string[]): Promise<Record<string, 'upvote' | 'downvote' | null>> => {
    if (!orbis || !isConnected || !user) {
      return {};
    }

    try {
      const result: Record<string, 'upvote' | 'downvote' | null> = {};

      for (const postId of postIds) {
        const { data } = await orbis.getReaction(postId, user.id);

        if (data) {
          result[postId] = data.type === 'like' ? 'upvote' : 'downvote';
        } else {
          result[postId] = null;
        }
      }

      return result;
    } catch (error) {
      console.error("Failed to fetch user votes:", error);
      return {};
    }
  };

  // Using formatAddress from utils

  const getCredentials = async (did: string): Promise<any[]> => {
    if (!orbis) return [];

    try {
      const { data, error } = await orbis.getCredentials(did);

      if (error) {
        console.error("Error fetching credentials:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Failed to fetch credentials:", error);
      return [];
    }
  };

  const value = {
    orbis,
    isConnected,
    connect,
    disconnect,
    createPost,
    createComment,
    getPosts,
    getComments,
    getProfile,
    createContext,
    votePost,
    getUserPosts,
    getUserVotes,
    getCredentials,
  };

  return React.createElement(OrbisContext.Provider, { value }, children);
};

export const useOrbis = () => useContext(OrbisContext);