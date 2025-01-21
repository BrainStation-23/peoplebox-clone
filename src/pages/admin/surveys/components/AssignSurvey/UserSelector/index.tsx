import { useState } from "react";
import { Label } from "@/components/ui/label";
import { UserList } from "./UserList";
import { UserFilters } from "./UserFilters";

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

export interface UserSelectorProps {
  users: User[];
  selectedUsers: string[];
  onChange: (selectedUsers: string[]) => void;
}

export function UserSelector({ users, selectedUsers, onChange }: UserSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-4">
      <Label>Select Users</Label>
      <UserFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <UserList
        users={users}
        selectedUsers={selectedUsers}
        onSelect={onChange}
        searchQuery={searchQuery}
      />
      <div className="text-sm text-muted-foreground">
        {selectedUsers.length} users selected
      </div>
    </div>
  );
}