import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";

export function useProfileManagement(user: User | null) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedSBUs, setSelectedSBUs] = useState<Set<string>>(new Set());
  const [primarySBU, setPrimarySBU] = useState<string>("");
  const queryClient = useQueryClient();

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
    enabled: !!user?.id,
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
    },
    onError: (error) => {
      console.error("Error in update mutation:", error);
      toast.error("Failed to update profile");
    }
  });

  const handleSBUChange = (sbuId: string, checked: boolean) => {
    console.log("SBU selection changed:", { sbuId, checked });
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

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    profileImageUrl,
    setProfileImageUrl,
    selectedLevel,
    setSelectedLevel,
    selectedSBUs,
    primarySBU,
    setPrimarySBU,
    profileData,
    profileError,
    updateProfileMutation,
    handleSBUChange
  };
}