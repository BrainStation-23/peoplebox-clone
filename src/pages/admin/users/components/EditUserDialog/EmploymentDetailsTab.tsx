import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Location, Level } from "../../types";

interface EmploymentDetailsTabProps {
  designation: string;
  setDesignation: (value: string) => void;
  selectedLocation: string;
  setSelectedLocation: (value: string) => void;
  selectedEmploymentType: string;
  setSelectedEmploymentType: (value: string) => void;
  selectedLevel: string;
  setSelectedLevel: (value: string) => void;
}

export function EmploymentDetailsTab({
  designation,
  setDesignation,
  selectedLocation,
  setSelectedLocation,
  selectedEmploymentType,
  setSelectedEmploymentType,
  selectedLevel,
  setSelectedLevel,
}: EmploymentDetailsTabProps) {
  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("*");
      
      if (error) throw error;
      return data as Location[];
    },
  });

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

  const { data: employmentTypes } = useQuery({
    queryKey: ["employment-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employment_types")
        .select("*")
        .eq("status", "active");
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="grid gap-6">
      {/* Level Selection */}
      <div className="grid gap-2">
        <Label>Employee Level</Label>
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

      {/* Enhanced Designation Input */}
      <div className="grid gap-2">
        <Label htmlFor="designation">Job Title/Position</Label>
        <Input
          id="designation"
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
          placeholder="Enter your job title (e.g., Software Engineer, Project Manager)"
          className="w-full"
        />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4" />
          <span>Specify your current role in the organization</span>
        </div>
      </div>

      {/* Location Selection */}
      <div className="grid gap-2">
        <Label>Location</Label>
        <RadioGroup
          value={selectedLocation}
          onValueChange={setSelectedLocation}
          className="flex flex-wrap gap-4"
        >
          {locations?.map((location) => (
            <div key={location.id} className="flex items-center space-x-2">
              <RadioGroupItem value={location.id} id={location.id} />
              <Label htmlFor={location.id}>{location.name}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Employment Type Selection */}
      <div className="grid gap-2">
        <Label>Employment Type</Label>
        <RadioGroup
          value={selectedEmploymentType}
          onValueChange={setSelectedEmploymentType}
          className="flex flex-wrap gap-4"
        >
          {employmentTypes?.map((type) => (
            <div key={type.id} className="flex items-center space-x-2">
              <RadioGroupItem value={type.id} id={type.id} />
              <Label htmlFor={type.id}>{type.name}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}