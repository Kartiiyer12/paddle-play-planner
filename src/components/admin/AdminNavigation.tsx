
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  MapPin, 
  Calendar, 
  CreditCard,
  Settings,
  Euro,
  Tag
} from "lucide-react";

const AdminNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    {
      label: "User Management",
      path: "/admin/users",
      icon: <Users className="h-5 w-5 mr-2" />
    },
    {
      label: "Venue Management",
      path: "/admin/venues",
      icon: <MapPin className="h-5 w-5 mr-2" />
    },
    {
      label: "Slot Management",
      path: "/admin/slots",
      icon: <Calendar className="h-5 w-5 mr-2" />
    },
    {
      label: "Payment Setup",
      path: "/admin/payments",
      icon: <CreditCard className="h-5 w-5 mr-2" />
    },
    {
      label: "Slot Configuration",
      path: "/admin/slot-config",
      icon: <Tag className="h-5 w-5 mr-2" />
    },
    {
      label: "Settings",
      path: "/admin/settings",
      icon: <Settings className="h-5 w-5 mr-2" />
    }
  ];

  return (
    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-6 overflow-x-auto whitespace-nowrap pb-2">
      {navItems.map((item) => (
        <Button
          key={item.path}
          variant={isActive(item.path) ? "default" : "outline"}
          className={`flex items-center ${
            isActive(item.path) 
              ? "bg-pickleball-purple" 
              : "border-pickleball-purple text-pickleball-purple hover:bg-pickleball-purple/10"
          }`}
          onClick={() => navigate(item.path)}
        >
          {item.icon}
          <span className="hidden sm:inline">{item.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default AdminNavigation;
