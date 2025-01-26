import { User } from "../../types";
import { UserCard } from "../UserCard";
import { cn } from "@/lib/utils";
import { useCallback, memo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TablePagination } from "../UserTable/TablePagination";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const MemoizedUserCard = memo(UserCard);

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
  const handleSelect = useCallback((userId: string, checked: boolean) => {
    onSelectUser(userId, checked);
  }, [onSelectUser]);

  const handleSelectAll = useCallback((checked: boolean) => {
    users.forEach(user => {
      onSelectUser(user.id, checked);
    });
  }, [users, onSelectUser]);

  const allSelected = users.length > 0 && users.every(user => selectedUsers.includes(user.id));

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground animate-fade-in">
        No users found. Try adjusting your search criteria.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox 
            checked={allSelected}
            onCheckedChange={handleSelectAll}
            aria-label="Select all users"
          />
          <span className="text-sm text-muted-foreground">
            Select All
          </span>
        </div>
        <Select 
          value={pageSize.toString()} 
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Cards per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="20">20 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
            <SelectItem value="100">100 per page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[calc(100vh-400px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
          {users.map((user) => (
            <div 
              key={user.id}
              className={cn(
                "transition-all duration-300",
                "animate-fade-in"
              )}
            >
              <MemoizedUserCard
                user={user}
                selected={selectedUsers.includes(user.id)}
                onSelect={handleSelect}
                onEdit={onEdit}
                onDelete={onDelete}
                onPasswordChange={onPasswordChange}
                onRoleToggle={onRoleToggle}
                onStatusToggle={onStatusToggle}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
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