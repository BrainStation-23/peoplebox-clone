import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface SBU {
  id: string;
  name: string;
}

interface SBUAssignmentTabProps {
  sbus?: SBU[];
  sbuSearch: string;
  setSbuSearch: (value: string) => void;
  selectedSBUs: Set<string>;
  handleSBUChange: (sbuId: string, checked: boolean) => void;
  primarySBU: string;
  setPrimarySBU: (value: string) => void;
}

export function SBUAssignmentTab({
  sbus,
  sbuSearch,
  setSbuSearch,
  selectedSBUs,
  handleSBUChange,
  primarySBU,
  setPrimarySBU,
}: SBUAssignmentTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search SBUs..."
          value={sbuSearch}
          onChange={(e) => setSbuSearch(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {sbus?.map((sbu) => (
          <div key={sbu.id} className="flex items-center justify-between p-2 border rounded">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`sbu-${sbu.id}`}
                checked={selectedSBUs.has(sbu.id)}
                onCheckedChange={(checked) => handleSBUChange(sbu.id, checked as boolean)}
              />
              <Label htmlFor={`sbu-${sbu.id}`}>{sbu.name}</Label>
            </div>
            
            {selectedSBUs.has(sbu.id) && (
              <div className="flex items-center space-x-2">
                <RadioGroup
                  value={primarySBU}
                  onValueChange={setPrimarySBU}
                  className="flex"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={sbu.id} id={`primary-${sbu.id}`} />
                    <Label htmlFor={`primary-${sbu.id}`}>Primary</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}