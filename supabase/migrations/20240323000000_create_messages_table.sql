-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy for viewing messages (users can view messages they sent or received)
CREATE POLICY "Users can view their own messages"
ON messages FOR SELECT
TO authenticated
USING (
    auth.uid() = sender_id OR
    auth.uid() = receiver_id
);

-- Policy for sending messages
CREATE POLICY "Users can send messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = sender_id
);

-- Policy for marking messages as read
CREATE POLICY "Users can mark received messages as read"
ON messages FOR UPDATE
TO authenticated
USING (
    auth.uid() = receiver_id
)
WITH CHECK (
    auth.uid() = receiver_id AND
    read = true
);

-- Create indexes for better performance
CREATE INDEX messages_sender_id_idx ON messages(sender_id);
CREATE INDEX messages_receiver_id_idx ON messages(receiver_id);
CREATE INDEX messages_created_at_idx ON messages(created_at); 