-- Add foreign key from books to profiles
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'books_user_id_fkey'
    ) THEN
        ALTER TABLE books
        ADD CONSTRAINT books_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key from matches to profiles for requester_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'matches_requester_id_fkey'
    ) THEN
        ALTER TABLE matches
        ADD CONSTRAINT matches_requester_id_fkey
        FOREIGN KEY (requester_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign keys from matches to books
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'matches_book_requested_id_fkey'
    ) THEN
        ALTER TABLE matches
        ADD CONSTRAINT matches_book_requested_id_fkey
        FOREIGN KEY (book_requested_id)
        REFERENCES books(id)
        ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'matches_book_offered_id_fkey'
    ) THEN
        ALTER TABLE matches
        ADD CONSTRAINT matches_book_offered_id_fkey
        FOREIGN KEY (book_offered_id)
        REFERENCES books(id)
        ON DELETE SET NULL;
    END IF;
END $$; 