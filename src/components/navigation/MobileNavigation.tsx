
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { logoutUser } from "@/services/authService";
import { toast } from "sonner";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MobileNavigation = () => {
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

  const handleBookNow = () => {
    if (user) {
      navigate("/book-slot");
      setIsOpen(false);
    } else {
      navigate("/login");
      setIsOpen(false);
    }
  };

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
          <div className="flex flex-col space-y-4 p-4">
            <Link
              to="/"
              className="text-gray-700 hover:text-pickleball-purple"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            {user ? (
              <>
                <Link
                  to="/my-bookings"
                  className="text-gray-700 hover:text-pickleball-purple"
                  onClick={() => setIsOpen(false)}
                >
                  My Bookings
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-pickleball-purple"
                  onClick={() => setIsOpen(false)}
                >
                  My Profile
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
              <Button
                className="bg-pickleball-purple hover:bg-pickleball-purple/90 w-full"
                onClick={handleBookNow}
              >
                Book Now
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileNavigation;
