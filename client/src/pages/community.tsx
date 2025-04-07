import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import Navbar from '@/components/layout/navbar';
import MobileNav from '@/components/layout/mobile-nav';
import CommunitySidebar from '@/components/layout/community-sidebar';
import InfoSidebar from '@/components/layout/info-sidebar';
import Feed from '@/components/home/feed';
import PostCard from '@/components/home/post-card';
import AuthModal from '@/components/modals/auth-modal';
import CreatePostModal from '@/components/modals/create-post-modal';
import CreateCommunityModal from '@/components/modals/create-community-modal';
import { Button } from '@/components/ui/button';
import { useOrbis } from '@/lib/orbis';
import { useCommunityStore, useAuthStore } from '@/lib/store';
import { getCommunityColor, formatTimeAgo } from '@/lib/utils';
import { AppPost } from '@shared/types';

export default function Community() {
  const [, params] = useRoute<{ id: string }>('/community/:id');
  const communityName = params?.id || '';
  const { communities } = useCommunityStore();
  const { getPosts } = useOrbis();
  const { isAuthenticated } = useAuthStore();
  
  const [community, setCommunity] = useState(communities.find(c => c.name === communityName));
  const [posts, setPosts] = useState<AppPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Set community when communities or communityName changes
  useEffect(() => {
    setCommunity(communities.find(c => c.name === communityName));
  }, [communities, communityName]);
  
  // Fetch posts for this community
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      
      if (community) {
        try {
          const fetchedPosts = await getPosts(community.orbisContext || community.name);
          setPosts(fetchedPosts);
        } catch (error) {
          console.error('Error fetching community posts:', error);
        }
      }
      
      setIsLoading(false);
    };
    
    fetchPosts();
  }, [community, getPosts]);
  
  if (!community) {
    return (
      <>
        <main className="container mx-auto px-2 md:px-4 py-4">
          <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md p-6 text-center border border-reddit-light-border dark:border-reddit-dark-border">
            <h2 className="text-xl font-semibold mb-2">Community Not Found</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">The community {communityName} doesn't exist or isn't available.</p>
            <Button className="bg-reddit-orange hover:bg-orange-600 text-white">
              Create this Community
            </Button>
          </div>
        </main>
        <MobileNav />
      </>
    );
  }
  
  return (
    <>
      
      {/* Community header/banner */}
      <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter border-b border-reddit-light-border dark:border-reddit-dark-border">
        {community.banner ? (
          <div 
            className="h-20 md:h-32 bg-cover bg-center" 
            style={{ backgroundImage: `url(${community.banner})` }}
          ></div>
        ) : (
          <div className="h-20 md:h-32 bg-gradient-to-r from-blue-400 to-purple-500"></div>
        )}
        
        <div className="container mx-auto px-4 py-2 flex items-center">
          <div className={`w-16 h-16 rounded-full ${getCommunityColor(community.name)} -mt-8 border-4 border-reddit-light-brighter dark:border-reddit-dark-brighter flex items-center justify-center`}>
            {community.avatar ? (
              <img src={community.avatar} alt={community.name} className="w-full h-full rounded-full" />
            ) : (
              <span className="text-white text-2xl font-bold">{community.name.charAt(0).toLowerCase()}</span>
            )}
          </div>
          
          <div className="ml-4">
            <h1 className="text-xl font-bold">{community.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{community.memberCount} members</p>
          </div>
          
          <Button className="ml-auto bg-reddit-blue hover:bg-blue-600 text-white">
            Join
          </Button>
        </div>
      </div>
      
      <main className="container mx-auto px-2 md:px-4 py-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-16 md:pb-4">
        <CommunitySidebar />
        
        <div className="col-span-1 md:col-span-2 lg:col-span-2 space-y-4">
          {/* Community description */}
          <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md p-4 border border-reddit-light-border dark:border-reddit-dark-border">
            <h2 className="font-semibold mb-2">About {community.name}</h2>
            <p className="text-sm mb-2">{community.description || `Welcome to the ${community.name} community!`}</p>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <i className="ri-calendar-line mr-1"></i>
              <span>Created {formatTimeAgo(Date.now() - 1000 * 60 * 60 * 24 * 30)}</span>
            </div>
          </div>
          
          {/* Create Post Area */}
          <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md p-2 flex items-center border border-reddit-light-border dark:border-reddit-dark-border">
            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center mr-2">
              <i className="ri-user-3-line text-gray-600 dark:text-gray-400"></i>
            </div>
            <input 
              type="text" 
              placeholder={`Create a post in ${community.name}`}
              className="bg-gray-100 dark:bg-gray-800 rounded-md py-2 px-4 text-sm flex-grow focus:outline-none focus:ring-1 focus:ring-reddit-blue"
              readOnly
              onClick={() => {
                document.dispatchEvent(new CustomEvent('open-create-post-modal', {
                  detail: { communityName: community.name }
                }));
              }}
            />
          </div>
          
          {/* Posts List */}
          <div className="space-y-4">
            {isLoading ? (
              // Skeleton loaders for posts
              Array(3).fill(0).map((_, index) => (
                <div key={index} className="post-card bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md border border-reddit-light-border dark:border-reddit-dark-border overflow-hidden p-4">
                  <div className="animate-pulse flex">
                    <div className="w-10 md:w-12 bg-gray-200 dark:bg-gray-700 h-24"></div>
                    <div className="flex-grow ml-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md p-6 text-center border border-reddit-light-border dark:border-reddit-dark-border">
                <p className="text-lg font-semibold mb-2">No posts yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Be the first to create a post in {community.name}!</p>
                <Button 
                  className="bg-reddit-orange hover:bg-orange-600 text-white font-semibold py-1.5 px-4 rounded-full text-sm"
                  onClick={() => {
                    document.dispatchEvent(new CustomEvent('open-create-post-modal', {
                      detail: { communityName: community.name }
                    }));
                  }}
                >
                  Create Post
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <InfoSidebar />
      </main>
      
      <MobileNav />
      
      {/* Modals */}
      <AuthModal />
      <CreatePostModal />
      <CreateCommunityModal />
    </>
  );
}
