-- Create a function to delete all matches related to a book
CREATE OR REPLACE FUNCTION delete_book_matches(book_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete matches where the book is either requested or offered
    DELETE FROM matches
    WHERE book_requested_id = book_id
    OR book_offered_id = book_id;
END;
$$; 