import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableRow } from "@/components/ui/table";
import { User } from "../../types";
import UserActions from "./UserActions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { UserX, UserCheck } from "lucide-react";

interface UserRowProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onPasswordChange: (userId: string) => void;
}

export function UserRow({ user, onEdit, onDelete, onPasswordChange }: UserRowProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleStatusMutation = useMutation({
    mutationFn: async () => {
      setIsUpdating(true);
      const { error } = await supabase.functions.invoke('toggle-user-status', {
        body: {
          userId: user.id,
          status: user.status === 'active' ? 'disabled' : 'active'
        }
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: `User ${user.status === 'active' ? 'disabled' : 'activated'} successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
      console.error("Error updating user status:", error);
    },
    onSettled: () => {
      setIsUpdating(false);
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: isAdmin ? "admin" : "user" })
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
      console.error("Error updating user role:", error);
    },
  });

  return (
    <TableRow 
      key={user.id}
      className={user.status === 'disabled' ? 'opacity-60' : ''}
    >
      <TableCell className="flex items-center gap-2">
        {user.status === 'disabled' ? (
          <UserX className="h-4 w-4 text-destructive" />
        ) : (
          <UserCheck className="h-4 w-4 text-success" />
        )}
        {user.first_name || user.last_name
          ? `${user.first_name || ""} ${user.last_name || ""}`
          : "N/A"}
      </TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>{user.org_id || "N/A"}</TableCell>
      <TableCell>
        <Switch
          checked={user.user_roles.role === "admin"}
          onCheckedChange={(checked) =>
            updateRoleMutation.mutate({ userId: user.id, isAdmin: checked })
          }
          disabled={user.status === 'disabled'}
        />
      </TableCell>
      <TableCell>
        {user.user_sbus?.find((sbu) => sbu.is_primary)?.sbu.name || "N/A"}
      </TableCell>
      <TableCell>
        <Badge 
          variant={user.status === 'active' ? 'success' : 'destructive'}
          className="mr-2"
        >
          {user.status}
        </Badge>
        <Switch
          checked={user.status === 'active'}
          onCheckedChange={() => toggleStatusMutation.mutate()}
          disabled={isUpdating}
        />
      </TableCell>
      <TableCell>
        <UserActions
          user={user}
          onEdit={onEdit}
          onDelete={onDelete}
          onPasswordChange={onPasswordChange}
        />
      </TableCell>
    </TableRow>
  );
}