import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import type { Location, Level } from "../../types";

interface EmploymentDetailsTabProps {
  designation: string;
  setDesignation: (value: string) => void;
  selectedLocation: string;
  setSelectedLocation: (value: string) => void;
  selectedEmploymentType: string;
  setSelectedEmploymentType: (value: string) => void;
}

export function EmploymentDetailsTab({
  designation,
  setDesignation,
  selectedLocation,
  setSelectedLocation,
  selectedEmploymentType,
  setSelectedEmploymentType,
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
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="designation">Designation</Label>
        <Input
          id="designation"
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
          placeholder="Enter designation"
        />
      </div>

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