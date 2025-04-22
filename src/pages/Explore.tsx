import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import BookCard, { BookProps } from "@/components/book/BookCard";
import { Search, SlidersHorizontal } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { fetchAllBooks } from "@/utils/books";
import { toast } from "sonner";

const Explore = () => {
  const [books, setBooks] = useState<BookProps[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<BookProps[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedCondition, setSelectedCondition] = useState<string>("all");
  const [distanceRange, setDistanceRange] = useState<number[]>([10]);
  const [loading, setLoading] = useState(true);

  // Fetch books from the database
  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllBooks();
      console.log('Loaded books:', data);
      const formattedBooks = data.map((book) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        cover: book.cover_url || "/placeholder.svg",
        condition: (book.condition || "Good") as BookProps["condition"],
        genre: book.genre || "Unknown",
        owner: {
          name: "Book Owner",
          avatar: "/placeholder.svg",
          rating: 5,
        },
      }));
      console.log('Formatted books:', formattedBooks.length);
      setBooks(formattedBooks);
      setFilteredBooks(formattedBooks);
    } catch (err) {
      console.error("Error loading books:", err);
      toast.error(err instanceof Error ? err.message : "Failed to load books");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // Remove a book from the local state
  const removeBookFromState = useCallback((bookId: string) => {
    setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
    setFilteredBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
  }, []);

  // Filter books based on search and filters
  useEffect(() => {
    let result = books;

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply genre filter
    if (selectedGenre !== "all") {
      result = result.filter((book) => book.genre === selectedGenre);
    }

    // Apply condition filter
    if (selectedCondition !== "all") {
      result = result.filter(
        (book) => book.condition === selectedCondition
      );
    }

    setFilteredBooks(result);
  }, [searchQuery, selectedGenre, selectedCondition, books]);

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

  return (
    <div className="container mx-auto">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold">Explore Books</h1>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search books..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Books</SheetTitle>
                  <SheetDescription>
                    Customize your book search with these filters.
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 py-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Genre</h3>
                    <Select
                      value={selectedGenre}
                      onValueChange={setSelectedGenre}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a genre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Genres</SelectItem>
                        {genres.map((genre) => (
                          <SelectItem key={genre} value={genre}>
                            {genre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Condition</h3>
                    <Select
                      value={selectedCondition}
                      onValueChange={setSelectedCondition}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Conditions</SelectItem>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Worn">Worn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Distance (km)</h3>
                    <Slider
                      value={distanceRange}
                      onValueChange={setDistanceRange}
                      max={50}
                      step={1}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0 km</span>
                      <span>{distanceRange[0]} km</span>
                      <span>50 km</span>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Books</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="recent">Recently Added</TabsTrigger>
          </TabsList>

          {["all", "recommended", "recent"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-0">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">Loading books...</p>
                </div>
              ) : filteredBooks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">
                    No books found matching your search criteria.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {filteredBooks.map((book) => (
                    <BookCard key={book.id} {...book} />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Explore;
