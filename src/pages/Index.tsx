
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Book, BookOpen, Repeat, ShieldCheck, Users } from "lucide-react";
import HomeNavbar from "@/components/layout/HomeNavbar";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Home Navbar */}
      <HomeNavbar />
      
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-book-200 to-book-300 py-16 md:py-24">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-10 md:mb-0 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Swap Books, <br /> Share Knowledge
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-md">
              Exchange Ease is a modern platform that connects book lovers looking to trade their books with others nearby.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/explore">Explore Books</Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&h=500&fit=crop"
                alt="Stack of books"
                className="rounded-lg shadow-xl z-10 relative"
                width={400}
                height={400}
              />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-lg bg-book-400/20 -z-10"></div>
              <div className="absolute -top-4 -left-4 w-32 h-32 rounded-lg bg-book-400/20 -z-10"></div>
            </div>
          </div>
        </div>
      </header>

      {/* How It Works Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Exchange Ease?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col space-y-8">
              <div className="flex space-x-4">
                <div className="bg-book-300 rounded-full p-2 h-fit">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Community of Book Lovers</h3>
                  <p className="text-muted-foreground">
                    Join thousands of readers who share your passion for books.
                  </p>
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="bg-book-300 rounded-full p-2 h-fit">
                  <Book className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">AI-Powered Matching</h3>
                  <p className="text-muted-foreground">
                    Our advanced algorithms ensure you find the perfect books to exchange.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-8">
              <div className="flex space-x-4">
                <div className="bg-book-300 rounded-full p-2 h-fit">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Trusted Exchange System</h3>
                  <p className="text-muted-foreground">
                    User ratings and verification ensure safe and reliable swaps.
                  </p>
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="bg-book-300 rounded-full p-2 h-fit">
                  <Repeat className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Eco-Friendly Reuse</h3>
                  <p className="text-muted-foreground">
                    Give books a second life and reduce environmental impact.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-book-300 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Exchanging?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our community today and discover new books while sharing your collection with others.
          </p>
          <Button size="lg" variant="secondary" className="text-book-600" asChild>
            <Link to="/register">Create Your Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-book-700 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center gap-2">
                <Book className="h-6 w-6" />
                <span className="text-xl font-bold">Exchange Ease</span>
              </div>
              <p className="mt-2 text-book-200/80">© 2025 Exchange Ease. All rights reserved.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold mb-3">Product</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-book-200/80 hover:text-white">Features</a></li>
                  <li><a href="#" className="text-book-200/80 hover:text-white">How it works</a></li>
                  <li><a href="#" className="text-book-200/80 hover:text-white">Pricing</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Support</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-book-200/80 hover:text-white">Help Center</a></li>
                  <li><a href="#" className="text-book-200/80 hover:text-white">Contact Us</a></li>
                  <li><a href="#" className="text-book-200/80 hover:text-white">Community</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Legal</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-book-200/80 hover:text-white">Privacy Policy</a></li>
                  <li><a href="#" className="text-book-200/80 hover:text-white">Terms of Service</a></li>
                  <li><a href="#" className="text-book-200/80 hover:text-white">Cookie Policy</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
