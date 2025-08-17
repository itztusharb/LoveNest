
"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Bell, UserPlus, X } from "lucide-react"
import { useEffect, useState } from "react";
import { getNotifications, respondToLinkRequest } from "@/ai/flows/notification-flow";
import { useToast } from "@/hooks/use-toast";
import type { Notification } from "@/ai/schemas/notification-schema";
import { Badge } from "@/components/ui/badge";

export function Notifications({ userId }: { userId: string }) {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isResponding, setIsResponding] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      const fetchedNotifications = await getNotifications(userId);
      setNotifications(fetchedNotifications);
      setUnreadCount(fetchedNotifications.filter(n => !n.isRead).length);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  const handleResponse = async (linkRequestId: string, notificationId: string, response: 'accepted' | 'declined') => {
    setIsResponding(notificationId);
    try {
      await respondToLinkRequest({ linkRequestId, notificationId, response });
      toast({
        title: 'Success',
        description: `Request ${response}.`,
      });
      fetchNotifications(); // Refresh notifications
    } catch (error) {
      console.error("Failed to respond to request", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not process your response.',
      });
    } finally {
        setIsResponding(null);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">{unreadCount}</Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Notifications</h4>
            <p className="text-sm text-muted-foreground">
              You have {notifications.length} new messages.
            </p>
          </div>
          <div className="grid gap-2">
            {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No new notifications.</p>
            ) : (
                notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className="mb-2 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
                    >
                        <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                        <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">
                            {notification.type === 'link_request' ? 'Partner Request' : 'Notification'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {notification.data.fromUserName} wants to link with you.
                        </p>
                        {notification.type === 'link_request' && notification.linkRequestId && (
                            <div className="flex gap-2 mt-2">
                                <Button size="sm" onClick={() => handleResponse(notification.linkRequestId!, notification.id, 'accepted')} disabled={!!isResponding}>
                                    {isResponding === notification.id ? 'Accepting...': 'Accept'}
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleResponse(notification.linkRequestId!, notification.id, 'declined')} disabled={!!isResponding}>
                                    {isResponding === notification.id ? 'Declining...': 'Decline'}
                                </Button>
                            </div>
                        )}
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
