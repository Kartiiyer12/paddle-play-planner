
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProfileInfoFieldsProps {
  name: string;
  onInputChange: (field: string, value: string) => void;
  disabled?: boolean;
}

const ProfileInfoFields = ({
  name,
  onInputChange,
  disabled = false
}: ProfileInfoFieldsProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="name">Name</Label>
      <Input 
        id="name" 
        value={name} 
        onChange={(e) => onInputChange("name", e.target.value)} 
        placeholder="Your name"
        disabled={true} // Always disabled - name comes from registration
        className="bg-gray-50"
      />
      <p className="text-sm text-gray-500">
        Name was set during registration. Contact support if you need to change it.
      </p>
    </div>
  );
};

export default ProfileInfoFields;
