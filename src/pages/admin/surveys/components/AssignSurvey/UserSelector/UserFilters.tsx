import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UserFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function UserFilters({ searchQuery, onSearchChange }: UserFiltersProps) {
  return (
    <div className="space-y-2">
      <Label>Search Users</Label>
      <Input
        placeholder="Search by name or email..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
}