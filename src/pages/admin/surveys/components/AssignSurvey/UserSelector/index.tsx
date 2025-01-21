import { useState } from "react";
import { Label } from "@/components/ui/label";
import { UserList } from "./UserList";
import { UserFilters } from "./UserFilters";

interface UserSelectorProps {
  users: Array<{
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  }>;
  selectedUserId?: string;
  onChange: (userId: string) => void;
}

export function UserSelector({ users, selectedUserId, onChange }: UserSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-4">
      <Label>Select Individual</Label>
      <UserFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <UserList
        users={users}
        selectedUserId={selectedUserId}
        onSelect={onChange}
        searchQuery={searchQuery}
      />
      <div className="text-sm text-muted-foreground">
        {selectedUserId ? "1 user selected" : "No user selected"}
      </div>
    </div>
  );
}