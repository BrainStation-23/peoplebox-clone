import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Level } from "../../types";

interface BasicInfoTabProps {
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  profileImageUrl: string;
  setProfileImageUrl: (value: string) => void;
  selectedLevel: string;
  setSelectedLevel: (value: string) => void;
  levels?: Level[];
}

export function BasicInfoTab({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  profileImageUrl,
  setProfileImageUrl,
  selectedLevel,
  setSelectedLevel,
  levels,
}: BasicInfoTabProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="lastName">Last Name</Label>
        <Input
          id="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="profileImage">Profile Image URL</Label>
        <Input
          id="profileImage"
          value={profileImageUrl}
          onChange={(e) => setProfileImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="grid gap-2">
        <Label>Level</Label>
        <RadioGroup
          value={selectedLevel}
          onValueChange={setSelectedLevel}
          className="flex flex-wrap gap-4"
        >
          {levels?.map((level) => (
            <div key={level.id} className="flex items-center space-x-2">
              <RadioGroupItem value={level.id} id={level.id} />
              <Label htmlFor={level.id}>{level.name}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}