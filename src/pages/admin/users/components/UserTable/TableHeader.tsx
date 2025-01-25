import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface UsersTableHeaderProps {
  onSelectAll: (checked: boolean) => void;
  allSelected: boolean;
  someSelected: boolean;
}

export function UsersTableHeader({ onSelectAll, allSelected, someSelected }: UsersTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[50px]">
          <Checkbox
            checked={allSelected}
            className="translate-y-[2px]"
            onCheckedChange={onSelectAll}
            data-state={someSelected ? "indeterminate" : allSelected ? "checked" : "unchecked"}
          />
        </TableHead>
        <TableHead>Name</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Organization ID</TableHead>
        <TableHead>Admin</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Primary SBU</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}