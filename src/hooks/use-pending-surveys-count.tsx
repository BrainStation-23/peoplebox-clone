import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function usePendingSurveysCount() {
  return useQuery({
    queryKey: ["pending-surveys-count"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { count, error } = await supabase
        .from("survey_assignments")
        .select("*, campaign:survey_campaigns!inner(status)", { count: 'exact', head: true })
        .eq("status", "pending")
        .eq("user_id", user.id)
        .neq("campaign.status", "draft");

      if (error) throw error;
      return count || 0;
    },
  });
}