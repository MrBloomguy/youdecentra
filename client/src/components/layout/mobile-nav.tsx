import React from 'react';
import { Link, useLocation } from 'wouter';
import { useUIStore, useAuthStore } from '@/lib/store';
import { usePrivy } from '@privy-io/react-auth';

export default function MobileNav() {
  const [location] = useLocation();
  const { setCreatePostModalOpen, setAuthModalOpen } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const { user } = usePrivy();
  
  const handleProfileClick = () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
  };
  
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex justify-around items-center h-14">
        <Link href="/" className="flex flex-col items-center justify-center py-1">
          <i className={`ri-home-4-${location === '/' ? 'fill' : 'line'} text-xl ${location === '/' ? 'text-primary' : ''}`}></i>
          <span className="text-xs">Explore</span>
        </Link>
        
        <Link href="/discover" className="flex flex-col items-center justify-center py-1">
          <i className={`ri-compass-${location === '/discover' ? 'fill' : 'line'} text-xl ${location === '/discover' ? 'text-primary' : ''}`}></i>
          <span className="text-xs">Discover</span>
        </Link>
        
        <Link href="/leaderboard" className="flex flex-col items-center justify-center py-1">
          <i className={`ri-bar-chart-${location === '/leaderboard' ? 'fill' : 'line'} text-xl ${location === '/leaderboard' ? 'text-primary' : ''}`}></i>
          <span className="text-xs">Leaderboard</span>
        </Link>
        
        <Link href="/messages" className="flex flex-col items-center justify-center py-1">
          <i className={`ri-message-3-${location === '/messages' ? 'fill' : 'line'} text-xl ${location === '/messages' ? 'text-primary' : ''}`}></i>
          <span className="text-xs">Messages</span>
        </Link>
        
        {isAuthenticated && user ? (
          <Link href={`/user/${user.id}`} className="flex flex-col items-center justify-center py-1">
            <i className={`ri-user-${location.startsWith('/user/') ? 'fill' : 'line'} text-xl ${location.startsWith('/user/') ? 'text-primary' : ''}`}></i>
            <span className="text-xs">Profile</span>
          </Link>
        ) : (
          <button 
            onClick={handleProfileClick}
            className="flex flex-col items-center justify-center py-1"
          >
            <i className="ri-user-line text-xl"></i>
            <span className="text-xs">Profile</span>
          </button>
        )}
      </div>
    </nav>
  );
}
