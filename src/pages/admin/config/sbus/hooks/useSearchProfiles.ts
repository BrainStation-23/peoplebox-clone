import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

export function useSearchProfiles(searchTerm: string) {
  return useQuery({
    queryKey: ["profiles", "search", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) {
        return { data: [], count: 0 };
      }
      
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
      
      // Transform the data to match the Profile interface
      const profiles = data.map(item => {
        const profile = item.profile as any;
        return {
          id: profile.id,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name
        } as Profile;
      });
      
      return {
        data: profiles,
        count: data[0]?.total_count || 0,
      };
    },
    enabled: searchTerm.trim().length > 0,
  });
}