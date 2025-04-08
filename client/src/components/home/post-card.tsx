import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatTimeAgo, getCommunityColor, getCommunityInitial, isImageUrl } from '@/lib/utils';
import { AppPost } from '@shared/types';
import { useOrbis } from '@/lib/orbis';
import { useAuthStore, usePostStore, useUIStore } from '@/lib/store';
import { SharePostDialog } from '@/components/post/share-post-dialog';
import { Award, Share2, Bookmark } from 'lucide-react';
import { usePostPoints, pointsService } from '@/lib/points';
import { usePrivy } from '@privy-io/react-auth';

interface PostCardProps {
  post: AppPost;
}

export default function PostCard({ post }: PostCardProps) {
  const { votePost } = useOrbis();
  const { isAuthenticated } = useAuthStore();
  const { updatePostVote } = usePostStore();
  const { setAuthModalOpen } = useUIStore();
  const { user } = usePrivy();
  const { points: postPoints, loading: pointsLoading } = usePostPoints(post.id);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

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
      updatePostVote(post.id, null, previousVote || null);
      // Remove vote through Orbis (implementation depends on Orbis SDK capability)
      await votePost(post.id, type === 'up' ? 'upvote' : 'downvote');
    } else {
      // Handle UI update optimistically
      updatePostVote(post.id, type, previousVote || null);
      // Submit vote through Orbis
      await votePost(post.id, type === 'up' ? 'upvote' : 'downvote');

      // Award points for liking if user is authenticated and has wallet
      if (user?.wallet?.address) {
        try {
          await pointsService.awardPointsForLike(
            user.wallet.address, 
            post.id,
            1 // Default points for liking
          );
        } catch (error) {
          console.error('Error awarding points for like:', error);
        }
      }
    }
  };

  // Handle share button click
  const handleShare = () => {
    setShareDialogOpen(true);
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
            <Link href={`/community/${post.community.name}`} className="flex items-center hover:underline">
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

          {/* Post points badge */}
          {!pointsLoading && postPoints > 0 && (
            <div className="mb-3">
              <Badge className="bg-green-600 hover:bg-green-700 flex items-center gap-1 text-white">
                <Award className="h-3 w-3" />
                <span>{postPoints} Points</span>
              </Badge>
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
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-1" />
              <span>Share</span>
            </Button>

            <Button 
              variant="ghost"
              size="sm"
              className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded-md ml-2 h-auto"
            >
              <Bookmark className="h-4 w-4 mr-1" />
              <span>Save</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Share Post Dialog */}
      <SharePostDialog 
        post={post} 
        open={shareDialogOpen} 
        onOpenChange={setShareDialogOpen} 
      />
    </div>
  );
}