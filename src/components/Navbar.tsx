
import { Link } from "react-router-dom";
import DesktopNavigation from "./navigation/DesktopNavigation";
import MobileNavigation from "./navigation/MobileNavigation";

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 fixed w-full top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link to="/" className="text-2xl font-bold text-pickleball-purple">
            PicklePlay
          </Link>
        </div>

        {/* Desktop Navigation */}
        <DesktopNavigation />

        {/* Mobile Navigation */}
        <MobileNavigation />
      </div>
    </nav>
  );
};

export default Navbar;
