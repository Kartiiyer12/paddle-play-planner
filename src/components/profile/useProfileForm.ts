
import { useState, useEffect } from "react";
import { getProfile, updateProfile } from "@/services/profileService";
import { toast } from "sonner";

export type ProfileFormData = {
  name: string;
  preferredVenues: string[];
};

export const useProfileForm = (userId: string, onSaved?: () => void) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    preferredVenues: []
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const profile = await getProfile(userId);
        console.log("Loaded profile data:", profile);
        
        if (profile) {
          setFormData({
            name: profile.name || "",
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
      console.log("Submitting profile data:", formData);
      
      const result = await updateProfile(userId, {
        name: formData.name,
        preferred_venues: formData.preferredVenues
      });
      
      if (result) {
        toast.success("Profile updated successfully");
        if (onSaved) onSaved();
      }
    } catch (error) {
      console.error("Profile update error:", error);
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
