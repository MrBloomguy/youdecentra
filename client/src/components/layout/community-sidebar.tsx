import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCommunityStore, useUIStore } from '@/lib/store';
import { getCommunityColor, getCommunityInitial } from '@/lib/utils';

export default function CommunitySidebar() {
  const { communities } = useCommunityStore();
  const { setCreateCommunityModalOpen } = useUIStore();
  
  return (
    <aside className="hidden md:block md:col-span-1 space-y-4">
      {/* Communities Card */}
      <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md p-4 border border-reddit-light-border dark:border-reddit-dark-border">
        <h2 className="font-semibold mb-4">Your Communities</h2>
        
        {/* Community List */}
        <ul className="space-y-2">
          {communities.map((community) => (
            <li key={community.id}>
              <Link href={`/community/${community.name}`} className="flex items-center py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                <div className={`w-6 h-6 rounded-full overflow-hidden ${getCommunityColor(community.name)} mr-2 flex-shrink-0`}>
                  <span className="text-white text-xs font-bold flex items-center justify-center h-full">
                    {getCommunityInitial(community.name)}
                  </span>
                </div>
                <span className="font-medium text-sm">{community.name}</span>
              </Link>
            </li>
          ))}
        </ul>
        
        <Button 
          variant="ghost" 
          className="w-full mt-4 text-reddit-blue hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold text-sm py-1.5 rounded-full"
        >
          Browse Communities
        </Button>
        
        <Separator className="my-4 border-reddit-light-border dark:border-reddit-dark-border" />
        
        <Button 
          onClick={() => setCreateCommunityModalOpen(true)}
          className="w-full bg-reddit-orange hover:bg-orange-600 text-white font-semibold py-1.5 px-4 rounded-full text-sm"
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
            <span>10.2k members</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
