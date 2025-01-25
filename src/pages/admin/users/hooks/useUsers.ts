import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "../types";

interface UseUsersProps {
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  selectedSBU: string;
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

      const users = data?.map(item => item.profile) || [];
      const total = data?.[0]?.total_count || 0;

      return {
        users: users as User[],
        total
      };
    },
  });
}