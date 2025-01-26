import { useState } from "react";
import { ChevronDown, ChevronUp, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
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
  addFilter: (key: string, value: string) => void;
  sbus: Array<{ id: string; name: string }>;
  levels: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string }>;
  employmentTypes: Array<{ id: string; name: string }>;
  employeeRoles: Array<{ id: string; name: string }>;
  employeeTypes: Array<{ id: string; name: string }>;
}

export function FilterPanel({
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
  addFilter,
  sbus,
  levels,
  locations,
  employmentTypes,
  employeeRoles,
  employeeTypes,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasActiveFilters = [
    selectedSBU,
    selectedLevel,
    selectedLocation,
    selectedEmploymentType,
    selectedEmployeeRole,
    selectedEmployeeType
  ].some(filter => filter !== 'all');

  const clearAllFilters = () => {
    setSelectedSBU('all');
    setSelectedLevel('all');
    setSelectedLocation('all');
    setSelectedEmploymentType('all');
    setSelectedEmployeeRole('all');
    setSelectedEmployeeType('all');
  };

  return (
    <div className="space-y-4 bg-background rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          {hasActiveFilters && (
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {[selectedSBU, selectedLevel, selectedLocation, selectedEmploymentType, selectedEmployeeRole, selectedEmployeeType]
                .filter(filter => filter !== 'all').length}
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="mr-2 h-4 w-4" />
            Clear all
          </Button>
        )}
      </div>

      <div className={cn("space-y-4", !isExpanded && "hidden")}>
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Primary Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Select value={selectedSBU} onValueChange={setSelectedSBU}>
              <SelectTrigger>
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
              <SelectTrigger>
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
              <SelectTrigger>
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
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Employee Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Select value={selectedEmploymentType} onValueChange={setSelectedEmploymentType}>
              <SelectTrigger>
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
              <SelectTrigger>
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
              <SelectTrigger>
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
          </div>
        </div>

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