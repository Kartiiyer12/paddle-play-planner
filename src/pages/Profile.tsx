import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/navigation/BackButton";
import { useAuth } from "@/context/AuthContext";
import { Venue } from "@/models/types";
import { getVenues } from "@/services/venueService";
import ProfileForm from "@/components/ProfileForm";

const Profile = () => {
  const navigate = useNavigate();
  const { user, isLoading: isLoadingAuth } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!user) {
        toast.error("You must be logged in to view your profile");
        navigate("/login");
        return;
      }

      loadVenues();
    }
  }, [user, isLoadingAuth, navigate]);

  const loadVenues = async () => {
    setIsLoading(true);
    try {
      const venuesData = await getVenues();
      setVenues(venuesData);
    } catch (error) {
      toast.error("Failed to load venues");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSaved = () => {
    toast.success("Profile updated successfully");
    
    // If this was a new user completing their profile for the first time
    const isNewUser = sessionStorage.getItem('newUser');
    if (isNewUser) {
      sessionStorage.removeItem('newUser');
      navigate("/my-bookings");
    }
  };

  if (isLoadingAuth || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow pt-24 pb-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="mb-6">
            <BackButton to="/my-bookings" />
            <h1 className="text-3xl font-bold text-gray-900 mt-4">My Profile</h1>
            <p className="text-gray-600 mt-2">
              Update your personal information and preferences
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              {user && (
                <ProfileForm 
                  userId={user.id} 
                  venues={venues} 
                  onSaved={handleProfileSaved}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
