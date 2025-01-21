import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, UserSBU } from "../../types";
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
  console.log("EditUserDialog rendered with user:", user);

  const [sbuSearch, setSbuSearch] = useState("");
  const queryClient = useQueryClient();

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedSBUs, setSelectedSBUs] = useState<Set<string>>(new Set());
  const [primarySBU, setPrimarySBU] = useState<string>("");

  // Fetch complete profile data
  const { data: profileData, error: profileError } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      console.log("Fetching profile data for user:", user?.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*, levels(*)')
        .eq('id', user?.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
      console.log("Fetched profile data:", data);
      return data;
    },
    enabled: !!user?.id && open,
  });

  // Update form state when profile data changes
  useEffect(() => {
    console.log("Profile data changed:", profileData);
    if (profileData) {
      setFirstName(profileData.first_name || '');
      setLastName(profileData.last_name || '');
      setSelectedLevel(profileData.level_id || '');
    }
  }, [profileData]);

  // Fetch levels
  const { data: levels } = useQuery({
    queryKey: ["levels"],
    queryFn: async () => {
      console.log("Fetching levels");
      const { data, error } = await supabase
        .from("levels")
        .select("*")
        .eq("status", "active");
      
      if (error) {
        console.error("Error fetching levels:", error);
        throw error;
      }
      console.log("Fetched levels:", data);
      return data;
    },
    enabled: open,
  });

  // Fetch SBUs
  const { data: sbus } = useQuery({
    queryKey: ["sbus", sbuSearch],
    queryFn: async () => {
      console.log("Fetching SBUs with search:", sbuSearch);
      let query = supabase.from("sbus").select("*");
      
      if (sbuSearch) {
        query = query.ilike("name", `%${sbuSearch}%`);
      }
      
      const { data, error } = await query;
      if (error) {
        console.error("Error fetching SBUs:", error);
        throw error;
      }
      console.log("Fetched SBUs:", data);
      return data;
    },
    enabled: open,
  });

  // Fetch user's current SBUs
  const { data: userSBUs } = useQuery({
    queryKey: ["user_sbus", user?.id],
    queryFn: async () => {
      console.log("Fetching user SBUs for user:", user?.id);
      const { data, error } = await supabase
        .from("user_sbus")
        .select("*, sbu:sbus(id, name)")
        .eq("user_id", user?.id);
      
      if (error) {
        console.error("Error fetching user SBUs:", error);
        throw error;
      }
      console.log("Fetched user SBUs:", data);
      return data as UserSBU[];
    },
    enabled: !!user?.id && open,
  });

  // Update effect when userSBUs data changes
  useEffect(() => {
    console.log("UserSBUs changed:", userSBUs);
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
      console.log("Updating profile with data:", {
        first_name: firstName,
        last_name: lastName,
        level_id: selectedLevel,
      });

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          level_id: selectedLevel || null,
        })
        .eq("id", user.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        throw profileError;
      }

      // Update SBU assignments
      console.log("Deleting existing SBU assignments for user:", user.id);
      const { error: sbuDeleteError } = await supabase
        .from("user_sbus")
        .delete()
        .eq("user_id", user.id);

      if (sbuDeleteError) {
        console.error("Error deleting SBUs:", sbuDeleteError);
        throw sbuDeleteError;
      }

      if (selectedSBUs.size > 0) {
        const sbuInserts = Array.from(selectedSBUs).map(sbuId => ({
          user_id: user.id,
          sbu_id: sbuId,
          is_primary: sbuId === primarySBU
        }));
        console.log("Inserting new SBU assignments:", sbuInserts);

        const { error: sbuInsertError } = await supabase
          .from("user_sbus")
          .insert(sbuInserts);

        if (sbuInsertError) {
          console.error("Error inserting SBUs:", sbuInsertError);
          throw sbuInsertError;
        }
      }
    },
    onSuccess: () => {
      console.log("Profile update successful");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user_sbus"] });
      toast.success("Profile updated successfully");
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error in update mutation:", error);
      toast.error("Failed to update profile");
    }
  });

  if (profileError) {
    console.error("Profile fetch error:", profileError);
    toast.error("Failed to load profile data");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to the user profile here. Click save when you're done.
          </DialogDescription>
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
