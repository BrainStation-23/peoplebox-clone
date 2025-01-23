import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Level } from "../../types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BasicInfoTabProps {
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  profileImageUrl: string;
  setProfileImageUrl: (value: string) => void;
  selectedLevel: string;
  setSelectedLevel: (value: string) => void;
  orgId: string;
  setOrgId: (value: string) => void;
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
  orgId,
  setOrgId,
}: BasicInfoTabProps) {
  // Fetch levels
  const { data: levels } = useQuery({
    queryKey: ["levels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("levels")
        .select("*")
        .eq("status", "active");
      
      if (error) throw error;
      return data as Level[];
    },
  });

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
        <Label htmlFor="orgId">Organization ID</Label>
        <Input
          id="orgId"
          value={orgId}
          onChange={(e) => setOrgId(e.target.value)}
          placeholder="Enter organization ID"
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