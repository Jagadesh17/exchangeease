-- Create enum type for exchange method
CREATE TYPE exchange_method_type AS ENUM ('In Person', 'Mail', 'Both');

-- Add exchange_method column to books table
ALTER TABLE books ADD COLUMN exchange_method exchange_method_type DEFAULT 'In Person';

-- Update the RLS policy to include the new column
DROP POLICY IF EXISTS "Users can update their own books" ON books;
CREATE POLICY "Users can update their own books"
ON books FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Update the insert policy to include the new column
DROP POLICY IF EXISTS "Users can insert their own books" ON books;
CREATE POLICY "Users can insert their own books"
ON books FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Update the select policy to include the new column
DROP POLICY IF EXISTS "Books are viewable by everyone" ON books;
CREATE POLICY "Books are viewable by everyone"
ON books FOR SELECT
USING (true);

-- Update the delete policy to include the new column
DROP POLICY IF EXISTS "Users can delete their own books" ON books;
CREATE POLICY "Users can delete their own books"
ON books FOR DELETE
USING (auth.uid() = user_id); 