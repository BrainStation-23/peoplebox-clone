import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSBUs } from "../../hooks/useSBUs";

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedSBU: string;
  setSelectedSBU: (value: string) => void;
}

export function SearchFilters({
  searchTerm,
  setSearchTerm,
  selectedSBU,
  setSelectedSBU,
}: SearchFiltersProps) {
  const { data: sbus = [] } = useSBUs();

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
      <Select value={selectedSBU} onValueChange={setSelectedSBU} defaultValue="all">
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by Primary SBU" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All SBUs</SelectItem>
          {sbus.map((sbu) => (
            <SelectItem key={sbu.id} value={sbu.name}>
              {sbu.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}