import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import MobileNav from '@/components/layout/mobile-nav';
import CommunitySidebar from '@/components/layout/community-sidebar';
import InfoSidebar from '@/components/layout/info-sidebar';
import Feed from '@/components/home/feed';
import AuthModal from '@/components/modals/auth-modal';
import CreatePostModal from '@/components/modals/create-post-modal';
import CreateCommunityModal from '@/components/modals/create-community-modal';
import { useOrbis } from '@/lib/orbis';
import { useAuthStore, useCommunityStore } from '@/lib/store';
import { useIsMobile } from '@/hooks/use-mobile';
import { AppCommunity } from '@shared/types';

// Topic categories for the Discover page
const TOPIC_CATEGORIES = [
  { name: 'Gaming', icon: 'gamepad-line' },
  { name: 'Technology', icon: 'computer-line' },
  { name: 'Art', icon: 'palette-line' },
  { name: 'Music', icon: 'music-2-line' },
  { name: 'Science', icon: 'flask-line' },
  { name: 'Web3', icon: 'global-line' }
];

interface HomeProps {
  isDiscoverPage?: boolean;
}

export default function Home({ isDiscoverPage = false }: HomeProps) {
  const { connect } = useOrbis();
  const { isAuthenticated, user } = useAuthStore();
  const { communities } = useCommunityStore();
  const [isLoading, setIsLoading] = useState(true);
  const [popularCommunities, setPopularCommunities] = useState<AppCommunity[]>([]);
  const isMobile = useIsMobile();
  
  // Connect to Orbis when the user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && user.walletAddress) {
      connect(user.walletAddress);
    }
  }, [isAuthenticated, user, connect]);
  
  // Load popular communities for the Discover page
  useEffect(() => {
    if (isDiscoverPage) {
      setIsLoading(true);
      // Sort communities by member count to get the most popular ones
      const sorted = [...communities].sort((a, b) => b.memberCount - a.memberCount);
      // Take top 5 communities for the popular section
      setPopularCommunities(sorted.slice(0, 5));
      setIsLoading(false);
    }
  }, [isDiscoverPage, communities]);
  
  return (
    <>
      <main className="container mx-auto px-2 md:px-4 py-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-16 md:pb-4">
        <CommunitySidebar />
        {isDiscoverPage ? (
          <div className="col-span-1 md:col-span-2 lg:col-span-2 space-y-4">
            <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md p-4 border border-reddit-light-border dark:border-reddit-dark-border">
              <h1 className="text-2xl font-bold mb-2">Discover</h1>
              <p className="text-gray-600 dark:text-gray-300">Explore trending communities and topics</p>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {TOPIC_CATEGORIES.map((category) => (
                  <div key={category.name} className="bg-gray-100 dark:bg-gray-800 rounded-md p-3 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition item-hover-effect">
                    <div className="flex items-center mb-2">
                      <i className={`ri-${category.icon} text-lg text-primary mr-2`}></i>
                      <p className="font-medium">{category.name}</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Trending now</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md p-4 border border-reddit-light-border dark:border-reddit-dark-border">
              <h2 className="text-xl font-bold mb-3">Popular Communities</h2>
              {isLoading ? (
                // Skeleton loader for communities
                <div className="space-y-3">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex items-center p-2 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 mr-3"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : popularCommunities.length > 0 ? (
                <div className="space-y-3">
                  {popularCommunities.map((community) => (
                    <Link key={community.id} href={`/community/${community.id}`}>
                      <div className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer">
                        {community.avatar ? (
                          <img src={community.avatar} alt={community.name} className="w-10 h-10 rounded-full mr-3 object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-black font-bold mr-3">
                            {community.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{community.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{community.memberCount.toLocaleString()} members</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No communities found.</p>
              )}
              
              <div className="mt-4">
                <button 
                  onClick={() => document.dispatchEvent(new CustomEvent('open-create-community-modal'))}
                  className="w-full py-2 bg-primary text-black font-medium rounded-md hover:opacity-90 transition"
                >
                  Create a Community
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Feed />
        )}
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
