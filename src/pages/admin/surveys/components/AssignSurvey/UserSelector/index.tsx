import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserList } from "./UserList";
import { UserFilters } from "./UserFilters";

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface UserSelectorProps {
  users: User[];
  selectedUserId?: string;
  onChange: (userId: string) => void;
}

export function UserSelector({ users, selectedUserId, onChange }: UserSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.first_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (user.last_name?.toLowerCase() || "").includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const handleSelectAll = () => {
    // If there's already a selection, clear it
    if (selectedUserId) {
      onChange("");
    } else {
      // Select the first user from the filtered list
      const firstUser = filteredUsers[0];
      if (firstUser) {
        onChange(firstUser.id);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Select User</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
        >
          {selectedUserId ? "Clear Selection" : "Select First"}
        </Button>
      </div>
      
      <UserFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <UserList
        users={filteredUsers}
        selectedUserId={selectedUserId}
        onSelect={onChange}
      />
      
      <div className="text-sm text-muted-foreground">
        {filteredUsers.length} users found
      </div>
    </div>
  );
}