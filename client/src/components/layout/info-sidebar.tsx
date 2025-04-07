import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useCommunityStore, useUIStore } from '@/lib/store';
import { getCommunityColor, getCommunityInitial } from '@/lib/utils';

export default function InfoSidebar() {
  const [location] = useLocation();
  const { communities } = useCommunityStore();
  const { setCreatePostModalOpen, setCreateCommunityModalOpen } = useUIStore();
  
  // Get just a few communities for the popular section
  const popularCommunities = communities.slice(0, 3);
  
  return (
    <aside className="hidden lg:block lg:col-span-1 space-y-4">
      {/* Current Community */}
      <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md overflow-hidden border border-reddit-light-border dark:border-reddit-dark-border">
        <div className="h-16 bg-gradient-to-r from-blue-400 to-purple-500"></div>
        <div className="p-4">
          <h2 className="font-bold text-base">Home</h2>
          <p className="text-sm mt-2 mb-4">Your personalized RedditWeb3 homepage. Come here to check in with your favorite communities.</p>
          <Button 
            onClick={() => setCreatePostModalOpen(true)}
            className="w-full bg-reddit-orange hover:bg-orange-600 text-white font-semibold py-1.5 px-4 rounded-full text-sm mb-2"
          >
            Create Post
          </Button>
          <Button 
            onClick={() => setCreateCommunityModalOpen(true)}
            variant="outline"
            className="w-full border border-reddit-blue text-reddit-blue hover:bg-blue-50 dark:hover:bg-gray-800 font-semibold py-1.5 px-4 rounded-full text-sm"
          >
            Create Community
          </Button>
        </div>
      </div>

      {/* Premium Promo */}
      <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md p-4 border border-reddit-light-border dark:border-reddit-dark-border">
        <div className="flex items-start">
          <i className="ri-vip-crown-2-fill text-yellow-500 text-xl mr-2"></i>
          <div>
            <h3 className="font-semibold text-sm">RedditWeb3 Premium</h3>
            <p className="text-xs mt-1 mb-3">The best RedditWeb3 experience, with monthly tokens</p>
            <Button 
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1.5 px-4 rounded-full text-xs"
            >
              Try Now
            </Button>
          </div>
        </div>
      </div>

      {/* Popular Communities */}
      <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md p-4 border border-reddit-light-border dark:border-reddit-dark-border">
        <h3 className="font-semibold mb-3">Popular Communities</h3>
        <ul className="space-y-2">
          {popularCommunities.map((community) => (
            <li key={community.id}>
              <Link 
                href={`/w/${community.name}`} 
                className="flex items-center justify-between py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-1"
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full overflow-hidden ${getCommunityColor(community.name)} mr-2 flex-shrink-0`}>
                    <span className="text-white text-xs font-bold flex items-center justify-center h-full">
                      {getCommunityInitial(community.name)}
                    </span>
                  </div>
                  <span className="font-medium text-sm">w/{community.name}</span>
                </div>
                <Button 
                  size="sm"
                  className="text-xs bg-reddit-blue hover:bg-blue-600 text-white px-3 py-0.5 rounded-full"
                >
                  Join
                </Button>
              </Link>
            </li>
          ))}
        </ul>
        <Button
          variant="ghost" 
          className="mt-3 w-full text-reddit-blue hover:bg-gray-100 dark:hover:bg-gray-800 text-sm py-1 rounded font-medium"
        >
          See More Communities
        </Button>
      </div>

      {/* Footer Links */}
      <div className="p-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex flex-wrap gap-x-2 gap-y-1 mb-2">
          <Link href="/help" className="hover:underline">Help</Link>
          <Link href="/about" className="hover:underline">About</Link>
          <Link href="/terms" className="hover:underline">Terms</Link>
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
        </div>
        <p>© 2023 RedditWeb3, Inc. All rights reserved</p>
      </div>
    </aside>
  );
}
