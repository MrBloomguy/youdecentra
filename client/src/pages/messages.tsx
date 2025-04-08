import React, { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MobileNav from '@/components/layout/mobile-nav';
import { useToast } from '@/hooks/use-toast';
import { UserSearch } from 'lucide-react';

export default function Messages() {
  const { isAuthenticated, user } = useAuthStore();
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [searchUsername, setSearchUsername] = useState('');

  if (!isAuthenticated) {
    return (
      <>
        <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <div className="flex items-center mb-4">
            <h1 className="text-2xl font-bold">Messages</h1>
          </div>
          <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md p-6 border border-reddit-light-border dark:border-reddit-dark-border text-center">
            <p className="mb-6 text-gray-600 dark:text-gray-300">Please sign in to view your messages.</p>
            <Button className="bg-reddit-orange hover:bg-orange-600 text-white">Sign In</Button>
          </div>
        </div>
        <MobileNav />
      </>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <div className="flex items-center mb-4">
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>
        <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md border border-reddit-light-border dark:border-reddit-dark-border overflow-hidden">
          <div className="flex h-[calc(100vh-220px)] md:h-[600px]">
            {/* Conversations sidebar */}
            <div className="w-full md:w-1/3 border-r border-reddit-light-border dark:border-reddit-dark-border">
              <div className="p-4 border-b border-reddit-light-border dark:border-reddit-dark-border">
                <h2 className="font-bold text-lg mb-4">Start New Message</h2>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter username to message..."
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                  />
                  <Button 
                    onClick={() => {
                      if (searchUsername.trim()) {
                        // Handle starting conversation
                        toast({
                          title: "Starting conversation",
                          description: `Creating chat with ${searchUsername}...`
                        });
                      }
                    }}
                  >
                    <UserSearch className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                </div>
              </div>
              <div className="overflow-y-auto h-[calc(100%-161px)]">
                <div className="text-center p-4 text-gray-500">
                  No conversations yet
                </div>
              </div>
            </div>

            {/* Message content */}
            <div className="hidden md:flex flex-col w-2/3">
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <i className="ri-chat-3-line text-5xl mb-2"></i>
                  <p>Select a conversation or start a new one</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <MobileNav />
    </>
  );
}