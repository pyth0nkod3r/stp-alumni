'use client';

import React, { useState } from 'react';
import { Bell, Check, UserPlus, Heart, MessageSquare, Calendar, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from '@/i18n/routing';
import { 
  useNotifications, 
  useUnreadNotificationCount, 
  useMarkNotificationRead, 
  useMarkAllNotificationsRead 
} from '@/lib/hooks/useNotificationQueries';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'CONNECTION_REQUEST':
    case 'CONNECTION_ACCEPTED':
      return <UserPlus className="h-4 w-4 text-blue-500" />;
    case 'POST_LIKE':
      return <Heart className="h-4 w-4 text-red-500" />;
    case 'POST_COMMENT':
      return <MessageSquare className="h-4 w-4 text-green-500" />;
    case 'EVENT_REGISTRATION':
    case 'EVENT_UPDATE':
      return <Calendar className="h-4 w-4 text-purple-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const { data, isLoading } = useNotifications();
  const notifications = data?.data?.notifications || [];
  
  const { data: unreadCount } = useUnreadNotificationCount();
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id);
    }
    setIsOpen(false);
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto text-xs font-medium text-primary p-0 hover:bg-transparent hover:text-primary/80"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              {markAllAsRead.isPending ? 'Marking...' : 'Mark all as read'}
            </Button>
          )}
        </div>
        
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <Bell className="h-10 w-10 text-gray-300 mb-2" />
              <p className="text-sm font-medium text-gray-900">No notifications yet</p>
              <p className="text-xs text-gray-500 mt-1">When you get notifications, they'll show up here.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0",
                    !notification.isRead && "bg-blue-50/50"
                  )}
                >
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 mt-0.5",
                    !notification.isRead && "bg-white"
                  )}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none text-gray-900">
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <span className="flex h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
