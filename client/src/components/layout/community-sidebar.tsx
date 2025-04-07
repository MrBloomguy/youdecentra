import React from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCommunityStore, useUIStore } from '@/lib/store';
import { getCommunityColor, getCommunityInitial } from '@/lib/utils';

export default function CommunitySidebar() {
  const { communities } = useCommunityStore();
  const { setCreateCommunityModalOpen } = useUIStore();
  const [location] = useLocation();
  
  // Get top communities by member count
  const topCommunities = [...communities]
    .sort((a, b) => b.memberCount - a.memberCount)
    .slice(0, 5);
  
  return (
    <aside className="hidden md:block md:col-span-1 space-y-4">
      {/* Navigation Links */}
      <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md p-4 border border-reddit-light-border dark:border-reddit-dark-border">
        <nav>
          <ul className="space-y-1">
            <li>
              <Link href="/" className={`flex items-center py-2 px-3 rounded ${location === '/' ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <i className="ri-home-line mr-3 text-lg"></i>
                <span className="font-medium">Home</span>
              </Link>
            </li>
            <li>
              <Link href="/discover" className={`flex items-center py-2 px-3 rounded ${location === '/discover' ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <i className="ri-compass-line mr-3 text-lg"></i>
                <span className="font-medium">Discover</span>
              </Link>
            </li>
            <li>
              <Link href="/leaderboard" className={`flex items-center py-2 px-3 rounded ${location.startsWith('/leaderboard') ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <i className="ri-award-line mr-3 text-lg"></i>
                <span className="font-medium">Leaderboard</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Communities Card */}
      <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md p-4 border border-reddit-light-border dark:border-reddit-dark-border">
        <h2 className="font-semibold mb-4">Top Communities</h2>
        
        {/* Community List */}
        <ul className="space-y-2">
          {topCommunities.map((community) => (
            <li key={community.id}>
              <Link href={`/community/${community.id}`} className="flex items-center py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded item-hover-effect">
                {community.avatar ? (
                  <img src={community.avatar} alt={community.name} className="w-6 h-6 rounded-full mr-2 object-cover flex-shrink-0" />
                ) : (
                  <div className={`w-6 h-6 rounded-full overflow-hidden bg-primary mr-2 flex-shrink-0`}>
                    <span className="text-black text-xs font-bold flex items-center justify-center h-full">
                      {community.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="font-medium text-sm">{community.name}</span>
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">{community.memberCount >= 1000 ? `${(community.memberCount / 1000).toFixed(1)}k` : community.memberCount}</span>
              </Link>
            </li>
          ))}
        </ul>
        
        <Link href="/discover">
          <Button 
            variant="ghost" 
            className="w-full mt-4 text-primary hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold text-sm py-1.5 rounded-full"
          >
            See All Communities
          </Button>
        </Link>
        
        <Separator className="my-4 border-reddit-light-border dark:border-reddit-dark-border" />
        
        <Button 
          onClick={() => setCreateCommunityModalOpen(true)}
          className="w-full bg-primary text-black font-semibold py-1.5 px-4 rounded-full text-sm hover:opacity-90"
        >
          Create Community
        </Button>
      </div>
      
      {/* Info Card */}
      <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md p-4 border border-reddit-light-border dark:border-reddit-dark-border">
        <h2 className="font-semibold mb-3">About RedditWeb3</h2>
        <p className="text-sm mb-3">A decentralized version of Reddit powered by web3 technologies, using Privy for authentication, Orbis for social features, and Pinata for content storage.</p>
        <div className="flex flex-col space-y-2 text-sm">
          <div className="flex items-center">
            <i className="ri-cake-line mr-2"></i>
            <span>Created May 2023</span>
          </div>
          <div className="flex items-center">
            <i className="ri-user-line mr-2"></i>
            <span>{communities.reduce((sum, community) => sum + community.memberCount, 0).toLocaleString()} total members</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
