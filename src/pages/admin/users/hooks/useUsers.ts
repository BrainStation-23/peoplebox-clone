import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";
import { Json } from "@/integrations/supabase/types";

interface UseUsersProps {
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  selectedSBU: string;
}

interface SearchUsersResponse {
  profile: Json;
  total_count: number;
}

export function useUsers({ currentPage, pageSize, searchTerm, selectedSBU }: UseUsersProps) {
  return useQuery({
    queryKey: ["users", currentPage, pageSize, searchTerm, selectedSBU],
    queryFn: async () => {
      console.log("Fetching users with params:", { currentPage, pageSize, searchTerm, selectedSBU });
      
      const { data, error } = await supabase
        .rpc('search_users', {
          search_text: searchTerm,
          page_number: currentPage,
          page_size: pageSize,
          sbu_filter: selectedSBU !== 'all' ? selectedSBU : null
        });

      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }

      // Transform the data to match the User type
      const transformedUsers = (data as SearchUsersResponse[]).map(item => {
        const profile = item.profile as any; // temporary any to help with transformation
        console.log("Transformed user data:", profile);
        
        return {
          id: profile.id,
          email: profile.email,
          first_name: profile.first_name || null,
          last_name: profile.last_name || null,
          profile_image_url: profile.profile_image_url,
          org_id: profile.org_id,
          gender: profile.gender,
          date_of_birth: profile.date_of_birth,
          designation: profile.designation,
          status: profile.status,
          user_roles: profile.user_roles
        } as User;
      });

      return {
        users: transformedUsers,
        total: data?.[0]?.total_count || 0
      };
    },
  });
}