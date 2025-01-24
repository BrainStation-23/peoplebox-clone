import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePasswordManagement = () => {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");
  const { toast } = useToast();

  const handlePasswordChange = async (userId: string) => {
    setSelectedUserId(userId);
    setIsPasswordDialogOpen(true);
  };

  const handlePasswordSave = async () => {
    try {
      const { error } = await supabase.functions.invoke('update-user-password', {
        body: { 
          user_id: selectedUserId,
          new_password: newPassword
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      
      setIsPasswordDialogOpen(false);
      setNewPassword("");
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update password",
      });
    }
  };

  return {
    isPasswordDialogOpen,
    setIsPasswordDialogOpen,
    newPassword,
    setNewPassword,
    handlePasswordChange,
    handlePasswordSave
  };
};