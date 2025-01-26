import { User } from "../../types";
import { UserCard } from "../UserCard";
import { cn } from "@/lib/utils";

interface UserGridProps {
  users: User[];
  selectedUsers: string[];
  onSelectUser: (userId: string, checked: boolean) => void;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onPasswordChange: (userId: string) => void;
  onRoleToggle: (userId: string, isAdmin: boolean) => void;
  onStatusToggle: (userId: string, isActive: boolean) => void;
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
  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground animate-fade-in">
        No users found. Try adjusting your search criteria.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
      {users.map((user) => (
        <div 
          key={user.id}
          className={cn(
            "transition-all duration-300",
            "animate-fade-in"
          )}
        >
          <UserCard
            user={user}
            selected={selectedUsers.includes(user.id)}
            onSelect={onSelectUser}
            onEdit={onEdit}
            onDelete={onDelete}
            onPasswordChange={onPasswordChange}
            onRoleToggle={onRoleToggle}
            onStatusToggle={onStatusToggle}
          />
        </div>
      ))}
    </div>
  );
}