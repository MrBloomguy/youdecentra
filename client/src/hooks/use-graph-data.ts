import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { 
  GET_POSTS, 
  GET_POSTS_BY_COMMUNITY, 
  GET_POST, 
  GET_COMMUNITIES, 
  GET_COMMUNITY, 
  GET_USER, 
  SEARCH,
  POST_CREATED_SUBSCRIPTION,
  COMMENT_CREATED_SUBSCRIPTION
} from '@/lib/graphQueries';
import { AppPost, AppCommunity, AppUser, AppComment } from '@shared/types';

// Hook to fetch paginated posts with filtering options
export function usePosts(first = 20, skip = 0, orderBy = 'createdAt') {
  const { loading, error, data, fetchMore } = useQuery(GET_POSTS, {
    variables: { first, skip, orderBy, orderDirection: 'desc' },
    notifyOnNetworkStatusChange: true,
  });

  const loadMore = () => {
    if (data?.posts) {
      fetchMore({
        variables: {
          skip: data.posts.length,
          first,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            posts: [...prev.posts, ...fetchMoreResult.posts],
          };
        },
      });
    }
  };

  return {
    loading,
    error,
    posts: data?.posts ? data.posts.map(mapGraphPostToAppPost) : [],
    loadMore,
    hasMore: data?.posts.length % first === 0 && data?.posts.length > 0,
  };
}

// Hook to fetch posts by community
export function usePostsByCommunity(communityId: string | number, first = 20, skip = 0) {
  const { loading, error, data, fetchMore } = useQuery(GET_POSTS_BY_COMMUNITY, {
    variables: { communityId: communityId.toString(), first, skip },
    notifyOnNetworkStatusChange: true,
  });

  const loadMore = () => {
    if (data?.posts) {
      fetchMore({
        variables: {
          skip: data.posts.length,
          first,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            posts: [...prev.posts, ...fetchMoreResult.posts],
          };
        },
      });
    }
  };

  return {
    loading,
    error,
    posts: data?.posts ? data.posts.map(mapGraphPostToAppPost) : [],
    loadMore,
    hasMore: data?.posts.length % first === 0 && data?.posts.length > 0,
  };
}

// Hook to fetch a single post with comments
export function usePost(postId: string) {
  const { loading, error, data, refetch } = useQuery(GET_POST, {
    variables: { id: postId },
    notifyOnNetworkStatusChange: true,
  });

  return {
    loading,
    error,
    post: data?.post ? mapGraphPostToAppPost(data.post) : null,
    comments: data?.post?.comments ? parseComments(data.post.comments) : [],
    refetch,
  };
}

// Hook to fetch paginated communities
export function useCommunities(first = 20, skip = 0) {
  const { loading, error, data, fetchMore } = useQuery(GET_COMMUNITIES, {
    variables: { first, skip },
    notifyOnNetworkStatusChange: true,
  });

  const loadMore = () => {
    if (data?.communities) {
      fetchMore({
        variables: {
          skip: data.communities.length,
          first,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            communities: [...prev.communities, ...fetchMoreResult.communities],
          };
        },
      });
    }
  };

  return {
    loading,
    error,
    communities: data?.communities 
      ? data.communities.map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          avatar: c.avatar || '',
          banner: c.banner || '',
          createdBy: c.createdBy.id,
          orbisContext: c.orbisContext || '',
          memberCount: c.memberCount,
        } as AppCommunity)) 
      : [],
    loadMore,
    hasMore: data?.communities.length % first === 0 && data?.communities.length > 0,
  };
}

// Hook to fetch a single community
export function useCommunity(communityId: string | number) {
  const { loading, error, data } = useQuery(GET_COMMUNITY, {
    variables: { id: communityId.toString() },
  });

  return {
    loading,
    error,
    community: data?.community 
      ? {
          id: data.community.id,
          name: data.community.name,
          description: data.community.description,
          avatar: data.community.avatar || '',
          banner: data.community.banner || '',
          createdBy: data.community.createdBy.id,
          orbisContext: data.community.orbisContext || '',
          memberCount: data.community.memberCount,
        } as AppCommunity
      : null,
  };
}

// Hook to fetch user data
export function useUser(userId: string) {
  const { loading, error, data } = useQuery(GET_USER, {
    variables: { id: userId },
  });

  return {
    loading,
    error,
    user: data?.user 
      ? {
          id: data.user.id,
          walletAddress: data.user.walletAddress,
          email: data.user.email || '',
          avatar: data.user.avatar || '',
        } as AppUser
      : null,
    posts: data?.user?.posts ? data.user.posts.map(mapGraphPostToAppPost) : [],
  };
}

