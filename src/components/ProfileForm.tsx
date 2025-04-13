
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Venue } from "@/models/types";
import { Search } from "lucide-react";
import { updateProfile, getProfile, ProfileData } from "@/services/profileService";

type ProfileFormData = {
  name: string;
  age: string;
  sex: "male" | "female" | "other";
  skillLevel: "beginner" | "intermediate" | "advanced" | "expert" | "legendary";
  preferredVenues: string[];
};

interface ProfileFormProps {
  userId: string;
  venues: Venue[];
  onSaved?: () => void;
}

const ProfileForm = ({ userId, venues, onSaved }: ProfileFormProps) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    age: "",
    sex: "male",
    skillLevel: "beginner",
    preferredVenues: []
  });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const profile = await getProfile(userId);
        if (profile) {
          setFormData({
            name: profile.name || "",
            age: profile.age ? profile.age.toString() : "",
            sex: profile.sex || "male",
            skillLevel: profile.skill_level || "beginner",
            preferredVenues: profile.preferred_venues || []
          });
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

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
      await updateProfile(userId, {
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : undefined,
        sex: formData.sex,
        skill_level: formData.skillLevel,
        preferred_venues: formData.preferredVenues
      });
      
      toast.success("Profile updated successfully");
      if (onSaved) onSaved();
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredVenues = venues.filter(venue => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      venue.name.toLowerCase().includes(search) ||
      venue.city.toLowerCase().includes(search) ||
      venue.state.toLowerCase().includes(search)
    );
  });

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  return (
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
        <div className="relative">
          <Input
            type="text"
            placeholder="Search venues by city or county..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVenues.map((venue) => (
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
  );
};

export default ProfileForm;
