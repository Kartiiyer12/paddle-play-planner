
import { Button } from "@/components/ui/button";
import { Venue } from "@/models/types";
import ProfileInfoFields from "./profile/ProfileInfoFields";
import ProfileVenueSelector from "./profile/ProfileVenueSelector";
import { useProfileForm } from "./profile/useProfileForm";

interface ProfileFormProps {
  userId: string;
  venues: Venue[];
  onSaved?: () => void;
}

const ProfileForm = ({ userId, venues, onSaved }: ProfileFormProps) => {
  const {
    formData,
    isLoading,
    isSaving,
    handleInputChange,
    handleVenueToggle,
    handleSubmit
  } = useProfileForm(userId, onSaved);

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ProfileInfoFields
        name={formData.name}
        age={formData.age}
        sex={formData.sex}
        skillLevel={formData.skillLevel}
        onInputChange={handleInputChange}
        disabled={isSaving}
      />

      <ProfileVenueSelector
        venues={venues}
        selectedVenues={formData.preferredVenues}
        onVenueToggle={handleVenueToggle}
        disabled={isSaving}
      />

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
