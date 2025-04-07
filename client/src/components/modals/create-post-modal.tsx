import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useUIStore, useCommunityStore, usePostStore, useAuthStore } from '@/lib/store';
import { useOrbis } from '@/lib/orbis';
import { uploadMultipleFilesToPinata } from '@/lib/pinata';
import { useToast } from '@/hooks/use-toast';
import { getCommunityInitial, getCommunityColor } from '@/lib/utils';
import { AppPost } from '@shared/types';

export default function CreatePostModal() {
  const { isCreatePostModalOpen, setCreatePostModalOpen, setAuthModalOpen } = useUIStore();
  const { communities } = useCommunityStore();
  const { addPost } = usePostStore();
  const { isAuthenticated, user } = useAuthStore();
  const { createPost } = useOrbis();
  const { toast } = useToast();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  // Handle community selection
  const handleCommunityChange = (value: string) => {
    setSelectedCommunity(value);
  };
  
  // Handle file selection
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  // Handle when files are selected via the input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
      
      // Create preview URLs
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);
    }
  };
  
  // Handle file drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
      
      // Create preview URLs
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);
    }
  };
  
  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  // Remove a file
  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    
    // Release the object URL and remove from previews
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
  };
  
  // Reset the form
  const resetForm = () => {
    setSelectedCommunity('');
    setTitle('');
    setContent('');
    setFiles([]);
    
    // Release all object URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      setAuthModalOpen(true);
      return;
    }
    
    if (!selectedCommunity) {
      toast({
        title: 'Community required',
        description: 'Please select a community to post in.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for your post.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload files to Pinata if there are any
      let mediaUrls: string[] = [];
      if (files.length > 0) {
        mediaUrls = await uploadMultipleFilesToPinata(files);
        
        if (mediaUrls.length === 0) {
          toast({
            title: 'Upload error',
            description: 'Failed to upload media files.',
            variant: 'destructive',
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      // Find the selected community
      const community = communities.find(c => c.name === selectedCommunity);
      
      if (!community) {
        toast({
          title: 'Community not found',
          description: 'The selected community could not be found.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      
      // Create post using Orbis
      const orbisPostId = await createPost(
        title,
        content,
        mediaUrls,
        community.orbisContext || community.name
      );
      
      if (!orbisPostId) {
        toast({
          title: 'Post creation failed',
          description: 'Failed to create post. Please try again.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      
      // Create a local post object for the UI
      const newPost: AppPost = {
        id: orbisPostId,
        title,
        content,
        community: {
          id: community.id,
          name: community.name,
          avatar: community.avatar,
        },
        author: {
          id: user.id,
          name: user.walletAddress ? `${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(user.walletAddress.length - 4)}` : user.id,
          avatar: user.avatar || '',
        },
        createdAt: Date.now(),
        upvotes: 0,
        downvotes: 0,
        commentCount: 0,
        mediaUrls,
        userVote: null,
      };
      
      // Add the post to the local store
      addPost(newPost);
      
      // Success toast
      toast({
        title: 'Post created',
        description: 'Your post has been created successfully.',
      });
      
      // Reset form and close modal
      resetForm();
      setCreatePostModalOpen(false);
    } catch (error) {
      console.error('Error creating post:', error);
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
    <Dialog open={isCreatePostModalOpen} onOpenChange={setCreatePostModalOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-semibold text-lg">Create a post</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Community Selector */}
          <div>
            <label className="block text-sm font-medium mb-1">Choose a community</label>
            <Select value={selectedCommunity} onValueChange={handleCommunityChange}>
              <SelectTrigger className="w-full bg-gray-100 dark:bg-gray-800 rounded-md">
                <SelectValue placeholder="Select a community" />
              </SelectTrigger>
              <SelectContent>
                {communities.map((community) => (
                  <SelectItem key={community.id} value={community.name}>
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full ${getCommunityColor(community.name)} mr-2 flex-shrink-0`}>
                        <span className="text-white text-xs font-bold flex items-center justify-center h-full">
                          {getCommunityInitial(community.name)}
                        </span>
                      </div>
                      <span>w/{community.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Post Title */}
          <div>
            <Input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-800 rounded-md"
            />
          </div>
          
          {/* Post Content */}
          <div>
            <Textarea
              placeholder="Text (optional)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-800 rounded-md h-32 resize-none"
            />
          </div>
          
          {/* Image Upload */}
          <div 
            className="border border-dashed border-gray-300 dark:border-gray-700 rounded-md p-4 text-center"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {previewUrls.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative w-24 h-24">
                    <img 
                      src={url} 
                      alt={`Preview ${index}`} 
                      className="w-full h-full object-cover rounded"
                    />
                    <button 
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <i className="ri-image-add-line text-3xl text-gray-400 mb-2"></i>
                <p className="text-sm text-gray-500 dark:text-gray-400">Drag and drop images or</p>
                <Button 
                  variant="link" 
                  className="text-reddit-blue font-medium text-sm p-0"
                  onClick={handleFileSelect}
                >
                  Upload
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept="image/*"
                  multiple
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Content will be stored on Pinata IPFS</p>
              </>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setCreatePostModalOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !selectedCommunity}
            className="bg-reddit-orange hover:bg-orange-600 text-white"
          >
            {isSubmitting ? (
              <>
                <i className="ri-loader-4-line animate-spin mr-2"></i>
                Posting...
              </>
            ) : (
              'Post'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
