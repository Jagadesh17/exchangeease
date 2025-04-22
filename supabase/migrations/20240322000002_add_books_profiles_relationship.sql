-- Add foreign key from books to profiles
ALTER TABLE books
ADD CONSTRAINT books_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Create a view that joins books with profiles
CREATE OR REPLACE VIEW books_with_profiles AS
SELECT 
    b.*,
    p.name,
    p.profile_pic
FROM books b
LEFT JOIN profiles p ON b.user_id = p.id; 