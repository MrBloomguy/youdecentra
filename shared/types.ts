// Orbis-related types
export interface OrbisPost {
  stream_id: string;
  creator: string;
  content: {
    title: string;
    body: string;
    media?: string[];
    context?: string;
    master?: string;
    timestamp: number;
  };
  count_likes: number;
  count_downvotes: number;
  count_haha: number;
  count_replies: number;
}

export interface OrbisComment {
  stream_id: string;
  creator: string;
  content: {
    body: string;
    context?: string;
    master: string;
    timestamp: number;
  };
  count_likes: number;
  count_downvotes: number;
  count_haha: number;
  count_replies: number;
}

export interface OrbisProfile {
  did: string;
  details: {
    profile?: {
      username?: string;
      description?: string;
      pfp?: string;
    }
  }
}

export interface OrbisContext {
  id: string;
  name: string;
  description?: string;
  creator: string;
  createdAt: number;
  members?: number;
}

// App-specific types
export interface AppUser {
  id: string;
  walletAddress: string;
  email: string;
  avatar: string | null;
}

export interface AppCommunity {
  id: number | string;
  name: string;
  description: string;
  avatar: string;
  banner: string;
  createdBy: string;
  orbisContext: string;
  memberCount: number;
}

export interface AppPost {
  id: string;
  title: string;
  content: string;
  community: {
    id: number | string;
    name: string;
    avatar: string;
  };
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: number;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  mediaUrls: string[];
  userVote?: 'up' | 'down' | null;
}

export interface AppComment {
  id: string;
  content: string;
  postId: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: number;
  upvotes: number;
  downvotes: number;
  replies: AppComment[];
  userVote?: 'up' | 'down' | null;
  parentId?: string;
}

export type NotificationType = 
  | 'post_like'
  | 'post_comment'
  | 'comment_like'
  | 'comment_reply'
  | 'mention'
  | 'follow'
  | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  recipient: string; // User ID of the recipient
  sender: string | null; // User ID of the sender, null for system notifications
  content: string; // Text content of the notification
  relatedPostId?: string;
  relatedCommentId?: string;
  createdAt: number;
  read: boolean;
}

export type MessageType = 'text' | 'media' | 'link';

export interface AppMessage {
  id: string;
  conversationId: string;
  sender: string;
  recipient: string;
  type: MessageType;
  content: string;
  media?: string[];
  createdAt: number;
  read: boolean;
}

export interface AppConversation {
  id: string;
  participants: string[]; // User IDs
  lastMessage: AppMessage | null;
  updatedAt: number;
  unreadCount: number;
}
