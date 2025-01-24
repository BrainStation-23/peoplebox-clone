import { Table, TableBody } from "@/components/ui/table";
import { User } from "../../types";
import { UsersTableHeader } from "./TableHeader";
import { UserRow } from "./UserRow";

interface TableContainerProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onPasswordChange: (userId: string) => void;
  isLoading?: boolean;
}

export function TableContainer({ 
  users, 
  onEdit, 
  onDelete, 
  onPasswordChange,
  isLoading
}: TableContainerProps) {
  if (users.length === 0 && !isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No users found. Try adjusting your search criteria.
      </div>
    );
  }

  return (
    <Table>
      <UsersTableHeader />
      <TableBody>
        {users.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            onEdit={onEdit}
            onDelete={onDelete}
            onPasswordChange={onPasswordChange}
          />
        ))}
      </TableBody>
    </Table>
  );
}