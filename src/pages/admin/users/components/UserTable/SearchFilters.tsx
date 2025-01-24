import { Search, Upload, Download, X } from "lucide-react";
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
  isLoading?: boolean;
}

export function SearchFilters({
  searchTerm,
  setSearchTerm,
  selectedSBU,
  setSelectedSBU,
  onExport,
  onImport,
  sbus,
  isLoading
}: SearchFiltersProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or org ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-[300px] pr-8"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {isLoading && (
            <div className="absolute right-2 top-2.5">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
            </div>
          )}
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