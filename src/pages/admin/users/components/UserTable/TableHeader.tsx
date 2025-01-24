import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Org ID</TableHead>
        <TableHead>Role</TableHead>
        <TableHead>Primary SBU</TableHead>
        <TableHead className="w-[200px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}