-- Step 1: Create the table
CREATE TABLE IF NOT EXISTS interested_books (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE CASCADE,
    book_id uuid REFERENCES books ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT interested_books_unique UNIQUE (user_id, book_id)
);

-- Step 2: Enable RLS
ALTER TABLE interested_books ENABLE ROW LEVEL SECURITY;

-- Step 3: Create basic policies
CREATE POLICY "Enable all operations for authenticated users"
ON interested_books
FOR ALL
TO authenticated
USING (auth.uid() = user_id); 