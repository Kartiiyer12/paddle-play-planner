
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/navigation/BackButton";
import { useAuth } from "@/context/AuthContext";
import { Venue } from "@/models/types";
import { getVenues } from "@/services/venueService";

type ProfileFormData = {
  name: string;
  age: string;
  sex: "male" | "female" | "other";
  skillLevel: "beginner" | "intermediate" | "advanced" | "expert" | "legendary";
  preferredVenues: string[];
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, isLoading: isLoadingAuth } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    age: "",
    sex: "male",
    skillLevel: "beginner",
    preferredVenues: []
  });
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!user) {
        toast.error("You must be logged in to view your profile");
        navigate("/login");
        return;
      }

      if (user.name) {
        setFormData(prev => ({ ...prev, name: user.name }));
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

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVenueToggle = (venueId: string) => {
    setFormData(prev => {
      if (prev.preferredVenues.includes(venueId)) {
        return {
          ...prev,
          preferredVenues: prev.preferredVenues.filter(id => id !== venueId)
        };
      } else {
        return {
          ...prev,
          preferredVenues: [...prev.preferredVenues, venueId]
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Here you would save the profile data to the database
      // For now, just show a success message
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
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
            <BackButton to="/" />
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
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      value={formData.name} 
                      onChange={(e) => handleInputChange("name", e.target.value)} 
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input 
                      id="age" 
                      type="number" 
                      value={formData.age} 
                      onChange={(e) => handleInputChange("age", e.target.value)} 
                      placeholder="Your age"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sex">Sex</Label>
                    <Select value={formData.sex} onValueChange={(value: any) => handleInputChange("sex", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your sex" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skillLevel">Skill Level</Label>
                    <Select value={formData.skillLevel} onValueChange={(value: any) => handleInputChange("skillLevel", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your skill level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                        <SelectItem value="legendary">Legendary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Preferred Venues</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {venues.map((venue) => (
                      <div
                        key={venue.id}
                        className={`border rounded-md p-4 cursor-pointer ${
                          formData.preferredVenues.includes(venue.id)
                            ? "border-pickleball-purple bg-pickleball-purple/5"
                            : "border-gray-200 hover:border-pickleball-purple/50"
                        }`}
                        onClick={() => handleVenueToggle(venue.id)}
                      >
                        <h3 className="font-medium">{venue.name}</h3>
                        <p className="text-sm text-gray-500">{venue.city}, {venue.state}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="bg-pickleball-purple hover:bg-pickleball-purple/90 w-full md:w-auto"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
