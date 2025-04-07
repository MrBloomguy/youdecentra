import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppUser, AppCommunity, AppPost } from '@shared/types';

// Theme Store
interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: localStorage.getItem('darkMode') === 'true',
      toggleTheme: () => set(state => {
        const newDarkMode = !state.isDarkMode;
        document.documentElement.classList.toggle('dark', newDarkMode);
        return { isDarkMode: newDarkMode };
      }),
    }),
    {
      name: 'theme-storage',
    }
  )
);

// Auth Store
interface AuthState {
  isAuthenticated: boolean;
  user: AppUser | null;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setUser: (user: AppUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
      setUser: (user: AppUser | null) => set({ user }),
      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Community Store
interface CommunityState {
  communities: AppCommunity[];
  selectedCommunity: AppCommunity | null;
  setCommunities: (communities: AppCommunity[]) => void;
  addCommunity: (community: AppCommunity) => void;
  setSelectedCommunity: (community: AppCommunity | null) => void;
  initializeCommunities: () => void;
}

export const useCommunityStore = create<CommunityState>()((set) => ({
  communities: [],
  selectedCommunity: null,
  setCommunities: (communities: AppCommunity[]) => set({ communities }),
  addCommunity: (community: AppCommunity) => 
    set(state => ({ communities: [...state.communities, community] })),
  setSelectedCommunity: (community: AppCommunity | null) => 
    set({ selectedCommunity: community }),
  initializeCommunities: () => set({
    communities: [
      {
        id: 1,
        name: 'web3',
        description: 'Discussions about Web3 technologies',
        avatar: '',
        banner: '',
        createdBy: 'system',
        orbisContext: 'web3',
        memberCount: 10200
      },
      {
        id: 2,
        name: 'crypto',
        description: 'Cryptocurrency discussions',
        avatar: '',
        banner: '',
        createdBy: 'system',
        orbisContext: 'crypto',
        memberCount: 8540
      },
      {
        id: 3,
        name: 'nft',
        description: 'NFT discussions and showcases',
        avatar: '',
        banner: '',
        createdBy: 'system',
        orbisContext: 'nft',
        memberCount: 6320
      }
    ]
  })
}));

// Post Store
interface PostState {
  posts: AppPost[];
  selectedPost: AppPost | null;
  setPosts: (posts: AppPost[]) => void;
  addPost: (post: AppPost) => void;
  setSelectedPost: (post: AppPost | null) => void;
  updatePostVote: (postId: string, voteType: 'up' | 'down' | null, previousVote: 'up' | 'down' | null) => void;
}

export const usePostStore = create<PostState>()((set) => ({
  posts: [],
  selectedPost: null,
  setPosts: (posts: AppPost[]) => set({ posts }),
  addPost: (post: AppPost) => 
    set(state => ({ posts: [post, ...state.posts] })),
  setSelectedPost: (post: AppPost | null) => 
    set({ selectedPost: post }),
  updatePostVote: (postId: string, voteType: 'up' | 'down' | null, previousVote: 'up' | 'down' | null) => 
    set(state => {
      const posts = [...state.posts];
      const postIndex = posts.findIndex(p => p.id === postId);
      
      if (postIndex !== -1) {
        // Remove previous vote if it exists
        if (previousVote === 'up') {
          posts[postIndex].upvotes -= 1;
        } else if (previousVote === 'down') {
          posts[postIndex].downvotes -= 1;
        }
        
        // Add new vote if it exists
        if (voteType === 'up') {
          posts[postIndex].upvotes += 1;
        } else if (voteType === 'down') {
          posts[postIndex].downvotes += 1;
        }
        
        // Update user vote status
        posts[postIndex].userVote = voteType;
      }
      
      // Also update selectedPost if it matches the updated post
      let selectedPost = state.selectedPost;
      if (selectedPost && selectedPost.id === postId) {
        // Remove previous vote if it exists
        if (previousVote === 'up') {
          selectedPost.upvotes -= 1;
        } else if (previousVote === 'down') {
          selectedPost.downvotes -= 1;
        }
        
        // Add new vote if it exists
        if (voteType === 'up') {
          selectedPost.upvotes += 1;
        } else if (voteType === 'down') {
          selectedPost.downvotes += 1;
        }
        
        // Update user vote status
        selectedPost.userVote = voteType;
      }
      
      return { posts, selectedPost };
    })
}));

// UI Store for modals
interface UIState {
  isAuthModalOpen: boolean;
  isCreatePostModalOpen: boolean;
  isCreateCommunityModalOpen: boolean;
  setAuthModalOpen: (isOpen: boolean) => void;
  setCreatePostModalOpen: (isOpen: boolean) => void;
  setCreateCommunityModalOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isAuthModalOpen: false,
  isCreatePostModalOpen: false,
  isCreateCommunityModalOpen: false,
  setAuthModalOpen: (isOpen: boolean) => set({ isAuthModalOpen: isOpen }),
  setCreatePostModalOpen: (isOpen: boolean) => set({ isCreatePostModalOpen: isOpen }),
  setCreateCommunityModalOpen: (isOpen: boolean) => set({ isCreateCommunityModalOpen: isOpen }),
}));
