import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";
import { toast } from "sonner";
import { SupervisorType } from "../components/EditUserDialog";

type SupervisorQueryResult = {
  supervisor_id: string;
  is_primary: boolean;
  supervisor: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  };
}

export function useSupervisorManagement(user: User | null) {
  const queryClient = useQueryClient();
  const [primarySupervisor, setPrimarySupervisor] = useState<string | null>(null);

  const { data: supervisors = [] } = useQuery({
    queryKey: ["supervisors", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_supervisors")
        .select(`
          supervisor_id,
          is_primary,
          supervisor:profiles!user_supervisors_supervisor_id_fkey (
            id,
            first_name,
            last_name
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;

      return (data as SupervisorQueryResult[]).map((item) => ({
        id: item.supervisor.id,
        first_name: item.supervisor.first_name,
        last_name: item.supervisor.last_name,
        is_primary: item.is_primary,
      })) as SupervisorType[];
    },
    enabled: !!user,
  });

  const updateSupervisorMutation = useMutation({
    mutationFn: async ({
      supervisorId,
      action,
    }: {
      supervisorId: string;
      action: "add" | "remove";
    }) => {
      if (!user) throw new Error("No user selected");

      if (action === "add") {
        const { error } = await supabase
          .from("user_supervisors")
          .insert({
            user_id: user.id,
            supervisor_id: supervisorId,
            is_primary: supervisors.length === 0, // Make primary if first supervisor
          });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_supervisors")
          .delete()
          .eq("user_id", user.id)
          .eq("supervisor_id", supervisorId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisors", user?.id] });
      toast.success("Supervisor list updated successfully");
    },
    onError: (error) => {
      console.error("Supervisor update error:", error);
      toast.error("Failed to update supervisor list");
    },
  });

  const updatePrimarySupervisorMutation = useMutation({
    mutationFn: async (supervisorId: string) => {
      if (!user) throw new Error("No user selected");

      // Begin transaction
      const { error: updateError } = await supabase
        .from("user_supervisors")
        .update({ is_primary: false })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      const { error: setPrimaryError } = await supabase
        .from("user_supervisors")
        .update({ is_primary: true })
        .eq("user_id", user.id)
        .eq("supervisor_id", supervisorId);

      if (setPrimaryError) throw setPrimaryError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supervisors", user?.id] });
      toast.success("Primary supervisor updated successfully");
    },
    onError: (error) => {
      console.error("Primary supervisor update error:", error);
      toast.error("Failed to update primary supervisor");
    },
  });

  const handleSupervisorChange = useCallback(
    (supervisorId: string, action: "add" | "remove") => {
      updateSupervisorMutation.mutate({ supervisorId, action });
    },
    [updateSupervisorMutation]
  );

  const handlePrimarySupervisorChange = useCallback(
    (supervisorId: string) => {
      updatePrimarySupervisorMutation.mutate(supervisorId);
    },
    [updatePrimarySupervisorMutation]
  );

  return {
    supervisors,
    handleSupervisorChange,
    handlePrimarySupervisorChange,
  };
}