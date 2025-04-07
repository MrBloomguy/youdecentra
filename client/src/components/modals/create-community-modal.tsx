import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useUIStore, useCommunityStore, useAuthStore } from '@/lib/store';
import { useOrbis } from '@/lib/orbis';
import { useToast } from '@/hooks/use-toast';
import { AppCommunity } from '@shared/types';

export default function CreateCommunityModal() {
  const { isCreateCommunityModalOpen, setCreateCommunityModalOpen, setAuthModalOpen } = useUIStore();
  const { addCommunity } = useCommunityStore();
  const { isAuthenticated, user } = useAuthStore();
  const { createContext } = useOrbis();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle name change with validation
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow lowercase letters, numbers, and underscores
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setName(value);
  };
  
  // Reset the form
  const resetForm = () => {
    setName('');
    setDescription('');
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      setAuthModalOpen(true);
      return;
    }
    
    if (!name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a name for your community.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create context (community) using Orbis
      const contextId = await createContext(name, description);
      
      if (!contextId) {
        toast({
          title: 'Community creation failed',
          description: 'Failed to create community. Please try again.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      
      // Create a local community object for the UI
      const newCommunity: AppCommunity = {
        id: contextId,
        name,
        description,
        avatar: '',
        banner: '',
        createdBy: user.id,
        orbisContext: contextId,
        memberCount: 1,
      };
      
      // Add the community to the local store
      addCommunity(newCommunity);
      
      // Success toast
      toast({
        title: 'Community created',
        description: 'Your community has been created successfully.',
      });
      
      // Reset form and close modal
      resetForm();
      setCreateCommunityModalOpen(false);
    } catch (error) {
      console.error('Error creating community:', error);
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
    <Dialog open={isCreateCommunityModalOpen} onOpenChange={setCreateCommunityModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-semibold text-lg">Create a Community</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          {/* Community Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                w/
              </span>
              <Input
                type="text"
                placeholder="community_name"
                value={name}
                onChange={handleNameChange}
                className="w-full bg-gray-100 dark:bg-gray-800 rounded-md pl-8"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Community names can only contain lowercase letters, numbers, and underscores.
            </p>
          </div>
          
          {/* Community Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description (optional)</label>
            <Textarea
              placeholder="What is your community about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-800 rounded-md resize-none"
            />
          </div>
          
          <div className="pt-4 pb-2">
            <p className="text-sm font-medium">Community Rules</p>
            <ul className="text-xs text-gray-500 mt-1 space-y-1 list-disc list-inside">
              <li>Communities are created as web3 contexts on Orbis</li>
              <li>All content is stored on decentralized storage</li>
              <li>Be respectful and follow web3 etiquette</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setCreateCommunityModalOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim()}
            className="bg-reddit-orange hover:bg-orange-600 text-white"
          >
            {isSubmitting ? (
              <>
                <i className="ri-loader-4-line animate-spin mr-2"></i>
                Creating...
              </>
            ) : (
              'Create Community'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
