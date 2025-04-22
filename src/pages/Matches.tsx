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

      // First, check if we can connect to Supabase
      const { data: connectionTest, error: connectionError } = await supabase
        .from('books')
        .select('count')
        .limit(1);

      if (connectionError) {
        console.error('Database connection test failed:', connectionError);
        throw new Error(`Database connection failed: ${connectionError.message}`);
      }

      // Test if matches table exists
      const { error: matchesTableError } = await supabase
        .from('matches')
        .select('count')
        .limit(1);

      if (matchesTableError) {
        console.error('Matches table test failed:', matchesTableError);
        if (matchesTableError.code === '42P01') {
          throw new Error('The matches table does not exist in the database. Please set up the database first.');
        } else {
          throw new Error(`Matches table error: ${matchesTableError.message}`);
        }
      }

      console.log('Database connection and table check successful, fetching matches...');
      
      // Get matches where user is the requester
      const { data: requestedMatches, error: requestedError } = await supabase
        .from('matches')
        .select(`
          id,
          status,
          created_at,
          requester_id,
          book_requested_id,
          book_offered_id,
          requested_book:books!book_requested_id(
            id,
            title,
            author,
            cover_url,
            condition,
            genre,
            user_id
          ),
          offered_book:books!book_offered_id(
            id,
            title,
            author,
            cover_url,
            condition,
            genre,
            user_id
          )
        `)
        .eq('requester_id', user.id)
        .returns<DatabaseMatch[]>();

      if (requestedError) {
        console.error('Error fetching requested matches:', requestedError);
        throw new Error(`Failed to fetch requested matches: ${requestedError.message}`);
      }

      console.log('Successfully fetched requested matches:', requestedMatches);

      // Get matches where user owns the requested book
      const { data: receivedMatches, error: receivedError } = await supabase
        .from('matches')
        .select(`
          id,
          status,
          created_at,
          requester_id,
          book_requested_id,
          book_offered_id,
          requested_book:books!book_requested_id(
            id,
            title,
            author,
            cover_url,
            condition,
            genre,
            user_id
          ),
          offered_book:books!book_offered_id(
            id,
            title,
            author,
            cover_url,
            condition,
            genre,
            user_id
          )
        `)
        .eq('requested_book.user_id', user.id)
        .returns<DatabaseMatch[]>();

      if (receivedError) {
        console.error('Error fetching received matches:', receivedError);
        throw new Error(`Failed to fetch received matches: ${receivedError.message}`);
      }

      // Get requester information for received matches
      const requesterIds = receivedMatches?.map(match => match.requester_id) || [];
      const { data: requesterProfiles, error: profilesError } = await supabase
        .from('auth.users')
        .select('id, email, user_metadata')
        .in('id', requesterIds)
        .returns<UserProfile[]>();

      if (profilesError) {
        console.error('Error fetching requester profiles:', profilesError);
      }

      const requesterProfileMap = new Map(
        requesterProfiles?.map(profile => [profile.id, profile]) || []
      );

      console.log('Successfully fetched received matches:', receivedMatches);

      // Format received matches
      const formattedReceivedMatches = (receivedMatches || []).map((match) => {
        const requesterProfile = requesterProfileMap.get(match.requester_id);

        if (!match.requested_book) {
          console.error('Missing requested book data for match:', match);
          return null;
        }

        return {
          id: match.id,
          status: match.status,
          requester: {
            id: match.requester_id,
            name: requesterProfile?.user_metadata?.name || 'Unknown User',
            avatar: requesterProfile?.user_metadata?.avatar_url || '/placeholder.svg',
          },
          requested_book: {
            id: match.requested_book.id,
            title: match.requested_book.title || 'Unknown Title',
            author: match.requested_book.author || 'Unknown Author',
            cover: match.requested_book.cover_url || '/placeholder.svg',
            condition: match.requested_book.condition || 'Good',
            genre: match.requested_book.genre || 'Unknown',
          },
          offered_book: match.offered_book ? {
            id: match.offered_book.id,
            title: match.offered_book.title || 'Unknown Title',
            author: match.offered_book.author || 'Unknown Author',
            cover: match.offered_book.cover_url || '/placeholder.svg',
            condition: match.offered_book.condition || 'Good',
            genre: match.offered_book.genre || 'Unknown',
          } : undefined,
          created_at: match.created_at,
        };
      }).filter(Boolean) as MatchProps[];

      // Format requested matches
      const formattedRequestedMatches = (requestedMatches || []).map((match) => {
        if (!match.requested_book) {
          console.error('Missing requested book data for match:', match);
          return null;
        }

        return {
          id: match.id,
          status: match.status,
          requester: {
            id: user.id,
            name: user.user_metadata?.name || 'You',
            avatar: user.user_metadata?.avatar_url || '/placeholder.svg',
          },
          requested_book: {
            id: match.requested_book.id,
            title: match.requested_book.title || 'Unknown Title',
            author: match.requested_book.author || 'Unknown Author',
            cover: match.requested_book.cover_url || '/placeholder.svg',
            condition: match.requested_book.condition || 'Good',
            genre: match.requested_book.genre || 'Unknown',
          },
          offered_book: match.offered_book ? {
            id: match.offered_book.id,
            title: match.offered_book.title || 'Unknown Title',
            author: match.offered_book.author || 'Unknown Author',
            cover: match.offered_book.cover_url || '/placeholder.svg',
            condition: match.offered_book.condition || 'Good',
            genre: match.offered_book.genre || 'Unknown',
          } : undefined,
          created_at: match.created_at,
        };
      }).filter(Boolean) as MatchProps[];

      console.log('Formatted matches:', {
        received: formattedReceivedMatches,
        requested: formattedRequestedMatches
      });

      setReceivedMatches(formattedReceivedMatches);
      setRequestedMatches(formattedRequestedMatches);
    } catch (error) {
      console.error('Detailed error in loadMatches:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        errorDetails: error instanceof Object ? JSON.stringify(error) : undefined,
        user: user ? { id: user.id } : 'No user'
      });
      
      // Show the specific error message to the user
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred while fetching matches';
      
      toast.error(errorMessage, {
        description: 'Please check the console for more details'
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

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Book Matches</h1>
        </div>

        <Tabs defaultValue="received">
          <TabsList className="mb-6">
            <TabsTrigger value="received">Received Requests</TabsTrigger>
            <TabsTrigger value="requested">My Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="received">
            {receivedMatches.length === 0 ? (
              <div className="text-center py-16 border rounded-lg bg-card">
                <div className="flex justify-center mb-4">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Match Requests</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't received any match requests yet
                </p>
                <Button asChild>
                  <Link to="/explore">Browse Books</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {receivedMatches.map((match) => (
                  <Card key={match.id}>
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
                    {match.status === 'pending' && (
                    <CardFooter className="flex justify-between bg-muted/20 px-4 py-3">
                      <Button
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeclineMatch(match.id)}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Decline
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link to={`/messages/${match.requester.id}`}>
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Message
                          </Link>
                        </Button>
                          <Button onClick={() => handleAcceptMatch(match.id)}>
                          <Check className="mr-2 h-4 w-4" />
                          Accept
                        </Button>
                      </div>
                    </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requested">
            {requestedMatches.length === 0 ? (
              <div className="text-center py-16 border rounded-lg bg-card">
                <div className="flex justify-center mb-4">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Requests Made</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't requested any books yet
                </p>
                <Button asChild>
                  <Link to="/explore">Find Books</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {requestedMatches.map((match) => (
                  <Card key={match.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <Avatar>
                            <AvatarImage src={match.requester.avatar} />
                            <AvatarFallback>{match.requester.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          <div>
                            <CardTitle className="text-lg">Your Request</CardTitle>
                            <CardDescription>
                              Sent {new Date(match.created_at).toLocaleDateString()}
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
                          <h3 className="font-medium text-sm mb-2">You want:</h3>
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
                            <h3 className="font-medium text-sm mb-2">You offered:</h3>
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
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Matches;
