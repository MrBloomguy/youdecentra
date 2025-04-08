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
  import { useEffect } from 'react';

const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [searchUsername, setSearchUsername] = useState('');
const [searchResults, setSearchResults] = useState<AppUser[]>([]);

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchUsername);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchUsername]);

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
                {searchUsername.trim() ? (
                  <div className="divide-y">
                    {searchResults.length > 0 ? (
                      searchResults.map((user) => (
                        <div 
                          key={user.id}
                          className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer flex items-center gap-3"
                          onClick={() => {
                            // Handle starting conversation
                            toast({
                              title: "Starting conversation",
                              description: `Creating chat with ${user.email || user.walletAddress}...`
                            });
                          }}
                        >
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.email} className="w-full h-full rounded-full" />
                            ) : (
                              <span className="text-gray-500">{user.email?.[0] || user.walletAddress[0]}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{user.email || user.walletAddress}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-4 text-gray-500">
                        No users found
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-4 text-gray-500">
                    No conversations yet
                  </div>
                )}
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