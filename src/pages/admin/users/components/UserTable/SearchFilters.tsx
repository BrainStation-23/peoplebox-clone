import { Search, Upload, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedSBU: string;
  setSelectedSBU: (value: string) => void;
  onExport: () => void;
  onImport: () => void;
  sbus: Array<{ id: string; name: string; }>;
}

export function SearchFilters({
  searchTerm,
  setSearchTerm,
  selectedSBU,
  setSelectedSBU,
  onExport,
  onImport,
  sbus,
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
            className="pl-8 w-[300px]"
          />
        </div>
        <Select value={selectedSBU} onValueChange={setSelectedSBU}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by SBU" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All SBUs</SelectItem>
            {sbus.map((sbu) => (
              <SelectItem key={sbu.id} value={sbu.id}>
                {sbu.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button onClick={onImport} variant="outline" size="sm">
          <Upload className="mr-2 h-4 w-4" />
          Import Users
        </Button>
        <Button onClick={onExport} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export Users
        </Button>
      </div>
    </div>
  );
}