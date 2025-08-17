
"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Send } from 'lucide-react';

const chatMessages = [
  {
    id: 1,
    sender: 'partner',
    text: 'Hey! How was your day?',
    time: '5:01 PM',
  },
  {
    id: 2,
    sender: 'me',
    text: 'It was great! Finally finished that big project at work.',
    time: '5:02 PM',
  },
  {
    id: 3,
    sender: 'partner',
    text: 'That\'s amazing! We should celebrate tonight. What are you thinking for dinner?',
    time: '5:02 PM',
  },
  {
    id: 4,
    sender: 'me',
    text: 'I was thinking of trying that new Italian place downtown!',
    time: '5:03 PM',
  },
  {
    id: 5,
    sender: 'partner',
    text: 'Perfect! I\'ll make a reservation. Can\'t wait to see you. ❤️',
    time: '5:04 PM',
  },
];


export default function ChatPage() {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="flex items-center gap-4 border-b p-4">
        <Avatar>
          <AvatarImage src="https://placehold.co/40x40.png" alt="Partner" data-ai-hint="man smiling" />
          <AvatarFallback>P</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold">My Partner</h2>
          <p className="text-sm text-muted-foreground">Online</p>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-end gap-2',
                message.sender === 'me' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.sender === 'partner' && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://placehold.co/40x40.png" alt="Partner" data-ai-hint="man smiling" />
                  <AvatarFallback>P</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-xs rounded-lg p-3 lg:max-w-md',
                  message.sender === 'me'
                    ? 'rounded-br-none bg-primary text-primary-foreground'
                    : 'rounded-bl-none bg-card'
                )}
              >
                <p className="text-sm">{message.text}</p>
                <p className="mt-1 text-right text-xs text-muted-foreground/80">
                  {message.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <form className="flex items-center gap-2">
          <Input placeholder="Type a message..." className="flex-1" />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
