import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, Tables } from "@/integrations/supabase/types";
import type { Database } from '@/integrations/supabase/types';

type BookWithProfile = Database['public']['Tables']['books']['Row'] & {
  profiles: Array<Database['public']['Tables']['profiles']['Row']>
};

type InterestedBookResponse = {
  book_id: string;
  books: {
    id: string;
    title: string;
    author: string;
    genre: string | null;
    condition: string;
    cover_url: string | null;
    user_id: string;
    profiles: Array<{
      name: string | null;
      profile_pic: string | null;
    }>;
  };
};

// Returns all books added by a user
export async function fetchMyBooks(userId: string) {
  if (!userId) {
    throw new Error('User ID is required to fetch books');
  }

  try {
    console.log('Fetching books for user:', userId);
    
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching books:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      console.log('No books found for user:', userId);
      return [];
    }

    console.log('Successfully fetched books:', data.length);
    return data;
  } catch (error) {
    console.error('Error in fetchMyBooks:', error);
    throw error;
  }
}

// Insert a new book for the current user
export async function addBook(book: Omit<TablesInsert<"books">, "user_id">, userId: string) {
  try {
    // Temporarily exclude exchange_method from the insert data
    const { exchange_method, ...insertData } = {
      ...book,
      user_id: userId,
    };

    console.log('Attempting to insert book without exchange_method:', insertData);
    
    const { data, error } = await supabase
      .from("books")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error inserting book:', error);
      throw new Error(error.message);
    }
    
    return data as Tables<"books">;
  } catch (err) {
    console.error('Error in addBook:', err);
    throw err;
  }
}

// Fetch all books from the database
export async function fetchAllBooks() {
  try {
    console.log('Fetching all books...');
    
    // Get all books
    const { data: books, error: booksError } = await supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false });

    if (booksError) {
      console.error("Error fetching books:", booksError);
      throw new Error(booksError.message);
    }

    if (!books) {
      console.log('No books found in the database');
      return [];
    }

    console.log('Successfully fetched books:', books.length);
    return books;
  } catch (err) {
    console.error("Error in fetchAllBooks:", err);
    throw err;
  }
}

// Fetch a single book by ID
export async function fetchBookById(bookId: string) {
  try {
    // Get the book
    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("*")
      .eq("id", bookId)
      .single();

    if (bookError) {
      console.error("Error fetching book:", bookError);
      throw new Error(bookError.message);
    }

    if (!book) {
      throw new Error("Book not found");
    }

    // Get the profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("name, profile_pic")
      .eq("id", book.user_id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
    }

    // Combine the data
    return {
      ...book,
      profiles: profile || null
    } as unknown as Tables<"books"> & {
      profiles: {
        name: string | null;
        profile_pic: string | null;
      } | null;
    };
  } catch (err) {
    console.error("Error in fetchBookById:", err);
    throw err;
  }
}

// Edit an existing book
export async function editBook(
  bookId: string,
  updates: Partial<Omit<TablesInsert<"books">, "user_id">>,
  userId: string
) {
  try {
    console.log('Attempting to edit book:', { bookId, updates, userId });

    // First verify the book belongs to the user
    const { data: existingBook, error: fetchError } = await supabase
      .from("books")
      .select("*")
      .eq("id", bookId)
      .single();

    if (fetchError) {
      console.error('Error fetching book for edit:', fetchError);
      throw new Error(fetchError.message);
    }
    if (!existingBook) {
      console.error('Book not found for edit:', bookId);
      throw new Error("Book not found");
    }
    if (existingBook.user_id !== userId) {
      console.error('User does not own this book');
      throw new Error("You can only edit your own books");
    }

    // Prepare update data
    const updateData = {
      title: updates.title || existingBook.title,
      author: updates.author || existingBook.author,
      genre: updates.genre || existingBook.genre,
      condition: updates.condition || existingBook.condition,
      location: updates.location || existingBook.location,
      exchange_method: updates.exchange_method || existingBook.exchange_method,
      description: updates.description || existingBook.description,
      isbn: updates.isbn || existingBook.isbn,
      exchange_notes: updates.exchange_notes || existingBook.exchange_notes,
    };

    console.log('Update data:', updateData);

    // Update the book
    const { data: updatedBook, error: updateError } = await supabase
      .from("books")
      .update(updateData)
      .eq("id", bookId)
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating book:', updateError);
      throw new Error(updateError.message);
    }

    console.log('Book updated successfully:', updatedBook);
    return updatedBook;
  } catch (err) {
    console.error("Error in editBook:", err);
    throw err;
  }
}

