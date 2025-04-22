import { supabase } from "@/integrations/supabase/client";

// Function to send a message
export async function sendMessage(senderId: string, receiverId: string, content: string) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        read: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

// Function to fetch conversation between two users
export async function fetchConversation(userId: string, otherUserId: string) {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // After getting messages, fetch user profiles
    const userIds = new Set([userId, otherUserId]);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, profile_pic')
      .in('id', Array.from(userIds));

    if (profilesError) throw profilesError;

    // Create a map of user profiles
    const profileMap = new Map(profiles?.map(profile => [profile.id, profile]));

    // Combine messages with profile information
    const messagesWithProfiles = messages?.map(message => ({
      ...message,
      sender: profileMap.get(message.sender_id),
      receiver: profileMap.get(message.receiver_id)
    })) || [];

    // Mark received messages as read
    const unreadMessages = messages?.filter(
      msg => msg.receiver_id === userId && !msg.read
    ) || [];

    if (unreadMessages.length > 0) {
      await markMessagesAsRead(userId, otherUserId);
    }

    return messagesWithProfiles;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
}

// Function to mark messages as read
export async function markMessagesAsRead(userId: string, senderId: string) {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('receiver_id', userId)
      .eq('sender_id', senderId)
      .eq('read', false);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
}

// Function to get unread message count
export async function getUnreadMessageCount(userId: string) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('receiver_id', userId)
      .eq('read', false);

    if (error) throw error;
    return data?.length || 0;
  } catch (error) {
    console.error('Error getting unread message count:', error);
    throw error;
  }
}

// Subscribe to real-time message updates
export function subscribeToMessages(userId: string, onUpdate: (payload: any) => void) {
  const subscription = supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`
      },
      onUpdate
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
} 