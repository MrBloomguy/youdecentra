import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Send, X, Paperclip } from 'lucide-react';
import { useMessages } from '@/lib/websocket';
import { useAuthStore } from '@/lib/store';
import { formatTimeAgo } from '@/lib/utils';
import { AppMessage } from '@shared/types';

interface MessageDialogProps {
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  conversationId?: string;
  trigger?: React.ReactNode;
}

export default function MessageDialog({
  recipientId,
  recipientName,
  recipientAvatar,
  conversationId,
  trigger
}: MessageDialogProps) {
  const { user } = useAuthStore();
  const userId = user?.id || null;
  
  const {
    messages,
    loading,
    error,
    typingUsers,
    sendMessage,
    sendTypingIndicator
  } = useMessages(userId, conversationId);
  
  const [messageText, setMessageText] = useState('');
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Handle typing indicator
  const handleTypingStart = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    sendTypingIndicator(true, recipientId);
    
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(false, recipientId);
      typingTimeoutRef.current = null;
    }, 3000);
  };
  
  const handleSendMessage = async () => {
    if (!messageText.trim() || !userId) return;
    
    try {
      let success;
      if (!conversationId) {
        // Create new conversation if none exists
        const newConvId = await createNewConversation([recipientId]);
        if (newConvId) {
          success = await sendNewMessage(newConvId, messageText);
        }
      } else {
        success = await sendNewMessage(conversationId, messageText);
      }
      
      if (success) {
        setMessageText('');
        // Clear typing indicator when message is sent
        sendTypingIndicator(false, recipientId);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Group messages by day for showing date separators
  const groupedMessages: { date: string; messages: AppMessage[] }[] = [];
  messages.forEach((message) => {
    const date = new Date(message.createdAt).toLocaleDateString();
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    
    if (lastGroup && lastGroup.date === date) {
      lastGroup.messages.push(message);
    } else {
      groupedMessages.push({ date, messages: [message] });
    }
  });
  
  // Determine if a message is from the same sender as the previous one
  // for adjusting UI spacing
  const isSameSender = (index: number, messages: AppMessage[], senderId: string) => {
    return index > 0 && messages[index - 1].sender === senderId;
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon">
            <MessageCircle className="h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0">
        <DialogHeader className="px-4 py-2 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {recipientAvatar ? (
                <img
                  src={recipientAvatar}
                  alt={recipientName}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {recipientName[0]}
                  </span>
                </div>
              )}
              <DialogTitle>{recipientName}</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div className="flex flex-col space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`rounded-lg p-3 max-w-[80%] ${
                      i % 2 === 0
                        ? 'bg-gray-100 dark:bg-gray-800'
                        : 'bg-blue-500 text-white'
                    } animate-pulse h-12`}
                  />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 mb-2">Failed to load messages</p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500 text-center">
                No messages yet. Send a message to start the conversation.
              </p>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              {groupedMessages.map((group, groupIndex) => (
                <div key={group.date} className="space-y-3">
                  <div className="flex justify-center">
                    <div className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-500">
                      {group.date === new Date().toLocaleDateString()
                        ? 'Today'
                        : group.date}
                    </div>
                  </div>
                  
                  {group.messages.map((message, index) => {
                    const isCurrentUser = message.sender === userId;
                    const showAvatar = !isSameSender(
                      index,
                      group.messages,
                      message.sender
                    );
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isCurrentUser ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`flex items-end gap-2 ${
                            isCurrentUser ? 'flex-row-reverse' : ''
                          }`}
                        >
                          {!isCurrentUser && showAvatar && (
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">
                                {recipientName[0]}
                              </span>
                            </div>
                          )}
                          
                          <div
                            className={`rounded-lg p-3 max-w-[250px] ${
                              isCurrentUser
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-800'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs mt-1 opacity-70 text-right">
                              {formatTimeAgo(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              
              {/* Typing indicator */}
              {Object.keys(typingUsers).length > 0 && (
                <div className="flex justify-start">
                  <div className="rounded-lg p-2 bg-gray-100 dark:bg-gray-800">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse delay-75" />
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse delay-150" />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
        
        <div className="p-3 border-t mt-auto">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Input
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                handleTypingStart();
              }}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            
            <Button
              variant="default"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}