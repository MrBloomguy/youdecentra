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
        <Link href="/" className="flex items-center justify-center p-2" aria-label="Explore">
          <i className={`ri-home-4-${location === '/' ? 'fill' : 'line'} text-2xl ${location === '/' ? 'text-primary' : ''} icon-interaction`}></i>
        </Link>
        
        <Link href="/discover" className="flex items-center justify-center p-2" aria-label="Discover">
          <i className={`ri-compass-${location === '/discover' ? 'fill' : 'line'} text-2xl ${location === '/discover' ? 'text-primary' : ''} icon-interaction`}></i>
        </Link>
        
        <Link href="/leaderboard" className="flex items-center justify-center p-2" aria-label="Leaderboard">
          <i className={`ri-bar-chart-${location === '/leaderboard' ? 'fill' : 'line'} text-2xl ${location === '/leaderboard' ? 'text-primary' : ''} icon-interaction`}></i>
        </Link>
        
        <Link href="/messages" className="flex items-center justify-center p-2" aria-label="Messages">
          <i className={`ri-message-3-${location === '/messages' ? 'fill' : 'line'} text-2xl ${location === '/messages' ? 'text-primary' : ''} icon-interaction`}></i>
        </Link>
        
        {isAuthenticated && user ? (
          <Link href={`/user/${user.id}`} className="flex items-center justify-center p-2" aria-label="Profile">
            <i className={`ri-user-${location.startsWith('/user/') ? 'fill' : 'line'} text-2xl ${location.startsWith('/user/') ? 'text-primary' : ''} icon-interaction`}></i>
          </Link>
        ) : (
          <button 
            onClick={handleProfileClick}
            className="flex items-center justify-center p-2"
            aria-label="Login to access your profile"
          >
            <i className="ri-user-line text-2xl icon-interaction"></i>
          </button>
        )}
      </div>
    </nav>
  );
}
