
"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Send, MessagesSquare } from 'lucide-react';
import { useAuthContext } from '@/hooks/use-auth';
import { useEffect, useState, useRef } from 'react';
import { getPartnerProfile } from '@/ai/flows/user-profile-flow';
import { addChatMessage, getChatId } from '@/ai/flows/chat-flow';
import { getChatMessages } from '@/services/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { format, formatDistanceToNowStrict } from 'date-fns';

const FIVE_MINUTES = 5 * 60 * 1000;

export default function ChatPage() {
  const { user } = useAuthContext();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const fetchPartnerAndChat = async () => {
    if (user && user.partnerId) {
      try {
        const partnerProfile = await getPartnerProfile(user.id);
        setPartner(partnerProfile);
        const id = await getChatId({ userId1: user.id, userId2: user.partnerId });
        setChatId(id);
      } catch (error) {
        console.error("Failed to fetch partner or chat info", error);
      }
    }
    setLoading(false);
  };
  
  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchPartnerAndChat();
    }
  }, [user]);

  useEffect(() => {
    let unsubscribeMessages: () => void | undefined;
    if (chatId) {
      unsubscribeMessages = getChatMessages(chatId, (newMessages) => {
        setMessages(newMessages);
      });
    }
    
    // Periodically refresh partner data to update 'lastSeen'
    const intervalId = setInterval(() => {
        fetchPartnerAndChat();
    }, 60000); // every minute

    return () => {
      if (unsubscribeMessages) {
        unsubscribeMessages();
      }
      clearInterval(intervalId);
    };
  }, [chatId]);


  useEffect(() => {
    // Scroll to bottom when messages change
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
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

  const getPartnerStatus = () => {
    if (!partner || !partner.lastSeen) return <span className="text-sm text-muted-foreground">Offline</span>;

    const lastSeenDate = new Date(partner.lastSeen);
    const now = new Date();
    const isOnline = now.getTime() - lastSeenDate.getTime() < FIVE_MINUTES;

    if (isOnline) {
      return <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-green-500"/><span className="text-sm text-muted-foreground">Online</span></div>;
    }

    return <span className="text-sm text-muted-foreground">Last seen {formatDistanceToNowStrict(lastSeenDate, { addSuffix: true })}</span>;
  }

  if (loading) {
    return (
        <div className="flex flex-1 self-stretch flex-col border rounded-lg">
            <div className="flex items-center gap-4 border-b p-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
            <div className="flex-1 p-4 space-y-6 overflow-y-auto">
                <div className="flex items-end gap-2 justify-start">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-12 w-48 rounded-lg" />
                </div>
                 <div className="flex items-end gap-2 justify-end">
                    <Skeleton className="h-16 w-64 rounded-lg" />
                </div>
                <div className="flex items-end gap-2 justify-start">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-10 w-32 rounded-lg" />
                </div>
            </div>
            <div className="flex items-center gap-2 border-t p-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-10" />
            </div>
        </div>
    );
  }

  if (!partner) {
     return (
        <div className="flex flex-1 self-stretch flex-col items-center justify-center text-center rounded-lg border-2 border-dashed">
            <MessagesSquare className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Partner Linked</h3>
            <p className="mt-2 text-sm text-muted-foreground">Link with a partner on your profile page to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 self-stretch flex-col border rounded-lg">
      <div className="flex items-center gap-4 border-b p-4">
        <Avatar>
          <AvatarImage src={partner.photoUrl} alt={partner.name} data-ai-hint="person smiling" />
          <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold">{partner.name}</h2>
          {getPartnerStatus()}
        </div>
      </div>
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4 space-y-6" ref={viewportRef}>
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
                    : 'rounded-bl-none bg-card border'
                )}
              >
                <p className="text-sm break-words">{message.text}</p>
                 <p className={cn("mt-1 text-right text-xs",  message.senderId === user.id ? "text-primary-foreground/80" : "text-muted-foreground/80")}>
                  {format(new Date(message.createdAt), "p")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t bg-background p-2 md:p-4">
        <form className="flex items-center gap-2" onSubmit={handleSendMessage}>
          <Input
            placeholder="Type a message..."
            className="flex-1"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
