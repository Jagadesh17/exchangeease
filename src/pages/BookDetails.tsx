import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Heart, Share, Edit, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import type { BookProps } from "@/components/book/BookCard";
import { fetchBookById, fetchAllBooks, editBook, deleteBook, fetchMyBooks, toggleBookInterest, checkBookInterest } from "@/utils/books";
import { useAuth } from "@/providers/AuthProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { requestMatch } from "@/utils/matches";
import { checkDatabaseConnection } from "@/utils/health";
import { Textarea } from "@/components/ui/textarea";

const genres = [
  "Fiction",
  "Science Fiction",
  "Fantasy",
  "Mystery",
  "Romance",
  "Biography",
  "History",
  "Computer Science",
  "Self-Help",
];

type ExtendedBookProps = BookProps & {
  exchange_method?: "In Person" | "Mail" | "Both";
  description?: string;
  isbn?: string;
  exchange_notes?: string;
};

const BookDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState<ExtendedBookProps | null>(null);
  const [isInterested, setIsInterested] = useState(false);
  const [loading, setLoading] = useState(true);
  const [similarBooks, setSimilarBooks] = useState<BookProps[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [bookUserId, setBookUserId] = useState<string | null>(null);
  const [ownerBooks, setOwnerBooks] = useState<BookProps[]>([]);
  const [editForm, setEditForm] = useState({
    title: "",
    author: "",
    genre: "",
    condition: "",
    location: "",
    exchange_method: "In Person" as "In Person" | "Mail" | "Both",
    description: "",
    isbn: "",
    exchange_notes: "",
  });

  const [editFormErrors, setEditFormErrors] = useState({
    title: "",
    author: "",
    genre: "",
    condition: "",
    location: "",
    exchange_method: "",
    description: "",
    isbn: "",
  });

  const [isRequestingMatch, setIsRequestingMatch] = useState(false);
  const [selectedBookToOffer, setSelectedBookToOffer] = useState<string | null>(null);
  const [userBooks, setUserBooks] = useState<BookProps[]>([]);

  useEffect(() => {
    async function loadBook() {
      if (!id) return;
    setLoading(true);
      try {
        // Fetch the book details
        const bookData = await fetchBookById(id);
        setBookUserId(bookData.user_id);
        const formattedBook: ExtendedBookProps = {
          id: bookData.id,
          title: bookData.title,
          author: bookData.author,
          cover: bookData.cover_url || "/placeholder.svg",
          condition: bookData.condition as BookProps["condition"],
          genre: bookData.genre || "Unknown",
          location: bookData.location || "",
          owner: {
            name: bookData.profiles?.name || "Unknown User",
            avatar: bookData.profiles?.profile_pic || "/placeholder.svg",
            rating: 5,
          },
          exchange_method: bookData.exchange_method || "In Person",
          description: bookData.description,
          exchange_notes: bookData.exchange_notes,
        };

        // Store additional data separately
        const additionalData = {
          isbn: bookData.isbn || "",
        };

        setBook(formattedBook);
        
        // Initialize edit form with all data
        setEditForm({
          title: bookData.title,
          author: bookData.author,
          genre: bookData.genre || "Unknown",
          condition: bookData.condition || "Good",
          location: bookData.location || "",
          exchange_method: bookData.exchange_method || "In Person",
          description: bookData.description || "",
          isbn: bookData.isbn || "",
          exchange_notes: bookData.exchange_notes || "",
        });

        // Fetch similar books (same genre)
        const allBooks = await fetchAllBooks();
        const similar = allBooks
          .filter(b => b.genre === bookData.genre && b.id !== id)
          .slice(0, 4)
          .map(b => ({
            id: b.id,
            title: b.title,
            author: b.author,
            cover: b.cover_url || "/placeholder.svg",
            condition: (b.condition || "Good") as BookProps["condition"],
            genre: b.genre || "Unknown",
            owner: {
              name: b.profiles?.name || "Unknown User",
              avatar: b.profiles?.profile_pic || "/placeholder.svg",
              rating: 5,
            },
          }));
        setSimilarBooks(similar);

        // Add console.log to debug
        console.log('Book data loaded:', bookData);
        console.log('Formatted book:', formattedBook);
        console.log('Edit form initialized:', editForm);
      } catch (err) {
        console.error("Error loading book:", err);
        toast.error("Failed to load book details");
        navigate("/explore");
      } finally {
        setLoading(false);
      }
    }
    loadBook();
  }, [id, navigate]);

  // Load user's books for offering in exchange
  useEffect(() => {
    async function loadUserBooks() {
      if (!user) return;
      try {
        const books = await fetchMyBooks(user.id);
        const formattedBooks = books.map(book => ({
          id: book.id,
          title: book.title,
          author: book.author,
          cover: book.cover_url || "/placeholder.svg",
          condition: book.condition as BookProps["condition"],
          genre: book.genre || "Unknown",
          owner: {
            name: book.profiles?.name || "Unknown User",
            avatar: book.profiles?.profile_pic || "/placeholder.svg",
            rating: 5,
          },
        }));
        setUserBooks(formattedBooks);
      } catch (err) {
        console.error("Error loading user's books:", err);
      }
    }
    loadUserBooks();
  }, [user]);

  useEffect(() => {
    async function loadOwnerBooks() {
      if (!bookUserId) return;
      try {
        const books = await fetchMyBooks(bookUserId);
        const formattedBooks = books
          .filter(b => b.id !== id) // Exclude current book
          .map(book => ({
            id: book.id,
            title: book.title,
            author: book.author,
            cover: book.cover_url || "/placeholder.svg",
            condition: book.condition as BookProps["condition"],
            genre: book.genre || "Unknown",
            owner: {
              name: book.profiles?.name || "Unknown User",
              avatar: book.profiles?.profile_pic || "/placeholder.svg",
              rating: 5,
            },
          }));
        setOwnerBooks(formattedBooks);
      } catch (err) {
        console.error("Error loading owner's books:", err);
      }
    }
    loadOwnerBooks();
  }, [bookUserId, id]);

  // Check initial interest state
  useEffect(() => {
    async function checkInterest() {
      if (!user || !id) return;
      try {
        const isInterested = await checkBookInterest(id, user.id);
        setIsInterested(isInterested);
      } catch (err) {
        console.error('Error checking book interest:', err);
      }
    }
    checkInterest();
  }, [id, user]);

  const handleInterestClick = async () => {
    if (!user) {
      toast.error("You must be logged in to save books");
      return;
    }
    if (!id) return;

    try {
      const newInterestState = await toggleBookInterest(id, user.id);
      setIsInterested(newInterestState);
      
      if (newInterestState) {
        toast.success("Added to your interested books!");
    } else {
        toast.info("Removed from your interested books");
      }
    } catch (err) {
      console.error('Error toggling book interest:', err);
      toast.error(err instanceof Error ? err.message : "Failed to update interest");
    }
  };

  const handleShareClick = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const validateEditForm = () => {
    const errors = {
      title: "",
      author: "",
      genre: "",
      condition: "",
      location: "",
      exchange_method: "",
      description: "",
      isbn: "",
    };
    let isValid = true;

    if (!editForm.title.trim()) {
      errors.title = "Title is required";
      isValid = false;
    }

    if (!editForm.author.trim()) {
      errors.author = "Author is required";
      isValid = false;
    }

    if (!editForm.genre) {
      errors.genre = "Genre is required";
      isValid = false;
    }

    if (!editForm.condition) {
      errors.condition = "Condition is required";
      isValid = false;
    }

    if (!editForm.location.trim()) {
      errors.location = "Location is required";
      isValid = false;
    }

    if (!editForm.exchange_method) {
      errors.exchange_method = "Exchange method is required";
      isValid = false;
    }

    if (!editForm.description.trim()) {
      errors.description = "Description is required";
      isValid = false;
    }

    if (!editForm.isbn.trim()) {
      errors.isbn = "ISBN is required";
      isValid = false;
    }

    setEditFormErrors(errors);
    return isValid;
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) {
      toast.error("Missing required information");
      return;
    }

    if (!validateEditForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    try {
      console.log('Submitting edit:', editForm);
      const updatedBook = await editBook(id, {
        title: editForm.title,
        author: editForm.author,
        genre: editForm.genre,
        condition: editForm.condition,
        location: editForm.location,
        exchange_method: editForm.exchange_method,
        description: editForm.description,
        isbn: editForm.isbn,
        exchange_notes: editForm.exchange_notes,
      }, user.id);
      console.log('Book updated:', updatedBook);

      // Update the local book state
      setBook(prev => {
        if (!prev) return null;
        return {
          ...prev,
          title: updatedBook.title,
          author: updatedBook.author,
          genre: updatedBook.genre,
          condition: updatedBook.condition as BookProps["condition"],
          location: updatedBook.location || "",
          exchange_method: updatedBook.exchange_method,
          description: updatedBook.description,
          exchange_notes: updatedBook.exchange_notes,
        };
      });

      setIsEditDialogOpen(false);
      toast.success("Book updated successfully!");
    } catch (err) {
      console.error("Error updating book:", err);
      toast.error(err instanceof Error ? err.message : "Failed to update book");
    }
  };

  const handleDelete = async () => {
    if (!id || !user) {
      toast.error("Missing required information");
      return;
    }

    try {
      // Show loading state
      const loadingToast = toast.loading("Deleting book...");
      
      // First check if the book exists and belongs to the user
      const { data: book, error: fetchError } = await supabase
        .from("books")
        .select("user_id")
        .eq("id", id)
        .single();

      if (fetchError) {
        console.error("Error verifying book ownership:", fetchError);
        toast.dismiss(loadingToast);
        toast.error("Could not verify book ownership");
        return;
      }

      if (!book) {
        toast.dismiss(loadingToast);
        toast.error("Book not found");
        return;
      }

      if (book.user_id !== user.id) {
        toast.dismiss(loadingToast);
        toast.error("You can only delete your own books");
        return;
      }

      // Delete the book - matches will be deleted automatically via CASCADE
      console.log('Attempting to delete book...');
      const { error: deleteError } = await supabase
        .from("books")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (deleteError) {
        console.error("Error deleting book:", deleteError);
        toast.dismiss(loadingToast);
        toast.error("Failed to delete book. Please try again.");
        return;
      }

      toast.dismiss(loadingToast);
      toast.success("Book deleted successfully!");
      
      // Navigate away and replace history to prevent going back
      navigate("/explore", { replace: true });
    } catch (err) {
      console.error("Error in delete operation:", err);
      toast.error("An unexpected error occurred while deleting the book");
    }
  };

  const handleRequestMatch = async () => {
    if (!user || !id) {
      toast.error("You must be logged in to request a match");
      return;
    }

    try {
      // Check database connection first
      const healthCheck = await checkDatabaseConnection();
      if (!healthCheck.ok) {
        console.error('Database connection failed:', healthCheck);
        toast.error(`Connection error: ${healthCheck.error}`);
        return;
      }

      if (!healthCheck.authenticated) {
        toast.error("Your session has expired. Please log in again.");
        return;
      }

      await requestMatch(id, selectedBookToOffer, user.id);
      toast.success("Match request sent successfully!");
      setIsRequestingMatch(false);
      setSelectedBookToOffer(null);
    } catch (err) {
      console.error("Error requesting match:", err);
      toast.error(err instanceof Error ? err.message : "Failed to request match");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-lg bg-muted w-32 h-40 mb-4"></div>
          <div className="h-4 bg-muted rounded w-48 mb-2.5"></div>
          <div className="h-3 bg-muted rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Book Not Found</h2>
        <p className="mb-6">The book you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/explore">Browse Books</Link>
        </Button>
      </div>
    );
  }

  const { title, author, cover, condition, genre, owner } = book;

  const conditionColor = {
    New: "bg-green-100 text-green-800",
    Good: "bg-blue-100 text-blue-800",
    Worn: "bg-amber-100 text-amber-800",
  }[condition];

  // Replace the interest button with match request
  const actionButtons = (
    <div className="flex gap-4 mt-6">
      {user?.id !== bookUserId ? (
        <>
          <Button
            onClick={() => setIsRequestingMatch(true)}
            className="flex-1"
          >
            Request Match
          </Button>
          <Button
            variant="outline"
            onClick={handleInterestClick}
            className="w-12"
          >
            <Heart className={isInterested ? "fill-red-500 text-red-500" : ""} />
          </Button>
          <Button
            variant="outline"
            onClick={handleShareClick}
            className="flex-1"
          >
            Share
          </Button>
        </>
      ) : (
        <Button
          variant="outline"
          onClick={handleShareClick}
          className="flex-1"
        >
          Share
        </Button>
      )}
    </div>
  );

  // Add match request dialog
  const matchRequestDialog = (
    <Dialog open={isRequestingMatch} onOpenChange={setIsRequestingMatch}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Book Match</DialogTitle>
          <DialogDescription>
            Select a book to offer in exchange (optional)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {userBooks.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">
                You don't have any books listed yet
              </p>
              <Button asChild variant="outline">
                <Link to="/add-book">Add a Book</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {userBooks.map((book) => (
                <div
                  key={book.id}
                  className={`flex items-center gap-3 p-2 border rounded-lg cursor-pointer transition-colors ${
                    selectedBookToOffer === book.id
                      ? "border-primary bg-primary/5"
                      : "hover:border-muted-foreground"
                  }`}
                  onClick={() => setSelectedBookToOffer(book.id)}
                >
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-10 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">
                      {book.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {book.condition}
                    </p>
                  </div>
                  <div
                    className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                      selectedBookToOffer === book.id
                        ? "border-primary bg-primary text-white"
                        : "border-muted"
                    }`}
                  >
                    {selectedBookToOffer === book.id && (
                      <Check className="h-3 w-3" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsRequestingMatch(false)}>
            Cancel
          </Button>
          <Button onClick={handleRequestMatch}>
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" className="mb-6" asChild>
        <Link to="/explore" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Explore
        </Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
        <div>
          <div className="aspect-[3/4] rounded-lg overflow-hidden">
              <img
                src={cover}
                alt={title}
              className="w-full h-full object-cover"
              />
            </div>
          <div className="flex gap-2 mt-4">
            {actionButtons}
          </div>
          {user && user.id === bookUserId && (
            <>
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Book Details</DialogTitle>
                    <DialogDescription>
                      Make changes to your book listing here.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleEditSubmit}>
                    <div className="grid gap-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
                          <Input
                            id="title"
                            value={editForm.title}
                            onChange={(e) =>
                              setEditForm({ ...editForm, title: e.target.value })
                            }
                            className={editFormErrors.title ? "border-destructive" : ""}
                          />
                          {editFormErrors.title && (
                            <p className="text-sm text-destructive">{editFormErrors.title}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="author">Author <span className="text-destructive">*</span></Label>
                          <Input
                            id="author"
                            value={editForm.author}
                            onChange={(e) =>
                              setEditForm({ ...editForm, author: e.target.value })
                            }
                            className={editFormErrors.author ? "border-destructive" : ""}
                          />
                          {editFormErrors.author && (
                            <p className="text-sm text-destructive">{editFormErrors.author}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="isbn">ISBN</Label>
                          <Input
                            id="isbn"
                            value={editForm.isbn}
                            onChange={(e) =>
                              setEditForm({ ...editForm, isbn: e.target.value })
                            }
                            placeholder="e.g., 978-3-16-148410-0"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="genre">Genre <span className="text-destructive">*</span></Label>
                          <Select
                            value={editForm.genre}
                            onValueChange={(value) =>
                              setEditForm({ ...editForm, genre: value })
                            }
                          >
                            <SelectTrigger id="genre" className={editFormErrors.genre ? "border-destructive" : ""}>
                              <SelectValue placeholder="Select genre" />
                            </SelectTrigger>
                            <SelectContent>
                              {genres.map((genre) => (
                                <SelectItem key={genre} value={genre}>
                                  {genre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {editFormErrors.genre && (
                            <p className="text-sm text-destructive">{editFormErrors.genre}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="condition">Condition <span className="text-destructive">*</span></Label>
                          <Select
                            value={editForm.condition}
                            onValueChange={(value) =>
                              setEditForm({ ...editForm, condition: value })
                            }
                          >
                            <SelectTrigger id="condition" className={editFormErrors.condition ? "border-destructive" : ""}>
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="New">New</SelectItem>
                              <SelectItem value="Good">Good</SelectItem>
                              <SelectItem value="Worn">Worn</SelectItem>
                            </SelectContent>
                          </Select>
                          {editFormErrors.condition && (
                            <p className="text-sm text-destructive">{editFormErrors.condition}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="location">Location <span className="text-destructive">*</span></Label>
                          <Input
                            id="location"
                            value={editForm.location}
                            onChange={(e) =>
                              setEditForm({ ...editForm, location: e.target.value })
                            }
                            placeholder="e.g. Toronto, ON"
                            className={editFormErrors.location ? "border-destructive" : ""}
                          />
                          {editFormErrors.location && (
                            <p className="text-sm text-destructive">{editFormErrors.location}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="exchange_method">Exchange Method <span className="text-destructive">*</span></Label>
                        <Select
                          value={editForm.exchange_method}
                          onValueChange={(value) =>
                            setEditForm({ ...editForm, exchange_method: value as "In Person" | "Mail" | "Both" })
                          }
                        >
                          <SelectTrigger id="exchange_method" className={editFormErrors.exchange_method ? "border-destructive" : ""}>
                            <SelectValue placeholder="Select exchange method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="In Person">In Person</SelectItem>
                            <SelectItem value="Mail">Mail</SelectItem>
                            <SelectItem value="Both">Both (In Person & Mail)</SelectItem>
                          </SelectContent>
                        </Select>
                        {editFormErrors.exchange_method && (
                          <p className="text-sm text-destructive">{editFormErrors.exchange_method}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Book Description</Label>
                        <Textarea
                          id="description"
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm({ ...editForm, description: e.target.value })
                          }
                          placeholder="Describe your book and its condition..."
                          className="min-h-[100px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="exchange_notes">Exchange Preferences & Notes</Label>
                        <Textarea
                          id="exchange_notes"
                          value={editForm.exchange_notes}
                          onChange={(e) =>
                            setEditForm({ ...editForm, exchange_notes: e.target.value })
                          }
                          placeholder="Specify any preferences or requirements for exchange..."
                          className="min-h-[100px]"
                        />
                      </div>
                  </div>
                  <DialogFooter>
                      <Button type="submit">Save Changes</Button>
                  </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Trash2 className="h-4 w-4" />
              </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Book</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this book? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>

        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
            <p className="text-xl text-muted-foreground">by {author}</p>
          </div>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="owner">Owner</TabsTrigger>
              <TabsTrigger value="exchange">Exchange Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Book Details</h4>
                      <ul className="space-y-2">
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Genre</span>
                          <span className="font-medium">{genre}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Condition</span>
                          <span className={`font-medium px-2 py-0.5 rounded-full text-sm ${conditionColor}`}>
                            {condition}
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Language</span>
                          <span className="font-medium">English</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Exchange Details</h4>
                      <ul className="space-y-2">
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Listed On</span>
                          <span className="font-medium">Recently</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Location</span>
                          <span className="font-medium">{book.location || "Not specified"}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">Exchange Method</span>
                          <span className="font-medium">{book.exchange_method || "In Person"}</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {book.description && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-2">Description & Notes</h4>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{book.description}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="owner">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src={owner.avatar}
                      alt={owner.name}
                      className="w-16 h-16 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{owner.name}</h3>
                      <p className="text-muted-foreground">Member since 2024</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Successful Exchanges</h4>
                      <p className="font-semibold text-2xl">-</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Books Listed</h4>
                      <p className="font-semibold text-2xl">{ownerBooks.length + 1}</p>
                    </div>
                  </div>

                  {ownerBooks.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-4">Other Books by {owner.name}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {ownerBooks.map((book) => (
                          <Link key={book.id} to={`/book/${book.id}`} className="block group">
                            <div className="relative aspect-[3/4] overflow-hidden rounded-lg mb-2">
                              <img
                                src={book.cover}
                                alt={book.title}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                            </div>
                            <h5 className="font-medium line-clamp-1">{book.title}</h5>
                            <p className="text-sm text-muted-foreground">{book.author}</p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exchange">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium mb-4">Exchange Method</h4>
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <div className="p-2 bg-background rounded">
                          {book?.exchange_method === "Mail" ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M4 9h16"/><path d="M4 15h16"/><path d="M8 4h8"/><path d="M8 20h8"/></svg>
                          ) : book?.exchange_method === "Both" ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{book?.exchange_method || "In Person"}</p>
                          <p className="text-sm text-muted-foreground">
                            {book?.exchange_method === "Mail" 
                              ? "This book is available for mail exchange only" 
                              : book?.exchange_method === "Both"
                              ? "This book is available for both in-person and mail exchange"
                              : "This book is available for in-person exchange only"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-4">Preferred Genres</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div className="flex items-center p-2 border rounded-lg bg-primary/5 border-primary">
                          <Label className="text-sm">{book.genre}</Label>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        The owner is primarily interested in exchanging for books in the same genre.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-4">Additional Notes</h4>
                      <div className="p-4 bg-muted rounded-lg">
                        {book.exchange_notes ? (
                          <p className="text-sm whitespace-pre-wrap">{book.exchange_notes}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No additional notes provided for exchange preferences.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {similarBooks.length > 0 && (
            <div className="mt-12">
              <h3 className="text-xl font-semibold mb-6">Similar Books</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {similarBooks.map((book) => (
                  <div key={book.id} className="book-card">
                    <Link to={`/book/${book.id}`} className="block">
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-sm line-clamp-1">
                          {book.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {book.author}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {matchRequestDialog}
    </div>
  );
};

export default BookDetails;
