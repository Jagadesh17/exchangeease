
import React from "react";
import { Link } from "react-router-dom";
import HomeNavbar from "@/components/layout/HomeNavbar";
import { BookOpen, Repeat, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const HowItWorks = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <HomeNavbar />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-12">How Exchange Ease Works</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="flex flex-col items-center text-center p-6 rounded-lg border hover:shadow-md transition-shadow">
            <div className="bg-book-100 p-4 rounded-full mb-6">
              <BookOpen className="h-10 w-10 text-book-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">List Your Books</h3>
            <p className="text-muted-foreground">
              Add books you want to exchange. Provide details and photos to help others find them.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 rounded-lg border hover:shadow-md transition-shadow">
            <div className="bg-book-100 p-4 rounded-full mb-6">
              <Repeat className="h-10 w-10 text-book-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Match & Exchange</h3>
            <p className="text-muted-foreground">
              Our AI finds perfect matches based on your preferences and location.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 rounded-lg border hover:shadow-md transition-shadow">
            <div className="bg-book-100 p-4 rounded-full mb-6">
              <ShieldCheck className="h-10 w-10 text-book-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Safe & Secure</h3>
            <p className="text-muted-foreground">
              Meet at suggested safe locations and verify exchanges with our secure QR system.
            </p>
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Detailed Process</h2>
          
          <div className="space-y-8">
            <div className="bg-secondary p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">1. Create Your Account</h3>
              <p className="mb-4">
                Sign up for an Exchange Ease account to get started. You'll need to provide some basic information and verify your email.
              </p>
              <Button asChild>
                <Link to="/register">Sign Up Now</Link>
              </Button>
            </div>
            
            <div className="bg-secondary p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">2. Add Books to Your Collection</h3>
              <p>
                List the books you want to exchange. You can scan barcodes, search by title, or manually enter details. Add photos and describe the condition for better matches.
              </p>
            </div>
            
            <div className="bg-secondary p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">3. Browse Available Books</h3>
              <p>
                Explore books available for exchange in your area. Filter by genre, condition, distance, and more.
              </p>
            </div>
            
            <div className="bg-secondary p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">4. Request Exchanges</h3>
              <p>
                When you find a book you want, request an exchange. The owner will review your request and respond.
              </p>
            </div>
            
            <div className="bg-secondary p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">5. Meet Safely and Exchange</h3>
              <p>
                Coordinate a meeting at a safe public location. Use our app to verify the exchange with QR codes.
              </p>
            </div>
            
            <div className="bg-secondary p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">6. Rate Your Experience</h3>
              <p>
                After the exchange, rate your experience to help maintain a trustworthy community.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
