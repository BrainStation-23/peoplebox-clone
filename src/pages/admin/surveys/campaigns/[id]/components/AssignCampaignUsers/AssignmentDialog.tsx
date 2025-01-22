import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { UserSelector } from "./UserSelector";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface AssignmentDialogProps {
  campaignId: string;
  surveyId: string;
}

export function AssignmentDialog({ campaignId, surveyId }: AssignmentDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>([]);
  const queryClient = useQueryClient();

  const handleAssign = async () => {
    try {
      if (selectedUsers.length === 0) {
        toast.error("Please select at least one user");
        return;
      }

      const { data: session } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        toast.error("No authenticated user found");
        return;
      }

      const assignments = selectedUsers.map(userId => ({
        survey_id: surveyId,
        user_id: userId,
        created_by: session.user.id,
        campaign_id: campaignId,
      }));

      const { error } = await supabase
        .from("survey_assignments")
        .insert(assignments);

      if (error) throw error;

      toast.success("Users assigned successfully");
      setOpen(false);
      setSelectedUsers([]);
      queryClient.invalidateQueries({ queryKey: ["campaign-assignments"] });
    } catch (error: any) {
      console.error("Error assigning users:", error);
      toast.error("Failed to assign users");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Assign Users
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Users to Campaign</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <UserSelector
            selectedUsers={selectedUsers}
            onChange={setSelectedUsers}
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAssign}>
              Assign Selected Users
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}