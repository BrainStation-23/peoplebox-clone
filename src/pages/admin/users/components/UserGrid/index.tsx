import { User } from "../../types";
import { UserCard } from "../UserCard";
import { TablePagination } from "../UserTable/TablePagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface UserGridProps {
  users: User[];
  selectedUsers: string[];
  onSelectUser: (userId: string, checked: boolean) => void;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onPasswordChange: (userId: string) => void;
  onRoleToggle: (userId: string, isAdmin: boolean) => void;
  onStatusToggle: (userId: string, isActive: boolean) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

export function UserGrid({
  users,
  selectedUsers,
  onSelectUser,
  onEdit,
  onDelete,
  onPasswordChange,
  onRoleToggle,
  onStatusToggle,
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
}: UserGridProps) {
  const allSelected = users.length > 0 && users.every(user => selectedUsers.includes(user.id));
  const someSelected = users.length > 0 && users.some(user => selectedUsers.includes(user.id));

  const handleSelectAll = (checked: boolean) => {
    users.forEach(user => {
      if (checked && !selectedUsers.includes(user.id)) {
        onSelectUser(user.id, true);
      } else if (!checked && selectedUsers.includes(user.id)) {
        onSelectUser(user.id, false);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allSelected}
            className="translate-y-[2px]"
            onCheckedChange={handleSelectAll}
            data-state={someSelected ? "indeterminate" : allSelected ? "checked" : "unchecked"}
          />
          <span className="text-sm text-muted-foreground">
            {selectedUsers.length} selected
          </span>
        </div>
        <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select page size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 per page</SelectItem>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="20">20 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            selected={selectedUsers.includes(user.id)}
            onSelect={onSelectUser}
            onEdit={onEdit}
            onDelete={onDelete}
            onPasswordChange={onPasswordChange}
            onRoleToggle={onRoleToggle}
            onStatusToggle={onStatusToggle}
          />
        ))}
      </div>

      <div className="mt-4">
        <TablePagination
          page={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}