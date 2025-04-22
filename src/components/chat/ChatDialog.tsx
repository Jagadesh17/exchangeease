'use client';

import { ChatBox } from "./ChatBox";

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export function ChatDialog({ isOpen, onClose, userId, userName }: ChatDialogProps) {
  return (
    <ChatBox 
      userId={userId} 
      userName={userName} 
      isOpen={isOpen} 
      onClose={onClose}
    />
  );
} 