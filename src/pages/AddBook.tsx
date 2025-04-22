import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, BookType, ImagePlus, Info, Upload } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";
import { addBook } from "@/utils/books";
import { uploadBookCover } from "@/utils/storage";

const AddBook = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [bookCover, setBookCover] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    genre: "",
    condition: "",
    description: "",
    location: "",
    exchange_method: "In Person" as "In Person" | "Mail" | "Both",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === "string") {
          setBookCover(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.title || !formData.author || !formData.genre || !formData.condition || !formData.location || !formData.exchange_method) {
      toast.error("Please fill in all required fields.");
      setIsLoading(false);
      return;
    }

    if (!user) {
      toast.error("You must be logged in to list a book.");
      setIsLoading(false);
      return;
    }

    try {
      let cover_url = null;

      if (coverFile) {
        try {
          cover_url = await uploadBookCover(coverFile, user.id);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to upload cover image";
          console.error("Error uploading cover:", err);
          toast.error(errorMessage);
          setIsLoading(false);
          return;
        }
      }

      await addBook(
        {
          title: formData.title,
          author: formData.author,
          isbn: formData.isbn,
          genre: formData.genre,
          condition: formData.condition,
          description: formData.description,
          cover_url: cover_url,
          location: formData.location,
          exchange_method: formData.exchange_method,
        },
        user.id
      );
      toast.success("Book successfully listed!");
      navigate("/my-books");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add book";
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

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
      <div className="flex flex-col space-y-6 max-w-3xl mx-auto">
        <Button
          variant="ghost"
          className="w-fit mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="text-3xl font-bold">List a Book for Exchange</h1>
        <p className="text-muted-foreground">
          Provide details about the book you want to exchange with others
        </p>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Book Cover</CardTitle>
                  <CardDescription>
                    Add a clear photo of your book
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-full aspect-[3/4] mb-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center overflow-hidden ${
                        bookCover ? "border-0" : "border-muted"
                      }`}
                    >
                      {bookCover ? (
                        <img
                          src={bookCover}
                          alt="Book cover preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-6">
                          <ImagePlus className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Drag and drop or click to upload
                          </p>
                        </div>
                      )}
                    </div>
                    <Label
                      htmlFor="cover-upload"
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2 text-primary hover:underline">
                        <Upload className="h-4 w-4" />
                        <span>{bookCover ? "Change cover" : "Upload cover"}</span>
                      </div>
                      <Input
                        id="cover-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverChange}
                      />
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Scan ISBN</CardTitle>
                  <CardDescription>
                    Use ISBN to auto-fill book details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <BookType className="mr-2 h-4 w-4" />
                    Scan ISBN
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Book Details</CardTitle>
                  <CardDescription>
                    Enter information about your book
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">
                        Title <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="Book title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="author">
                        Author <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="author"
                        name="author"
                        placeholder="Author's name"
                        value={formData.author}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="isbn">ISBN</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>The ISBN is typically found on the back cover of the book</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Input
                        id="isbn"
                        name="isbn"
                        placeholder="e.g., 978-3-16-148410-0"
                        value={formData.isbn}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="genre">
                          Genre <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.genre}
                          onValueChange={(value) =>
                            handleSelectChange("genre", value)
                          }
                          required
                        >
                          <SelectTrigger id="genre">
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
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="condition">
                          Condition <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.condition}
                          onValueChange={(value) =>
                            handleSelectChange("condition", value)
                          }
                          required
                        >
                          <SelectTrigger id="condition">
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Good">Good</SelectItem>
                            <SelectItem value="Worn">Worn</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">
                        Location <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="location"
                        name="location"
                        placeholder="e.g., Toronto, ON"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="exchange_method">
                        Exchange Method <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.exchange_method}
                        onValueChange={(value) =>
                          handleSelectChange("exchange_method", value as "In Person" | "Mail" | "Both")
                        }
                      >
                        <SelectTrigger id="exchange_method">
                          <SelectValue placeholder="Select exchange method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="In Person">In Person</SelectItem>
                          <SelectItem value="Mail">Mail</SelectItem>
                          <SelectItem value="Both">Both (In Person & Mail)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Describe your book, its condition, and any other details..."
                        rows={5}
                        value={formData.description}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Exchange Preferences</CardTitle>
                  <CardDescription>
                    Specify what books you'd like to receive in exchange
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Interested in Genres</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {genres.slice(0, 6).map((genre) => (
                          <div key={genre} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`genre-${genre}`}
                              className="rounded text-primary"
                            />
                            <Label htmlFor={`genre-${genre}`}>{genre}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="exchange-notes">Additional Notes</Label>
                      <Textarea
                        id="exchange-notes"
                        placeholder="Any specific books or authors you're looking for?"
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/my-books")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Listing..." : "List Book"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBook;
