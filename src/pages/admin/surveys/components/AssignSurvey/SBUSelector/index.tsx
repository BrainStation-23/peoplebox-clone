import { useState } from "react";
import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface SBU {
  id: string;
  name: string;
}

interface SBUSelectorProps {
  sbus: SBU[];
  selectedSBUs: string[];
  onChange: (sbuIds: string[]) => void;
}

export function SBUSelector({ sbus, selectedSBUs, onChange }: SBUSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSBUs = sbus.filter((sbu) =>
    sbu.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSBU = (sbuId: string) => {
    const newSelection = selectedSBUs.includes(sbuId)
      ? selectedSBUs.filter(id => id !== sbuId)
      : [...selectedSBUs, sbuId];
    onChange(newSelection);
  };

  return (
    <div className="space-y-4">
      <Label>Select SBUs</Label>
      <Input
        placeholder="Search SBUs..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <ScrollArea className="h-[200px] rounded-md border p-2">
        <div className="space-y-1">
          {filteredSBUs.map((sbu) => {
            const isSelected = selectedSBUs.includes(sbu.id);
            return (
              <button
                key={sbu.id}
                onClick={() => toggleSBU(sbu.id)}
                className={cn(
                  "w-full flex items-center space-x-2 px-2 py-1.5 rounded-sm text-sm",
                  "hover:bg-accent hover:text-accent-foreground",
                  isSelected && "bg-accent"
                )}
              >
                <div className="flex-1 text-left">{sbu.name}</div>
                {isSelected && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      </ScrollArea>
      <div className="text-sm text-muted-foreground">
        {selectedSBUs.length} SBUs selected
      </div>
    </div>
  );
}