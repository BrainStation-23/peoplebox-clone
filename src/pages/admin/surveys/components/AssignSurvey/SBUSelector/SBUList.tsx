import { Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface SBU {
  id: string;
  name: string;
}

interface SBUListProps {
  sbus: SBU[];
  selectedSBUs: string[];
  onSelect: (sbuId: string) => void;
  searchQuery?: string;
}

export function SBUList({ sbus, selectedSBUs, onSelect, searchQuery = "" }: SBUListProps) {
  const filteredSBUs = sbus.filter((sbu) =>
    sbu.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollArea className="h-[200px] rounded-md border p-2">
      <div className="space-y-1">
        {filteredSBUs.map((sbu) => {
          const isSelected = selectedSBUs.includes(sbu.id);
          return (
            <button
              key={sbu.id}
              onClick={() => onSelect(sbu.id)}
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
  );
}