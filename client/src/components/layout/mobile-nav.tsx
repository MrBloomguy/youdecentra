import React from 'react';
import { Link, useLocation } from 'wouter';
import { useUIStore } from '@/lib/store';

export default function MobileNav() {
  const [location] = useLocation();
  const { setCreatePostModalOpen } = useUIStore();
  
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-reddit-light-brighter dark:bg-reddit-dark-brighter border-t border-reddit-light-border dark:border-reddit-dark-border z-50">
      <div className="flex justify-around items-center h-12">
        <Link href="/" className="flex flex-col items-center justify-center py-1">
          <i className={`ri-home-4-${location === '/' ? 'fill' : 'line'} text-xl ${location === '/' ? 'text-reddit-orange' : ''}`}></i>
          <span className="text-xs">Home</span>
        </Link>
        
        <Link href="/discover" className="flex flex-col items-center justify-center py-1">
          <i className={`ri-compass-${location === '/discover' ? 'fill' : 'line'} text-xl ${location === '/discover' ? 'text-reddit-orange' : ''}`}></i>
          <span className="text-xs">Discover</span>
        </Link>
        
        <button 
          onClick={() => setCreatePostModalOpen(true)}
          className="flex flex-col items-center justify-center py-1"
        >
          <i className="ri-add-circle-line text-xl text-reddit-orange"></i>
          <span className="text-xs">Create</span>
        </button>
        
        <Link href="/chat" className="flex flex-col items-center justify-center py-1">
          <i className={`ri-chat-3-${location === '/chat' ? 'fill' : 'line'} text-xl ${location === '/chat' ? 'text-reddit-orange' : ''}`}></i>
          <span className="text-xs">Chat</span>
        </Link>
        
        <Link href="/notifications" className="flex flex-col items-center justify-center py-1">
          <i className={`ri-notification-3-${location === '/notifications' ? 'fill' : 'line'} text-xl ${location === '/notifications' ? 'text-reddit-orange' : ''}`}></i>
          <span className="text-xs">Alerts</span>
        </Link>
      </div>
    </nav>
  );
}
