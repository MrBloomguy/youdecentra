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

export default function Home() {
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
        <Feed />
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
