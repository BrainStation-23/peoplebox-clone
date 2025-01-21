import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SBUList } from "./SBUList";

interface SBUSelectorProps {
  sbus: Array<{ id: string; name: string }>;
  selectedSBUs: string[];
  onChange: (sbuIds: string[]) => void;
}

export function SBUSelector({ sbus, selectedSBUs, onChange }: SBUSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelect = (sbuId: string) => {
    const newSelection = selectedSBUs.includes(sbuId)
      ? selectedSBUs.filter((id) => id !== sbuId)
      : [...selectedSBUs, sbuId];
    onChange(newSelection);
  };

  const handleSelectAll = () => {
    const filteredSBUs = sbus.filter((sbu) =>
      sbu.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const allSelected = filteredSBUs.every((sbu) => selectedSBUs.includes(sbu.id));
    
    if (allSelected) {
      // If all are selected, deselect all filtered SBUs
      const newSelection = selectedSBUs.filter(
        (id) => !filteredSBUs.some((sbu) => sbu.id === id)
      );
      onChange(newSelection);
    } else {
      // Select all filtered SBUs
      const newSelection = Array.from(
        new Set([...selectedSBUs, ...filteredSBUs.map((sbu) => sbu.id)])
      );
      onChange(newSelection);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Select SBUs</Label>
        <div className="space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
          >
            {sbus.every((sbu) => selectedSBUs.includes(sbu.id))
              ? "Deselect All"
              : "Select All"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearAll}
          >
            Clear All
          </Button>
        </div>
      </div>
      <Input
        placeholder="Search SBUs..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <SBUList
        sbus={sbus}
        selectedSBUs={selectedSBUs}
        onSelect={handleSelect}
        searchQuery={searchQuery}
      />
      <div className="text-sm text-muted-foreground">
        {selectedSBUs.length} SBUs selected
      </div>
    </div>
  );
}