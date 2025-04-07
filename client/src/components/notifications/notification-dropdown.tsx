import React, { useState, useEffect } from 'react';
import {
  Bell,
  XCircle,
  Check,
  MessageCircle,
  Heart,
  Share,
  RefreshCw,
  User
} from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AppNotification, NotificationType } from '@shared/types';
import { useNotifications } from '@/lib/websocket';
import { useAuthStore } from '@/lib/store';
import { formatTimeAgo } from '@/lib/utils';

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'post_like':
    case 'comment_like':
      return <Heart className="h-4 w-4 text-red-500" />;
    case 'post_comment':
    case 'comment_reply':
      return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case 'mention':
      return <User className="h-4 w-4 text-purple-500" />;
    case 'follow':
      return <User className="h-4 w-4 text-green-500" />;
    case 'system':
      return <RefreshCw className="h-4 w-4 text-gray-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

export default function NotificationDropdown() {
  const { user } = useAuthStore();
  const userId = user?.id || null;
  
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead
  } = useNotifications(userId);
  
  const [open, setOpen] = useState(false);
  
  // Mark notifications as read when dropdown is opened
  useEffect(() => {
    if (open && unreadCount > 0) {
      // Optional: Auto-mark as read when opening dropdown
      // markAllAsRead();
    }
  }, [open, unreadCount]);
  
  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllAsRead();
  };
  
  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Handle navigation based on notification type
    if (notification.relatedPostId) {
      window.location.href = `/post/${notification.relatedPostId}`;
    } else if (notification.type === 'follow') {
      // Navigate to user profile
      window.location.href = `/profile/${notification.sender}`;
    }
    
    setOpen(false);
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              className="h-8 text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all as read
            </Button>
          )}
        </div>
        
        <Separator />
        
        <ScrollArea className="h-[300px]">
          {loading ? (
            <div className="flex flex-col space-y-2 p-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-start space-x-2">
                  <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-3/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-4 text-center text-sm text-gray-500">
              <p>Failed to load notifications.</p>
              <Button 
                variant="link" 
                size="sm" 
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              <p>No notifications yet.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`
                    flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 
                    cursor-pointer transition-colors
                    ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  `}
                >
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{notification.content}</p>
                    <p className="text-xs text-gray-500">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                  
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}