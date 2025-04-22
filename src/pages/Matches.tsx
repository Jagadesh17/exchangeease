import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Check, MessageCircle, Star, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ChatDialog } from "@/components/chat/ChatDialog";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";
import { fetchUserMatches, respondToMatch, subscribeToMatches } from "@/utils/matches";
import { supabase } from "@/integrations/supabase/client";

// Define a simplified book type for matches
interface MatchBookProps {
  id: string;
  title: string;
  author: string;
  cover: string;
  condition: 'New' | 'Good' | 'Worn';
  genre: string;
  user_id: string;
  owner_name: string;
}

interface DatabaseBook {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  condition: 'New' | 'Good' | 'Worn';
  genre: string;
  user_id: string;
}

interface DatabaseMatch {
  id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  requester_id: string;
  book_requested_id: string;
  book_offered_id: string | null;
  requested_book: DatabaseBook;
  offered_book: DatabaseBook | null;
  requester?: {
    id: string;
    name: string;
    profile_pic: string | null;
  };
}

interface UserProfile {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
    avatar_url?: string;
  };
}

interface MatchProps {
  id: string;
  status: 'pending' | 'accepted' | 'declined';
  requester: {
    id: string;
    name: string;
    avatar: string;
  };
  requested_book: MatchBookProps;
  offered_book?: MatchBookProps;
  created_at: string;
}

