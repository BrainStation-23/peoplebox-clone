import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User } from "../../types";
import { useSBUManagement } from "../../hooks/useSBUManagement";

interface SBUAssignmentTabProps {
  user: User;
}

export function SBUAssignmentTab({ user }: SBUAssignmentTabProps) {
  const {
    sbus,
    selectedSBUs,
    primarySBU,
    handleSBUChange,
    handlePrimarySBUChange,
  } = useSBUManagement(user);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <Label>Strategic Business Units (SBUs)</Label>
          <div className="space-y-4">
            {sbus?.map((sbu) => (
              <div
                key={sbu.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={selectedSBUs.has(sbu.id)}
                    onCheckedChange={(checked) =>
                      handleSBUChange(sbu.id, checked)
                    }
                  />
                  <span>{sbu.name}</span>
                </div>
                {selectedSBUs.has(sbu.id) && (
                  <Switch
                    checked={primarySBU === sbu.id}
                    onCheckedChange={() => handlePrimarySBUChange(sbu.id)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}