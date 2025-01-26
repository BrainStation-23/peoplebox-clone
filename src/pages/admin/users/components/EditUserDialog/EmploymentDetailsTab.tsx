import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Info, Building, MapPin, Briefcase, GraduationCap, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  selectedEmployeeRole: string;
  setSelectedEmployeeRole: (value: string) => void;
  selectedEmployeeType: string;
  setSelectedEmployeeType: (value: string) => void;
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
  selectedEmployeeRole,
  setSelectedEmployeeRole,
  selectedEmployeeType,
  setSelectedEmployeeType,
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

  const { data: employeeRoles } = useQuery({
    queryKey: ["employee-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_roles")
        .select("*")
        .eq("status", "active");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: employeeTypes } = useQuery({
    queryKey: ["employee-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_types")
        .select("*")
        .eq("status", "active");
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Position & Level</h3>
            </div>
            
            <div className="space-y-6">
              {/* Level Selection */}
              <div className="space-y-3">
                <Label className="text-base">Employee Level</Label>
                <RadioGroup
                  value={selectedLevel}
                  onValueChange={setSelectedLevel}
                  className="grid grid-cols-2 gap-4"
                >
                  {levels?.map((level) => (
                    <div
                      key={level.id}
                      className={`flex items-center space-x-2 rounded-lg border p-4 transition-colors
                        ${selectedLevel === level.id ? 'bg-primary/5 border-primary' : 'hover:bg-muted'}`}
                    >
                      <RadioGroupItem value={level.id} id={level.id} />
                      <Label htmlFor={level.id} className="flex-1 cursor-pointer">
                        {level.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Separator />

              {/* Employee Role Selection */}
              <div className="space-y-3">
                <Label className="text-base">Employee Role</Label>
                <RadioGroup
                  value={selectedEmployeeRole}
                  onValueChange={setSelectedEmployeeRole}
                  className="grid grid-cols-2 gap-4"
                >
                  {employeeRoles?.map((role) => (
                    <div
                      key={role.id}
                      className={`flex items-center space-x-2 rounded-lg border p-4 transition-colors
                        ${selectedEmployeeRole === role.id ? 'bg-primary/5 border-primary' : 'hover:bg-muted'}`}
                    >
                      <RadioGroupItem value={role.id} id={role.id} />
                      <Label htmlFor={role.id} className="flex-1 cursor-pointer">
                        {role.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Separator />

              {/* Employee Type Selection */}
              <div className="space-y-3">
                <Label className="text-base">Employee Type</Label>
                <RadioGroup
                  value={selectedEmployeeType}
                  onValueChange={setSelectedEmployeeType}
                  className="grid grid-cols-2 gap-4"
                >
                  {employeeTypes?.map((type) => (
                    <div
                      key={type.id}
                      className={`flex items-center space-x-2 rounded-lg border p-4 transition-colors
                        ${selectedEmployeeType === type.id ? 'bg-primary/5 border-primary' : 'hover:bg-muted'}`}
                    >
                      <RadioGroupItem value={type.id} id={type.id} />
                      <Label htmlFor={type.id} className="flex-1 cursor-pointer">
                        {type.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Separator />

              {/* Job Title Input */}
              <div className="space-y-3">
                <Label htmlFor="designation" className="text-base">Job Title/Position</Label>
                <div className="relative">
                  <Input
                    id="designation"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="Enter your job title"
                    className="pl-10"
                  />
                  <Briefcase className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <span>Specify your current role in the organization</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Building className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Work Location & Type</h3>
            </div>

            <div className="space-y-6">
              {/* Location Selection */}
              <div className="space-y-3">
                <Label className="text-base">Office Location</Label>
                <RadioGroup
                  value={selectedLocation}
                  onValueChange={setSelectedLocation}
                  className="grid gap-3"
                >
                  {locations?.map((location) => (
                    <div
                      key={location.id}
                      className={`flex items-center space-x-2 rounded-lg border p-4 transition-colors
                        ${selectedLocation === location.id ? 'bg-primary/5 border-primary' : 'hover:bg-muted'}`}
                    >
                      <RadioGroupItem value={location.id} id={location.id} />
                      <Label htmlFor={location.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{location.name}</span>
                        </div>
                        {location.address && (
                          <span className="text-sm text-muted-foreground block mt-1 ml-6">
                            {location.address}
                          </span>
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Separator />

              {/* Employment Type Selection */}
              <div className="space-y-3">
                <Label className="text-base">Employment Type</Label>
                <RadioGroup
                  value={selectedEmploymentType}
                  onValueChange={setSelectedEmploymentType}
                  className="grid gap-3"
                >
                  {employmentTypes?.map((type) => (
                    <div
                      key={type.id}
                      className={`flex items-center space-x-2 rounded-lg border p-4 transition-colors
                        ${selectedEmploymentType === type.id ? 'bg-primary/5 border-primary' : 'hover:bg-muted'}`}
                    >
                      <RadioGroupItem value={type.id} id={type.id} />
                      <Label htmlFor={type.id} className="cursor-pointer">
                        {type.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}