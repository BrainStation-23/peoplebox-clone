import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSBUs() {
  return useQuery({
    queryKey: ["sbus"],
    queryFn: async () => {
      console.log("Fetching all SBUs");
      const { data, error } = await supabase
        .from("sbus")
        .select("*")
        .order("name");
      
      if (error) {
        console.error("Error fetching SBUs:", error);
        throw error;
      }
      
      console.log("Fetched SBUs:", data);
      return data;
    },
  });
}