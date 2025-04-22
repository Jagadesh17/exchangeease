import { supabase } from "@/integrations/supabase/client";

export interface UserStats {
  booksListed: number;
  successfulSwaps: number;
  memberSince: string;
  books: Array<{
    id: string;
    title: string;
    author: string;
    cover_url: string;
    condition: string;
    genre: string;
    created_at: string;
  }>;
}

export async function fetchUserStats(userId: string): Promise<UserStats> {
  try {
    // Get user's books with count
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (booksError) throw booksError;

    // First get the user's book IDs
    const userBookIds = books?.map(book => book.id) || [];

    // Get count of successful matches (both as requester and book owner)
    const { data: matches, error: swapsError } = await supabase
      .from('matches')
      .select('id')
      .eq('status', 'completed')
      .or(`requester_id.eq.${userId},book_requested_id.in.(${userBookIds.join(',')})`);

    if (swapsError) throw swapsError;

    // Get user's join date
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Format the member since date with the exact date
    const memberSince = new Date(userData.created_at).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    return {
      booksListed: books?.length || 0,
      successfulSwaps: matches?.length || 0,
      memberSince,
      books: books || []
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
} 