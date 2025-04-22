-- First, drop existing foreign key constraints
ALTER TABLE matches
DROP CONSTRAINT IF EXISTS matches_book_requested_id_fkey,
DROP CONSTRAINT IF EXISTS matches_book_offered_id_fkey;

-- Re-add the constraints with ON DELETE CASCADE
ALTER TABLE matches
ADD CONSTRAINT matches_book_requested_id_fkey
    FOREIGN KEY (book_requested_id)
    REFERENCES books(id)
    ON DELETE CASCADE;

ALTER TABLE matches
ADD CONSTRAINT matches_book_offered_id_fkey
    FOREIGN KEY (book_offered_id)
    REFERENCES books(id)
    ON DELETE CASCADE; 