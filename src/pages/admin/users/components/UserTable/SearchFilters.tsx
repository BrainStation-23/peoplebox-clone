import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedSBU: string;
  setSelectedSBU: (value: string) => void;
  onExport: () => void;
}

export function SearchFilters({
  searchTerm,
  setSearchTerm,
  selectedSBU,
  setSelectedSBU,
  onExport,
}: SearchFiltersProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div>
          <select
            value={selectedSBU}
            onChange={(e) => setSelectedSBU(e.target.value)}
            className="border rounded-md p-2"
          >
            <option value="all">All SBUs</option>
            {/* Add options for SBUs here */}
          </select>
        </div>
      </div>
      <Button onClick={onExport} variant="outline" size="sm">
        <Download className="mr-2 h-4 w-4" />
        Export Users
      </Button>
    </div>
  );
}
