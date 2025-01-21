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
      setProfileImageUrl(profileData.profile_image_url || '');
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
        profile_image_url: profileImageUrl,
        level_id: selectedLevel,
      });

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          profile_image_url: profileImageUrl,
          level_id: selectedLevel || null,
        })
        .eq("id", user.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        throw profileError;
      }
    },
    onSuccess: () => {
      console.log("Profile update successful");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      console.error("Error in update mutation:", error);
      toast.error("Failed to update profile");
    }
  });

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    profileImageUrl,
    setProfileImageUrl,
    selectedLevel,
    setSelectedLevel,
    profileData,
    profileError,
    updateProfileMutation,
  };
}