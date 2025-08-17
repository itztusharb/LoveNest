
"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Send } from 'lucide-react';
import { useAuthContext } from '@/hooks/use-auth';
import { useEffect, useState, useRef } from 'react';
import { getPartnerProfile } from '@/ai/flows/user-profile-flow';
import { addChatMessage, getChatId } from '@/ai/flows/chat-flow';
import { getChatMessages } from '@/services/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function ChatPage() {
  const { user } = useAuthContext();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      const fetchPartnerAndChat = async () => {
        setLoading(true);
        try {
          if (user.partnerId) {
            const partnerProfile = await getPartnerProfile(user.id);
            setPartner(partnerProfile);
            const id = await getChatId({ userId1: user.id, userId2: user.partnerId });
            setChatId(id);
          }
        } catch (error) {
          console.error("Failed to fetch partner or chat info", error);
        } finally {
          setLoading(false);
        }
      };
      fetchPartnerAndChat();
    }
  }, [user]);

  useEffect(() => {
    if (chatId) {
      const unsubscribe = getChatMessages(chatId, (newMessages) => {
        setMessages(newMessages);
      });
      return () => unsubscribe();
    }
  }, [chatId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
        const scrollableView = scrollAreaRef.current.querySelector('div');
        if (scrollableView) {
            scrollableView.scrollTop = scrollableView.scrollHeight;
        }
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !user.partnerId) return;

    try {
      await addChatMessage({
        userId1: user.id,
        userId2: user.partnerId,
        senderId: user.id,
        text: newMessage,
      });
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  if (loading) {
    return (
        <div className="flex h-[calc(100vh-8rem)] flex-col">
            <div className="flex items-center gap-4 border-b p-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
            <div className="flex-1 p-4 space-y-4">
                <Skeleton className="h-16 w-3/4 rounded-lg" />
                <Skeleton className="h-16 w-3/4 rounded-lg self-end ml-auto" />
                <Skeleton className="h-12 w-1/2 rounded-lg" />
            </div>
            <div className="border-t p-4">
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    );
  }

  if (!partner) {
     return (
      <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center text-center">
        <p className="text-lg font-semibold">No Partner Linked</p>
        <p className="text-muted-foreground">Please link with a partner to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="flex items-center gap-4 border-b p-4">
        <Avatar>
          <AvatarImage src={partner.photoUrl} alt={partner.name} data-ai-hint="person smiling" />
          <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold">{partner.name}</h2>
          {/* You might want to implement a real presence system later */}
          <p className="text-sm text-muted-foreground">Online</p>
        </div>
      </div>
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-end gap-2',
                message.senderId === user.id ? 'justify-end' : 'justify-start'
              )}
            >
              {message.senderId !== user.id && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={partner.photoUrl} alt={partner.name} data-ai-hint="person smiling" />
                  <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-xs rounded-lg p-3 lg:max-w-md',
                  message.senderId === user.id
                    ? 'rounded-br-none bg-primary text-primary-foreground'
                    : 'rounded-bl-none bg-card'
                )}
              >
                <p className="text-sm">{message.text}</p>
                 <p className="mt-1 text-right text-xs text-muted-foreground/80">
                  {format(new Date(message.createdAt), "p")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <form className="flex items-center gap-2" onSubmit={handleSendMessage}>
          <Input
            placeholder="Type a message..."
            className="flex-1"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
