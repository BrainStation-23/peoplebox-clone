import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User, GenderType } from "../types";

export function useProfileManagement(user: User | null) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [orgId, setOrgId] = useState("");
  const [gender, setGender] = useState<GenderType>("male");
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  const [designation, setDesignation] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedEmploymentType, setSelectedEmploymentType] = useState("");
  const queryClient = useQueryClient();

  const { data: profileData, error: profileError } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, levels(*)')
        .eq('id', user?.id)
        .maybeSingle();
      
      if (error) throw error;
      console.log('Fetched profile data:', data);
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (profileData) {
      console.log('Setting initial form values:', profileData);
      setFirstName(profileData.first_name || '');
      setLastName(profileData.last_name || '');
      setProfileImageUrl(profileData.profile_image_url || '');
      setSelectedLevel(profileData.level_id || '');
      setOrgId(profileData.org_id || '');
      setGender(profileData.gender || 'male');
      setDateOfBirth(profileData.date_of_birth ? new Date(profileData.date_of_birth) : undefined);
      setDesignation(profileData.designation || '');
      setSelectedLocation(profileData.location_id || '');
      setSelectedEmploymentType(profileData.employment_type_id || '');
    }
  }, [profileData]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;

      const updateData = {
        first_name: firstName,
        last_name: lastName,
        profile_image_url: profileImageUrl,
        level_id: selectedLevel || null,
        org_id: orgId || null,
        gender: gender || null,
        date_of_birth: dateOfBirth?.toISOString().split('T')[0] || null,
        designation: designation || null,
        location_id: selectedLocation || null,
        employment_type_id: selectedEmploymentType || null,
      };

      console.log('Updating profile with data:', {
        userId: user.id,
        updateData,
        currentFormState: {
          selectedLevel,
          orgId,
          designation,
          selectedLocation,
          selectedEmploymentType
        }
      });

      const { error: profileError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      // Log the result of the update
      const { data: updatedProfile, error: fetchError } = await supabase
        .from("profiles")
        .select('*')
        .eq("id", user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching updated profile:', fetchError);
      } else {
        console.log('Profile after update:', updatedProfile);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
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
    orgId,
    setOrgId,
    gender,
    setGender,
    dateOfBirth,
    setDateOfBirth,
    designation,
    setDesignation,
    selectedLocation,
    setSelectedLocation,
    selectedEmploymentType,
    setSelectedEmploymentType,
    profileData,
    profileError,
    updateProfileMutation,
  };
}