const Matches = () => {
  const { user } = useAuth();
  const [receivedMatches, setReceivedMatches] = useState<MatchProps[]>([]);
  const [requestedMatches, setRequestedMatches] = useState<MatchProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<{
    userId: string;
    userName: string;
  } | null>(null);

  // Debug logging for user state
  useEffect(() => {
    console.log('User state changed:', {
      userExists: !!user,
      userId: user?.id,
      userMetadata: user?.user_metadata,
      timestamp: new Date().toISOString()
    });
  }, [user]);

  // Load matches
  const loadMatches = async () => {
    console.log('loadMatches called with user state:', {
      userExists: !!user,
      userId: user?.id,
      userMetadata: user?.user_metadata,
      loading,
      timestamp: new Date().toISOString()
    });

    if (!user) {
      console.log('No user found, skipping match loading');
      setLoading(false);
      return;
    }

    if (!user.id) {
      console.error('User object exists but has no ID:', user);
      toast.error('Authentication error', {
        description: 'Please try logging out and back in'
      });
      setLoading(false);
      return;
    }
    
    try {
      console.log('Starting to load matches for user:', {
        userId: user.id,
        timestamp: new Date().toISOString()
      });

      // First, verify the matches table exists and we can access it
      console.log('Checking matches table access...');
      const { data: matchesCheck, error: matchesCheckError } = await supabase
        .from('matches')
        .select('id')
        .limit(1);

      if (matchesCheckError) {
        console.error('Error accessing matches table:', matchesCheckError);
        throw new Error(`Cannot access matches table: ${matchesCheckError.message}`);
      }

      console.log('Matches table check successful:', matchesCheck);

      // Now check books table
      console.log('Checking books table access...');
      const { data: booksCheck, error: booksCheckError } = await supabase
        .from('books')
        .select('id')
        .limit(1);

      if (booksCheckError) {
        console.error('Error accessing books table:', booksCheckError);
        throw new Error(`Cannot access books table: ${booksCheckError.message}`);
      }

      console.log('Books table check successful:', booksCheck);

      // Try a simple matches query first
      console.log('Fetching matches for user:', user.id);
      const { data: simpleMatches, error: simpleError } = await supabase
        .from('matches')
        .select('id, status, requester_id, book_requested_id')
        .eq('requester_id', user.id);

      if (simpleError) {
        console.error('Error with simple matches query:', simpleError);
        throw new Error(`Simple matches query failed: ${simpleError.message}`);
      }

      console.log('Simple matches query successful:', simpleMatches);

      // Now try with joined data
      const { data: requestedMatches, error: requestedError } = await supabase
        .from('matches')
        .select(`
          id,
          status,
          created_at,
          requester_id,
          book_requested_id,
          book_offered_id,
          requested_book:books!book_requested_id(id, title, author, cover_url, condition, genre, user_id),
          offered_book:books!book_offered_id(id, title, author, cover_url, condition, genre, user_id)
        `)
        .eq('requester_id', user.id);

      if (requestedError) {
        console.error('Error fetching requested matches:', {
          error: requestedError,
          details: requestedError.details,
          message: requestedError.message,
          hint: requestedError.hint,
          code: requestedError.code
        });
        throw new Error(`Failed to fetch requested matches: ${requestedError.message}`);
      }

      console.log('Requested matches:', requestedMatches);

      // Get matches where user owns the requested book
      const userBooksQuery = await supabase
        .from('books')
        .select('id')
        .eq('user_id', user.id);

      if (userBooksQuery.error) {
        console.error('Error fetching user books:', userBooksQuery.error);
        throw new Error(`Failed to fetch user books: ${userBooksQuery.error.message}`);
      }

      const userBookIds = userBooksQuery.data.map(book => book.id);

      const { data: receivedMatches, error: receivedError } = await supabase
        .from('matches')
        .select(`
          id,
          status,
          created_at,
          requester_id,
          book_requested_id,
          book_offered_id,
          requested_book:books!book_requested_id(id, title, author, cover_url, condition, genre, user_id),
          offered_book:books!book_offered_id(id, title, author, cover_url, condition, genre, user_id)
        `)
        .in('book_requested_id', userBookIds);

      if (receivedError) {
        console.error('Error fetching received matches:', {
          error: receivedError,
          details: receivedError.details,
          message: receivedError.message,
          hint: receivedError.hint,
          code: receivedError.code
        });
        throw new Error(`Failed to fetch received matches: ${receivedError.message}`);
      }

      console.log('Received matches:', receivedMatches);

      // Format the matches with proper type checking
      const formattedRequestedMatches = requestedMatches?.map((match: any) => {
        if (!match.requested_book) {
          console.warn('Missing requested book data for match:', match);
          return null;
        }

        return {
          id: match.id,
          status: match.status,
          requester: {
            id: user.id,
            name: user.user_metadata.name || 'Unknown',
            avatar: user.user_metadata.avatar_url || '',
          },
          requested_book: {
            id: match.requested_book.id,
            title: match.requested_book.title,
            author: match.requested_book.author,
            cover: match.requested_book.cover_url || '',
            condition: match.requested_book.condition || 'Good',
            genre: match.requested_book.genre || 'Unknown',
            user_id: match.requested_book.user_id,
            owner_name: 'Unknown',
          },
          offered_book: match.offered_book ? {
            id: match.offered_book.id,
            title: match.offered_book.title,
            author: match.offered_book.author,
            cover: match.offered_book.cover_url || '',
            condition: match.offered_book.condition || 'Good',
            genre: match.offered_book.genre || 'Unknown',
            user_id: match.offered_book.user_id,
            owner_name: 'Unknown',
          } : undefined,
          created_at: match.created_at,
        };
      }).filter(Boolean) as MatchProps[];

      // Format received matches similarly
      const formattedReceivedMatches = receivedMatches?.map((match: any) => {
        if (!match.requested_book) {
          console.warn('Missing requested book data for match:', match);
          return null;
        }

        return {
          id: match.id,
          status: match.status,
          requester: {
            id: match.requester_id,
            name: 'Unknown User',
            avatar: '',
          },
          requested_book: {
            id: match.requested_book.id,
            title: match.requested_book.title,
            author: match.requested_book.author,
            cover: match.requested_book.cover_url || '',
            condition: match.requested_book.condition || 'Good',
            genre: match.requested_book.genre || 'Unknown',
            user_id: match.requested_book.user_id,
            owner_name: 'Unknown',
          },
          offered_book: match.offered_book ? {
            id: match.offered_book.id,
            title: match.offered_book.title,
            author: match.offered_book.author,
            cover: match.offered_book.cover_url || '',
            condition: match.offered_book.condition || 'Good',
            genre: match.offered_book.genre || 'Unknown',
            user_id: match.offered_book.user_id,
            owner_name: 'Unknown',
          } : undefined,
          created_at: match.created_at,
        };
      }).filter(Boolean) as MatchProps[];

      console.log('Formatted matches:', {
        received: formattedReceivedMatches,
        requested: formattedRequestedMatches
      });

      setReceivedMatches(formattedReceivedMatches || []);
      setRequestedMatches(formattedRequestedMatches || []);

    } catch (error) {
      console.error('Detailed error in loadMatches:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        errorDetails: error instanceof Object ? JSON.stringify(error) : undefined,
        user: user ? { id: user.id } : 'No user'
      });
      
      toast.error('Error loading matches', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial load and setup real-time subscriptions
  useEffect(() => {
    console.log('Setup effect running with user state:', {
      userExists: !!user,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });

    loadMatches();

    // Subscribe to changes in matches table
    if (user) {
      console.log('Setting up subscriptions for user:', {
        userId: user.id,
        timestamp: new Date().toISOString()
      });

      // Subscribe to matches where user is the requester
      const requestedSubscription = supabase
        .channel('requested-matches')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'matches',
            filter: `requester_id=eq.${user.id}`
          },
          () => {
            loadMatches(); // Reload matches when there's a change
          }
        )
        .subscribe();

      // Subscribe to matches where user owns the requested book
      const receivedSubscription = supabase
        .channel('received-matches')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'matches',
            filter: `book_requested_id=in.(select id from books where user_id=eq.${user.id})`
          },
          () => {
            loadMatches(); // Reload matches when there's a change
          }
        )
        .subscribe();

      // Cleanup subscriptions
      return () => {
        requestedSubscription.unsubscribe();
        receivedSubscription.unsubscribe();
      };
    }
  }, [user]);

  const handleAcceptMatch = async (matchId: string) => {
    if (!user) return;
    
    try {
      // First update the match status
      await respondToMatch(matchId, 'accepted', user.id);

      // Find the match details to get requester info
      const match = receivedMatches.find(m => m.id === matchId);
      if (!match) {
        console.error('Could not find match details for notification');
        return;
      }

      // Create notification for the requester
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: match.requester.id,
          type: 'match_accepted',
          title: 'Match Request Accepted!',
          message: `Your request for "${match.requested_book.title}" has been accepted`,
          data: {
            match_id: matchId,
            book_title: match.requested_book.title,
            book_id: match.requested_book.id
          },
          read: false
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }

    toast.success("Match accepted! We've notified the other user.");
      
      // The real-time subscription will handle the UI update
    } catch (error) {
      console.error('Error accepting match:', error);
      toast.error('Failed to accept match');
    }
  };

  const handleDeclineMatch = async (matchId: string) => {
    if (!user) return;
    
    try {
      await respondToMatch(matchId, 'declined', user.id);
    toast.info("Match declined.");
      
      // The real-time subscription will handle the UI update
    } catch (error) {
      console.error('Error declining match:', error);
      toast.error('Failed to decline match');
    }
  };

  const handleOpenChat = (userId: string, userName: string) => {
    setSelectedChat({ userId, userName });
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
  };

  if (loading) {
  return (
      <div className="container mx-auto py-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );
  }

  const renderMatchCard = (match: MatchProps, isReceived: boolean) => (
    <Card key={match.id} className="mb-4">
      <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={match.requester.avatar} />
              <AvatarFallback>{match.requester.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
              <CardTitle className="text-lg">{match.requester.name}</CardTitle>
              <CardDescription>
                Requested {new Date(match.created_at).toLocaleDateString()}
              </CardDescription>
                            </div>
                          </div>
          <Badge variant={
            match.status === 'pending' ? 'default' :
            match.status === 'accepted' ? 'secondary' :
            'destructive'
          }>
            {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
      <CardContent>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="sm:w-1/2">
            <h3 className="font-medium text-sm mb-2">They want:</h3>
                          <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <img
                src={match.requested_book.cover}
                alt={match.requested_book.title}
                              className="w-16 h-20 object-cover rounded"
                            />
                            <div>
                              <Link
                  to={`/book/${match.requested_book.id}`}
                                className="font-medium hover:underline line-clamp-1"
                              >
                  {match.requested_book.title}
                              </Link>
                              <p className="text-xs text-muted-foreground">
                  by {match.requested_book.author}
                              </p>
                              <Badge
                                variant="secondary"
                                className="mt-2 text-xs px-2 py-0"
                              >
                  {match.requested_book.condition}
                              </Badge>
                            </div>
                          </div>
                        </div>

          {match.offered_book && (
                        <div className="sm:w-1/2">
                          <h3 className="font-medium text-sm mb-2">In exchange for:</h3>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <img
                  src={match.offered_book.cover}
                  alt={match.offered_book.title}
                  className="w-16 h-20 object-cover rounded"
                />
                <div>
                  <Link
                    to={`/book/${match.offered_book.id}`}
                    className="font-medium hover:underline line-clamp-1"
                  >
                    {match.offered_book.title}
                  </Link>
                                  <p className="text-xs text-muted-foreground">
                    by {match.offered_book.author}
                  </p>
                  <Badge
                    variant="secondary"
                    className="mt-2 text-xs px-2 py-0"
                  >
                    {match.offered_book.condition}
                  </Badge>
                          </div>
                        </div>
            </div>
          )}
                      </div>
                    </CardContent>
      <CardFooter className="flex justify-between">
        {match.status === 'pending' && isReceived && (
          <div className="flex gap-2">
                      <Button
              variant="outline"
              size="sm"
                        onClick={() => handleDeclineMatch(match.id)}
                      >
              <X className="w-4 h-4 mr-1" />
                        Decline
                        </Button>
                        <Button
              size="sm"
                          onClick={() => handleAcceptMatch(match.id)}
                        >
              <Check className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                      </div>
        )}
        {match.status === 'accepted' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenChat(
              isReceived ? match.requester.id : match.requested_book.user_id,
              isReceived ? match.requester.name : match.requested_book.owner_name
            )}
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Chat
                                  </Button>
        )}
        {match.status === 'declined' && (
          <Badge variant="destructive">Declined</Badge>
        )}
      </CardFooter>
                  </Card>
  );

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Book Matches</h1>
      
      <Tabs defaultValue="received" className="w-full">
        <TabsList>
          <TabsTrigger value="received">
            Received Matches
          </TabsTrigger>
          <TabsTrigger value="requested">
            Requested Matches
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received">
          {receivedMatches.map((match) => renderMatchCard(match, true))}
        </TabsContent>

        <TabsContent value="requested">
          {requestedMatches.map((match) => renderMatchCard(match, false))}
          </TabsContent>
        </Tabs>

      {selectedChat && (
        <ChatDialog
          isOpen={!!selectedChat}
          onClose={() => handleCloseChat()}
          userId={selectedChat.userId}
          userName={selectedChat.userName}
        />
      )}
    </div>
  );
};

export default Matches;
