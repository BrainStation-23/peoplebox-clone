import { Search, Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FilterPanel } from "./FilterPanel";

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onBulkCreate: () => void;
  sbus: Array<{ id: string; name: string; }>;
  levels: Array<{ id: string; name: string; }>;
  locations: Array<{ id: string; name: string; }>;
  employmentTypes: Array<{ id: string; name: string; }>;
  employeeRoles: Array<{ id: string; name: string; }>;
  employeeTypes: Array<{ id: string; name: string; }>;
  totalResults?: number;
  isSearching?: boolean;
  selectedSBU: string;
  selectedLevel: string;
  selectedLocation: string;
  selectedEmploymentType: string;
  selectedEmployeeRole: string;
  selectedEmployeeType: string;
  setSelectedSBU: (value: string) => void;
  setSelectedLevel: (value: string) => void;
  setSelectedLocation: (value: string) => void;
  setSelectedEmploymentType: (value: string) => void;
  setSelectedEmployeeRole: (value: string) => void;
  setSelectedEmployeeType: (value: string) => void;
}

export function SearchFilters({
  searchTerm,
  setSearchTerm,
  selectedSBU,
  selectedLevel,
  selectedLocation,
  selectedEmploymentType,
  selectedEmployeeRole,
  selectedEmployeeType,
  setSelectedSBU,
  setSelectedLevel,
  setSelectedLocation,
  setSelectedEmploymentType,
  setSelectedEmployeeRole,
  setSelectedEmployeeType,
  onBulkCreate,
  sbus,
  levels,
  locations,
  employmentTypes,
  employeeRoles,
  employeeTypes,
  isSearching,
  totalResults
}: SearchFiltersProps) {
  const addFilter = (key: string, value: string) => {
    const currentFilters = searchTerm.split(' ').filter(term => !term.startsWith(`${key}:`));
    const newSearchTerm = [...currentFilters, `${key}:${value}`].join(' ').trim();
    setSearchTerm(newSearchTerm);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users... (Try status:active or role:admin)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[300px] pr-8"
            />
            {searchTerm && !isSearching && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {isSearching && (
              <div className="absolute right-2 top-2.5">
                <LoadingSpinner size={16} />
              </div>
            )}
          </div>
          {totalResults !== undefined && (
            <span className="text-sm text-muted-foreground">
              {totalResults} {totalResults === 1 ? 'result' : 'results'} found
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={onBulkCreate} variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Bulk Create Users
          </Button>
        </div>
      </div>

      <FilterPanel
        selectedSBU={selectedSBU}
        selectedLevel={selectedLevel}
        selectedLocation={selectedLocation}
        selectedEmploymentType={selectedEmploymentType}
        selectedEmployeeRole={selectedEmployeeRole}
        selectedEmployeeType={selectedEmployeeType}
        setSelectedSBU={setSelectedSBU}
        setSelectedLevel={setSelectedLevel}
        setSelectedLocation={setSelectedLocation}
        setSelectedEmploymentType={setSelectedEmploymentType}
        setSelectedEmployeeRole={setSelectedEmployeeRole}
        setSelectedEmployeeType={setSelectedEmployeeType}
        addFilter={addFilter}
        sbus={sbus}
        levels={levels}
        locations={locations}
        employmentTypes={employmentTypes}
        employeeRoles={employeeRoles}
        employeeTypes={employeeTypes}
      />
    </div>
  );
}