import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface UserSelectorProps {
  selectedUsers: string[];
  onChange: (users: string[]) => void;
}

export function UserSelector({ selectedUsers, onChange }: UserSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name")
        .order("first_name");
      
      if (error) throw error;
      return data;
    },
  });

  const filteredUsers = users?.filter((user) => {
    const searchStr = `${user.first_name || ''} ${user.last_name || ''} ${user.email}`.toLowerCase();
    return searchStr.includes(searchQuery.toLowerCase());
  }) || [];

  const toggleUser = (userId: string) => {
    const newSelection = selectedUsers.includes(userId)
      ? selectedUsers.filter(id => id !== userId)
      : [...selectedUsers, userId];
    onChange(newSelection);
  };

  return (
    <div className="space-y-4">
      <Label>Select Users</Label>
      <Input
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <ScrollArea className="h-[300px] rounded-md border p-2">
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
                type="button"
              >
                <div className="flex-1 text-left">{displayName}</div>
                {isSelected && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      </ScrollArea>
      <div className="text-sm text-muted-foreground">
        {selectedUsers.length} users selected
      </div>
    </div>
  );
}