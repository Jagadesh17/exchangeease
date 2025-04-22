-- Enable RLS on matches table
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Policy for inserting match requests
CREATE POLICY "Users can create match requests"
ON matches FOR INSERT
TO authenticated
WITH CHECK (
  requester_id = auth.uid()
);

-- Policy for viewing matches
CREATE POLICY "Users can view their own match requests and matches for their books"
ON matches FOR SELECT
TO authenticated
USING (
  requester_id = auth.uid() OR
  book_requested_id IN (
    SELECT id FROM books WHERE user_id = auth.uid()
  )
);

-- Policy for updating match status
CREATE POLICY "Book owners can update match status"
ON matches FOR UPDATE
TO authenticated
USING (
  book_requested_id IN (
    SELECT id FROM books WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  book_requested_id IN (
    SELECT id FROM books WHERE user_id = auth.uid()
  )
);

-- Policy for deleting matches
CREATE POLICY "Users can delete their own match requests"
ON matches FOR DELETE
TO authenticated
USING (
  requester_id = auth.uid()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    read BOOLEAN DEFAULT false NOT NULL
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their notifications
CREATE POLICY notifications_select_policy ON notifications
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Create policy to allow the system to create notifications
CREATE POLICY notifications_insert_policy ON notifications
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Create policy to allow users to mark their notifications as read
CREATE POLICY notifications_update_policy ON notifications
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid()); 