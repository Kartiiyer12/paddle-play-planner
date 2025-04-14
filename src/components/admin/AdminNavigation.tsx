
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Users, 
  Building2, 
  CalendarDays,
  Settings
} from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const AdminNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    {
      label: "Venues",
      path: "/admin/venues",
      icon: <Building2 className="h-5 w-5" />
    },
    {
      label: "Slots",
      path: "/admin/slots",
      icon: <CalendarDays className="h-5 w-5" />
    },
    {
      label: "Users",
      path: "/admin/users",
      icon: <Users className="h-5 w-5" />
    },
    {
      label: "Settings",
      path: "/admin/settings",
      icon: <Settings className="h-5 w-5" />
    }
  ];

  // Mobile version (bottom navigation for small screens)
  const mobileNav = (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 p-2">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Button
            key={item.path + "-mobile"}
            variant="ghost"
            size="sm"
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center py-1 px-0 h-auto rounded-md",
              isActive(item.path) && "bg-gray-100 text-pickleball-purple"
            )}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );

  // Desktop version
  const desktopNav = (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList className="flex space-x-2">
        {navItems.map((item) => (
          <NavigationMenuItem key={item.path}>
            <Button
              variant={isActive(item.path) ? "default" : "outline"}
              className={cn(
                "flex items-center",
                isActive(item.path) 
                  ? "bg-pickleball-purple" 
                  : "border-pickleball-purple text-pickleball-purple hover:bg-pickleball-purple/10"
              )}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span className="ml-2">{item.label}</span>
            </Button>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );

  return (
    <>
      {desktopNav}
      {mobileNav}
    </>
  );
};

export default AdminNavigation;
