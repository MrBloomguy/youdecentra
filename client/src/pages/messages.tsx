import React, { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Messages() {
  const { isAuthenticated, user } = useAuthStore();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  
  // Placeholder data for conversations
  const conversations = [
    { id: 1, name: 'Alice', avatar: 'A', lastMessage: 'Hey, how are you doing?', time: '2m ago', unread: 2 },
    { id: 2, name: 'Bob', avatar: 'B', lastMessage: 'Did you see the latest post?', time: '1h ago', unread: 0 },
    { id: 3, name: 'Charlie', avatar: 'C', lastMessage: 'Thanks for the feedback!', time: '2h ago', unread: 0 },
    { id: 4, name: 'Dave', avatar: 'D', lastMessage: 'Let me know when you are free', time: '1d ago', unread: 0 },
    { id: 5, name: 'Eve', avatar: 'E', lastMessage: 'Awesome, looking forward to it!', time: '2d ago', unread: 0 },
  ];
  
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md p-6 border border-reddit-light-border dark:border-reddit-dark-border text-center">
          <h1 className="text-2xl font-bold mb-4">Messages</h1>
          <p className="mb-6 text-gray-600 dark:text-gray-300">Please sign in to view your messages.</p>
          <Button className="bg-reddit-orange hover:bg-orange-600 text-white">Sign In</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <div className="bg-reddit-light-brighter dark:bg-reddit-dark-brighter rounded-md border border-reddit-light-border dark:border-reddit-dark-border overflow-hidden">
        <div className="flex h-[calc(100vh-220px)] md:h-[600px]">
          {/* Conversations sidebar */}
          <div className="w-full md:w-1/3 border-r border-reddit-light-border dark:border-reddit-dark-border">
            <div className="p-4 border-b border-reddit-light-border dark:border-reddit-dark-border">
              <h2 className="font-bold text-lg">Messages</h2>
            </div>
            <div className="overflow-y-auto h-[calc(100%-61px)]">
              {conversations.map((convo) => (
                <div 
                  key={convo.id}
                  className={`flex items-center p-4 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${selectedConversation === convo.id ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                  onClick={() => setSelectedConversation(convo.id)}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                    {convo.avatar}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className="font-semibold truncate">{convo.name}</p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">{convo.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{convo.lastMessage}</p>
                  </div>
                  {convo.unread > 0 && (
                    <div className="ml-2 bg-reddit-orange text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {convo.unread}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Message content */}
          <div className="hidden md:flex flex-col w-2/3">
            {selectedConversation ? (
              <>
                {/* Conversation header */}
                <div className="p-4 border-b border-reddit-light-border dark:border-reddit-dark-border flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                    {conversations.find(c => c.id === selectedConversation)?.avatar}
                  </div>
                  <h3 className="font-semibold">{conversations.find(c => c.id === selectedConversation)?.name}</h3>
                </div>
                
                {/* Messages area */}
                <div className="flex-grow overflow-y-auto p-4">
                  <div className="space-y-4">
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg py-2 px-4 max-w-[70%]">
                        <p>Hey there! How's it going?</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">10:42 AM</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-blue-100 dark:bg-blue-900 rounded-lg py-2 px-4 max-w-[70%]">
                        <p>I'm doing well, thanks for asking! Just checking out this new platform.</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">10:45 AM</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg py-2 px-4 max-w-[70%]">
                        <p>That's great! What do you think of it so far?</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">10:47 AM</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-blue-100 dark:bg-blue-900 rounded-lg py-2 px-4 max-w-[70%]">
                        <p>It's pretty cool! I like the web3 integration and the community features.</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">10:50 AM</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Message input */}
                <div className="p-4 border-t border-reddit-light-border dark:border-reddit-dark-border">
                  <div className="flex">
                    <Input 
                      type="text" 
                      placeholder="Type a message..." 
                      className="flex-grow rounded-r-none"
                    />
                    <Button className="rounded-l-none bg-reddit-orange hover:bg-orange-600">
                      <i className="ri-send-plane-fill mr-1"></i>
                      Send
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <i className="ri-chat-3-line text-5xl mb-2"></i>
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Mobile message view - shown when a conversation is selected */}
          {selectedConversation && (
            <div className="fixed inset-0 bg-white dark:bg-reddit-dark-brighter z-50 flex flex-col md:hidden">
              {/* Mobile conversation header with back button */}
              <div className="p-4 border-b border-reddit-light-border dark:border-reddit-dark-border flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="mr-2"
                  onClick={() => setSelectedConversation(null)}
                >
                  <i className="ri-arrow-left-line"></i>
                </Button>
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                  {conversations.find(c => c.id === selectedConversation)?.avatar}
                </div>
                <h3 className="font-semibold">{conversations.find(c => c.id === selectedConversation)?.name}</h3>
              </div>
              
              {/* Mobile messages area */}
              <div className="flex-grow overflow-y-auto p-4">
                <div className="space-y-4">
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg py-2 px-4 max-w-[70%]">
                      <p>Hey there! How's it going?</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">10:42 AM</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-blue-100 dark:bg-blue-900 rounded-lg py-2 px-4 max-w-[70%]">
                      <p>I'm doing well, thanks for asking! Just checking out this new platform.</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">10:45 AM</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg py-2 px-4 max-w-[70%]">
                      <p>That's great! What do you think of it so far?</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">10:47 AM</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-blue-100 dark:bg-blue-900 rounded-lg py-2 px-4 max-w-[70%]">
                      <p>It's pretty cool! I like the web3 integration and the community features.</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-right mt-1">10:50 AM</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Mobile message input */}
              <div className="p-4 border-t border-reddit-light-border dark:border-reddit-dark-border">
                <div className="flex">
                  <Input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="flex-grow rounded-r-none"
                  />
                  <Button className="rounded-l-none bg-reddit-orange hover:bg-orange-600">
                    <i className="ri-send-plane-fill mr-1"></i>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}