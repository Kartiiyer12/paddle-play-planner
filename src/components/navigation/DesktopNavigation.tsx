
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { logoutUser } from "@/services/authService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const DesktopNavigation = () => {
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
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="hidden md:flex items-center space-x-6">
      <Link to="/" className="text-gray-700 hover:text-pickleball-purple">
        Home
      </Link>
      {user ? (
        <>
          <Link to="/my-bookings" className="text-gray-700 hover:text-pickleball-purple">
            My Bookings
          </Link>
          <Link to="/profile" className="text-gray-700 hover:text-pickleball-purple">
            My Profile
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
        <Button 
          onClick={handleBookNow}
          className="bg-pickleball-purple hover:bg-pickleball-purple/90"
        >
          Book Now
        </Button>
      )}
    </div>
  );
};

export default DesktopNavigation;
