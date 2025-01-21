import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User, UserSBU } from "../types";

export function useSBUManagement(user: User | null) {
  const [sbuSearch, setSbuSearch] = useState("");

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
        .select("*, sbu:sbus(id, name)")
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

  return {
    sbus,
    userSBUs,
    sbuSearch,
    setSbuSearch,
  };
}