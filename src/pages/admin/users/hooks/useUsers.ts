import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User, UserSBU } from "../types";

interface UseUsersProps {
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  selectedSBU: string;
  selectedLevel: string;
  selectedLocation: string;
  selectedEmploymentType: string;
  selectedEmployeeRole: string;
  selectedEmployeeType: string;
}

interface SearchUsersResponse {
  profile: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    profile_image_url: string | null;
    org_id: string | null;
    gender: string | null;
    date_of_birth: string | null;
    designation: string | null;
    status: string;
    user_roles: {
      role: string;
    };
    user_sbus: UserSBU[];
  };
  total_count: number;
}

export function useUsers({ 
  currentPage, 
  pageSize, 
  searchTerm, 
  selectedSBU,
  selectedLevel,
  selectedLocation,
  selectedEmploymentType,
  selectedEmployeeRole,
  selectedEmployeeType 
}: UseUsersProps) {
  return useQuery({
    queryKey: [
      "users", 
      currentPage, 
      pageSize, 
      searchTerm, 
      selectedSBU,
      selectedLevel,
      selectedLocation,
      selectedEmploymentType,
      selectedEmployeeRole,
      selectedEmployeeType
    ],
    queryFn: async () => {
      console.log("Fetching users with params:", { 
        currentPage, 
        pageSize, 
        searchTerm, 
        selectedSBU,
        selectedLevel,
        selectedLocation,
        selectedEmploymentType,
        selectedEmployeeRole,
        selectedEmployeeType
      });
      
      const { data, error } = await supabase
        .rpc('search_users', {
          search_text: searchTerm,
          page_number: currentPage,
          page_size: pageSize,
          sbu_filter: selectedSBU !== 'all' ? selectedSBU : null,
          level_filter: selectedLevel !== 'all' ? selectedLevel : null,
          location_filter: selectedLocation !== 'all' ? selectedLocation : null,
          employment_type_filter: selectedEmploymentType !== 'all' ? selectedEmploymentType : null,
          employee_role_filter: selectedEmployeeRole !== 'all' ? selectedEmployeeRole : null,
          employee_type_filter: selectedEmployeeType !== 'all' ? selectedEmployeeType : null
        });

      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }

      const transformedUsers = (data as unknown as SearchUsersResponse[]).map(item => {
        const profile = item.profile;
        return {
          id: profile.id,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          profile_image_url: profile.profile_image_url,
          org_id: profile.org_id,
          gender: profile.gender,
          date_of_birth: profile.date_of_birth,
          designation: profile.designation,
          status: profile.status,
          user_roles: profile.user_roles,
          user_sbus: profile.user_sbus
        } as User;
      });

      return {
        users: transformedUsers,
        total: data?.[0]?.total_count || 0
      };
    },
  });
}