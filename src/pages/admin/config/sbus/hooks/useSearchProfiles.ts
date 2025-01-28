import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSearchProfiles(searchTerm: string) {
  return useQuery({
    queryKey: ["profiles", "search", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return { data: [], count: 0 };
      
      const { data, error } = await supabase.rpc("search_users", {
        search_text: searchTerm,
        page_number: 1,
        page_size: 5,
        sbu_filter: null,
        level_filter: null,
        location_filter: null,
        employment_type_filter: null,
        employee_role_filter: null,
        employee_type_filter: null,
      });
      
      if (error) throw error;
      
      return {
        data: data.map(item => item.profile),
        count: data[0]?.total_count || 0,
      };
    },
    enabled: searchTerm.trim().length > 0,
  });
}