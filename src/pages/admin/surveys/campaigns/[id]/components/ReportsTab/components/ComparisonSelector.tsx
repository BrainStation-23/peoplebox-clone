import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ComparisonDimension } from "../types/comparison";

interface ComparisonSelectorProps {
  value: ComparisonDimension;
  onChange: (value: ComparisonDimension) => void;
}

export function ComparisonSelector({ value, onChange }: ComparisonSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Compare by:</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select comparison" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No comparison</SelectItem>
          <SelectItem value="sbu">SBU</SelectItem>
          <SelectItem value="gender">Gender</SelectItem>
          <SelectItem value="location">Location</SelectItem>
          <SelectItem value="employment_type">Employment Type</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}