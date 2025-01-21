import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedSBU: string;
  setSelectedSBU: (value: string) => void;
  uniqueSBUs: string[];
}

export function SearchFilters({
  searchTerm,
  setSearchTerm,
  selectedSBU,
  setSelectedSBU,
  uniqueSBUs,
}: SearchFiltersProps) {
  return (
    <div className="flex gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by email or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      <Select value={selectedSBU} onValueChange={setSelectedSBU}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by Primary SBU" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All SBUs</SelectItem>
          {uniqueSBUs.map((sbu) => (
            <SelectItem key={sbu} value={sbu}>
              {sbu}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}