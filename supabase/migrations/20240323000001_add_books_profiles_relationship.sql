-- Drop existing view if it exists
DROP VIEW IF EXISTS public.books_with_profiles;

-- Add foreign key relationship between books and profiles
ALTER TABLE books
ADD CONSTRAINT books_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Create a view to join books with profiles
CREATE OR REPLACE VIEW public.books_with_profiles AS
SELECT 
    b.id,
    b.title,
    b.author,
    b.cover_url,
    b.condition,
    b.genre,
    b.user_id,
    b.created_at,
    b.updated_at,
    b.exchange_method,
    b.exchange_notes,
    p.name as owner_name,
    p.profile_pic as owner_profile_pic,
    p.location as owner_location
FROM 
    public.books b
LEFT JOIN 
    public.profiles p ON p.id = b.user_id;

-- Update the RLS policies to use the new view
CREATE POLICY "Anyone can view books with profiles"
    ON public.books_with_profiles
    FOR SELECT
    USING (true);

-- Grant necessary permissions
GRANT SELECT ON public.books_with_profiles TO authenticated;
GRANT SELECT ON public.books_with_profiles TO anon; 