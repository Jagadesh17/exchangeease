import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Function to request a match
export async function requestMatch(bookRequestedId: string, bookOfferedId: string | null, userId: string) {
  try {
    console.log('Starting match request:', { bookRequestedId, bookOfferedId, userId });

    // First check if we can connect to Supabase
    const { error: healthCheckError } = await supabase
      .from('books')
      .select('count')
      .limit(1);

    if (healthCheckError) {
      console.error('Supabase connection error:', healthCheckError);
      throw new Error(`Failed to connect to database: ${healthCheckError.message}`);
    }

    // Check if a match request already exists
    const { data: existingMatch, error: existingMatchError } = await supabase
      .from('matches')
      .select('*')
      .eq('requester_id', userId)
      .eq('book_requested_id', bookRequestedId)
      .single();

    if (existingMatchError) {
      console.error('Error checking existing match:', existingMatchError);
      if (existingMatchError.code === '42P01') {
        throw new Error('The matches table does not exist. Please ensure the database is properly set up.');
      }
      if (existingMatchError.code === 'PGRST116') {
        // This error means no match was found, which is what we want
        console.log('No existing match found, proceeding with creation');
      } else {
        throw existingMatchError;
      }
    }

    if (existingMatch) {
      console.log('Found existing match:', existingMatch);
      throw new Error('You have already requested this book');
    }

    // Verify the book exists and is available
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookRequestedId)
      .single();

    if (bookError) {
      console.error('Error checking book:', bookError);
      throw new Error('Could not verify book availability');
    }

    if (!book) {
      throw new Error('The requested book does not exist');
    }

    if (book.user_id === userId) {
      throw new Error('You cannot request your own book');
    }

    console.log('Creating new match request...');
    // Create new match request
    const { data, error } = await supabase
      .from('matches')
      .insert({
        requester_id: userId,
        book_requested_id: bookRequestedId,
        book_offered_id: bookOfferedId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating match:', error);
      if (error.code === '42P01') {
        throw new Error('The matches table does not exist. Please ensure the database is properly set up.');
      }
      if (error.code === '23503') {
        throw new Error('Invalid book or user reference');
      }
      throw error;
    }

    console.log('Match request created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in requestMatch:', error);
    throw error;
  }
}

// Function to respond to a match request
export async function respondToMatch(matchId: string, status: 'accepted' | 'declined', userId: string) {
  try {
    // Verify the match exists and is for the current user's book
    const { data: match } = await supabase
      .from('matches')
      .select('*, books!book_requested_id(*)')
      .eq('id', matchId)
      .single();

    if (!match) {
      throw new Error('Match not found');
    }

    if (match.books.user_id !== userId) {
      throw new Error('You are not authorized to respond to this match');
    }

    // Update match status
    const { data, error } = await supabase
      .from('matches')
      .update({ status })
      .eq('id', matchId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error responding to match:', error);
    throw error;
  }
}

// Function to get all matches for a user (both requested and received)
export async function fetchUserMatches(userId: string) {
  try {
    console.log('Fetching matches for user:', userId);

    // Get matches where user is the requester
    const { data: requestedMatches, error: requestedError } = await supabase
      .from('matches')
      .select(`
        *,
        requested_book:books!book_requested_id(
          *,
          profiles:profiles(*)
        ),
        offered_book:books!book_offered_id(
          *,
          profiles:profiles(*)
        )
      `)
      .eq('requester_id', userId);

    if (requestedError) {
      console.error('Error fetching requested matches:', requestedError);
      if (requestedError.code === '42P01') {
        throw new Error('The matches table does not exist. Please ensure the database is properly set up.');
      }
      throw requestedError;
    }

    console.log('Requested matches:', requestedMatches);

    // Get matches where user owns the requested book
    const { data: receivedMatches, error: receivedError } = await supabase
      .from('matches')
      .select(`
        *,
        requested_book:books!book_requested_id(
          *,
          profiles:profiles(*)
        ),
        offered_book:books!book_offered_id(
          *,
          profiles:profiles(*)
        )
      `)
      .eq('requested_book.user_id', userId);

    if (receivedError) {
      console.error('Error fetching received matches:', receivedError);
      if (receivedError.code === '42P01') {
        throw new Error('The matches table does not exist. Please ensure the database is properly set up.');
      }
      throw receivedError;
    }

    console.log('Received matches:', receivedMatches);

    // Check if matches table exists by attempting a simple query
    const { error: tableCheckError } = await supabase
      .from('matches')
      .select('count')
      .limit(1);

    if (tableCheckError && tableCheckError.code === '42P01') {
      throw new Error('The matches table does not exist. Please ensure the database is properly set up.');
    }

    return {
      requested: requestedMatches || [],
      received: receivedMatches || []
    };
  } catch (error) {
    console.error('Error in fetchUserMatches:', error);
    // Add more context to the error
    if (error instanceof Error) {
      throw new Error(`Failed to fetch matches: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while fetching matches');
  }
}

// Subscribe to real-time match updates
export function subscribeToMatches(userId: string, onUpdate: (payload: any) => void) {
  const subscription = supabase
    .channel('matches')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'matches',
        filter: `requester_id=eq.${userId}`
      },
      onUpdate
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
} 