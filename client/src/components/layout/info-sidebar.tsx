import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { usePostStore, useUIStore } from '@/lib/store';
import { formatTimeAgo } from '@/lib/utils';

export default function InfoSidebar() {
  const { posts } = usePostStore();
  const { setCreatePostModalOpen, setCreateCommunityModalOpen } = useUIStore();

  // Get the 3 most recent posts
  const recentPosts = posts
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3);

  return (
    <aside className="hidden lg:block lg:col-span-1 space-y-4">
      {/* Recent Posts */}
      <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md overflow-hidden border border-reddit-light-border dark:border-reddit-dark-border">
        <div className="h-16 bg-gradient-to-r from-blue-400 to-purple-500"></div>
        <div className="p-4">
          <h2 className="font-bold text-base mb-4">Recent Posts</h2>
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <Link key={post.id} href={`/post/${post.id}`}>
                <div className="group cursor-pointer">
                  <h3 className="text-sm font-medium group-hover:text-blue-500 line-clamp-2">
                    {post.title}
                  </h3>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>Posted by {post.author.name}</span>
                    <span className="mx-1">•</span>
                    <span>{formatTimeAgo(post.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

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