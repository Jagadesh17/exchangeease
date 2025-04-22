-- Add foreign key relationships between messages and profiles tables
ALTER TABLE messages
ADD CONSTRAINT messages_sender_profile_fkey
FOREIGN KEY (sender_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

ALTER TABLE messages
ADD CONSTRAINT messages_receiver_profile_fkey
FOREIGN KEY (receiver_id)
REFERENCES profiles(id)
ON DELETE CASCADE; 