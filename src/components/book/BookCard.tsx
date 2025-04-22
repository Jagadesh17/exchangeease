import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Info, Repeat } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

export interface BookProps {
  id: string;
  title: string;
  author: string;
  cover: string;
  condition: "New" | "Good" | "Worn";
  genre: string;
  location?: string;
  owner: {
    name: string;
    avatar: string;
    rating: number;
  };
}

const BookCard = ({ id, title, author, cover, condition, genre, location, owner }: BookProps) => {
  const [isInterested, setIsInterested] = useState(false);

  const handleInterestClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInterested(!isInterested);
    
    if (!isInterested) {
      toast.success("Added to your interested books!");
    } else {
      toast.info("Removed from your interested books");
    }
  };

  const conditionClasses = {
    New: "condition-new",
    Good: "condition-good",
    Worn: "condition-worn",
  };

  return (
    <Link to={`/book/${id}`}>
      <Card className="book-card h-full flex flex-col">
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={cover}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className={`book-condition ${conditionClasses[condition]}`}>
            {condition}
          </div>
        </div>
        <CardContent className="flex-grow p-4">
          <h3 className="font-semibold text-base line-clamp-1 mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-2">{author}</p>
          <Badge variant="secondary" className="text-xs">
            {genre}
          </Badge>
        </CardContent>
        <CardFooter className="flex justify-between items-center border-t p-3 bg-muted/30">
          <div className="flex items-center">
            <img
              src={owner.avatar}
              alt={owner.name}
              className="w-6 h-6 rounded-full mr-2"
            />
            <span className="text-xs">{owner.name}</span>
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleInterestClick}
            >
              <Heart className={`h-4 w-4 ${isInterested ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default BookCard;
