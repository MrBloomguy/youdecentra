import { gql } from '@apollo/client';

// Fragment for post data to avoid duplication in queries
export const POST_FRAGMENT = gql`
  fragment PostFields on Post {
    id
    title
    content
    orbisPostId
    mediaUrls
    createdAt
    upvotes
    downvotes
    commentCount
    author {
      id
      walletAddress
      name
      avatar
    }
    community {
      id
      name
      avatar
    }
    votes {
      id
      voteType
      user {
        id
      }
    }
  }
`;

// Query to get paginated posts with sorting options
export const GET_POSTS = gql`
  query GetPosts($first: Int, $skip: Int, $orderBy: String, $orderDirection: String) {
    posts(
      first: $first,
      skip: $skip,
      orderBy: $orderBy,
      orderDirection: $orderDirection
    ) {
      ...PostFields
    }
  }
  ${POST_FRAGMENT}
`;

// Query to get posts filtered by community
export const GET_POSTS_BY_COMMUNITY = gql`
  query GetPostsByCommunity($communityId: ID!, $first: Int, $skip: Int) {
    posts(
      first: $first,
      skip: $skip,
      where: { community: $communityId },
      orderBy: "createdAt",
      orderDirection: "desc"
    ) {
      ...PostFields
    }
  }
  ${POST_FRAGMENT}
`;

// Query to get a single post with its comments
export const GET_POST = gql`
  query GetPost($id: ID!) {
    post(id: $id) {
      ...PostFields
      comments {
        id
        content
        orbisCommentId
        createdAt
        upvotes
        downvotes
        author {
          id
          walletAddress
          name
          avatar
        }
        post {
          id
        }
        parent {
          id
        }
        votes {
          id
          voteType
          user {
            id
          }
        }
      }
    }
  }
  ${POST_FRAGMENT}
`;

// Query to get paginated communities
export const GET_COMMUNITIES = gql`
  query GetCommunities($first: Int, $skip: Int) {
    communities(
      first: $first,
      skip: $skip,
      orderBy: "memberCount",
      orderDirection: "desc"
    ) {
      id
      name
      description
      avatar
      banner
      orbisContext
      memberCount
      createdAt
      createdBy {
        id
        walletAddress
      }
    }
  }
`;

// Query to get a single community
export const GET_COMMUNITY = gql`
  query GetCommunity($id: ID!) {
    community(id: $id) {
      id
      name
      description
      avatar
      banner
      orbisContext
      memberCount
      createdAt
      createdBy {
        id
        walletAddress
      }
    }
  }
`;

// Query to get user data
export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      walletAddress
      email
      name
      avatar
      posts(orderBy: "createdAt", orderDirection: "desc", first: 10) {
        ...PostFields
      }
    }
  }
  ${POST_FRAGMENT}
`;

// Query for searching posts, communities, and users
export const SEARCH = gql`
  query Search(
    $postQuery: PostWhereInput,
    $communityQuery: CommunityWhereInput,
    $userQuery: UserWhereInput,
    $first: Int
  ) {
    posts(first: $first, where: $postQuery) {
      ...PostFields
    }
    communities(first: $first, where: $communityQuery) {
      id
      name
      description
      avatar
      memberCount
      createdBy {
        id
      }
    }
    users(first: $first, where: $userQuery) {
      id
      walletAddress
      name
      avatar
    }
  }
  ${POST_FRAGMENT}
`;

// Subscription for real-time updates when a new post is created
export const POST_CREATED_SUBSCRIPTION = gql`
  subscription PostCreated {
    postCreated {
      ...PostFields
    }
  }
  ${POST_FRAGMENT}
`;

// Subscription for real-time updates when a new comment is added to a post
export const COMMENT_CREATED_SUBSCRIPTION = gql`
  subscription CommentCreated($postId: ID!) {
    commentCreated(postId: $postId) {
      id
      content
      createdAt
      upvotes
      downvotes
      author {
        id
        walletAddress
        name
        avatar
      }
      post {
        id
      }
      parent {
        id
      }
    }
  }
`;