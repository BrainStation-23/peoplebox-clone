import { Search, Upload, Download, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onExport: () => void;
  onImport: () => void;
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
  onExport,
  onImport,
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

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
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

        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {levels.map((level) => (
              <SelectItem key={level.id} value={level.id}>
                {level.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedEmploymentType} onValueChange={setSelectedEmploymentType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Employment Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employment Types</SelectItem>
            {employmentTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedEmployeeRole} onValueChange={setSelectedEmployeeRole}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Employee Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employee Roles</SelectItem>
            {employeeRoles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedEmployeeType} onValueChange={setSelectedEmployeeType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Employee Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employee Types</SelectItem>
            {employeeTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => addFilter('status', 'active')}
          >
            Active Users
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addFilter('role', 'admin')}
          >
            Admins
          </Button>
        </div>
      </div>
    </div>
  );
}