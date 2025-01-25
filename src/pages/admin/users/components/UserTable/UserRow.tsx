import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "../../types";
import UserActions from "./UserActions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserRowProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onPasswordChange: (userId: string) => void;
  selected: boolean;
  onSelect: (userId: string, checked: boolean) => void;
}

export function UserRow({ 
  user, 
  onEdit, 
  onDelete, 
  onPasswordChange,
  selected,
  onSelect
}: UserRowProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { error } = await supabase.functions.invoke('toggle-user-status', {
        body: { 
          userId,
          status: isActive ? 'active' : 'disabled'
        }
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "User status updated successfully",
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
  });

  return (
    <TableRow key={user.id}>
      <TableCell>
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelect(user.id, checked as boolean)}
          className="translate-y-[2px]"
        />
      </TableCell>
      <TableCell>
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
        />
      </TableCell>
      <TableCell>
        <Switch
          checked={user.status === "active"}
          onCheckedChange={(checked) =>
            toggleStatusMutation.mutate({ userId: user.id, isActive: checked })
          }
        />
      </TableCell>
      <TableCell>
        {user.user_sbus?.find((sbu) => sbu.is_primary)?.sbu.name || "N/A"}
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