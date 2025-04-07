import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Copy, 
  Mail, 
  MessageCircle, 
  ExternalLink 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AppPost } from '@shared/types';
import { pointsService } from '@/lib/points';
import { usePrivy } from '@privy-io/react-auth';

interface SharePostDialogProps {
  post: AppPost;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SharePostDialog({ post, open, onOpenChange }: SharePostDialogProps) {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);
  const { user } = usePrivy();
  
  // Construct the URL for the post
  const postUrl = `${window.location.origin}/post/${post.id}`;
  
  // Create the message for sharing
  const shareTitle = `Check out this post on Web3 Reddit: "${post.title}"`;
  const shareText = `${post.title}\n\nPosted in r/${post.community.name}\n\n`;
  
  // Share on Twitter
  const handleTwitterShare = async () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(postUrl)}`;
    await handleShare('twitter', url);
  };
  
  // Share on Facebook
  const handleFacebookShare = async () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
    await handleShare('facebook', url);
  };
  
  // Share on LinkedIn
  const handleLinkedInShare = async () => {
    const url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(shareTitle)}`;
    await handleShare('linkedin', url);
  };
  
  // Share via Email
  const handleEmailShare = async () => {
    const url = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + postUrl)}`;
    await handleShare('email', url);
  };
  
  // Share via WhatsApp
  const handleWhatsAppShare = async () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + postUrl)}`;
    await handleShare('whatsapp', url);
  };
  
  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      toast({
        title: "Link copied!",
        description: "Post link has been copied to clipboard.",
      });
      await awardPointsForShare('copy');
    } catch (error) {
      console.error('Error copying link:', error);
      toast({
        title: "Failed to copy link",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Generic share handler
  const handleShare = async (platform: string, url: string) => {
    setIsSharing(true);
    
    try {
      // Open the share URL in a new window
      window.open(url, '_blank');
      
      // Award points for sharing
      await awardPointsForShare(platform);
      
      toast({
        title: "Post shared!",
        description: `You've shared this post on ${platform}.`,
      });
    } catch (error) {
      console.error(`Error sharing to ${platform}:`, error);
      toast({
        title: "Sharing failed",
        description: "There was an error sharing this post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };
  
  // Award points for sharing
  const awardPointsForShare = async (platform: string) => {
    if (!user?.wallet?.address) return;
    
    try {
      const result = await pointsService.awardPointsForShare(
        user.wallet.address,
        post.id,
        3 // Default points for sharing
      );
      
      if (result) {
        console.log(`Points awarded for sharing on ${platform}`);
      }
    } catch (error) {
      console.error('Error awarding points for sharing:', error);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
          <DialogDescription>
            Share this post with your friends and community
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 py-4">
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 p-4"
            onClick={handleTwitterShare}
            disabled={isSharing}
          >
            <Twitter className="h-5 w-5 text-blue-400" />
            <span className="text-xs">Twitter</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 p-4"
            onClick={handleFacebookShare}
            disabled={isSharing}
          >
            <Facebook className="h-5 w-5 text-blue-600" />
            <span className="text-xs">Facebook</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 p-4"
            onClick={handleLinkedInShare}
            disabled={isSharing}
          >
            <Linkedin className="h-5 w-5 text-blue-700" />
            <span className="text-xs">LinkedIn</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 p-4"
            onClick={handleEmailShare}
            disabled={isSharing}
          >
            <Mail className="h-5 w-5 text-gray-600" />
            <span className="text-xs">Email</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 p-4"
            onClick={handleWhatsAppShare}
            disabled={isSharing}
          >
            <MessageCircle className="h-5 w-5 text-green-500" />
            <span className="text-xs">WhatsApp</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 p-4"
            onClick={handleCopyLink}
            disabled={isSharing}
          >
            <Copy className="h-5 w-5 text-gray-500" />
            <span className="text-xs">Copy Link</span>
          </Button>
        </div>
        
        <div className="flex items-center space-x-2 rounded-md border p-2">
          <div className="truncate text-sm text-muted-foreground">
            {postUrl}
          </div>
          <Button 
            size="sm" 
            className="h-7 px-2"
            onClick={handleCopyLink}
            disabled={isSharing}
          >
            <Copy className="h-3.5 w-3.5" />
            <span className="sr-only">Copy Link</span>
          </Button>
        </div>
        
        <DialogFooter className="sm:justify-start">
          <Button
            variant="secondary"
            className="flex items-center gap-2"
            onClick={() => window.open(postUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
            <span>Open Post</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}