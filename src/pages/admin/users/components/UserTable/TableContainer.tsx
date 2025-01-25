import { Table, TableBody } from "@/components/ui/table";
import { User } from "../../types";
import { UsersTableHeader } from "./TableHeader";
import { UserRow } from "./UserRow";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface TableContainerProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onPasswordChange: (userId: string) => void;
  isLoading?: boolean;
  selectedUsers: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectUser: (userId: string, checked: boolean) => void;
}

export function TableContainer({ 
  users, 
  onEdit, 
  onDelete, 
  onPasswordChange,
  isLoading,
  selectedUsers,
  onSelectAll,
  onSelectUser
}: TableContainerProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No users found. Try adjusting your search criteria.
      </div>
    );
  }

  return (
    <Table>
      <UsersTableHeader 
        onSelectAll={onSelectAll}
        allSelected={users.length > 0 && users.every(user => selectedUsers.includes(user.id))}
        someSelected={users.length > 0 && users.some(user => selectedUsers.includes(user.id))}
      />
      <TableBody>
        {users.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            onEdit={onEdit}
            onDelete={onDelete}
            onPasswordChange={onPasswordChange}
            selected={selectedUsers.includes(user.id)}
            onSelect={onSelectUser}
          />
        ))}
      </TableBody>
    </Table>
  );
}