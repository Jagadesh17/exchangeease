import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BookHeart,
  Home,
  Library,
  Map,
  PlusCircle,
  Settings,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { Search, Handshake } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { pathname } = useLocation();

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/50 transition-opacity duration-200 ease-in-out md:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 transform border-r border-gray-200 bg-white transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900",
          "md:translate-x-0 md:pt-20",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto bg-white px-4 py-6 dark:bg-gray-900">
          <nav className="flex-1">
            <ul className="space-y-1.5 font-medium">
              <li>
                <Link
                  to="/explore"
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2.5 text-sm text-gray-900 transition-all hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800",
                    pathname === "/explore" && "bg-gray-100 dark:bg-gray-800 font-semibold"
                  )}
                  onClick={() => onClose()}
                >
                  <Search className="h-5 w-5" />
                  <span className="ml-3">Explore</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/my-books"
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2.5 text-sm text-gray-900 transition-all hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800",
                    pathname === "/my-books" && "bg-gray-100 dark:bg-gray-800 font-semibold"
                  )}
                  onClick={() => onClose()}
                >
                  <Library className="h-5 w-5" />
                  <span className="ml-3">My Books</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/matches"
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2.5 text-sm text-gray-900 transition-all hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800",
                    pathname === "/matches" && "bg-gray-100 dark:bg-gray-800 font-semibold"
                  )}
                  onClick={() => onClose()}
                >
                  <Handshake className="h-5 w-5" />
                  <span className="ml-3">Matches</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2.5 text-sm text-gray-900 transition-all hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800",
                    pathname === "/profile" && "bg-gray-100 dark:bg-gray-800 font-semibold"
                  )}
                  onClick={() => onClose()}
                >
                  <UserRound className="h-5 w-5" />
                  <span className="ml-3">Profile</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/settings"
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2.5 text-sm text-gray-900 transition-all hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800",
                    pathname === "/settings" && "bg-gray-100 dark:bg-gray-800 font-semibold"
                  )}
                  onClick={() => onClose()}
                >
                  <Settings className="h-5 w-5" />
                  <span className="ml-3">Settings</span>
                </Link>
              </li>
            </ul>
          </nav>
          
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800">
            <Button
              variant="default"
              className="w-full flex items-center gap-2 justify-center"
              asChild
            >
              <Link to="/add-book" onClick={() => onClose()}>
                <PlusCircle className="h-5 w-5" />
                <span>List a Book</span>
              </Link>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
