import {
  TableHead,
  TableHeader as ShadcnTableHeader,
  TableRow,
} from "@/components/ui/table";

export function UsersTableHeader() {
  return (
    <ShadcnTableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Org ID</TableHead>
        <TableHead>Is Admin</TableHead>
        <TableHead>Primary SBU</TableHead>
        <TableHead className="w-[200px]">Actions</TableHead>
      </TableRow>
    </ShadcnTableHeader>
  );
}