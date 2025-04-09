
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { logoutUser } from "@/services/authService";
import { toast } from "sonner";

const Navbar = ({ isLoggedIn = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 fixed w-full top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link to="/" className="text-2xl font-bold text-pickleball-purple">
            PicklePlay
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-pickleball-purple">
            Home
          </Link>
          <Link to="/#how-it-works" className="text-gray-700 hover:text-pickleball-purple">
            How It Works
          </Link>
          <Link to="/#venues" className="text-gray-700 hover:text-pickleball-purple">
            Venues
          </Link>
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="text-gray-700 hover:text-pickleball-purple">
                Dashboard
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="text-gray-700 hover:text-pickleball-purple">
                  Admin Panel
                </Link>
              )}
              <Button 
                className="bg-pickleball-purple hover:bg-pickleball-purple/90"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" className="border-pickleball-purple text-pickleball-purple">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-pickleball-purple hover:bg-pickleball-purple/90">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
          <div className="flex flex-col space-y-4 p-4">
            <Link
              to="/"
              className="text-gray-700 hover:text-pickleball-purple"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/#how-it-works"
              className="text-gray-700 hover:text-pickleball-purple"
              onClick={() => setIsOpen(false)}
            >
              How It Works
            </Link>
            <Link
              to="/#venues"
              className="text-gray-700 hover:text-pickleball-purple"
              onClick={() => setIsOpen(false)}
            >
              Venues
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-pickleball-purple"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="text-gray-700 hover:text-pickleball-purple"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <Button
                  className="bg-pickleball-purple hover:bg-pickleball-purple/90 w-full"
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="w-full">
                  <Button
                    variant="outline"
                    className="border-pickleball-purple text-pickleball-purple w-full"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="w-full">
                  <Button
                    className="bg-pickleball-purple hover:bg-pickleball-purple/90 w-full"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
