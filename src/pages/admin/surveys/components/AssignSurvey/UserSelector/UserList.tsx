import { Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface UserListProps {
  users: User[];
  selectedUsers: string[];
  onSelect: (selectedUsers: string[]) => void;
  searchQuery?: string;
}

export function UserList({ users, selectedUsers, onSelect, searchQuery = "" }: UserListProps) {
  const filteredUsers = users.filter((user) => {
    const searchStr = `${user.first_name || ''} ${user.last_name || ''} ${user.email}`.toLowerCase();
    return searchStr.includes(searchQuery.toLowerCase());
  });

  const toggleUser = (userId: string) => {
    const newSelectedUsers = selectedUsers.includes(userId)
      ? selectedUsers.filter(id => id !== userId)
      : [...selectedUsers, userId];
    onSelect(newSelectedUsers);
  };

  return (
    <ScrollArea className="h-[200px] rounded-md border p-2">
      <div className="space-y-1">
        {filteredUsers.map((user) => {
          const isSelected = selectedUsers.includes(user.id);
          const displayName = `${user.first_name || ''} ${user.last_name || ''} ${!user.first_name && !user.last_name ? user.email : ''}`.trim();
          
          return (
            <button
              key={user.id}
              onClick={() => toggleUser(user.id)}
              className={cn(
                "w-full flex items-center space-x-2 px-2 py-1.5 rounded-sm text-sm",
                "hover:bg-accent hover:text-accent-foreground",
                isSelected && "bg-accent"
              )}
            >
              <div className="flex-1 text-left">{displayName}</div>
              {isSelected && <Check className="h-4 w-4" />}
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}