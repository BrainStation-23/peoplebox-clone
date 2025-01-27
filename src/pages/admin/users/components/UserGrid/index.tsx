import { User } from "../../types";
import { UserCard } from "../UserCard";

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
}: UserGridProps) {
  return (
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
  );
}