// Hook to search posts, communities and users
export function useSearch(query: string, first = 10) {
  const { loading, error, data } = useQuery(SEARCH, {
    variables: { 
      postQuery: { 
        or: [
          { title_contains_nocase: query },
          { content_contains_nocase: query }
        ]
      },
      communityQuery: { name_contains_nocase: query },
      userQuery: { name_contains_nocase: query },
      first
    },
    skip: !query || query.length < 3,
  });

  return {
    loading,
    error,
    results: data ? {
      posts: data.posts ? data.posts.map(mapGraphPostToAppPost) : [],
      communities: data.communities ? data.communities.map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        avatar: c.avatar || '',
        banner: c.banner || '',
        createdBy: c.createdBy.id,
        orbisContext: c.orbisContext || '',
        memberCount: c.memberCount,
      } as AppCommunity)) : [],
      users: data.users ? data.users.map((u: any) => ({
        id: u.id,
        walletAddress: u.walletAddress,
        email: u.email || '',
        avatar: u.avatar || '',
      } as AppUser)) : [],
    } as SearchResults : {
      posts: [],
      communities: [],
      users: [],
    } as SearchResults,
  };
}

// Hook for real-time subscription to new posts
export function useNewPostSubscription() {
  const { data, loading, error } = useSubscription(POST_CREATED_SUBSCRIPTION);

  return {
    loading,
    error,
    newPost: data?.postCreated ? mapGraphPostToAppPost(data.postCreated) : null,
  };
}

// Hook for real-time subscription to new comments on a specific post
export function useNewCommentSubscription(postId: string) {
  const { data, loading, error } = useSubscription(COMMENT_CREATED_SUBSCRIPTION, {
    variables: { postId },
  });

  return {
    loading,
    error,
    newComment: data?.commentCreated 
      ? {
          id: data.commentCreated.id,
          content: data.commentCreated.content,
          postId: data.commentCreated.post.id,
          author: {
            id: data.commentCreated.author.id,
            name: data.commentCreated.author.name || data.commentCreated.author.walletAddress.substring(0, 8),
            avatar: data.commentCreated.author.avatar || '',
          },
          createdAt: Number(data.commentCreated.createdAt),
          upvotes: data.commentCreated.upvotes,
          downvotes: data.commentCreated.downvotes,
          replies: [],
          parentId: data.commentCreated.parent?.id,
        } as AppComment 
      : null,
  };
}

// Types for search results
export interface SearchResults {
  posts: AppPost[];
  communities: AppCommunity[];
  users: AppUser[];
}

// Helper function to map GraphQL Post to our AppPost type
export function mapGraphPostToAppPost(graphPost: any): AppPost {
  return {
    id: graphPost.id,
    title: graphPost.title,
    content: graphPost.content,
    community: {
      id: graphPost.community.id,
      name: graphPost.community.name,
      avatar: graphPost.community.avatar || '',
    },
    author: {
      id: graphPost.author.id,
      name: graphPost.author.name || graphPost.author.walletAddress.substring(0, 8),
      avatar: graphPost.author.avatar || '',
    },
    createdAt: Number(graphPost.createdAt),
    upvotes: graphPost.upvotes,
    downvotes: graphPost.downvotes,
    commentCount: graphPost.commentCount,
    mediaUrls: graphPost.mediaUrls || [],
    userVote: graphPost.votes?.[0]?.voteType === 'UP' 
      ? 'up' 
      : graphPost.votes?.[0]?.voteType === 'DOWN' 
        ? 'down' 
        : null,
  };
}

// Helper function to parse comment threads
export function parseComments(graphComments: any[]): AppComment[] {
  // First, create a map of all comments
  const commentMap = new Map<string, AppComment>();
  
  // Process all comments
  graphComments.forEach(comment => {
    commentMap.set(comment.id, {
      id: comment.id,
      content: comment.content,
      postId: comment.post.id,
      author: {
        id: comment.author.id,
        name: comment.author.name || comment.author.walletAddress.substring(0, 8),
        avatar: comment.author.avatar || '',
      },
      createdAt: Number(comment.createdAt),
      upvotes: comment.upvotes,
      downvotes: comment.downvotes,
      replies: [],
      parentId: comment.parent?.id,
      userVote: comment.votes?.[0]?.voteType === 'UP' 
        ? 'up' 
        : comment.votes?.[0]?.voteType === 'DOWN' 
          ? 'down' 
          : null,
    });
  });
  
  // Organize comments into a tree structure
  const rootComments: AppComment[] = [];
  
  commentMap.forEach(comment => {
    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        parent.replies.push(comment);
      } else {
        rootComments.push(comment);
      }
    } else {
      rootComments.push(comment);
    }
  });
  
  // Sort root comments by creation time (newest first)
  rootComments.sort((a, b) => b.createdAt - a.createdAt);
  
  // Sort replies by creation time (oldest first)
  commentMap.forEach(comment => {
    if (comment.replies.length > 0) {
      comment.replies.sort((a, b) => a.createdAt - b.createdAt);
    }
  });
  
  return rootComments;
}