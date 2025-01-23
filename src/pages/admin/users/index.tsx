import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import UserTable from "./components/UserTable";
import CreateUserDialog from "./components/CreateUserDialog";
import EditUserDialog from "./components/EditUserDialog"; 
import { User } from "./types";
import { useToast } from "@/hooks/use-toast";

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      console.log("Fetching users...");
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id,
          email,
          first_name,
          last_name,
          profile_image_url,
          level_id,
          levels (
            id,
            name,
            status
          )
        `);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      // Fetch roles and SBUs for each user
      const usersWithData = await Promise.all(
        profiles.map(async (profile) => {
          // Fetch role
          const { data: roleData, error: roleError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", profile.id)
            .single();

          if (roleError) {
            console.error("Error fetching role for user:", profile.id, roleError);
            return {
              ...profile,
              user_roles: { role: "user" as const },
            };
          }

          // Fetch SBUs
          const { data: sbuData, error: sbuError } = await supabase
            .from("user_sbus")
            .select(`
              id,
              user_id,
              sbu_id,
              is_primary,
              sbu:sbus (
                id,
                name
              )
            `)
            .eq("user_id", profile.id);

          if (sbuError) {
            console.error("Error fetching SBUs for user:", profile.id, sbuError);
            return {
              ...profile,
              user_roles: roleData,
              user_sbus: [],
            };
          }

          return {
            ...profile,
            user_roles: roleData,
            user_sbus: sbuData,
          };
        })
      );

      console.log("Users with complete data:", usersWithData);
      return usersWithData as User[];
    },
  });

  const handleCreateSuccess = () => {
    refetch();
    setIsCreateDialogOpen(false);
    toast({
      title: "Success",
      description: "User created successfully",
    });
  };

  const handleDelete = async (userId: string) => {
    try {
      const response = await fetch('/api/manage-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'DELETE',
          action: { user_id: userId }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      refetch();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete user",
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
        >
          Add User
        </button>
      </div>

      <UserTable
        users={users || []}
        isLoading={isLoading}
        page={1}
        pageSize={10}
        total={users?.length || 0}
        onPageChange={() => {}}
        onDelete={handleDelete}
      />

      <CreateUserDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      <EditUserDialog
        user={selectedUser}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
}