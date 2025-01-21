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
        .select("id, email, first_name, last_name");

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      // Fetch roles separately and combine the data
      const usersWithRoles = await Promise.all(
        profiles.map(async (profile) => {
          const { data: roleData, error: roleError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", profile.id)
            .single();

          if (roleError) {
            console.error("Error fetching role for user:", profile.id, roleError);
            return {
              ...profile,
              user_roles: { role: "user" as const }, // Default to user if error
            };
          }

          return {
            ...profile,
            user_roles: roleData,
          };
        })
      );

      console.log("Users with roles:", usersWithRoles);
      return usersWithRoles as User[];
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
        onDelete={async () => {}}
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