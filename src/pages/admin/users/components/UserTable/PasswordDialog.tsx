import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PasswordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

export function PasswordDialog({
  isOpen,
  onOpenChange,
  userId,
}: PasswordDialogProps) {
  const [newPassword, setNewPassword] = useState("");
  const { toast } = useToast();

  const handleSave = async () => {
    if (!userId) return;

    try {
      const { error } = await supabase.functions.invoke('update-user-password', {
        body: { userId, newPassword },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Password has been updated successfully",
      });

      setNewPassword("");
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save Password</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}