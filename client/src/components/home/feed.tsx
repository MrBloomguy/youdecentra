import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';
import PostCard from './post-card';
import { useOrbis } from '@/lib/orbis';
import { usePostStore, useUIStore, useAuthStore } from '@/lib/store';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTotalPoints } from '@/lib/points';
import { AppPost } from '@shared/types';

export default function Feed() {
  const { getPosts, getUserVotes } = useOrbis();
  const { posts, setPosts } = usePostStore();
  const { isAuthenticated, user } = useAuthStore();
  const { setCreatePostModalOpen } = useUIStore();
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'hot' | 'new' | 'top'>('hot');
  const isMobile = useIsMobile();
  const { totalPoints, loading: totalPointsLoading } = useTotalPoints();

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        // Get posts without a specific context to get all posts
        const fetchedPosts = await getPosts();
        
        if (isAuthenticated && user) {
          // Get user votes for the fetched posts
          const postIds = fetchedPosts.map(post => post.id);
          const userVotes = await getUserVotes(postIds);
          
          // Merge user votes with posts
          const postsWithVotes = fetchedPosts.map(post => ({
            ...post,
            userVote: userVotes[post.id] === 'upvote' ? 'up' : userVotes[post.id] === 'downvote' ? 'down' : null
          }));
          
          setPosts(postsWithVotes);
        } else {
          setPosts(fetchedPosts);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [getPosts, getUserVotes, setPosts, isAuthenticated, user]);

  const handleFilterChange = (filter: 'hot' | 'new' | 'top') => {
    setActiveFilter(filter);
    
    let filteredPosts = [...posts];
    if (filter === 'new') {
      filteredPosts.sort((a, b) => b.createdAt - a.createdAt);
    } else if (filter === 'top') {
      filteredPosts.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
    } else {
      // Hot is a combination of time and votes
      filteredPosts.sort((a, b) => {
        const aScore = a.upvotes - a.downvotes;
        const bScore = b.upvotes - b.downvotes;
        const aAge = (Date.now() - a.createdAt) / 3600000; // hours
        const bAge = (Date.now() - b.createdAt) / 3600000; // hours
        
        // Simple hot algorithm: score / (age + 2)^1.8
        return (bScore / Math.pow(bAge + 2, 1.8)) - (aScore / Math.pow(aAge + 2, 1.8));
      });
    }
    
    setPosts(filteredPosts);
  };

  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-2 space-y-4 relative">
      {/* Create Post Area - Hidden on Mobile */}
      {!isMobile && (
        <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md p-2 flex items-center border border-reddit-light-border dark:border-reddit-dark-border">
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center mr-2">
            <i className="ri-user-3-line text-gray-600 dark:text-gray-400"></i>
          </div>
          <Input
            type="text"
            placeholder="Create Post"
            className="bg-gray-100 dark:bg-gray-800 rounded-md py-2 px-4 text-sm flex-grow"
            onClick={() => setCreatePostModalOpen(true)}
            readOnly
          />
          <Button 
            onClick={() => setCreatePostModalOpen(true)}
            size="icon"
            variant="ghost" 
            className="ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <i className="ri-image-line"></i>
          </Button>
          <Button 
            onClick={() => setCreatePostModalOpen(true)}
            size="icon"
            variant="ghost" 
            className="ml-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <i className="ri-link"></i>
          </Button>
        </div>
      )}
      
      {/* Floating Create Post Button - Visible only on Mobile */}
      {isMobile && (
        <button 
          onClick={() => setCreatePostModalOpen(true)}
          className="fixed bottom-20 right-4 z-30 bg-primary text-black w-14 h-14 rounded-full flex items-center justify-center shadow-lg animate-fade-in"
          aria-label="Create new post"
        >
          <i className="ri-add-line text-2xl icon-interaction"></i>
        </button>
      )}

      {/* Feed Filters */}
      <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md p-2 flex justify-between border border-reddit-light-border dark:border-reddit-dark-border">
        <div className="flex">
          <Button
            variant="ghost"
            className={`flex items-center space-x-1 py-1 px-3 text-sm font-semibold rounded-full ${activeFilter === 'hot' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
            onClick={() => handleFilterChange('hot')}
          >
            <i className="ri-fire-line"></i>
            <span>Hot</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex items-center space-x-1 py-1 px-3 text-sm font-semibold rounded-full ${activeFilter === 'new' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
            onClick={() => handleFilterChange('new')}
          >
            <i className="ri-award-line"></i>
            <span>New</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex items-center space-x-1 py-1 px-3 text-sm font-semibold rounded-full ${activeFilter === 'top' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
            onClick={() => handleFilterChange('top')}
          >
            <i className="ri-bar-chart-line"></i>
            <span>Top</span>
          </Button>
        </div>
        
        {/* Total Points Badge */}
        {!totalPointsLoading && (
          <div className="flex items-center ml-auto">
            <Badge className="bg-primary hover:bg-primary/90 text-black dark:text-black flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              <span className="hidden xs:inline">{totalPoints.toLocaleString()} Total Points</span>
              <span className="xs:hidden">{totalPoints.toLocaleString()}</span>
            </Badge>
          </div>
        )}
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {isLoading ? (
          // Skeleton loaders for posts
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="post-card bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md border border-reddit-light-border dark:border-reddit-dark-border overflow-hidden p-4">
              <div className="animate-pulse flex">
                <div className="w-10 md:w-12 bg-gray-200 dark:bg-gray-700 h-24"></div>
                <div className="flex-grow ml-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ))
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md p-6 text-center border border-reddit-light-border dark:border-reddit-dark-border">
            <p className="text-lg font-semibold mb-2">No posts yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Be the first to create a post!</p>
            <Button 
              onClick={() => setCreatePostModalOpen(true)}
              className="bg-reddit-orange hover:bg-orange-600 text-white font-semibold py-1.5 px-4 rounded-full text-sm"
            >
              Create Post
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
