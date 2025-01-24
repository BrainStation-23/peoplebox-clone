import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User, UserSBU } from "@/types/user";
import { toast } from "sonner";

export function useSBUManagement(user: User | null) {
  const [sbuSearch, setSbuSearch] = useState("");
  const [selectedSBUs, setSelectedSBUs] = useState<Set<string>>(new Set());
  const [primarySBU, setPrimarySBU] = useState<string>("");
  const queryClient = useQueryClient();

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
    enabled: true,
  });

  // Fetch user's current SBUs
  const { data: userSBUs } = useQuery({
    queryKey: ["user_sbus", user?.id],
    queryFn: async () => {
      console.log("Fetching user SBUs for user:", user?.id);
      const { data, error } = await supabase
        .from("user_sbus")
        .select(`*, sbu:sbus(id, name)`)
        .eq("user_id", user?.id);
      
      if (error) {
        console.error("Error fetching user SBUs:", error);
        throw error;
      }
      console.log("Fetched user SBUs:", data);
      return data as UserSBU[];
    },
    enabled: !!user?.id,
  });

  // Initialize selected SBUs and primary SBU from fetched data
  useEffect(() => {
    if (userSBUs) {
      const newSelectedSBUs = new Set(userSBUs.map(us => us.sbu_id));
      setSelectedSBUs(newSelectedSBUs);
      
      const primarySbu = userSBUs.find(us => us.is_primary);
      if (primarySbu) {
        setPrimarySBU(primarySbu.sbu_id);
      }
    }
  }, [userSBUs]);

  // Mutation for updating SBU assignments
  const updateSBUAssignment = useMutation({
    mutationFn: async ({ sbuId, checked }: { sbuId: string; checked: boolean }) => {
      if (!user?.id) return;

      if (checked) {
        // Add new SBU assignment
        const { error } = await supabase
          .from("user_sbus")
          .insert({
            user_id: user.id,
            sbu_id: sbuId,
            is_primary: !primarySBU // Make it primary if no primary SBU exists
          });

        if (error) throw error;
      } else {
        // Remove SBU assignment
        const { error } = await supabase
          .from("user_sbus")
          .delete()
          .eq("user_id", user.id)
          .eq("sbu_id", sbuId);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_sbus"] });
      toast.success("SBU assignment updated");
    },
    onError: () => {
      toast.error("Failed to update SBU assignment");
    }
  });

  // Mutation for updating primary SBU
  const updatePrimarySBU = useMutation({
    mutationFn: async (sbuId: string) => {
      if (!user?.id) return;

      // First, set all user's SBUs to non-primary
      const { error: resetError } = await supabase
        .from("user_sbus")
        .update({ is_primary: false })
        .eq("user_id", user.id);

      if (resetError) throw resetError;

      // Then set the selected SBU as primary
      const { error: updateError } = await supabase
        .from("user_sbus")
        .update({ is_primary: true })
        .eq("user_id", user.id)
        .eq("sbu_id", sbuId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_sbus"] });
      toast.success("Primary SBU updated");
    },
    onError: () => {
      toast.error("Failed to update primary SBU");
    }
  });

  const handleSBUChange = (sbuId: string, checked: boolean) => {
    updateSBUAssignment.mutate({ sbuId, checked });
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

  const handlePrimarySBUChange = (sbuId: string) => {
    updatePrimarySBU.mutate(sbuId);
    setPrimarySBU(sbuId);
  };

  return {
    sbus,
    userSBUs,
    sbuSearch,
    setSbuSearch,
    selectedSBUs,
    primarySBU,
    handleSBUChange,
    handlePrimarySBUChange
  };
}