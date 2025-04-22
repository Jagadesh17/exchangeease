-- Create the interested_books table
CREATE TABLE IF NOT EXISTS public.interested_books (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, book_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.interested_books ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own interested books" ON public.interested_books;
    DROP POLICY IF EXISTS "Users can add books to their interests" ON public.interested_books;
    DROP POLICY IF EXISTS "Users can remove books from their interests" ON public.interested_books;
    
    -- Create new policies
    CREATE POLICY "Users can view their own interested books"
    ON public.interested_books FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

    CREATE POLICY "Users can add books to their interests"
    ON public.interested_books FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can remove books from their interests"
    ON public.interested_books FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
END $$;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS interested_books_user_id_idx ON public.interested_books(user_id);
CREATE INDEX IF NOT EXISTS interested_books_book_id_idx ON public.interested_books(book_id); 