import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Supervisor } from "../../types";

interface ManagementTabProps {
  user: User;
  supervisors: Supervisor[];
  onSupervisorChange: (supervisorId: string, action: "add" | "remove") => void;
  onPrimarySupervisorChange: (supervisorId: string) => void;
}

export function ManagementTab({
  user,
  supervisors,
  onSupervisorChange,
  onPrimarySupervisorChange,
}: ManagementTabProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <Label>Supervisors</Label>
          <div className="space-y-4">
            {supervisors.map((supervisor) => (
              <div
                key={supervisor.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={true}
                    onCheckedChange={(checked) =>
                      onSupervisorChange(
                        supervisor.id,
                        checked ? "add" : "remove"
                      )
                    }
                  />
                  <span>
                    {supervisor.first_name} {supervisor.last_name}
                  </span>
                </div>
                <Switch
                  checked={supervisor.is_primary}
                  onCheckedChange={() =>
                    onPrimarySupervisorChange(supervisor.id)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}