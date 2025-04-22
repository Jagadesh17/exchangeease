import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { BookPlus, Edit, MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/providers/AuthProvider";
import { fetchMyBooks, fetchInterestedBooks } from "@/utils/books";
import { toast } from "sonner";
import type { BookProps } from "@/components/book/BookCard";

const MyBooks = () => {
  const { user } = useAuth();
  const [listedBooks, setListedBooks] = useState<BookProps[]>([]);
  const [interestedBooks, setInterestedBooks] = useState<BookProps[]>([]);
  const [bookToDelete, setBookToDelete] = useState<BookProps | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingInterested, setLoadingInterested] = useState(true);

  useEffect(() => {
    async function loadBooks() {
      if (!user) {
        setListedBooks([]);
        return;
      }
      setLoading(true);
      try {
        const data = await fetchMyBooks(user.id);
        setListedBooks(
          data.map((b) => ({
            id: b.id,
            title: b.title,
            author: b.author,
            cover: b.cover_url || "/placeholder.svg",
            condition: (b.condition === "New" || b.condition === "Good" || b.condition === "Worn") 
              ? b.condition 
              : "Good" as const,
            genre: b.genre || "Unknown",
            owner: {
              name: user.email || "You",
              avatar: "/placeholder.svg",
              rating: 5,
            },
          }))
        );
      } catch (err) {
        console.error('Error loading books:', err);
        toast.error(err instanceof Error ? err.message : "Failed to load your books");
      } finally {
        setLoading(false);
      }
    }
    loadBooks();
  }, [user]);

  useEffect(() => {
    async function loadInterestedBooks() {
      if (!user) {
        setInterestedBooks([]);
        return;
      }
      setLoadingInterested(true);
      try {
        const books = await fetchInterestedBooks(user.id);
        setInterestedBooks(books);
      } catch (err) {
        console.error('Error loading interested books:', err);
        toast.error(err instanceof Error ? err.message : "Failed to load interested books");
      } finally {
        setLoadingInterested(false);
      }
    }
    loadInterestedBooks();
  }, [user]);

  const handleDelete = () => {
    if (bookToDelete) {
      setListedBooks(listedBooks.filter((book) => book.id !== bookToDelete.id));
      toast.success(`"${bookToDelete.title}" has been removed.`);
      setIsDeleteDialogOpen(false);
      setBookToDelete(null);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Books</h1>
          <Button asChild>
            <Link to="/add-book" className="flex items-center gap-2">
              <BookPlus className="h-4 w-4" />
              Add a Book
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="listed" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="listed">Listed Books</TabsTrigger>
            <TabsTrigger value="interested">Interested In</TabsTrigger>
          </TabsList>

          <TabsContent value="listed">
            {loading ? (
              <div className="text-center py-12">
                <span>Loading...</span>
              </div>
            ) : listedBooks.length === 0 ? (
              <div className="text-center py-16 border rounded-lg bg-card">
                <div className="flex justify-center mb-4">
                  <BookPlus className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Books Listed</h3>
                <p className="text-muted-foreground mb-6">
                  Share books you want to exchange with other users
                </p>
                <Button asChild>
                  <Link to="/add-book">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    List Your First Book
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {listedBooks.map((book) => (
                  <div
                    key={book.id}
                    className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg"
                  >
                    <div className="w-full sm:w-24 h-36">
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-semibold">
                            <Link to={`/book/${book.id}`} className="hover:underline">
                              {book.title}
                            </Link>
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            by {book.author}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="-mt-1">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link
                                to={`/book/${book.id}`}
                                className="flex cursor-pointer items-center"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit listing
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex cursor-pointer items-center text-destructive"
                              onClick={() => {
                                setBookToDelete(book);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete listing
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-muted">
                          {book.genre}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-muted">
                          {book.condition}
                        </span>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-medium">Status</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-sm">Active</span>
                        </div>
                      </div>
                    </div>

                    <div className="min-w-[120px] flex flex-col gap-2 mt-4 sm:mt-0">
                      <div className="text-sm">
                        <p className="text-muted-foreground">Listed on</p>
                        <p className="font-medium">—</p>
                      </div>
                      <div className="text-sm mt-2">
                        <p className="text-muted-foreground">Interested users</p>
                        <p className="font-medium">—</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="interested">
            {loadingInterested ? (
              <div className="text-center py-12">
                <span>Loading...</span>
              </div>
            ) : interestedBooks.length === 0 ? (
              <div className="text-center py-16 border rounded-lg bg-card">
                <div className="flex justify-center mb-4">
                  <BookPlus className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Interested Books</h3>
                <p className="text-muted-foreground mb-6">
                  Books you're interested in will appear here
                </p>
                <Button asChild>
                  <Link to="/explore">Explore Books</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {interestedBooks.map((book) => (
                  <div
                    key={book.id}
                    className="book-card"
                  >
                    <Link to={`/book/${book.id}`} className="block">
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold line-clamp-1">{book.title}</h3>
                        <p className="text-sm text-muted-foreground">{book.author}</p>
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center">
                            <img
                              src={book.owner.avatar}
                              alt={book.owner.name}
                              className="w-6 h-6 rounded-full mr-2"
                            />
                            <span className="text-xs">{book.owner.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setInterestedBooks(
                                interestedBooks.filter(
                                  (b) => b.id !== book.id
                                )
                              );
                              toast.info(`Removed "${book.title}" from your interested books.`);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Book Listing</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{bookToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyBooks;
