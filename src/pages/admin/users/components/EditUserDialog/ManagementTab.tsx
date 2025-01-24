import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { User } from "../../types";

interface ManagementTabProps {
  user: User;
  onSupervisorChange: (supervisorId: string, action: 'add' | 'remove') => void;
  onPrimarySupervisorChange: (supervisorId: string) => void;
  supervisors: Array<{
    id: string;
    first_name: string | null;
    last_name: string | null;
    is_primary: boolean;
  }>;
}

export function ManagementTab({
  user,
  onSupervisorChange,
  onPrimarySupervisorChange,
  supervisors,
}: ManagementTabProps) {
  const [search, setSearch] = useState("");

  const { data: searchResults } = useQuery({
    queryKey: ["supervisorSearch", search],
    queryFn: async () => {
      if (!search) return [];
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
        .neq('id', user.id)
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: search.length > 2,
  });

  return (
    <div className="space-y-6">
      {/* Current Supervisors Section */}
      <div>
        <h3 className="text-lg font-medium mb-4">Current Supervisors</h3>
        {supervisors.length === 0 ? (
          <p className="text-muted-foreground">No supervisors assigned</p>
        ) : (
          <RadioGroup
            value={supervisors.find(s => s.is_primary)?.id}
            onValueChange={onPrimarySupervisorChange}
            className="space-y-2"
          >
            {supervisors.map((supervisor) => (
              <div
                key={supervisor.id}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={supervisor.id} id={`supervisor-${supervisor.id}`} />
                  <Label htmlFor={`supervisor-${supervisor.id}`}>
                    {supervisor.first_name} {supervisor.last_name}
                    {supervisor.is_primary && " (Primary)"}
                  </Label>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSupervisorChange(supervisor.id, 'remove')}
                >
                  Remove
                </Button>
              </div>
            ))}
          </RadioGroup>
        )}
      </div>

      {/* Add Supervisor Section */}
      <div>
        <h3 className="text-lg font-medium mb-4">Add Supervisor</h3>
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search supervisors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        {searchResults && searchResults.length > 0 && (
          <div className="mt-2 border rounded-md divide-y">
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="flex items-center justify-between p-2 hover:bg-muted/50"
              >
                <span>
                  {result.first_name} {result.last_name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onSupervisorChange(result.id, 'add');
                    setSearch("");
                  }}
                >
                  Add
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}