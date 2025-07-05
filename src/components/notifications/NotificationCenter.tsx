import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Bell, 
  DollarSign, 
  CheckSquare, 
  MessageCircle, 
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
  Settings
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'transaction' | 'task' | 'message' | 'system' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: any;
}

export default function NotificationCenter() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'success',
      category: 'transaction',
      title: 'Payment Received',
      message: 'New payment of ₱15,000 from ABC Corp has been recorded',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      isRead: false,
      metadata: { amount: 15000, currency: 'PHP', client: 'ABC Corp' }
    },
    {
      id: '2',
      type: 'warning',
      category: 'task',
      title: 'Task Due Soon',
      message: 'Website update task is due in 2 hours',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      isRead: false,
      metadata: { taskId: '123', dueDate: '2024-12-05T16:00:00Z' }
    },
    {
      id: '3',
      type: 'info',
      category: 'message',
      title: 'New Message',
      message: 'Lyn sent you a message about Q4 planning',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      isRead: false,
      metadata: { senderId: 'lyn', messageId: '456' }
    },
    {
      id: '4',
      type: 'info',
      category: 'reminder',
      title: 'Upcoming Meeting',
      message: 'Client meeting with XYZ Ltd scheduled for tomorrow at 2 PM',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
      isRead: true,
      metadata: { eventId: '789', date: '2024-12-06T14:00:00Z' }
    },
    {
      id: '5',
      type: 'success',
      category: 'system',
      title: 'Backup Completed',
      message: 'Your business data has been successfully backed up',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
      isRead: true,
      metadata: { backupSize: '2.4GB', location: 'cloud' }
    }
  ];

  useEffect(() => {
    setNotifications(mockNotifications);
    
    // Set up real-time notifications subscription
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          console.log('New notification:', payload);
          // Handle real-time notifications here
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
  };

  const getNotificationIcon = (category: string, type: string) => {
    switch (category) {
      case 'transaction': return DollarSign;
      case 'task': return CheckSquare;
      case 'message': return MessageCircle;
      case 'reminder': return Calendar;
      case 'system': 
        switch (type) {
          case 'success': return CheckCircle;
          case 'warning': return AlertTriangle;
          case 'error': return AlertTriangle;
          default: return Info;
        }
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-destructive';
      default: return 'text-primary';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.actionUrl) {
      // Navigate to the relevant page
      console.log('Navigate to:', notification.actionUrl);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Notifications</CardTitle>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </CardHeader>
          
          <ScrollArea className="max-h-96">
            <CardContent className="pt-0 space-y-1">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                  <p className="text-sm">You're all caught up!</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.category, notification.type);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent/50 ${
                        !notification.isRead ? 'bg-accent/30' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-muted/50 ${getNotificationColor(notification.type)}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-medium ${!notification.isRead ? 'font-semibold' : ''}`}>
                              {notification.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                            </p>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 p-1 h-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full absolute right-3 top-3"></div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </ScrollArea>
          
          {notifications.length > 0 && (
            <div className="border-t p-3">
              <Button variant="ghost" className="w-full text-sm">
                View all notifications
              </Button>
            </div>
          )}
        </Card>
      </PopoverContent>
    </Popover>
  );
}