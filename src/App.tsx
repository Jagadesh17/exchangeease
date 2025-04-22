import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Layout from "./components/layout/Layout";
import Explore from "./pages/Explore";
import MyBooks from "./pages/MyBooks";
import BookDetails from "./pages/BookDetails";
import Profile from "./pages/Profile";
import AddBook from "./pages/AddBook";
import Matches from "./pages/Matches";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HowItWorks from "./pages/HowItWorks";
import Settings from "./pages/Settings";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, session } = useAuth();
  
  if (!user || !session) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/" element={<Layout />}>
                  <Route path="/explore" element={<Explore />} />
                  <Route 
                    path="/my-books" 
                    element={
                      <ProtectedRoute>
                        <MyBooks />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/book/:id" element={<BookDetails />} />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/add-book" 
                    element={
                      <ProtectedRoute>
                        <AddBook />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/matches" 
                    element={
                      <ProtectedRoute>
                        <Matches />
                      </ProtectedRoute>
                    } 
                  />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
