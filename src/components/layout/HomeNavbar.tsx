import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Book, LogOut, Search, User, HelpCircle } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/AuthProvider";

const HomeNavbar = () => {
  const { user, profile, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <Book className="h-6 w-6 text-book-400" />
            <span className="text-xl font-bold">Exchange Ease</span>
          </Link>
        </div>

        <div className="hidden md:flex md:flex-1 md:justify-center md:px-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for books..."
              className="w-full rounded-full bg-background pl-8 md:max-w-md"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to="/how-it-works" className="flex items-center gap-1">
              <HelpCircle className="h-4 w-4" />
              <span>How it works</span>
            </Link>
          </Button>
          
          <Button variant="ghost" asChild>
            <Link to="/my-books" className="flex items-center gap-1">
              <Book className="h-4 w-4" />
              <span>My Books</span>
            </Link>
          </Button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <img
                    src={profile?.profile_pic || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&auto=format&fit=crop&q=80"}
                    alt="User"
                    className="h-8 w-8 rounded-full"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex cursor-pointer items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/my-books" className="flex cursor-pointer items-center">
                    <Book className="mr-2 h-4 w-4" />
                    My Books
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex cursor-pointer items-center text-destructive"
                  onClick={signOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default HomeNavbar;
