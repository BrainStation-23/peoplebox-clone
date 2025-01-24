import { Table, TableBody } from "@/components/ui/table";
import { User } from "@/types/user";
import { UsersTableHeader } from "./TableHeader";
import { UserRow } from "./UserRow";

interface TableContainerProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onPasswordChange: (userId: string) => void;
}

export function TableContainer({ 
  users, 
  onEdit, 
  onDelete, 
  onPasswordChange 
}: TableContainerProps) {
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