import { Table, TableBody } from "@/components/ui/table";
import { User } from "../../types";
import { UsersTableHeader } from "./TableHeader";
import { UserRow } from "./UserRow";
import { useNavigate } from "react-router-dom";

interface TableContainerProps {
  users: User[];
  onDelete: (userId: string) => void;
  onPasswordChange: (userId: string) => void;
}

export function TableContainer({ 
  users, 
  onDelete, 
  onPasswordChange 
}: TableContainerProps) {
  const navigate = useNavigate();

  const handleEdit = (user: User) => {
    navigate(`/admin/users/${user.id}/edit`);
  };

  return (
    <Table>
      <UsersTableHeader />
      <TableBody>
        {users.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            onEdit={handleEdit}
            onDelete={onDelete}
            onPasswordChange={onPasswordChange}
          />
        ))}
      </TableBody>
    </Table>
  );
}