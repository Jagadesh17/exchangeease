import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Edit, ExternalLink, Mail, MapPin, Star, User } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { BookProps } from "@/components/book/BookCard";
import { MOCK_BOOKS } from "@/data/mock-data";
import { useAuth } from "@/providers/AuthProvider";
import { useRef } from "react";
import { fetchUserStats, UserStats } from "@/utils/profile";

const Profile = () => {
  const { profile, updateProfile, refreshProfile } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    booksListed: 0,
    successfulSwaps: 0,
    memberSince: '',
    books: []
  });
  const [exchangedBooks, setExchangedBooks] = useState<BookProps[]>(MOCK_BOOKS.slice(0, 4));
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    email: profile?.email || "",
    location: profile?.location || "",
    bio: profile?.bio || "",
    profilePic: profile?.profile_pic || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&auto=format&fit=crop",
  });
  const [selectedPicFile, setSelectedPicFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditMode && profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        location: profile.location || "",
        bio: profile.bio || "",
        profilePic: profile.profile_pic || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&auto=format&fit=crop",
      });
      setSelectedPicFile(null);
    }
  }, [isEditMode, profile]);

  useEffect(() => {
    async function loadStats() {
      if (profile?.id) {
        try {
          const stats = await fetchUserStats(profile.id);
          setUserStats(stats);
        } catch (error) {
          console.error('Error loading user stats:', error);
        }
      }
    }
    loadStats();
  }, [profile?.id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPicFile(file);
      setFormData((prev) => ({
        ...prev,
        profilePic: URL.createObjectURL(file),
      }));
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const update: any = {
      name: formData.name,
      email: formData.email,
      location: formData.location,
      bio: formData.bio,
    };
    if (selectedPicFile) update.profile_pic_file = selectedPicFile;

    const result = await updateProfile(update);
    setIsSaving(false);

    if (result.error) {
      toast.error(`Error updating profile: ${result.error}`);
    } else {
      setIsEditMode(false);
      toast.success("Profile updated successfully!");
      await refreshProfile();
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
        <div>
          <div className="aspect-square rounded-lg overflow-hidden">
            <img
              src={formData.profilePic}
              alt={formData.name}
              className="w-full h-full object-cover"
            />
          </div>
          {isEditMode && (
            <div className="mt-4">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePicChange}
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                Change Picture
              </Button>
            </div>
          )}
        </div>

        <div>
          {isEditMode ? (
            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>
              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={() => setIsEditMode(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  onClick={handleSaveProfile}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          ) : (
            <div>
              <h1 className="text-2xl font-bold">{formData.name}</h1>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center justify-center md:justify-start mt-2 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{formData.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{formData.location}</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm">{formData.bio}</p>
              </div>
              <div className="flex items-center mt-4 justify-center md:justify-start">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= 4.5
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm">4.5/5 (24 reviews)</span>
                </div>
                <Button variant="link" className="ml-2 p-0" asChild>
                  <Link to="/reviews">View all reviews</Link>
                </Button>
              </div>
              <Button onClick={() => setIsEditMode(true)} className="mt-4">
                Edit Profile
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Books Listed</span>
                <span className="font-bold">{userStats.booksListed}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Successful Swaps</span>
                <span className="font-bold">{userStats.successfulSwaps}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Member Since</span>
                <span className="font-bold flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  {userStats.memberSince}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Listed Books</CardTitle>
            <CardDescription>
              Books you've listed for exchange
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userStats.books.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't listed any books yet</p>
                <Button asChild>
                  <Link to="/add-book">Add Your First Book</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {userStats.books.map((book) => (
                  <div key={book.id} className="flex items-center gap-4 p-2 border rounded-lg">
                    <img
                      src={book.cover_url || "/placeholder.svg"}
                      alt={book.title}
                      className="w-16 h-20 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <Link to={`/book/${book.id}`} className="hover:underline">
                        <h4 className="font-medium line-clamp-1">{book.title}</h4>
                      </Link>
                      <p className="text-sm text-muted-foreground">{book.author}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary">{book.genre}</Badge>
                        <Badge variant="secondary">{book.condition}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
