import React from 'react';
import { useLocation } from 'wouter';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MessageCircle, RefreshCw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useConversations } from '@/lib/websocket';
import { useAuthStore } from '@/lib/store';
import { formatTimeAgo } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import MessageDialog from './message-dialog';

export default function ConversationsList() {
  const { user } = useAuthStore();
  const userId = user?.id || null;
  const [, setLocation] = useLocation();
  
  const { conversations, loading, error } = useConversations(userId);
  
  const handleConversationClick = (conversationId: string) => {
    setLocation(`/messages/${conversationId}`);
  };
  
  const getRecipientInfo = (conversation: any) => {
    // Get the other participant in the conversation (not the current user)
    const recipientId = conversation.participants.find((id: string) => id !== userId);
    
    // This is simplified - in a real app, you'd fetch user details from a users store
    return {
      id: recipientId,
      name: `User ${recipientId.slice(0, 6)}...`,
      avatar: null
    };
  };
  
  return (
    <div className="h-full flex flex-col border rounded-lg overflow-hidden">
      <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
        <h2 className="text-lg font-medium">Messages</h2>
      </div>
      
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <p className="text-gray-500 mb-2">Failed to load conversations</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="mx-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center">
            <MessageCircle className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No conversations yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Start messaging other users to see conversations here
            </p>
          </div>
        ) : (
          <div>
            {conversations.map((conversation) => {
              const recipient = getRecipientInfo(conversation);
              const lastMessage = conversation.lastMessage;
              
              return (
                <div key={conversation.id}>
                  <div
                    className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                      conversation.unreadCount > 0
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : ''
                    }`}
                    onClick={() => handleConversationClick(conversation.id)}
                  >
                    <div className="flex items-center space-x-3">
                      {recipient.avatar ? (
                        <img
                          src={recipient.avatar}
                          alt={recipient.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="font-medium text-gray-600">
                            {recipient.name[0]}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">{recipient.name}</h3>
                          {lastMessage && (
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(conversation.updatedAt)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-1">
                          {lastMessage ? (
                            <p className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                              {lastMessage.sender === userId ? 'You: ' : ''}
                              {lastMessage.content}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-400 italic">
                              No messages yet
                            </p>
                          )}
                          
                          {conversation.unreadCount > 0 && (
                            <Badge variant="default" className="ml-2">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Separator />
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
      
      {/* A simple hack - this doesn't really make sense in a conversation list,
          but showing how you might include the message dialog trigger elsewhere */}
      <div className="p-3 border-t bg-gray-50 dark:bg-gray-800 flex justify-end">
        <Button variant="outline" size="sm">
          <MessageCircle className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>
    </div>
  );
}