import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSBUs() {
  return useQuery({
    queryKey: ["sbus"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sbus")
        .select("id, name")
        .order("name");
      
      if (error) {
        console.error("Error fetching SBUs:", error);
        throw error;
      }
      
      return data;
    },
  });
}