import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import UserTable from "./components/UserTable";
import CreateUserDialog from "./components/CreateUserDialog";
import { User } from "./types";

export default function Users() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const pageSize = 10;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["users", search, page],
    queryFn: async () => {
      // First, get profiles with pagination
      let profilesQuery = supabase
        .from("profiles")
        .select(`
          id,
          email,
          first_name,
          last_name
        `, { count: 'exact' })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (search) {
        profilesQuery = profilesQuery.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
      }

      const { data: profiles, count, error: profilesError } = await profilesQuery;
      
      if (profilesError) throw profilesError;

      // Then, get user roles for these profiles
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", profiles?.map(profile => profile.id) || []);

      if (rolesError) throw rolesError;

      // Combine the data
      const users = profiles?.map(profile => {
        const userRole = userRoles?.find(role => role.user_id === profile.id);
        return {
          ...profile,
          user_roles: {
            role: userRole?.role || "user"
          }
        };
      }) as User[];

      return {
        users,
        total: count || 0
      };
    }
  });

  const handleDelete = async (userId: string) => {
    try {
      const { error } = await supabase.functions.invoke('manage-users', {
        body: { method: 'DELETE', action: { user_id: userId } }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <UserTable
        users={data?.users || []}
        total={data?.total || 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onDelete={handleDelete}
      />

      <CreateUserDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          refetch();
          setIsCreateDialogOpen(false);
        }}
      />
    </div>
  );
}