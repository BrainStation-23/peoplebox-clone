import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useUserActions(refetch: () => void) {
  const { toast } = useToast();

  const handleCreateSuccess = () => {
    refetch();
    toast({
      title: "Success",
      description: "User created successfully",
    });
  };

  const handleDelete = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { user_id: userId }
      });

      if (error) {
        throw error;
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

  return {
    handleCreateSuccess,
    handleDelete,
  };
}