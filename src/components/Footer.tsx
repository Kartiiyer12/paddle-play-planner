
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-pickleball-purple">PicklePlay</h3>
            <p className="text-gray-600 text-sm">
              Community-driven pickleball court booking platform. Connect, play, and enjoy!
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-pickleball-purple text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/#how-it-works" className="text-gray-600 hover:text-pickleball-purple text-sm">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/#venues" className="text-gray-600 hover:text-pickleball-purple text-sm">
                  Venues
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Help & Support</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-pickleball-purple text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-pickleball-purple text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-600 hover:text-pickleball-purple text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-pickleball-purple text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Connect With Us</h4>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-pickleball-purple hover:text-pickleball-purple/80">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-pickleball-purple hover:text-pickleball-purple/80">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-pickleball-purple hover:text-pickleball-purple/80">
                <Twitter size={20} />
              </a>
            </div>
            <p className="text-gray-600 text-sm">
              Subscribe to our newsletter for updates on new venues and events!
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6">
          <p className="text-center text-gray-600 text-sm">
            © {currentYear} PicklePlay. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
