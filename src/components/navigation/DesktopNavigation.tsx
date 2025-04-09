
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

  return (
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
      {user ? (
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
  );
};

export default DesktopNavigation;
