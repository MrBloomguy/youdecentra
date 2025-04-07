import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { formatTimeAgo, getCommunityColor, getCommunityInitial, isImageUrl } from '@/lib/utils';
import { AppPost } from '@shared/types';
import { useOrbis } from '@/lib/orbis';
import { useAuthStore, usePostStore, useUIStore } from '@/lib/store';

interface PostCardProps {
  post: AppPost;
}

export default function PostCard({ post }: PostCardProps) {
  const { votePost } = useOrbis();
  const { isAuthenticated } = useAuthStore();
  const { updatePostVote } = usePostStore();
  const { setAuthModalOpen } = useUIStore();
  
  const handleVote = async (type: 'up' | 'down') => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    
    // Save the previous vote to handle optimistic UI updates
    const previousVote = post.userVote;
    
    // If user is clicking the same vote they already have, remove the vote
    if (post.userVote === type) {
      // Handle UI update optimistically
      updatePostVote(post.id, null, previousVote);
      // Remove vote through Orbis (implementation depends on Orbis SDK capability)
      await votePost(post.id, type === 'up' ? 'upvote' : 'downvote');
    } else {
      // Handle UI update optimistically
      updatePostVote(post.id, type, previousVote);
      // Submit vote through Orbis
      await votePost(post.id, type === 'up' ? 'upvote' : 'downvote');
    }
  };
  
  // Check if post has media to display
  const hasImage = post.mediaUrls && post.mediaUrls.length > 0 && post.mediaUrls.some(url => isImageUrl(url));
  
  // Get the first image if there are any
  const firstImage = hasImage ? post.mediaUrls.find(url => isImageUrl(url)) : null;

  return (
    <div className="post-card bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md border border-reddit-light-border dark:border-reddit-dark-border overflow-hidden">
      <div className="flex">
        {/* Voting sidebar */}
        <div className="w-10 md:w-12 bg-gray-50 dark:bg-gray-900 flex flex-col items-center py-2">
          <button 
            className={`vote-arrow ${post.userVote === 'up' ? 'voted-up' : 'text-gray-400'}`}
            onClick={() => handleVote('up')}
          >
            <i className="ri-arrow-up-s-line text-xl"></i>
          </button>
          <span className={`text-xs font-semibold my-1 ${post.userVote === 'up' ? 'text-reddit-orange' : post.userVote === 'down' ? 'text-blue-500' : ''}`}>
            {post.upvotes - post.downvotes}
          </span>
          <button 
            className={`vote-arrow ${post.userVote === 'down' ? 'voted-down' : 'text-gray-400'}`}
            onClick={() => handleVote('down')}
          >
            <i className="ri-arrow-down-s-line text-xl"></i>
          </button>
        </div>

        {/* Post content */}
        <div className="flex-grow p-2 md:p-3">
          {/* Post header */}
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
            <Link href={`/w/${post.community.name}`} className="flex items-center hover:underline">
              <div className={`w-5 h-5 rounded-full ${getCommunityColor(post.community.name)} mr-1 flex-shrink-0`}>
                <span className="text-white text-xs font-bold flex items-center justify-center h-full">
                  {getCommunityInitial(post.community.name)}
                </span>
              </div>
              <span className="font-medium">{post.community.name}</span>
            </Link>
            <span className="mx-1">•</span>
            <span>Posted by 
              <Link href={`/user/${post.author.id}`} className="hover:underline ml-1">
                {post.author.name}
              </Link>
            </span>
            <span className="mx-1">•</span>
            <span>{formatTimeAgo(post.createdAt)}</span>
          </div>

          {/* Post title & link to detail page */}
          <Link href={`/post/${post.id}`}>
            <h3 className="text-lg font-semibold mb-2 hover:text-blue-600 dark:hover:text-blue-400">
              {post.title}
            </h3>
          </Link>

          {/* Post content */}
          <p className="text-sm mb-3">
            {post.content.length > 200 
              ? `${post.content.substring(0, 200)}...` 
              : post.content}
          </p>

          {/* Post media (if any) */}
          {hasImage && firstImage && (
            <div className="mb-3 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 max-h-96 flex items-center justify-center">
              <img 
                src={firstImage} 
                alt={post.title} 
                className="max-w-full max-h-96 object-contain"
              />
            </div>
          )}

          {/* Post actions */}
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Button
              variant="ghost"
              size="sm" 
              className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded-md h-auto"
              asChild
            >
              <Link href={`/post/${post.id}`}>
                <i className="ri-chat-1-line mr-1"></i>
                <span>{post.commentCount} comments</span>
              </Link>
            </Button>
            
            <Button 
              variant="ghost"
              size="sm"
              className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded-md ml-2 h-auto"
            >
              <i className="ri-share-forward-line mr-1"></i>
              <span>Share</span>
            </Button>
            
            <Button 
              variant="ghost"
              size="sm"
              className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded-md ml-2 h-auto"
            >
              <i className="ri-bookmark-line mr-1"></i>
              <span>Save</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
