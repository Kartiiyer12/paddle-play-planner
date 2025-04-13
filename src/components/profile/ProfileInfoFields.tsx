
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProfileInfoFieldsProps {
  name: string;
  age: string;
  sex: "male" | "female" | "other";
  skillLevel: "beginner" | "intermediate" | "advanced" | "expert" | "legendary";
  onInputChange: (field: string, value: string) => void;
  disabled?: boolean;
}

const ProfileInfoFields = ({
  name,
  age,
  sex,
  skillLevel,
  onInputChange,
  disabled = false
}: ProfileInfoFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input 
            id="name" 
            value={name} 
            onChange={(e) => onInputChange("name", e.target.value)} 
            placeholder="Your name"
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input 
            id="age" 
            type="number" 
            value={age} 
            onChange={(e) => onInputChange("age", e.target.value)} 
            placeholder="Your age"
            disabled={disabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="sex">Sex</Label>
          <Select 
            value={sex} 
            onValueChange={(value: "male" | "female" | "other") => onInputChange("sex", value)}
            disabled={disabled}
          >
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
          <Select 
            value={skillLevel} 
            onValueChange={(value: "beginner" | "intermediate" | "advanced" | "expert" | "legendary") => 
              onInputChange("skillLevel", value)
            }
            disabled={disabled}
          >
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
    </>
  );
};

export default ProfileInfoFields;
