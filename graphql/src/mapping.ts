import { 
  PostCreated, 
  CommentCreated, 
  CommunityCreated, 
  VoteCast 
} from '../generated/Web3Reddit/Web3Reddit'

import {
  Post,
  Comment,
  Community,
  User,
  Vote,
  VoteType
} from '../generated/schema'

import { BigInt, Address, log, store } from '@graphprotocol/graph-ts'

// Handler for PostCreated events
export function handlePostCreated(event: PostCreated): void {
  // Create or load user
  let userId = event.params.author.toHexString()
  let user = User.load(userId)
  
  if (user == null) {
    user = new User(userId)
    user.walletAddress = event.params.author.toHexString()
    user.save()
  }
  
  // Create or load community
  let communityId = event.params.communityId.toString()
  let community = Community.load(communityId)
  
  if (community == null) {
    log.warning('Community not found for post: {}', [communityId])
    return
  }
  
  // Create post
  let post = new Post(event.params.id.toString())
  post.title = event.params.title
  post.content = event.params.content
  post.createdAt = event.block.timestamp
  post.upvotes = 0
  post.downvotes = 0
  post.commentCount = 0
  post.mediaUrls = []
  post.author = userId
  post.community = communityId
  post.save()
}

// Handler for CommentCreated events
export function handleCommentCreated(event: CommentCreated): void {
  // Create or load user
  let userId = event.params.author.toHexString()
  let user = User.load(userId)
  
  if (user == null) {
    user = new User(userId)
    user.walletAddress = event.params.author.toHexString()
    user.save()
  }
  
  // Load post
  let postId = event.params.postId.toString()
  let post = Post.load(postId)
  
  if (post == null) {
    log.warning('Post not found for comment: {}', [postId])
    return
  }
  
  // Create comment
  let comment = new Comment(event.params.id.toString())
  comment.content = event.params.content
  comment.createdAt = event.block.timestamp
  comment.upvotes = 0
  comment.downvotes = 0
  comment.author = userId
  comment.post = postId
  comment.save()
  
  // Update post comment count
  post.commentCount = post.commentCount + 1
  post.save()
}

// Handler for CommunityCreated events
export function handleCommunityCreated(event: CommunityCreated): void {
  // Create or load user
  let userId = event.params.creator.toHexString()
  let user = User.load(userId)
  
  if (user == null) {
    user = new User(userId)
    user.walletAddress = event.params.creator.toHexString()
    user.save()
  }
  
  // Create community
  let community = new Community(event.params.id.toString())
  community.name = event.params.name
  community.description = event.params.description
  community.createdBy = userId
  community.memberCount = 1
  community.createdAt = event.block.timestamp
  community.save()
}

// Handler for VoteCast events
export function handleVoteCast(event: VoteCast): void {
  // Create or load user
  let userId = event.params.voter.toHexString()
  let user = User.load(userId)
  
  if (user == null) {
    user = new User(userId)
    user.walletAddress = event.params.voter.toHexString()
    user.save()
  }
  
  // Create vote ID by combining voter and target
  let voteId = userId.concat('-').concat(event.params.id.toString())
  
  // Create vote
  let vote = new Vote(voteId)
  vote.user = userId
  vote.createdAt = event.block.timestamp
  
  // Determine vote type (UP=0, DOWN=1)
  let voteTypeValue = event.params.voteType
  vote.voteType = voteTypeValue == 0 ? 'UP' : 'DOWN'
  
  // Determine target type (POST=0, COMMENT=1)
  let targetType = event.params.targetType
  let targetId = event.params.id.toString()
  
  if (targetType == 0) {
    // Vote on a post
    vote.post = targetId
    
    let post = Post.load(targetId)
    if (post != null) {
      // Update post vote counts
      if (voteTypeValue == 0) {
        post.upvotes = post.upvotes + 1
      } else {
        post.downvotes = post.downvotes + 1
      }
      post.save()
    }
  } else {
    // Vote on a comment
    vote.comment = targetId
    
    let comment = Comment.load(targetId)
    if (comment != null) {
      // Update comment vote counts
      if (voteTypeValue == 0) {
        comment.upvotes = comment.upvotes + 1
      } else {
        comment.downvotes = comment.downvotes + 1
      }
      comment.save()
    }
  }
  
  vote.save()
}
