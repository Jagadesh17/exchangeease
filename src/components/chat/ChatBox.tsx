'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { fetchConversation, sendMessage, subscribeToMessages } from '@/utils/messages';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  read: boolean;
  sender?: {
    id: string;
    name: string;
    profile_pic: string | null;
  };
  receiver?: {
    id: string;
    name: string;
    profile_pic: string | null;
  };
}

interface ChatBoxProps {
  userId: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatBox({ userId, userName, isOpen, onClose }: ChatBoxProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!user) return;
    try {
      const data = await fetchConversation(user.id, userId);
      setMessages(data);
      setLoading(false);
      scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      loadMessages();
      const unsubscribe = subscribeToMessages(user.id, (payload) => {
        if (payload.new && (
          payload.new.sender_id === userId ||
          payload.new.receiver_id === userId
        )) {
          setMessages(prev => [...prev, payload.new as Message]);
          scrollToBottom();
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, [isOpen, user, userId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    try {
      await sendMessage(user.id, userId, newMessage.trim());
      setNewMessage('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl h-[80vh] flex flex-col gap-0 p-0"
        aria-describedby="chat-description"
      >
        <DialogHeader className="px-4 py-2 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={userName || 'User'} />
                <AvatarFallback>
                  {userName ? userName[0]?.toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <DialogTitle className="font-semibold">
                {userName || 'User'}
              </DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close chat</span>
            </Button>
          </div>
          <DialogDescription id="chat-description">
            Chat conversation with {userName || 'User'}
          </DialogDescription>
        </DialogHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <span className="text-muted-foreground">Loading messages...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <span className="text-muted-foreground">No messages yet</span>
              </div>
            ) : (
              messages.map((message) => {
                const isCurrentUser = message.sender_id === user?.id;
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2",
                      isCurrentUser ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage
                        src={
                          isCurrentUser
                            ? user?.user_metadata?.avatar_url || ""
                            : message.sender?.profile_pic || ""
                        }
                        alt={
                          isCurrentUser
                            ? user?.user_metadata?.name || "You"
                            : message.sender?.name || "User"
                        }
                      />
                      <AvatarFallback>
                        {isCurrentUser
                          ? (user?.user_metadata?.name?.[0] || "Y").toUpperCase()
                          : (message.sender?.name?.[0] || "U").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "rounded-lg px-3 py-2 max-w-[80%]",
                        isCurrentUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                      <span className="text-xs opacity-70">
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="border-t p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 