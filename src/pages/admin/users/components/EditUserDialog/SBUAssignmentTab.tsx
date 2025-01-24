import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User } from "../../types";
import { useSBUManagement } from "../../hooks/useSBUManagement";

interface SBUAssignmentTabProps {
  user: User;
}

export function SBUAssignmentTab({ user }: SBUAssignmentTabProps) {
  const {
    sbus,
    sbuSearch,
    setSbuSearch,
    selectedSBUs,
    primarySBU,
    handleSBUChange,
    handlePrimarySBUChange,
  } = useSBUManagement(user);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Search SBUs</Label>
        <Input
          placeholder="Search SBUs..."
          value={sbuSearch}
          onChange={(e) => setSbuSearch(e.target.value)}
        />
      </div>

      <ScrollArea className="h-[300px] rounded-md border p-4">
        <div className="space-y-4">
          {sbus?.map((sbu) => (
            <div key={sbu.id} className="flex items-center space-x-2">
              <Checkbox
                id={sbu.id}
                checked={selectedSBUs.has(sbu.id)}
                onCheckedChange={(checked) =>
                  handleSBUChange(sbu.id, checked as boolean)
                }
              />
              <Label htmlFor={sbu.id}>{sbu.name}</Label>
            </div>
          ))}
        </div>
      </ScrollArea>

      {selectedSBUs.size > 0 && (
        <div className="space-y-2">
          <Label>Primary SBU</Label>
          <RadioGroup
            value={primarySBU}
            onValueChange={handlePrimarySBUChange}
            className="space-y-2"
          >
            {sbus
              ?.filter((sbu) => selectedSBUs.has(sbu.id))
              .map((sbu) => (
                <div key={sbu.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={sbu.id} id={`primary-${sbu.id}`} />
                  <Label htmlFor={`primary-${sbu.id}`}>{sbu.name}</Label>
                </div>
              ))}
          </RadioGroup>
        </div>
      )}
    </div>
  );
}