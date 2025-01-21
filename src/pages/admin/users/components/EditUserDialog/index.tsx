import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, UserSBU, Level } from "../../types";
import { BasicInfoTab } from "./BasicInfoTab";
import { SBUAssignmentTab } from "./SBUAssignmentTab";

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditUserDialog({
  user,
  open,
  onOpenChange,
}: EditUserDialogProps) {
  const [sbuSearch, setSbuSearch] = useState("");
  const queryClient = useQueryClient();

  // Form state
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedSBUs, setSelectedSBUs] = useState<Set<string>>(new Set());
  const [primarySBU, setPrimarySBU] = useState<string>("");

  // Fetch levels
  const { data: levels } = useQuery({
    queryKey: ["levels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("levels")
        .select("*")
        .eq("status", "active");
      
      if (error) throw error;
      return data as Level[];
    },
    enabled: open,
  });

  // Fetch SBUs
  const { data: sbus } = useQuery({
    queryKey: ["sbus", sbuSearch],
    queryFn: async () => {
      let query = supabase.from("sbus").select("*");
      
      if (sbuSearch) {
        query = query.ilike("name", `%${sbuSearch}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  // Fetch user's current SBUs
  const { data: userSBUs } = useQuery({
    queryKey: ["user_sbus", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_sbus")
        .select("*, sbu:sbus(id, name)")
        .eq("user_id", user?.id);
      
      if (error) throw error;
      return data as UserSBU[];
    },
    enabled: !!user?.id && open,
  });

  // Update effect when userSBUs data changes
  useEffect(() => {
    if (userSBUs) {
      const sbuIds = new Set(userSBUs.map(us => us.sbu_id));
      setSelectedSBUs(sbuIds);
      const primary = userSBUs.find(us => us.is_primary);
      if (primary) {
        setPrimarySBU(primary.sbu_id);
      }
    }
  }, [userSBUs]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          level_id: selectedLevel || null,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update SBU assignments
      const { error: sbuDeleteError } = await supabase
        .from("user_sbus")
        .delete()
        .eq("user_id", user.id);

      if (sbuDeleteError) throw sbuDeleteError;

      if (selectedSBUs.size > 0) {
        const sbuInserts = Array.from(selectedSBUs).map(sbuId => ({
          user_id: user.id,
          sbu_id: sbuId,
          is_primary: sbuId === primarySBU
        }));

        const { error: sbuInsertError } = await supabase
          .from("user_sbus")
          .insert(sbuInserts);

        if (sbuInsertError) throw sbuInsertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user_sbus"] });
      toast.success("Profile updated successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Failed to update profile");
      console.error("Error updating profile:", error);
    }
  });

  const handleSave = () => {
    updateProfileMutation.mutate();
  };

  const handleSBUChange = (sbuId: string, checked: boolean) => {
    const newSelectedSBUs = new Set(selectedSBUs);
    if (checked) {
      newSelectedSBUs.add(sbuId);
    } else {
      newSelectedSBUs.delete(sbuId);
      if (primarySBU === sbuId) {
        setPrimarySBU("");
      }
    }
    setSelectedSBUs(newSelectedSBUs);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList>
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="sbus">SBU Assignment</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <BasicInfoTab
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              profileImageUrl={profileImageUrl}
              setProfileImageUrl={setProfileImageUrl}
              selectedLevel={selectedLevel}
              setSelectedLevel={setSelectedLevel}
              levels={levels}
            />
          </TabsContent>

          <TabsContent value="sbus">
            <SBUAssignmentTab
              sbus={sbus}
              sbuSearch={sbuSearch}
              setSbuSearch={setSbuSearch}
              selectedSBUs={selectedSBUs}
              handleSBUChange={handleSBUChange}
              primarySBU={primarySBU}
              setPrimarySBU={setPrimarySBU}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateProfileMutation.isPending}
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}