// Delete a book
export async function deleteBook(bookId: string, userId: string): Promise<boolean> {
  try {
    console.log('Starting delete operation for book:', { bookId, userId });

    // Step 1: Direct deletion attempt first
    const { error: directDeleteError } = await supabase
      .from("books")
      .delete()
      .eq("id", bookId)
      .eq("user_id", userId);

    if (directDeleteError) {
      console.error('Direct deletion error:', directDeleteError);
      
      // If there's a permission error, let's verify the book exists and belongs to the user
      const { data: book, error: fetchError } = await supabase
        .from("books")
        .select("user_id")
        .eq("id", bookId)
        .single();

      if (fetchError) {
        console.error('Error fetching book:', fetchError);
        throw new Error('Could not verify book ownership');
      }

      if (!book) {
        throw new Error('Book not found');
      }

      if (book.user_id !== userId) {
        throw new Error('You can only delete your own books');
      }

      // If we get here, there's a different issue with deletion
      throw new Error(directDeleteError.message);
    }

    // Step 2: Verify the deletion
    const { data: checkBook } = await supabase
      .from("books")
      .select("id")
      .eq("id", bookId)
      .maybeSingle();

    if (checkBook) {
      console.error('Book still exists after deletion:', checkBook);
      throw new Error('Failed to delete the book from the database');
    }

    console.log('Book successfully deleted from database');
    return true;

  } catch (err) {
    console.error('Delete operation failed:', err);
    throw err;
  }
}

// Add or remove book from interests
export async function toggleBookInterest(bookId: string, userId: string): Promise<boolean> {
  try {
    console.log('Toggling book interest:', { bookId, userId });

    // First check if the book is already in interests
    const { data: existingInterest, error: checkError } = await supabase
      .from('interested_books')
      .select('*')
      .eq('book_id', bookId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking interest:', checkError);
      throw new Error(checkError.message);
    }

    if (existingInterest) {
      // Remove interest
      const { error: deleteError } = await supabase
        .from('interested_books')
        .delete()
        .eq('book_id', bookId)
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Error removing interest:', deleteError);
        throw new Error(deleteError.message);
      }

      console.log('Interest removed successfully');
      return false;
    } else {
      // Add interest
      const { error: insertError } = await supabase
        .from('interested_books')
        .insert([{ book_id: bookId, user_id: userId }]);

      if (insertError) {
        console.error('Error adding interest:', insertError);
        throw new Error(insertError.message);
      }

      console.log('Interest added successfully');
      return true;
    }
  } catch (err) {
    console.error('Error in toggleBookInterest:', err);
    throw err;
  }
}

// Check if user is interested in a book
export async function checkBookInterest(bookId: string, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('interested_books')
      .select('*')
      .eq('book_id', bookId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error checking book interest:', error);
      throw new Error(error.message);
    }

    return !!data;
  } catch (err) {
    console.error('Error in checkBookInterest:', err);
    throw err;
  }
}

// Fetch user's interested books
export async function fetchInterestedBooks(userId: string) {
  try {
    console.log('Fetching interested books for user:', userId);
    
    const { data: rawData, error } = await supabase
      .from('interested_books')
      .select(`
        book_id,
        books_with_profiles!inner (
          id,
          title,
          author,
          genre,
          condition,
          cover_url,
          user_id,
          name,
          profile_pic
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching interested books:', error);
      throw new Error(error.message);
    }

    if (!rawData) {
      console.log('No interested books found');
      return [];
    }

    // Transform the data to match expected format
    const formattedBooks = rawData.map(item => ({
      id: item.books_with_profiles.id,
      title: item.books_with_profiles.title,
      author: item.books_with_profiles.author,
      cover: item.books_with_profiles.cover_url || '/placeholder.svg',
      condition: item.books_with_profiles.condition as "New" | "Good" | "Worn",
      genre: item.books_with_profiles.genre || 'Unknown',
      owner: {
        name: item.books_with_profiles.name || 'Unknown User',
        avatar: item.books_with_profiles.profile_pic || '/placeholder.svg',
        rating: 5,
      },
    }));

    console.log('Successfully fetched interested books:', formattedBooks.length);
    return formattedBooks;
  } catch (err) {
    console.error('Error in fetchInterestedBooks:', err);
    throw err;
  }
}
