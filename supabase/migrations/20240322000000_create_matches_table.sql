-- Create matches table if it doesn't exist
CREATE TABLE IF NOT EXISTS matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_requested_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    book_offered_id UUID REFERENCES books(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own matches (either as requester or book owner)
CREATE POLICY "Users can view their own matches"
    ON matches FOR SELECT
    USING (
        auth.uid() = requester_id
        OR 
        EXISTS (
            SELECT 1 FROM books 
            WHERE books.id = matches.book_requested_id 
            AND books.user_id = auth.uid()
        )
    );

-- Policy to allow users to create match requests
CREATE POLICY "Users can create match requests"
    ON matches FOR INSERT
    WITH CHECK (
        auth.uid() = requester_id
        AND
        NOT EXISTS (
            SELECT 1 FROM books 
            WHERE books.id = book_requested_id 
            AND books.user_id = auth.uid()
        )
    );

-- Policy to allow users to update matches for their books
CREATE POLICY "Users can update matches for their books"
    ON matches FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM books 
            WHERE books.id = matches.book_requested_id 
            AND books.user_id = auth.uid()
        )
    );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 