
import { useState, useEffect } from "react";
import { getProfile, updateProfile } from "@/services/profileService";
import { toast } from "sonner";

export type ProfileFormData = {
  name: string;
  age: string;
  sex: "male" | "female" | "other";
  skillLevel: "beginner" | "intermediate" | "advanced" | "expert" | "legendary";
  preferredVenues: string[];
};

export const useProfileForm = (userId: string, onSaved?: () => void) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    age: "",
    sex: "male",
    skillLevel: "beginner",
    preferredVenues: []
  });
  
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
            sex: (profile.sex as "male" | "female" | "other") || "male",
            skillLevel: (profile.skill_level as "beginner" | "intermediate" | "advanced" | "expert" | "legendary") || "beginner",
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

  return {
    formData,
    isLoading,
    isSaving,
    handleInputChange,
    handleVenueToggle,
    handleSubmit
  };
};
