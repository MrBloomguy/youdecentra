import React, { useEffect } from 'react';
import Navbar from '@/components/layout/navbar';
import MobileNav from '@/components/layout/mobile-nav';
import CommunitySidebar from '@/components/layout/community-sidebar';
import InfoSidebar from '@/components/layout/info-sidebar';
import Feed from '@/components/home/feed';
import AuthModal from '@/components/modals/auth-modal';
import CreatePostModal from '@/components/modals/create-post-modal';
import CreateCommunityModal from '@/components/modals/create-community-modal';
import { useOrbis } from '@/lib/orbis';
import { useAuthStore } from '@/lib/store';

interface HomeProps {
  isDiscoverPage?: boolean;
}

export default function Home({ isDiscoverPage = false }: HomeProps) {
  const { connect } = useOrbis();
  const { isAuthenticated, user } = useAuthStore();
  
  // Connect to Orbis when the user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && user.walletAddress) {
      connect(user.walletAddress);
    }
  }, [isAuthenticated, user, connect]);
  
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
                {['Gaming', 'Technology', 'Art', 'Music', 'Science', 'Web3'].map((category) => (
                  <div key={category} className="bg-gray-100 dark:bg-gray-800 rounded-md p-3 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition">
                    <p className="font-medium">{category}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Trending now</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md p-4 border border-reddit-light-border dark:border-reddit-dark-border">
              <h2 className="text-xl font-bold mb-3">Popular Communities</h2>
              <div className="space-y-3">
                {['Web3', 'NFTs', 'DeFi', 'DAOs', 'Cryptocurrency'].map((community) => (
                  <div key={community} className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold mr-3">
                      {community.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{community}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Active community</p>
                    </div>
                  </div>
                ))}
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
