import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import Navbar from '@/components/layout/navbar';
import MobileNav from '@/components/layout/mobile-nav';
import PostCard from '@/components/home/post-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useOrbis } from '@/lib/orbis';
import { useAuthStore, useUIStore } from '@/lib/store';
import { formatTimeAgo, getCommunityColor, getCommunityInitial } from '@/lib/utils';
import { AppPost, OrbisComment } from '@shared/types';
import { useToast } from '@/hooks/use-toast';
import { pointsService } from '@/lib/points';
import { usePrivy } from '@privy-io/react-auth';

export default function PostDetail() {
  const [, params] = useRoute<{ id: string }>('/post/:id');
  const postId = params?.id || '';
  const { getPosts, getComments, createComment } = useOrbis();
  const { isAuthenticated, user } = useAuthStore();
  const { setAuthModalOpen } = useUIStore();
  const { toast } = useToast();
  const { user: privyUser } = usePrivy();
  
  const [post, setPost] = useState<AppPost | null>(null);
  const [comments, setComments] = useState<OrbisComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch post details
  useEffect(() => {
    const fetchPostDetails = async () => {
      setIsLoading(true);
      
      try {
        // For a real implementation, we would fetch a single post by ID
        // but the Orbis SDK might not have a direct method for that
        // so we'll simulate it by fetching posts and filtering
        const posts = await getPosts();
        const foundPost = posts.find(p => p.id === postId);
        
        if (foundPost) {
          setPost(foundPost);
        }
      } catch (error) {
        console.error('Error fetching post details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPostDetails();
  }, [postId, getPosts]);
  
  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!postId) return;
      
      setIsCommentsLoading(true);
      
      try {
        const fetchedComments = await getComments(postId);
        setComments(fetchedComments);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setIsCommentsLoading(false);
      }
    };
    
    fetchComments();
  }, [postId, getComments]);
  
  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    
    if (!commentText.trim() || !post) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const commentId = await createComment(commentText, post.id);
      
      if (commentId) {
        // Success - clear the input and refresh comments
        setCommentText('');
        
        // Fetch updated comments
        const updatedComments = await getComments(postId);
        setComments(updatedComments);
        
        // Update the post's comment count
        setPost(prev => prev ? { ...prev, commentCount: prev.commentCount + 1 } : null);
        
        // Award points for commenting if user has a wallet
        if (privyUser?.wallet?.address) {
          try {
            await pointsService.awardPointsForComment(
              privyUser.wallet.address,
              post.id,
              commentId,
              2 // Default points for commenting
            );
            
            toast({
              title: 'Comment posted',
              description: 'Your comment has been posted successfully. You earned 2 points!',
            });
          } catch (error) {
            console.error('Error awarding points for comment:', error);
            toast({
              title: 'Comment posted',
              description: 'Your comment has been posted successfully.',
            });
          }
        } else {
          toast({
            title: 'Comment posted',
            description: 'Your comment has been posted successfully.',
          });
        }
      } else {
        toast({
          title: 'Comment failed',
          description: 'Failed to post your comment. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Navbar />
      
      <main className="container mx-auto px-2 md:px-4 py-4 pb-16 md:pb-4">
        {isLoading ? (
          // Skeleton loader
          <div className="max-w-3xl mx-auto bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md border border-reddit-light-border dark:border-reddit-dark-border overflow-hidden p-4">
            <div className="animate-pulse">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            </div>
          </div>
        ) : !post ? (
          <div className="max-w-3xl mx-auto bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md p-6 text-center border border-reddit-light-border dark:border-reddit-dark-border">
            <h2 className="text-xl font-semibold mb-2">Post Not Found</h2>
            <p className="text-gray-500 dark:text-gray-400">The post you're looking for doesn't exist or has been removed.</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {/* Post Card */}
            <PostCard post={post} />
            
            {/* Comment Section */}
            <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md border border-reddit-light-border dark:border-reddit-dark-border mt-4 p-4">
              <h3 className="font-semibold mb-4">Comments</h3>
              
              {/* Comment Form */}
              <div className="mb-6">
                <Textarea
                  placeholder={isAuthenticated ? "What are your thoughts?" : "Login to comment"}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={!isAuthenticated || isSubmitting}
                  className="w-full bg-gray-100 dark:bg-gray-800 rounded-md resize-none mb-2"
                  rows={4}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!isAuthenticated || !commentText.trim() || isSubmitting}
                    className="bg-reddit-orange hover:bg-orange-600 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <i className="ri-loader-4-line animate-spin mr-2"></i>
                        Posting...
                      </>
                    ) : (
                      'Comment'
                    )}
                  </Button>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              {/* Comments List */}
              {isCommentsLoading ? (
                // Comments skeleton loader
                Array(3).fill(0).map((_, index) => (
                  <div key={index} className="mb-4 animate-pulse">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/12"></div>
                    </div>
                    <div className="pl-8 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.stream_id} className="border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span className="font-medium">
                          {comment.creator.substring(0, 6)}...{comment.creator.substring(comment.creator.length - 4)}
                        </span>
                        <span className="mx-1">•</span>
                        <span>{formatTimeAgo(comment.content.timestamp)}</span>
                      </div>
                      <p className="text-sm">{comment.content.body}</p>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <button className="flex items-center hover:text-reddit-orange mr-2">
                          <i className="ri-arrow-up-s-line mr-1"></i>
                          <span>{comment.count_likes || 0}</span>
                        </button>
                        <button className="flex items-center hover:text-blue-500 mr-2">
                          <i className="ri-arrow-down-s-line mr-1"></i>
                          <span>{comment.count_downvotes || 0}</span>
                        </button>
                        <button className="flex items-center hover:text-gray-700 dark:hover:text-gray-300">
                          <i className="ri-chat-1-line mr-1"></i>
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      <MobileNav />
    </>
  );
}
